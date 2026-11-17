import type { Session, Telemetry } from './types';
const KEY = 'balancelab.sessions.v1';
export function readSessions(): Session[] { try { const data = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(data) ? data.filter(s => s.id && Array.isArray(s.samples)) : []; } catch { return []; } }
export function storeSessions(sessions: Session[]) { localStorage.setItem(KEY, JSON.stringify(sessions)); }
export function metrics(samples: Telemetry[]) {
  const errors = samples.map(s => s.angle_deg - s.target_deg).filter(Number.isFinite);
  return { max: errors.length ? Math.max(...errors.map(Math.abs)) : null, rmse: errors.length ? Math.sqrt(errors.reduce((sum, e) => sum + e * e, 0) / errors.length) : null };
}
export function download(name: string, content: string, type = 'text/plain') { const url = URL.createObjectURL(new Blob([content], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
export function exportCSV(session: Session) { const fields: (keyof Telemetry)[] = ['timestamp_ms','angle_deg','target_deg','angular_velocity_dps','motor_left_pct','motor_right_pct','battery_voltage','control_hz','state']; download(`${session.name.replace(/[^a-z0-9]/gi, '-')}.csv`, fields.join(',') + '\n' + session.samples.map(s => fields.map(f => s[f] ?? '').join(',')).join('\n'), 'text/csv'); }
