import test from 'node:test';
import assert from 'node:assert/strict';
import React,{act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import App from '../src/App';
import {SimulationProvider} from '../src/lib/providers';
import type {Session} from '../src/lib/types';

function button(text:string,scope:ParentNode=document):HTMLButtonElement {
  const found=[...scope.querySelectorAll<HTMLButtonElement>('button')].find(b=>b.textContent?.trim()===text);
  assert.ok(found,`Button not found: ${text}`);return found;
}
async function click(b:HTMLElement){await act(async()=>b.click());}
async function input(id:string,value:string){await act(async()=>{const node=document.getElementById(id) as HTMLInputElement;assert.ok(node,id);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(node,value);node.dispatchEvent(new Event('input',{bubbles:true}));});}
async function select(id:string,value:string){await act(async()=>{const node=document.getElementById(id) as HTMLSelectElement;assert.ok(node,id);node.value=value;node.dispatchEvent(new Event('change',{bubbles:true}));});}
async function mount():Promise<Root>{localStorage.clear();document.body.innerHTML='<div id="root"></div>';const root=createRoot(document.getElementById('root')!);await act(async()=>root.render(<App/>));return root;}
async function learning(name:string){const group=document.querySelector('[aria-label="Learning mode"]')!;const b=[...group.querySelectorAll<HTMLButtonElement>('button')].find(b=>b.querySelector('strong')?.textContent===name);assert.ok(b);await click(b);}
async function nav(label:string){const b=[...document.querySelectorAll<HTMLButtonElement>('.sidebar nav button')].find(b=>b.querySelector('span')?.textContent===label);assert.ok(b,label);await click(b);}

test('Play is default; all modes reuse the same provider, gains and animated twin',async t=>{
  t.mock.timers.enable({apis:['setInterval']});const connection=t.mock.method(SimulationProvider.prototype,'connect');const root=await mount();t.after(async()=>{await act(async()=>root.unmount());});
  assert.ok(document.querySelector('.student-theme'));assert.match(document.querySelector('h1')!.textContent!,/Ready to balance/);
  await act(async()=>{for(let i=0;i<5;i++)t.mock.timers.tick(50);});
  const pose=document.querySelector('.robot-svg g[style]')!.getAttribute('style');assert.ok(pose?.includes('rotate'));
  await input('friendly-kp','42');assert.equal((document.getElementById('friendly-kp') as HTMLInputElement).value,'42');
  assert.match(document.querySelector('.student-controls')!.textContent!,/Applied: 32.0/);
  await click(button('Apply settings'));assert.match(document.querySelector('.student-controls')!.textContent!,/Applied: 42.0/);
  await learning('Learn');assert.match(document.querySelector('.pid-learning-cards')!.textContent!,/Kp · Proportional/);
  assert.equal((document.getElementById('friendly-kp') as HTMLInputElement).value,'42');
  await learning('Engineer');assert.ok(document.querySelector('.engineer-theme'));assert.equal(document.querySelectorAll('.telemetry-card').length,6);
  assert.equal((document.getElementById('kp-number') as HTMLInputElement).value,'42');
  await act(async()=>{for(let i=0;i<10;i++)t.mock.timers.tick(50);});
  assert.notEqual(document.querySelector('.robot-svg g[style]')!.getAttribute('style'),pose);
  await learning('Play');assert.equal((document.getElementById('friendly-kp') as HTMLInputElement).value,'42');assert.equal(connection.mock.callCount(),1);
  await click(button('Take a quick tour'));assert.ok(document.querySelector('[role="dialog"]'));
  await act(async()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));
  assert.equal(document.querySelector('[role="dialog"]'),null);
});

test('guided trials record real simulated samples, save predictions and compare in both interfaces',async t=>{
  t.mock.timers.enable({apis:['setInterval']});const root=await mount();t.after(async()=>{await act(async()=>root.unmount());});
  await act(async()=>t.mock.timers.tick(200));await nav('Experiment Lab');
  await select('prediction','The robot will cross the target fewer times.');
  await click(button('Start challenge'));
  await learning('Engineer');assert.ok(document.querySelector('.recording-float'));await learning('Play');
  await act(async()=>{for(let i=0;i<242;i++)t.mock.timers.tick(50);});
  assert.ok(document.querySelector('[aria-labelledby="save-title"]'));assert.match(document.querySelector('.trial-feedback')!.textContent!,/Full 12-second test/);
  await click(button('Save experiment'));let saved=JSON.parse(localStorage.getItem('balancelab.sessions.v1')!) as Session[];
  assert.equal(saved.length,1);assert.equal(saved[0].protocol,'push-v1');assert.equal(saved[0].completed,true);assert.equal(saved[0].prediction,'The robot will cross the target fewer times.');assert.ok(saved[0].samples.length>=240);
  await input('friendly-kd','6');await click(button('Apply settings'));await click(button('Retry this challenge'));
  await act(async()=>{for(let i=0;i<242;i++)t.mock.timers.tick(50);});await click(button('Save experiment'));
  saved=JSON.parse(localStorage.getItem('balancelab.sessions.v1')!);assert.equal(saved.length,2);assert.equal(saved[1].pid.kd,6);
  await nav('My discoveries');assert.ok(document.querySelector('.before-after'));assert.doesNotMatch(document.querySelector('.comparison-takeaways')!.textContent!,/different or incomplete/);assert.match(document.querySelector('.comparison-takeaways')!.textContent!,/target/);
  await learning('Engineer');assert.equal(document.querySelectorAll('.results-table tbody tr').length,2);
});

