import { ArrowRight, BookOpen, Hand, LineChart, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { AccessibleDialog } from './AccessibleDialog';
const steps = [
  { icon: BookOpen, title: 'Meet your balancing robot', text: 'The two-wheel robot leans using the same data shown on the page. In Simulation, you can experiment without moving real hardware.', anchor: 'robot-playground' },
  { icon: SlidersHorizontal, title: 'Try a different setting', text: 'Adjust one slider at a time. Nothing changes until you press Apply settings. More strength is not always better!', anchor: 'balance-controls' },
  { icon: Hand, title: 'Give it a gentle push', text: 'In Simulation, the push button adds a bounded nudge. Watch whether the robot leans further, recovers, or falls.', anchor: 'robot-playground' },
  { icon: LineChart, title: 'Look behind the movement', text: 'See what happened opens the real response graph. Blue shows lean; dashed orange shows the target.', anchor: 'response-story' },
  { icon: BookOpen, title: 'Make it an investigation', text: 'Experiment Lab has short challenges. Make a prediction, record a 12-second trial, then try a new setting and compare.', anchor: 'mini-challenge-link' },
];
export function Walkthrough({ onClose, onEmergency }: { onClose: () => void; onEmergency?: () => Promise<unknown> }) {
  const [step,setStep] = useState(0); const current = steps[step]; const Icon = current.icon;
  return <AccessibleDialog titleId="tour-title" onClose={onClose} className="tutorial-modal" onEmergency={onEmergency}><div className="tutorial-top"><span className="learning-kicker">A QUICK LOOK AROUND · {step+1} OF {steps.length}</span><button className="icon-button" aria-label="Close tutorial" onClick={onClose}><X size={19}/></button></div><div className="tutorial-illustration"><Icon size={48}/></div><h2 id="tour-title">{current.title}</h2><p>{current.text}</p><div className="tutorial-dots">{steps.map((s,i) => <button key={s.title} title={`Tutorial step ${i+1}`} aria-label={`Go to tutorial step ${i+1}`} aria-current={step===i?'step':undefined} className={step===i?'active':''} onClick={() => setStep(i)}/>)}</div><div className="tutorial-actions"><button className="text-button" onClick={onClose}>Skip tutorial</button><button className="button primary" onClick={() => { if(step===4) { onClose(); document.getElementById(current.anchor)?.scrollIntoView({block:'center'}); } else setStep(step+1); }}>{step===4 ? 'Let’s explore' : 'Next'}<ArrowRight size={16}/></button></div></AccessibleDialog>;
}
