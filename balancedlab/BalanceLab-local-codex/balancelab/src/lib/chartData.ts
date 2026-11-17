import type { Session } from './types';
/** Align recordings by their actual sample timestamps; downsample only by retaining measured points. */
export function alignedResponses(sessions: Session[], maxPointsPerSession = 1200): Record<string, number>[] {
  const rows = new Map<number, Record<string, number>>();
  sessions.forEach((session, n) => {
    const start = session.samples[0]?.timestamp_ms;
    if (start === undefined) return;
    const stride = Math.max(1, Math.ceil(session.samples.length / maxPointsPerSession));
    session.samples.forEach((sample, i) => {
      if (i % stride !== 0 && i !== session.samples.length - 1) return;
      const time = +((sample.timestamp_ms - start) / 1000).toFixed(3);
      if (!Number.isFinite(time) || time < 0) return;
      const row = rows.get(time) ?? { time };
      row[`run${n}`] = sample.angle_deg - sample.target_deg;
      rows.set(time, row);
    });
  });
  return [...rows.values()].sort((a, b) => a.time - b.time);
}
