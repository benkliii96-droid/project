import React, { useMemo } from 'react'

type ExType = 'squat' | 'pushup' | 'curl' | 'row' | 'hinge' | 'plank' | 'generic'

function detectType(name: string): ExType {
  const n = name.toLowerCase()
  if (n.includes('squat') || n.includes('lunge'))                       return 'squat'
  if (n.includes('push')  || n.includes('press'))                       return 'pushup'
  if (n.includes('curl')  || n.includes('bicep'))                       return 'curl'
  if (n.includes('row')   || n.includes('pull') || n.includes('lat'))   return 'row'
  if (n.includes('deadlift') || n.includes('hinge') || n.includes('rdl')) return 'hinge'
  if (n.includes('plank') || n.includes('core'))                        return 'plank'
  return 'generic'
}

// ── SMIL helpers ──────────────────────────────────────────────────────────────
// Animate SVG coordinates directly — no transform-origin issues

const KS = '0.45 0 0.55 1;0.45 0 0.55 1'  // ease-in-out splines
const KT = '0;0.5;1'

function Anim({ attr, a, b, dur = '2s' }: { attr: string; a: number; b: number; dur?: string }) {
  if (a === b) return null
  return (
    <animate
      attributeName={attr}
      values={`${a};${b};${a}`}
      dur={dur}
      repeatCount="indefinite"
      calcMode="spline"
      keyTimes={KT}
      keySplines={KS}
    />
  )
}

/** Animated line — interpolates all four coords independently */
function AL({
  ax1, ay1, ax2, ay2,
  bx1, by1, bx2, by2,
  w = 2.6, dur = '2s',
}: {
  ax1: number; ay1: number; ax2: number; ay2: number
  bx1: number; by1: number; bx2: number; by2: number
  w?: number; dur?: string
}) {
  return (
    <line x1={ax1} y1={ay1} x2={ax2} y2={ay2}
      stroke="#00c9a0" strokeWidth={w} strokeLinecap="round" fill="none">
      <Anim attr="x1" a={ax1} b={bx1} dur={dur}/>
      <Anim attr="y1" a={ay1} b={by1} dur={dur}/>
      <Anim attr="x2" a={ax2} b={bx2} dur={dur}/>
      <Anim attr="y2" a={ay2} b={by2} dur={dur}/>
    </line>
  )
}

/** Animated circle — interpolates cx/cy */
function AC({
  ax, ay, bx, by, r = 3.2, dur = '2s',
}: {
  ax: number; ay: number; bx: number; by: number; r?: number; dur?: string
}) {
  return (
    <circle cx={ax} cy={ay} r={r} fill="#00c9a0" stroke="#091a17" strokeWidth="1.2">
      <Anim attr="cx" a={ax} b={bx} dur={dur}/>
      <Anim attr="cy" a={ay} b={by} dur={dur}/>
    </circle>
  )
}

// Static helpers
const SL = ({ x1, y1, x2, y2, w = 2.6, op = 1 }: { x1:number; y1:number; x2:number; y2:number; w?:number; op?:number }) =>
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00c9a0" strokeWidth={w} strokeLinecap="round" fill="none" opacity={op}/>
const SC = ({ cx, cy, r = 3.2 }: { cx:number; cy:number; r?:number }) =>
  <circle cx={cx} cy={cy} r={r} fill="#00c9a0" stroke="#091a17" strokeWidth="1.2"/>
const Floor = ({ x1, x2, y }: { x1:number; x2:number; y:number }) =>
  <line x1={x1} y1={y} x2={x2} y2={y} stroke="#00c9a0" strokeWidth="0.8" opacity="0.2" strokeDasharray="3 2"/>

