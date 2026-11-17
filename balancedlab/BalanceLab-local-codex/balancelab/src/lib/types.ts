export type PID = { kp: number; ki: number; kd: number };
export type RobotState = 'BALANCING' | 'ARMED' | 'DISARMED' | 'STOPPED' | 'FALLEN' | 'ESTOP';
export type Telemetry = {
  type: 'telemetry'; timestamp_ms: number; angle_deg: number; target_deg: number;
  angular_velocity_dps?: number; motor_left_pct?: number; motor_right_pct?: number;
  battery_voltage?: number; control_hz?: number; state?: RobotState;
};
export type Connection = 'Connected' | 'Connecting' | 'Disconnected' | 'Stale';
export type Command = 'pid' | 'arm' | 'disarm' | 'start' | 'stop' | 'estop' | 'reset' | 'disturb';
export type LearningMode = 'Play' | 'Learn' | 'Engineer';
export type Session = { id: string; name: string; date: string; mode: string; pid: PID; samples: Telemetry[]; notes: string; kind: string; protocol?: 'push-v1'; completed?: boolean; prediction?: string };
export type GainRanges = Record<keyof PID, { min: number; max: number; step: number }>;
export const DEFAULT_PID: PID = { kp: 32, ki: 0.8, kd: 4.2 };
export const DEFAULT_RANGES: GainRanges = { kp: { min: 0, max: 80, step: 0.1 }, ki: { min: 0, max: 10, step: 0.1 }, kd: { min: 0, max: 15, step: 0.1 } };
