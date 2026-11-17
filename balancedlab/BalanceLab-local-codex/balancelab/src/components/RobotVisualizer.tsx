import { Maximize2, RotateCcw } from 'lucide-react';
import { studentStatus } from '../lib/education';
import type { Telemetry } from '../lib/types';
export function RobotVisualizer({ data, valid, mode, disturb, running, fullscreen, onExpand, friendly = false }: { data: Telemetry | null; valid: boolean; mode: string; disturb: () => void; running: boolean; fullscreen?: boolean; friendly?: boolean; onExpand?: () => void }) {
  const feedback = studentStatus(data,valid);
  const angle = valid && data ? data.angle_deg : null;
  const state = valid ? data?.state : undefined;
  const stable = state === 'BALANCING' && Math.abs(angle ?? 99) < 5;
  return <section className={`panel robot-panel ${fullscreen ? 'expanded-robot' : ''}`}>
    <div className="panel-head"><h2><span className="tiny-square"/>{friendly?'Your balancing robot':'Robot digital twin'}</h2><button className="icon-button" title="Expand visualizer" onClick={onExpand}><Maximize2 size={16}/></button></div>
    <div className="robot-stage">
      <div className="twin-meta"><span className="eyebrow">{friendly?'WATCH IT FIND ITS BALANCE':'ATTITUDE MONITOR'}</span><span className={`badge ${(friendly ? feedback.tone==='steady' : stable) ? 'green' : 'neutral'}`}><i/>{friendly ? feedback.label : !valid ? 'No fresh data' : stable ? 'Upright & stable' : state === 'BALANCING' ? 'Correcting tilt' : state?.replaceAll('_', ' ') || 'State unavailable'}</span></div>
      <div className="angle-readout"><strong>{angle === null ? '—' : angle.toFixed(2)}<small>°</small></strong><span>{friendly?'Current lean':'Current tilt angle'}</span></div>
      <svg className="robot-svg" viewBox="0 0 660 330" role="img" aria-label={`Two-wheel robot at ${angle?.toFixed(2) ?? 'unknown'} degrees`}>
        <defs>
          <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#526078"/><stop offset=".5" stopColor="#26364c"/><stop offset="1" stopColor="#121f30"/></linearGradient>
          <linearGradient id="tire" x1="0" x2="1"><stop stopColor="#0a101b"/><stop offset=".5" stopColor="#283444"/><stop offset="1" stopColor="#080e17"/></linearGradient>
          <linearGradient id="pcb" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#164b54"/><stop offset="1" stopColor="#0b2a34"/></linearGradient>
          <radialGradient id="halo"><stop stopColor="#22d3ee" stopOpacity=".12"/><stop offset="1" stopColor="#22d3ee" stopOpacity="0"/></radialGradient>
          <pattern id="grid" width="34" height="22" patternUnits="userSpaceOnUse"><path d="M34 0H0V22" fill="none" stroke="#26354a" strokeWidth=".7"/></pattern>
        </defs>
        <ellipse cx="337" cy="249" rx="225" ry="80" fill="url(#halo)"/>
        <path className="reference-floor" d="M34 280L205 220H465L628 280Z" fill="url(#grid)" opacity=".55"/>
        <path className="reference-ground" d="M38 280H625" stroke="#40516a"/><path d="M331 38V282" stroke="#527188" strokeDasharray="5 7" opacity=".45"/>
        <ellipse cx="332" cy="277" rx="107" ry="10" fill="#030916" opacity=".6"/>
        <g style={{ transformOrigin: '332px 251px', transform: `rotate(${Math.max(-40, Math.min(40, angle ?? 0))}deg)`, transition: 'transform 120ms linear' }}>
          <g transform="translate(399 220)"><ellipse rx="28" ry="49" fill="#080e17" stroke="#3a4859"/><ellipse cx="9" rx="27" ry="49" fill="url(#tire)" stroke="#465166"/><ellipse cx="11" rx="16" ry="33" fill="#111d2d" stroke="#607084"/><ellipse cx="13" rx="7" ry="14" fill="#718599"/><path d="M-6-39L13-36M-11-24L10-21M-13-7L9-5M-12 11L9 12M-7 29L13 30" stroke="#687789" strokeWidth="3" opacity=".4"/></g>
          <path d="M271 112L353 84L401 113L317 143Z" fill="#3c4e65" stroke="#70819b"/>
          <path d="M271 112L317 143V246L271 217Z" fill="#15273b" stroke="#465972"/>
          <path d="M317 143L401 113V217L317 246Z" fill="url(#metal)" stroke="#607087"/>
          <path d="M282 123L308 139V215L282 199Z" fill="#091321" stroke="#314b66"/>
          <path d="M287 138L303 147M287 150L303 159M287 162L303 171M287 174L303 183" stroke="#465d74" strokeWidth="3"/>
          <path d="M329 144L389 123V198L329 220Z" fill="url(#pcb)" stroke="#31808a"/>
          <path d="M339 155L378 141V176L339 190Z" fill="#122332" stroke="#9caab3"/>
          <path d="M346 156L371 147V174L346 183Z" fill="#34465a"/>
          <path d="M343 197L376 185M345 202L370 193" stroke="#64a49e"/>
          <g stroke="#80aaa8" strokeWidth="2"><path d="M336 153L332 155M336 162L332 164M336 171L332 173M336 180L332 182M381 143L386 141M381 152L386 150M381 161L386 159M381 170L386 168"/></g>
          <circle cx="380" cy="182" r="3" fill={valid ? '#34d399' : '#64748b'} className={valid ? 'led' : ''}/><circle cx="337" cy="207" r="2" fill="#f59e0b"/>
          <path d="M287 108V75L331 61L374 83V97" fill="none" stroke="#74859b" strokeWidth="5"/><path d="M287 75L331 61L374 83L331 99Z" fill="#2e4159" stroke="#7689a0"/>
          <path d="M301 77L331 67L357 82L329 91Z" fill="#101e31" stroke="#22d3ee" strokeOpacity=".5"/>
          <circle cx="331" cy="79" r="4" fill="#22d3ee"/>
          <path d="M280 215L322 241L397 216V228L322 256L280 230Z" fill="#4b6078" stroke="#71859b"/>
          <g transform="translate(273 238)"><ellipse rx="32" ry="45" fill="#080e17" stroke="#475265"/><ellipse cx="-12" rx="31" ry="45" fill="url(#tire)" stroke="#506077"/><ellipse cx="-15" rx="21" ry="32" fill="#111c2d" stroke="#75869b"/><ellipse cx="-16" rx="11" ry="20" fill="#40536a" stroke="#8ca1b2"/><ellipse cx="-17" rx="5" ry="9" fill="#0b1726"/><path d="M-24-35L-3-37M-31-21L-8-24M-35-5L-10-8M-33 13L-9 10M-28 30L-5 27" stroke="#69788c" strokeWidth="3" opacity=".5"/></g>
        </g>
        <path d="M435 163A117 117 0 0 1 448 234" fill="none" stroke="#22d3ee" strokeOpacity=".4" strokeWidth="1.5"/>
        <path d="M438 169L435 163L431 170M443 232L448 237L452 230" fill="none" stroke="#22d3ee"/>
        <path d="M329 156L413 128H453" fill="none" stroke="#4a6c80" strokeDasharray="3 4"/><text x="461" y="132" fill="#8295ac" fontSize="10" fontFamily="monospace">ESP32-S3</text>
        <text x="307" y="310" fill="#667c96" fontSize="10" fontFamily="monospace">0° REFERENCE</text>
      </svg>
      <div className="stage-bottom"><span><i className="dot cyan"/>{mode === 'SIMULATION' ? 'Simulated environment' : 'ESP32 telemetry'}</span><span>Target <b>{valid && data ? data.target_deg.toFixed(1) + '°' : '—'}</b></span><button onClick={disturb} disabled={!running || mode !== 'SIMULATION'}><RotateCcw size={12}/>Add disturbance</button></div>
    </div>
  </section>;
}