// ── SQUAT ─────────────────────────────────────────────────────────────────────
// Two poses. Ankles FIXED. Knees spread forward. Body drops. Arms out for balance.
function SquatFigure() {
  const D = '2.2s'
  // A = standing, B = bottom of squat
  // Fixed
  const lAx=26, lAy=116,  rAx=54, rAy=116

  return (
    <svg viewBox="0 0 80 122" className="w-full h-full">
      <Floor x1={10} x2={70} y={116}/>

      {/* ── shins (ankle fixed) */}
      <AL ax1={30} ay1={92} ax2={lAx} ay2={lAy}  bx1={19} by1={89} bx2={lAx} by2={lAy} w={2.6} dur={D}/>
      <AL ax1={50} ay1={92} ax2={rAx} ay2={rAy}  bx1={61} by1={89} bx2={rAx} by2={rAy} w={2.6} dur={D}/>

      {/* ── thighs */}
      <AL ax1={40} ay1={65} ax2={30} ay2={92}  bx1={40} by1={71} bx2={19} by2={89} w={2.8} dur={D}/>
      <AL ax1={40} ay1={65} ax2={50} ay2={92}  bx1={40} by1={71} bx2={61} by2={89} w={2.8} dur={D}/>

      {/* ── spine */}
      <AL ax1={40} ay1={20} ax2={40} ay2={65}  bx1={40} by1={35} bx2={40} by2={71} w={3} dur={D}/>

      {/* ── upper arms */}
      <AL ax1={40} ay1={28} ax2={22} ay2={46}  bx1={40} by1={43} bx2={16} by2={53} w={2.2} dur={D}/>
      <AL ax1={40} ay1={28} ax2={58} ay2={46}  bx1={40} by1={43} bx2={64} by2={53} w={2.2} dur={D}/>

      {/* ── forearms (extend forward in squat) */}
      <AL ax1={22} ay1={46} ax2={16} ay2={58}  bx1={16} by1={53} bx2={5}  by2={59} w={2} dur={D}/>
      <AL ax1={58} ay1={46} ax2={64} ay2={58}  bx1={64} by1={53} bx2={75} by2={59} w={2} dur={D}/>

      {/* ── joints */}
      <AC ax={40} ay={65} bx={40} by={71} r={3.8} dur={D}/>   {/* hip */}
      <AC ax={30} ay={92} bx={19} by={89} r={3.2} dur={D}/>   {/* l knee */}
      <AC ax={50} ay={92} bx={61} by={89} r={3.2} dur={D}/>   {/* r knee */}
      <AC ax={22} ay={46} bx={16} by={53} r={2.6} dur={D}/>   {/* l elbow */}
      <AC ax={58} ay={46} bx={64} by={53} r={2.6} dur={D}/>   {/* r elbow */}
      <SC cx={lAx} cy={lAy} r={2.4}/>
      <SC cx={rAx} cy={rAy} r={2.4}/>

      {/* ── head (animates down with body) */}
      <circle cx="40" r="9" fill="#0d2922" stroke="#00c9a0" strokeWidth="2">
        <Anim attr="cy" a={11} b={26} dur={D}/>
      </circle>
    </svg>
  )
}

// ── PUSH-UP ───────────────────────────────────────────────────────────────────
// Hands and toes FIXED on floor. Body drops. Elbows bend.
function PushupFigure() {
  const D = '2.2s'
  // Fixed floor contacts
  const rHx=87, rHy=53,  lHx=57, lHy=56,  footx=7, footy=54

  return (
    <svg viewBox="0 0 130 62" className="w-full h-full">
      <Floor x1={4} x2={126} y={56}/>

      {/* ── torso */}
      <AL ax1={104} ay1={20} ax2={28} ay2={40}  bx1={104} by1={32} bx2={28} by2={51} w={3} dur={D}/>

      {/* ── right arm (upper) */}
      <AL ax1={88} ay1={26} ax2={87} ay2={46}   bx1={88} by1={38} bx2={80} by2={46} w={2.4} dur={D}/>
      {/* ── right arm (forearm, hand fixed) */}
      <AL ax1={87} ay1={46} ax2={rHx} ay2={rHy}  bx1={80} by1={46} bx2={rHx} by2={rHy} w={2.2} dur={D}/>

      {/* ── left arm (upper) */}
      <AL ax1={60} ay1={34} ax2={57} ay2={49}   bx1={60} by1={46} bx2={52} by2={52} w={2.4} dur={D}/>
      {/* ── left arm (forearm, hand fixed) */}
      <AL ax1={57} ay1={49} ax2={lHx} ay2={lHy}  bx1={52} by1={52} bx2={lHx} by2={lHy} w={2.2} dur={D}/>

      {/* ── leg */}
      <AL ax1={28} ay1={40} ax2={14} ay2={51}  bx1={28} by1={51} bx2={14} by2={56} w={2.6} dur={D}/>
      <AL ax1={14} ay1={51} ax2={footx} ay2={footy}  bx1={14} by1={56} bx2={footx} by2={footy} w={2} dur={D}/>

      {/* ── joints */}
      <AC ax={88} ay={26} bx={88} by={38} r={3} dur={D}/>
      <AC ax={87} ay={46} bx={80} by={46} r={2.6} dur={D}/>
      <AC ax={60} ay={34} bx={60} by={46} r={3} dur={D}/>
      <AC ax={57} ay={49} bx={52} by={52} r={2.6} dur={D}/>
      <AC ax={28} ay={40} bx={28} by={51} r={3.4} dur={D}/>
      <SC cx={rHx} cy={rHy} r={2.2}/>
      <SC cx={lHx} cy={lHy} r={2.2}/>
      <SC cx={footx} cy={footy} r={2}/>

      {/* ── head */}
      <circle cx="114" r="8.5" fill="#0d2922" stroke="#00c9a0" strokeWidth="2">
        <Anim attr="cy" a={13} b={25} dur={D}/>
      </circle>
    </svg>
  )
}

