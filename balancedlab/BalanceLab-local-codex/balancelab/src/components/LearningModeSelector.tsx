import { BookOpen, Compass, Gauge } from 'lucide-react';
import type { LearningMode } from '../lib/types';
const modes = [{ name: 'Play' as const, icon: Compass, subtitle: 'Try it out' }, { name: 'Learn' as const, icon: BookOpen, subtitle: 'Discover the why' }, { name: 'Engineer' as const, icon: Gauge, subtitle: 'Explore the details' }];
export function LearningModeSelector({ value, onChange }: { value: LearningMode; onChange: (mode: LearningMode) => void }) {
  return <div className="learning-toolbar"><div><span className="learning-kicker">YOUR LEARNING SPACE</span><p>One robot. Three ways to explore.</p></div><div className="learning-mode-selector" role="group" aria-label="Learning mode">{modes.map(m => <button key={m.name} aria-pressed={value === m.name} className={value === m.name ? 'selected' : ''} onClick={() => onChange(m.name)}><m.icon size={17}/><span><strong>{m.name}</strong><small>{m.subtitle}</small></span></button>)}</div></div>;
}
