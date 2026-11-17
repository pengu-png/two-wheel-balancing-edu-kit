import type { GainRanges, PID, Session, Telemetry } from './types';

export const TRIAL_SECONDS = 12;
export const NEAR_TARGET_DEG = 2;
export const NEAR_TARGET_DPS = 3;
export const GAIN_LESSONS = [
  { key: 'kp' as const, label: 'Balance Strength', term: 'Kp · Proportional', title: 'React to leaning', short: 'How strongly should the robot react to a lean?', detail: 'Proportional control reacts to the difference between the measured angle and the target angle. Increasing it strengthens correction, but can also increase oscillation.', prompt: 'What changes when you increase balance strength?', experiment: 0 },
  { key: 'ki' as const, label: 'Long-term Correction', term: 'Ki · Integral', title: 'Fix persistent error', short: 'How much should a small, lasting lean influence correction?', detail: 'Integral control adds up error over time. It can reduce persistent error, but too much can add overshoot or slow recovery. Our simulator may have very little persistent error to correct.', prompt: 'When would a small error need extra attention?', experiment: 2 },
  { key: 'kd' as const, label: 'Wobble Control', term: 'Kd · Derivative', title: 'React to changing motion', short: 'How much should changing motion influence correction?', detail: 'Derivative control reacts to how quickly the error changes. It can damp oscillation, but too much can make response sluggish and amplify sensor noise on real hardware.', prompt: 'Can stronger damping also slow the response?', experiment: 1 },
];

export function validPID(pid: PID, ranges: GainRanges) {
  return (['kp', 'ki', 'kd'] as const).every(k => Number.isFinite(pid[k]) && pid[k] >= ranges[k].min && pid[k] <= ranges[k].max);
}

// Wobble is the standard deviation of angle error in the last 3 seconds.
// At least 1 second and 10 samples are required; low <0.5°, moderate <2°, otherwise high.
export function wobble(samples: Telemetry[]) {
  const last = samples.at(-1)?.timestamp_ms ?? 0;
  const recent = samples.filter(s => s.timestamp_ms >= last - 3000);
  if (recent.length < 10 || last - recent[0].timestamp_ms < 1000) return { label: 'Measuring…', value: null };
  const values = recent.map(s => s.angle_deg - s.target_deg);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
  return { label: sd < .5 ? 'Low' : sd < 2 ? 'Moderate' : 'High', value: sd };
}

export function studentStatus(data: Telemetry | null, valid: boolean) {
  if (!valid || !data) return { label: 'Waiting', message: 'Waiting for fresh robot data.', tone: 'waiting' };
  if (data.state === 'FALLEN') return { label: 'Fallen', message: 'That was a big wobble! Reset and try again.', tone: 'warning' };
  if (data.state === 'ESTOP') return { label: 'Stopped safely', message: 'Emergency stop is active. Reset before rearming.', tone: 'warning' };
  if (data.state !== 'BALANCING') return { label: data.state === 'ARMED' ? 'Ready' : 'Paused', message: data.state === 'ARMED' ? 'Ready when you are. Start balancing!' : 'The controller is paused. Arm, then start to explore.', tone: 'waiting' };
  const error = data.angle_deg - data.target_deg;
  const velocity = data.angular_velocity_dps;
  if (velocity === undefined) return { label: 'Motion unknown', message: `The robot is ${Math.abs(error).toFixed(1)}° from its target. Motion data is unavailable.`, tone: 'waiting' };
  if (Math.abs(error) <= NEAR_TARGET_DEG && Math.abs(velocity) <= NEAR_TARGET_DPS) return { label: 'Balancing', message: 'Looking steady!', tone: 'steady' };
  if (error * velocity < 0) return { label: 'Recovering', message: 'Trying to recover… Watch the lean shrink.', tone: 'recovering' };
  return { label: 'Leaning', message: Math.abs(error) >= 8 ? "Whoa! I’m leaning!" : 'A little wobble. Watch what happens next.', tone: 'warning' };
}

