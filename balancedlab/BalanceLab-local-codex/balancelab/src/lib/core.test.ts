import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTelemetry, SimulationProvider, WebSocketProvider } from './providers';
import { metrics } from './storage';
import type { Telemetry } from './types';

test('telemetry parser rejects incomplete and nonfinite data', () => {
  assert.equal(parseTelemetry({ type:'telemetry', angle_deg:3 }),null);
  assert.equal(parseTelemetry({ type:'telemetry',timestamp_ms:0,angle_deg:Infinity,target_deg:0 }),null);
  const parsed = parseTelemetry({ type:'telemetry',timestamp_ms:5,angle_deg:2,target_deg:0,battery_voltage:NaN,state:'made-up' });
  assert.ok(parsed); assert.equal(parsed.battery_voltage,undefined); assert.equal(parsed.control_hz,undefined); assert.equal(parsed.state,undefined);
});
test('error metrics use measured angle minus target; empty data has no metrics', () => {
  const result = metrics([{ angle_deg:4,target_deg:1 },{ angle_deg:-3,target_deg:1 }] as Telemetry[]);
  assert.equal(result.max,4); assert.equal(result.rmse,Math.sqrt(12.5));
  assert.deepEqual(metrics([]),{ max:null,rmse:null });
});
test('simulation settles from a disturbance and publishes consistent telemetry', async t => {
  t.mock.timers.enable({ apis:['setInterval'] });
  const provider = new SimulationProvider(); const samples: Telemetry[] = [];
  provider.connect(d => samples.push(d),() => {}); t.after(() => provider.close());
  for(let i=0;i<300;i++) t.mock.timers.tick(50);
  assert.equal(samples.length,300); assert.ok(Math.abs(samples.at(-1)!.angle_deg)<1);
  assert.ok(samples.every(s => Number.isFinite(s.angle_deg) && s.motor_left_pct===s.motor_right_pct && s.control_hz===200));
  const before = samples.at(-1)!.angle_deg; await provider.command('disturb'); t.mock.timers.tick(50);
  assert.ok(samples.at(-1)!.angle_deg>before+6);
});
test('emergency stop requires reset and rearm before control starts', async t => {
  t.mock.timers.enable({ apis:['setInterval'] });
  const provider = new SimulationProvider(); let current: Telemetry | undefined;
  provider.connect(d => current=d,() => {}); t.after(() => provider.close());
  await provider.command('estop'); t.mock.timers.tick(50); assert.equal(current?.state,'ESTOP'); assert.equal(current?.motor_left_pct,0);
  await assert.rejects(provider.command('start')); await assert.rejects(provider.command('arm')); 
  await provider.command('reset'); await provider.command('arm'); await provider.command('start'); t.mock.timers.tick(50); assert.equal(current?.state,'BALANCING');
});
test('changing PID changes simulated dynamics', async t => {
  t.mock.timers.enable({ apis:['setInterval'] });
  const a=new SimulationProvider(), b=new SimulationProvider(); let angleA=0,angleB=0;
  a.connect(d=>angleA=d.angle_deg,()=>{}); b.connect(d=>angleB=d.angle_deg,()=>{});
  t.after(()=>{a.close();b.close();}); await b.command('pid',{kp:10,ki:0,kd:0});
  for(let i=0;i<80;i++) t.mock.timers.tick(50);
  assert.ok(Math.abs(angleA-angleB)>0.5);
});
test('live adapter requires explicit firmware ack and detects stale telemetry', async t => {
  t.mock.timers.enable({ apis:['Date','setInterval','setTimeout'] });
  const original=globalThis.WebSocket;
  class FakeSocket {
    static OPEN=1; static instance: FakeSocket; readyState=1;
    onopen?:()=>void; onmessage?: (event:{data:string})=>void; onclose?:()=>void; onerror?:()=>void; sent='';
    constructor(_url:string) { FakeSocket.instance=this; }
    send(data:string) { this.sent=data; } close() { this.readyState=3; }
  }
  globalThis.WebSocket=FakeSocket as unknown as typeof WebSocket;
  const provider=new WebSocketProvider('wss://robot.test/ws'); let status=''; let received:Telemetry | null=null;
  t.after(()=>{provider.close();globalThis.WebSocket=original;});
  provider.connect(d=>received=d,s=>status=s); const ws=FakeSocket.instance; ws.onopen?.(); assert.equal(status,'Stale');
  ws.onmessage?.({data:JSON.stringify({type:'telemetry',timestamp_ms:50,angle_deg:1,target_deg:0})});
  assert.equal(status,'Connected'); assert.equal((received as Telemetry | null)?.battery_voltage,undefined);
  let applied=false; const pending=provider.command('pid',{kp:3,ki:0,kd:1}).then(()=>applied=true);
  await Promise.resolve(); assert.equal(applied,false);
  const id=JSON.parse(ws.sent).id; ws.onmessage?.({data:JSON.stringify({type:'ack',id,ok:true})}); await pending; assert.equal(applied,true);
  const failed=assert.rejects(provider.command('arm'),/acknowledgement/); t.mock.timers.tick(4001); await failed;
  assert.equal(status,'Stale');
  ws.onclose?.(); assert.equal(status,'Disconnected');
});
