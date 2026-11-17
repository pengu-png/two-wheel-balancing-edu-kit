import { useCallback, useEffect, useRef, useState } from 'react';
import { SimulationProvider, WebSocketProvider, type DataProvider } from './providers';
import { DEFAULT_PID, type Command, type Connection, type PID, type Telemetry } from './types';
export function useRobot(mode: 'SIMULATION' | 'LIVE', url: string) {
  const [data, setData] = useState<Telemetry | null>(null); const [history, setHistory] = useState<Telemetry[]>([]);
  const [status, setStatus] = useState<Connection>('Connecting'); const [applied, setApplied] = useState<PID | null>(DEFAULT_PID);
  const provider = useRef<DataProvider | null>(null); const onSample = useRef<(d: Telemetry) => void>(() => {});
  const [reconnect, setReconnect] = useState(0);
  const sourceKey = `${mode}|${url}|${reconnect}`;
  const activeSource = useRef('');
  useEffect(() => {
    activeSource.current = sourceKey;
    setData(null); setHistory([]); setStatus('Connecting'); setApplied(mode === 'SIMULATION' ? { ...DEFAULT_PID } : null);
    const p = mode === 'SIMULATION' ? new SimulationProvider() : new WebSocketProvider(url); provider.current = p;
    let latest: Telemetry | null = null; const buffer: Telemetry[] = [];
    p.connect(d => { latest = d; buffer.push(d); if (buffer.length > 1200) buffer.shift(); onSample.current(d); }, setStatus);
    const refresh = setInterval(() => { if (latest) { setData(latest); setHistory([...buffer]); } }, 100);
    return () => { p.close(); clearInterval(refresh); };
  }, [mode, url, reconnect]);
  const command = useCallback(async (action: Command, payload?: PID) => {
    if ((activeSource.current !== sourceKey || status !== 'Connected') && action !== 'estop') throw new Error('Fresh telemetry is required for this action.');
    const current=provider.current;
    if(!current) throw new Error('No robot data provider is active.');
    await current.command(action, payload);
    if(current!==provider.current) throw new Error('The data source changed before this command completed.');
    if (action === 'pid' && payload) setApplied({ ...payload });
  }, [status,sourceKey]);
  const matches=activeSource.current===sourceKey;
  return { data:matches?data:null, history:matches?history:[], status:matches?status:'Connecting' as Connection, applied:matches?applied:null, command, onSample, reconnect: () => setReconnect(n => n + 1) };
}