// ── CURL ──────────────────────────────────────────────────────────────────────
// Upper arms static. Only forearms move (rotate around fixed elbows).
function CurlFigure() {
  const D = '2s'
  return (
    <svg viewBox="0 0 80 118" className="w-full h-full">
      <Floor x1={10} x2={70} y={114}/>

      {/* ── static: spine, legs */}
      <SL x1={40} y1={20} x2={40} y2={72} w={3}/>
      <SL x1={40} y1={72} x2={30} y2={98} w={2.8}/>
      <SL x1={40} y1={72} x2={50} y2={98} w={2.8}/>
      <SL x1={30} y1={98} x2={26} y2={114} w={2.2}/>
      <SL x1={50} y1={98} x2={54} y2={114} w={2.2}/>
      <SC cx={40} cy={72} r={3.6}/>
      <SC cx={30} cy={98} r={3}/>
      <SC cx={50} cy={98} r={3}/>

      {/* ── static: upper arms */}
      <SL x1={40} y1={32} x2={24} y2={52}/>
      <SL x1={40} y1={32} x2={56} y2={52}/>
      <SC cx={40} cy={32} r={3}/>

      {/* ── animated: forearms (elbow is pivot) */}
      {/* Left: elbow fixed at (24,52). Wrist: A=(18,72) B=(10,34) */}
      <AL ax1={24} ay1={52} ax2={18} ay2={72}  bx1={24} by1={52} bx2={10} by2={34} w={2.4} dur={D}/>
      {/* Right: elbow fixed at (56,52). Wrist: A=(62,72) B=(70,34) */}
      <AL ax1={56} ay1={52} ax2={62} ay2={72}  bx1={56} by1={52} bx2={70} by2={34} w={2.4} dur={D}/>

      {/* elbow joints */}
      <SC cx={24} cy={52} r={2.8}/>
      <SC cx={56} cy={52} r={2.8}/>

      {/* wrist/dumbbell dots */}
      <AC ax={18} ay={72} bx={10} by={34} r={4} dur={D}/>
      <AC ax={62} ay={72} bx={70} by={34} r={4} dur={D}/>

      {/* ── head */}
      <circle cx="40" cy="11" r="9" fill="#0d2922" stroke="#00c9a0" strokeWidth="2"/>
    </svg>
  )
}

// ── ROW ───────────────────────────────────────────────────────────────────────
// Torso hinged ~45°, static. Only arms move (elbows pull back to hip).
function RowFigure() {
  const D = '2s'
  // Fixed: feet, static spine + legs
  return (
    <svg viewBox="0 0 120 66" className="w-full h-full">
      <Floor x1={4} x2={116} y={62}/>

      {/* ── static body */}
      {/* spine (hinged) */}
      <SL x1={90} y1={19} x2={44} y2={40} w={3}/>
      {/* legs */}
      <SL x1={44} y1={40} x2={34} y2={62} w={2.8}/>
      <SL x1={44} y1={40} x2={54} y2={62} w={2.8}/>
      <SC cx={44} cy={40} r={3.6}/>
      <SC cx={34} cy={62} r={2.4}/>
      <SC cx={54} cy={62} r={2.4}/>

      {/* ── shoulder joints (on spine, static) */}
      <SC cx={76} cy={24} r={3}/>
      <SC cx={68} cy={28} r={3}/>

      {/* ── arms: extend forward (A) → pull to hip (B) */}
      {/* upper arm */}
      <AL ax1={76} ay1={24} ax2={56} ay2={32}  bx1={76} by1={24} bx2={72} by2={20} w={2.4} dur={D}/>
      {/* forearm */}
      <AL ax1={56} ay1={32} ax2={40} ay2={42}  bx1={72} by1={20} bx2={68} by2={30} w={2.2} dur={D}/>

      {/* elbow + wrist */}
      <AC ax={56} ay={32} bx={72} by={20} r={2.8} dur={D}/>
      <AC ax={40} ay={42} bx={68} by={30} r={2.4} dur={D}/>

      {/* ── head */}
      <circle cx="98" cy="12" r="8.5" fill="#0d2922" stroke="#00c9a0" strokeWidth="2"/>
    </svg>
  )
}