export type TrialMetrics = { peak: number; rms: number; crossings: number; recovery: number | null; duration: number };
// Recovery: first sample in a final uninterrupted ≥2s interval within ±2° and ±3°/s.
// Count target crossings only after error leaves a ±0.5° deadband.
export function trialMetrics(samples: Telemetry[]): TrialMetrics | null {
  if (samples.length < 2) return null;
  let lastSign = 0, crossings = 0, candidate: number | null = null;
  let sum = 0, peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    if (!Number.isFinite(s.angle_deg) || !Number.isFinite(s.target_deg) || !Number.isFinite(s.timestamp_ms)) return null;
    if (i && (s.timestamp_ms <= samples[i - 1].timestamp_ms || s.timestamp_ms - samples[i - 1].timestamp_ms > 250)) return null;
    const error = s.angle_deg - s.target_deg;
    sum += error * error; peak = Math.max(peak, Math.abs(error));
    const sign = Math.abs(error) > .5 ? Math.sign(error) : 0;
    if (sign) { if (lastSign && sign !== lastSign) crossings++; lastSign = sign; }
    if (s.state === 'BALANCING' && Math.abs(error) <= NEAR_TARGET_DEG && s.angular_velocity_dps !== undefined && Math.abs(s.angular_velocity_dps) <= NEAR_TARGET_DPS) candidate ??= s.timestamp_ms;
    else candidate = null;
  }
  const start = samples[0].timestamp_ms, end = samples.at(-1)!.timestamp_ms;
  return { peak, rms: Math.sqrt(sum / samples.length), crossings, duration: (end - start) / 1000, recovery: candidate !== null && end - candidate >= 2000 ? (candidate - start) / 1000 : null };
}

export function comparableTrials(before: Session, after: Session) {
  const a = trialMetrics(before.samples), b = trialMetrics(after.samples);
  return !!(a && b && before.id !== after.id && before.mode === 'SIMULATION' && after.mode === 'SIMULATION' && before.protocol === 'push-v1' && after.protocol === 'push-v1' && before.completed && after.completed && a.duration >= TRIAL_SECONDS && a.duration <= TRIAL_SECONDS + .25 && b.duration >= TRIAL_SECONDS && b.duration <= TRIAL_SECONDS + .25 && Math.abs((before.samples[0].angle_deg - before.samples[0].target_deg) - (after.samples[0].angle_deg - after.samples[0].target_deg)) < .5 && before.samples.every(s => s.target_deg === before.samples[0].target_deg) && after.samples.every(s => s.target_deg === before.samples[0].target_deg));
}

export function comparisonSummary(before: Session, after: Session) {
  if (!comparableTrials(before, after)) return ['These recordings have different or incomplete test conditions. View their graphs, but avoid a better-or-worse claim.'];
  const a = trialMetrics(before.samples)!, b = trialMetrics(after.samples)!;
  const statements: string[] = [];
  if (a.recovery !== null && b.recovery !== null) statements.push(Math.abs(a.recovery - b.recovery) < .15 ? 'Both settings returned near the target in about the same time.' : b.recovery < a.recovery ? `Your robot returned near the target ${(a.recovery - b.recovery).toFixed(1)}s faster this time.` : `Your robot took ${(b.recovery - a.recovery).toFixed(1)}s longer to return near the target this time.`);
  else statements.push('A lasting return near the target was not observed in at least one recording. Recovery time is unavailable.');
  statements.push(b.crossings === a.crossings ? `Both recordings crossed the target ${b.crossings} times outside the small-motion deadband.` : b.crossings > a.crossings ? `This setting crossed the target more often (${a.crossings} → ${b.crossings}), suggesting more oscillation in this test.` : `This setting crossed the target fewer times (${a.crossings} → ${b.crossings}), suggesting less oscillation in this test.`);
  statements.push(Math.abs(b.peak - a.peak) < .1 ? 'The biggest lean was similar in both tests.' : b.peak > a.peak ? `The robot leaned ${(b.peak - a.peak).toFixed(1)}° further at its largest lean this time.` : `The biggest lean was ${(a.peak - b.peak).toFixed(1)}° smaller this time.`);
  return statements;
}
