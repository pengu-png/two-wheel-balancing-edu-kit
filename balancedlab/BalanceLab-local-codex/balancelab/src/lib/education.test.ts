import test from 'node:test';
import assert from 'node:assert/strict';
import {comparableTrials,comparisonSummary,studentStatus,trialMetrics,validPID,wobble} from './education';
import {DEFAULT_PID,DEFAULT_RANGES,type Session,type Telemetry} from './types';
const sample=(time:number,error:number,velocity=0):Telemetry=>({type:'telemetry',timestamp_ms:time,angle_deg:error,target_deg:0,angular_velocity_dps:velocity,state:'BALANCING'});
function session(id:string,recovery:number):Session{return {id,name:id,date:'2026-11-14T00:00:00Z',mode:'SIMULATION',pid:{...DEFAULT_PID},kind:'Stay on Your Feet!',protocol:'push-v1',completed:true,notes:'',samples:Array.from({length:241},(_,i)=>sample(i*50,i===0?14:i*50<recovery*1000?5:0))};}
test('student status is derived from measured error, motion, controller state and freshness',()=>{
 assert.equal(studentStatus(sample(0,1,0),true).label,'Balancing');
 assert.equal(studentStatus(sample(0,7,-2),true).label,'Recovering');
 assert.equal(studentStatus(sample(0,9,2),true).label,'Leaning');
 assert.equal(studentStatus({...sample(0,0),state:'FALLEN'},true).label,'Fallen');
 assert.equal(studentStatus(sample(0,0),false).label,'Waiting');
 assert.equal(studentStatus({...sample(0,0),angular_velocity_dps:undefined},true).label,'Motion unknown');
});
test('wobble uses rolling error variation and does not confuse constant lean with balance',()=>{
 assert.equal(wobble([sample(0,0)]).value,null);
 const constant=Array.from({length:61},(_,i)=>sample(i*50,8));assert.equal(wobble(constant).label,'Low');assert.notEqual(studentStatus(constant[0],true).label,'Balancing');
 const moderate=constant.map((s,i)=>({...s,angle_deg:i%2?1:-1}));assert.equal(wobble(moderate).label,'Moderate');
 assert.equal(wobble(moderate.map(s=>({...s,angle_deg:s.angle_deg*3}))).label,'High');
});
test('recovery requires an uninterrupted final two-second interval and actual velocity',()=>{
 const data=session('a',7).samples;assert.equal(trialMetrics(data)?.recovery,7);
 assert.equal(trialMetrics([...data.slice(0,-1),sample(12000,3)])?.recovery,null);
 assert.equal(trialMetrics(data.map(s=>({...s,angular_velocity_dps:undefined})))?.recovery,null);
 assert.equal(trialMetrics(data.slice(0,-30))?.recovery,7);
 assert.equal(trialMetrics([sample(0,0),sample(500,0)]),null);
 assert.equal(trialMetrics([sample(0,0),sample(0,0)]),null);
});
test('oscillation crossings ignore motion inside the ±0.5 degree deadband',()=>{
 const data=[2,.2,-.1,.1,-.6,-.2,.7].map((e,i)=>sample(i*50,e));assert.equal(trialMetrics(data)?.crossings,2);
});
test('improvement claims require complete, comparable standardized trials',()=>{
 const before=session('before',8),after=session('after',6);assert.ok(comparableTrials(before,after));assert.match(comparisonSummary(before,after)[0],/2.0s faster/);
 for(const invalid of [{...after,protocol:undefined},{...after,completed:false},{...after,mode:'LIVE'},{...after,samples:after.samples.slice(0,-2)}]){assert.equal(comparableTrials(before,invalid),false);assert.match(comparisonSummary(before,invalid)[0],/different or incomplete/);}
 const changed={...after,samples:after.samples.map(s=>({...s,target_deg:1}))};assert.equal(comparableTrials(before,changed),false);
});
test('configured real gain limits reject nonfinite and out-of-range commands',()=>{
 assert.ok(validPID(DEFAULT_PID,DEFAULT_RANGES));assert.equal(validPID({...DEFAULT_PID,kp:81},DEFAULT_RANGES),false);assert.equal(validPID({...DEFAULT_PID,ki:NaN},DEFAULT_RANGES),false);
 const custom={...DEFAULT_RANGES,kp:{min:0,max:20,step:.2}};assert.equal(validPID(DEFAULT_PID,custom),false);assert.ok(validPID({...DEFAULT_PID,kp:12.4},custom));
});

test('comparison traces retain actual timestamps even when sample intervals differ',async()=>{
 const {alignedResponses}=await import('./chartData');
 const a={...session('a',6),samples:[sample(1000,4),sample(1100,3),sample(2000,1)]};
 const b={...session('b',6),samples:[sample(5000,2),sample(5400,-1),sample(6000,0)]};
 const rows=alignedResponses([a,b]);assert.deepEqual(rows.map(r=>r.time),[0,.1,.4,1]);
 assert.equal(rows.find(r=>r.time===.1)?.run0,3);assert.equal(rows.find(r=>r.time===.4)?.run1,-1);assert.equal(rows.find(r=>r.time===.4)?.run0,undefined);
});
