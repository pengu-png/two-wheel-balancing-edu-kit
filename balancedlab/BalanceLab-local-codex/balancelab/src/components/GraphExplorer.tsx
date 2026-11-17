import { useState } from 'react';
import { ChevronDown, LineChart, MessageCircleQuestion } from 'lucide-react';
import { RealtimeChart } from './RealtimeChart';
import { trialMetrics } from '../lib/education';
import type { Telemetry } from '../lib/types';
const explanations = {
  Target: 'The dashed orange line is the angle the robot is trying to reach. The blue line shows its measured lean. Where do they meet?',
  'Biggest lean': 'The marked point is the largest distance from the target in the visible window. A smaller peak is one useful clue, but does not tell the whole story.',
  Wobble: 'Oscillation means moving back and forth around the target. Each side-to-side crossing outside ±0.5° counts once. More crossings can suggest more oscillation under the same test conditions.',
  Recovery: 'Recovery means moving back toward the target. For our 12-second challenges, a return near the target requires at least two continuous seconds within ±2° and ±3°/s at the end.',
  'Near target': 'The shaded band is within 2° of the target. Entering the band alone does not prove the robot has settled; it may still be moving quickly.',
};
export function GraphExplorer({ history, mode, valid, openInitially = false }: { history: Telemetry[]; mode: string; valid: boolean; openInitially?: boolean }) {
  const [open,setOpen] = useState(openInitially); const [term,setTerm] = useState<keyof typeof explanations>('Target'); const [annotations,setAnnotations] = useState(true);
  const m = trialMetrics(history);
  return <section className="graph-explorer" id="response-story"><button className="graph-reveal" aria-expanded={open} onClick={() => setOpen(!open)}><span className="student-icon purple"><LineChart size={20}/></span><span><strong>{open ? 'The story behind the wobble' : 'See what happened'}</strong><small>Follow the lean, the correction, and the recovery.</small></span><ChevronDown size={19} className={open?'rotated':''}/></button>{open && <div className="graph-story-body"><div className="graph-intro"><p>{valid ? 'This is the same robot data you see above. Hover over the graph to inspect a moment.' : 'Fresh data is unavailable. Any graph below shows earlier samples, not the robot’s current condition.'}</p><label><input type="checkbox" checked={annotations} onChange={e => setAnnotations(e.target.checked)}/>Show learning hints</label></div><RealtimeChart light history={history} mode={mode} title="How the robot leaned" educational={annotations}/><div className="graph-term-buttons" role="group" aria-label="Understand the graph">{(Object.keys(explanations) as (keyof typeof explanations)[]).map(key => <button key={key} className={term===key?'active':''} aria-pressed={term===key} onClick={() => setTerm(key)}>{key}</button>)}</div><p className="graph-explanation"><MessageCircleQuestion size={18}/><span>{explanations[term]}{term==='Wobble' && m && <strong> Current retained window: {m.crossings} crossings.</strong>}</span></p><details className="reflection"><summary>Something to wonder about</summary><p>Why might the robot lean past the target before coming back? Try a different setting, then compare equal-length recordings.</p></details></div>}</section>;
}