// ── HINGE / DEADLIFT ──────────────────────────────────────────────────────────
// Ankles fixed. Torso goes from vertical → horizontal. Arms hang.
function HingeFigure() {
  const D = '2.4s'
  // Fixed
  const lAx=36, lAy=100,  rAx=60, rAy=100

  return (
    <svg viewBox="0 0 96 106" className="w-full h-full">
      <Floor x1={8} x2={88} y={100}/>

      {/* ── legs (soft bend — knees barely change) */}
      {/* left */}
      <AL ax1={48} ay1={58} ax2={38} ay2={80}  bx1={46} by1={60} bx2={36} by2={82} w={2.8} dur={D}/>
      <AL ax1={38} ay1={80} ax2={lAx} ay2={lAy}  bx1={36} by1={82} bx2={lAx} by2={lAy} w={2.6} dur={D}/>
      {/* right */}
      <AL ax1={48} ay1={58} ax2={58} ay2={80}  bx1={46} by1={60} bx2={60} by2={82} w={2.8} dur={D}/>
      <AL ax1={58} ay1={80} ax2={rAx} ay2={rAy}  bx1={60} by1={82} bx2={rAx} by2={rAy} w={2.6} dur={D}/>

      {/* ── spine: vertical A → near-horizontal B */}
      <AL ax1={48} ay1={58} ax2={48} ay2={20}  bx1={46} by1={60} bx2={80} by2={44} w={3} dur={D}/>

      {/* ── arms hang from shoulder */}
      {/* left arm */}
      <AL ax1={40} ay1={30} ax2={34} ay2={50}  bx1={68} by1={47} bx2={62} by2={62} w={2.2} dur={D}/>
      {/* right arm */}
      <AL ax1={56} ay1={30} ax2={62} ay2={50}  bx1={76} by1={43} bx2={80} by2={58} w={2.2} dur={D}/>

      {/* ── joints */}
      <AC ax={48} ay={58} bx={46} by={60} r={3.8} dur={D}/>   {/* hip */}
      <AC ax={38} ay={80} bx={36} by={82} r={3}   dur={D}/>   {/* l knee */}
      <AC ax={58} ay={80} bx={60} by={82} r={3}   dur={D}/>   {/* r knee */}
      <AC ax={40} ay={30} bx={68} by={47} r={2.8} dur={D}/>   {/* l shoulder */}
      <AC ax={56} ay={30} bx={76} by={43} r={2.8} dur={D}/>   {/* r shoulder */}
      <SC cx={lAx} cy={lAy} r={2.4}/>
      <SC cx={rAx} cy={rAy} r={2.4}/>

      {/* ── head */}
      <circle r="8.5" fill="#0d2922" stroke="#00c9a0" strokeWidth="2">
        <Anim attr="cx" a={48} b={86} dur={D}/>
        <Anim attr="cy" a={12} b={38} dur={D}/>
      </circle>
    </svg>
  )
}

// ── PLANK ─────────────────────────────────────────────────────────────────────
// Static hold — glow pulses to indicate effort. Alignment guide shown.
function PlankFigure() {
  return (
    <svg viewBox="0 0 140 58" className="w-full h-full">
      <Floor x1={4} x2={136} y={52}/>
      <g opacity="1">
        <animate attributeName="opacity" values="1;0.5;1" dur="2.5s"
          repeatCount="indefinite" calcMode="spline"
          keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>

        {/* ── head */}
        <circle cx="126" cy="16" r="8.5" fill="#0d2922" stroke="#00c9a0" strokeWidth="2"/>

        {/* ── body straight line */}
        <SL x1={117} y1={22} x2={18} y2={48} w={3}/>

        {/* ── alignment guide */}
        <line x1="126" y1="16" x2="18" y2="48" stroke="#00c9a0" strokeWidth="0.8" opacity="0.25" strokeDasharray="3 2"/>

        {/* ── right forearm */}
        <SL x1={96}  y1={28} x2={92}  y2={48} w={2.4}/>
        {/* ── left forearm */}
        <SL x1={66}  y1={36} x2={62}  y2={50} w={2.4}/>

        {/* ── joints */}
        <SC cx={96}  cy={28} r={3}/>
        <SC cx={66}  cy={36} r={3}/>
        <SC cx={46}  cy={42} r={3.6}/> {/* hip */}
        <SC cx={92}  cy={48} r={2.4}/>
        <SC cx={62}  cy={50} r={2.4}/>
        <SC cx={18}  cy={48} r={2.4}/> {/* toes */}
      </g>
    </svg>
  )
}

