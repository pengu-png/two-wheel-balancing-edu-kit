import { DEFAULT_PID, type PID, type Telemetry, type Command, type Connection, type RobotState } from './types';

export interface DataProvider {
  connect(onData: (data: Telemetry) => void, onStatus: (status: Connection) => void): void;
  command(action: Command, payload?: PID): Promise<void>;
  close(): void;
}

// Educational second-order model. Coefficients are illustrative, not robot gains.
export class SimulationProvider implements DataProvider {
  private timer?: ReturnType<typeof setInterval>;
  private pid = { ...DEFAULT_PID }; private angle = 8; private velocity = 0; private integral = 0;
  private state: RobotState = 'BALANCING'; private time = 0; private out?: (data: Telemetry) => void;
  connect(onData: (data: Telemetry) => void, onStatus: (status: Connection) => void) {
    this.out = onData; onStatus('Connected');
    this.timer = setInterval(() => this.tick(), 50);
  }
  private tick() {
    let motor = 0;
    for (let i = 0; i < 10; i++) {
      const dt = 0.005;
      if (this.state === 'BALANCING') {
        this.integral = Math.max(-15, Math.min(15, this.integral + this.angle * dt));
        motor = Math.max(-100, Math.min(100, this.pid.kp * this.angle * .35 + this.pid.kd * this.velocity * .5 + this.pid.ki * this.integral * .08));
        this.velocity += (8 * Math.sin(this.angle * Math.PI / 180) - motor * .9 - this.velocity * .12 + .3 * Math.sin(this.time * 3)) * dt;
        this.angle += this.velocity * dt;
        if (Math.abs(this.angle) >= 40) { this.angle = Math.sign(this.angle) * 40; this.velocity = 0; this.state = 'FALLEN'; }
      }
      this.time += dt;
    }
    this.out?.({ type: 'telemetry', timestamp_ms: this.time * 1000, angle_deg: this.angle, target_deg: 0, angular_velocity_dps: this.velocity, motor_left_pct: motor, motor_right_pct: motor, battery_voltage: 11.8 - .03 * Math.abs(motor) / 100, control_hz: 200, state: this.state });
  }
  async command(action: Command, payload?: PID) {
    if ((this.state === 'ESTOP' || this.state === 'FALLEN') && (action === 'arm' || action === 'start')) throw new Error('Reset the controller before rearming.');
    if (action === 'pid' && payload) this.pid = { ...payload };
    if (action === 'arm') { this.state = 'ARMED'; this.angle = 0; this.velocity = 0; }
    if (action === 'disarm') this.state = 'DISARMED';
    if (action === 'start') { if (this.state !== 'ARMED') throw new Error('Arm the robot before starting control.'); this.state = 'BALANCING'; this.angle = 6; }
    if (action === 'stop') this.state = 'STOPPED';
    if (action === 'estop') this.state = 'ESTOP';
    if (action === 'reset') { this.state = 'DISARMED'; this.angle = 0; this.velocity = 0; this.integral = 0; }
    if (action === 'disturb') { if (this.state !== 'BALANCING') throw new Error('Start the control loop first.'); this.angle += 8; this.velocity += 3; }
  }
  close() { clearInterval(this.timer); }
}

export function parseTelemetry(input: unknown): Telemetry | null {
  if (!input || typeof input !== 'object') return null;
  const d = input as Record<string, unknown>;
  if (d.type !== 'telemetry' || !['timestamp_ms', 'angle_deg', 'target_deg'].every(k => typeof d[k] === 'number' && Number.isFinite(d[k])) || (d.timestamp_ms as number) < 0) return null;
  const out: Telemetry = { type: 'telemetry', timestamp_ms: d.timestamp_ms as number, angle_deg: d.angle_deg as number, target_deg: d.target_deg as number };
  for (const key of ['angular_velocity_dps', 'motor_left_pct', 'motor_right_pct', 'battery_voltage', 'control_hz'] as const) if (typeof d[key] === 'number' && Number.isFinite(d[key])) out[key] = d[key] as number;
  if (['BALANCING', 'ARMED', 'DISARMED', 'STOPPED', 'FALLEN', 'ESTOP'].includes(String(d.state))) out.state = d.state as RobotState;
  return out;
}

// Firmware contract: commands carry an id; return {type:'ack', id, ok:true} only after applying.
export class WebSocketProvider implements DataProvider {
  private ws?: WebSocket; private freshness?: ReturnType<typeof setInterval>; private last: number | null = null; private sequence = 0;
  private pending = new Map<number, { resolve: () => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> }>();
  constructor(private url: string) {}
  connect(onData: (data: Telemetry) => void, onStatus: (status: Connection) => void) {
    onStatus('Connecting');
    try {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => { onStatus('Stale'); this.last = null; };
      this.ws.onmessage = event => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'ack') {
            const p = this.pending.get(message.id);
            if (p) { clearTimeout(p.timer); this.pending.delete(message.id); message.ok === true ? p.resolve() : p.reject(new Error(String(message.error || 'Firmware rejected the command.'))); }
          }
          const data = parseTelemetry(message);
          if (data) { this.last = Date.now(); onStatus('Connected'); onData(data); }
        } catch { /* Invalid messages never enter the telemetry stream. */ }
      };
      this.ws.onclose = () => { onStatus('Disconnected'); this.rejectPending(); };
      this.ws.onerror = () => onStatus('Disconnected');
      this.freshness = setInterval(() => { if (this.ws?.readyState === WebSocket.OPEN && (this.last === null || Date.now() - this.last > 2000)) onStatus('Stale'); }, 500);
    } catch { onStatus('Disconnected'); }
  }
  command(action: Command, payload?: PID) {
    if (this.ws?.readyState !== WebSocket.OPEN) return Promise.reject(new Error('Robot is disconnected.'));
    if (action !== 'estop' && (this.last === null || Date.now() - this.last > 2000)) return Promise.reject(new Error('Fresh telemetry is required for this action.'));
    const id = ++this.sequence;
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('No firmware acknowledgement received.')); }, 4000);
      this.pending.set(id, { resolve, reject, timer });
      this.ws!.send(JSON.stringify({ type: 'command', id, action, ...(payload ? { parameters: payload } : {}) }));
    });
  }
  private rejectPending() { this.pending.forEach(p => { clearTimeout(p.timer); p.reject(new Error('Connection closed.')); }); this.pending.clear(); }
  close() { if (this.ws) { this.ws.onclose = null; this.ws.onmessage = null; this.ws.onerror = null; this.ws.onopen = null; this.ws.close(); } clearInterval(this.freshness); this.rejectPending(); }
}