test('live controls require confirmation, firmware ack and fresh data; simulation pushes stay disabled',async t=>{
  t.mock.timers.enable({apis:['Date','setInterval','setTimeout']});const original=globalThis.WebSocket;
  class Socket {static OPEN=1;static instance:Socket;readyState=1;onopen?:()=>void;onmessage?:(event:{data:string})=>void;onclose?:()=>void;onerror?:()=>void;sent:string[]=[];constructor(_url:string){Socket.instance=this;}send(data:string){this.sent.push(data);}close(){this.readyState=3;}}
  globalThis.WebSocket=Socket as unknown as typeof WebSocket;
  const root=await mount();t.after(async()=>{await act(async()=>root.unmount());globalThis.WebSocket=original;});
  await act(async()=>t.mock.timers.tick(200));await nav('Settings');await click(button('Live robotESP32 WebSocket telemetry'));
  const ws=Socket.instance;await act(async()=>ws.onopen?.());await nav('Robot playground');
  assert.match(document.querySelector('.robot-friendly-feedback')!.textContent!,/Waiting for fresh/);assert.equal(button('Give the robot a push!One bounded simulated nudge').disabled,true);
  await act(async()=>{ws.onmessage?.({data:JSON.stringify({type:'telemetry',timestamp_ms:100,angle_deg:1.2,target_deg:0,state:'ARMED',angular_velocity_dps:0})});t.mock.timers.tick(100);});
  assert.equal(document.querySelector('.simple-telemetry>div strong')!.textContent,'1.2°');
  await click(button('Start control'));assert.ok(document.querySelector('[aria-labelledby="live-confirm-title"]'));assert.equal(ws.sent.length,0);await click(button('Cancel'));assert.equal(ws.sent.length,0);
  await click(button('Apply settings'));await click(button('Confirm & send'));assert.equal(ws.sent.length,1);const cmd=JSON.parse(ws.sent[0]);assert.equal(cmd.action,'pid');assert.match(document.querySelector('.student-controls')!.textContent!,/Applied: Unknown/);
  await act(async()=>ws.onmessage?.({data:JSON.stringify({type:'ack',id:cmd.id,ok:true})}));assert.match(document.querySelector('.student-controls')!.textContent!,/Applied: 32.0/);
  await click(button('Start control'));const dialog=document.querySelector('[aria-labelledby="live-confirm-title"]')!;await click(button('Emergency stop',dialog));
  assert.equal(document.querySelector('[aria-labelledby="live-confirm-title"]'),null);const stop=JSON.parse(ws.sent.at(-1)!);assert.equal(stop.action,'estop');await act(async()=>ws.onmessage?.({data:JSON.stringify({type:'ack',id:stop.id,ok:true})}));
  await act(async()=>t.mock.timers.tick(2500));assert.match(document.querySelector('.robot-friendly-feedback')!.textContent!,/Waiting for fresh/);assert.equal(button('Start control').disabled,true);
});

test('safety stop interrupts a challenge and never saves it as a complete comparison trial',async t=>{
 t.mock.timers.enable({apis:['setInterval']});const root=await mount();t.after(async()=>{await act(async()=>root.unmount());});
 await act(async()=>t.mock.timers.tick(200));await nav('Experiment Lab');await click(button('Start challenge'));
 await act(async()=>{for(let i=0;i<25;i++)t.mock.timers.tick(50);});
 await click(button('Emergency stop',document.querySelector('.topbar')!));assert.ok(document.querySelector('[aria-labelledby="save-title"]'));assert.match(document.querySelector('.trial-feedback')!.textContent!,/Incomplete or interrupted/);
 await click(button('Save experiment'));const saved=JSON.parse(localStorage.getItem('balancelab.sessions.v1')!) as Session[];assert.equal(saved[0].completed,false);assert.equal(saved[0].protocol,undefined);assert.equal(document.querySelector('.recording-float'),null);
});