// ── GENERIC ───────────────────────────────────────────────────────────────────
// Overhead press / generic movement — arms go from low to overhead
function GenericFigure() {
  const D = '2s'
  return (
    <svg viewBox="0 0 80 120" className="w-full h-full">
      <Floor x1={10} x2={70} y={114}/>

      {/* ── static: spine + legs */}
      <SL x1={40} y1={20} x2={40} y2={70} w={3}/>
      <SL x1={40} y1={70} x2={30} y2={96} w={2.8}/>
      <SL x1={40} y1={70} x2={50} y2={96} w={2.8}/>
      <SL x1={30} y1={96} x2={26} y2={114} w={2.2}/>
      <SL x1={50} y1={96} x2={54} y2={114} w={2.2}/>
      <SC cx={40} cy={70} r={3.6}/>
      <SC cx={30} cy={96} r={3}/>
      <SC cx={50} cy={96} r={3}/>

      {/* ── arms: down at sides A → overhead B */}
      {/* left upper arm */}
      <AL ax1={40} ay1={32} ax2={26} ay2={52}  bx1={40} by1={32} bx2={26} by2={14} w={2.4} dur={D}/>
      {/* left forearm */}
      <AL ax1={26} ay1={52} ax2={20} ay2={68}  bx1={26} by1={14} bx2={20} by2={0}  w={2.2} dur={D}/>
      {/* right upper arm */}
      <AL ax1={40} ay1={32} ax2={54} ay2={52}  bx1={40} by1={32} bx2={54} by2={14} w={2.4} dur={D}/>
      {/* right forearm */}
      <AL ax1={54} ay1={52} ax2={60} ay2={68}  bx1={54} by1={14} bx2={60} by2={0}  w={2.2} dur={D}/>

      {/* joints */}
      <SC cx={40} cy={32} r={3}/>
      <AC ax={26} ay={52} bx={26} by={14} r={2.8} dur={D}/>
      <AC ax={54} ay={52} bx={54} by={14} r={2.8} dur={D}/>

      {/* ── head */}
      <circle cx="40" cy="11" r="9" fill="#0d2922" stroke="#00c9a0" strokeWidth="2"/>
    </svg>
  )
}

// ── Labels & registry ─────────────────────────────────────────────────────────
const LABELS: Record<ExType, string> = {
  squat:   'Feet shoulder-width · break parallel · knees track toes',
  pushup:  'Straight body line · elbows 45° · full range of motion',
  curl:    'Elbows fixed at sides · full extension at the bottom',
  row:     'Neutral spine · pull elbows to hip · squeeze blade',
  hinge:   'Push hips back · soft knees · neutral spine throughout',
  plank:   'Head-to-heel straight line · brace core · steady breath',
  generic: 'Controlled movement · full range of motion · breathe',
}

const FIGURES: Record<ExType, () => React.ReactElement> = {
  squat: SquatFigure, pushup: PushupFigure, curl: CurlFigure,
  row: RowFigure, hinge: HingeFigure, plank: PlankFigure, generic: GenericFigure,
}

export default function ExerciseDemo({ exerciseName }: { exerciseName: string }) {
  const type   = useMemo(() => detectType(exerciseName), [exerciseName])
  const Figure = FIGURES[type]

  return (
    <div className="card p-4">
      <div className="section-label mb-3">Exercise Demo</div>
      <div className="bg-surface-elevated rounded-xl flex items-center justify-center p-3 mb-3" style={{ height: 148 }}>
        <div className="w-full h-full">
          <Figure />
        </div>
      </div>
      <p className="text-xs text-slate-400 text-center leading-relaxed">{LABELS[type]}</p>
    </div>
  )
}
