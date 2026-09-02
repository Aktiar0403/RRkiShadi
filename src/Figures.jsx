/* ------------------------------------------------------------------
   Two little guests, dressed for whichever evening is picked in
   "What to Wear". Their clothes take the tapped swatch colour (--c);
   darker / lighter shades and gold trims are derived in CSS.
     cocktail → indo-western (bandhgala · draped gown)
     wedding  → indian festive (sherwani + safa · lehenga + dupatta)
     pyjama   → pyjama sets, slippers, sleep masks
------------------------------------------------------------------- */
const SKIN = '#e9b899'
const HAIR = '#2b1a12'
const CREAM = '#f1e6cf'
const FLUFF = '#f6ece2'

function Face({ cx, cy = 34 }) {
  return (
    <>
      <circle cx={cx} cy={cy} r="15" fill={SKIN} />
      <circle cx={cx - 5} cy={cy - 2} r="1.6" fill={HAIR} />
      <circle cx={cx + 5} cy={cy - 2} r="1.6" fill={HAIR} />
      <path d={`M${cx - 5} ${cy + 5} Q${cx} ${cy + 10} ${cx + 5} ${cy + 5}`} fill="none" stroke={HAIR} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx={cx - 9} cy={cy + 4} r="2.2" fill="#f08a8a" opacity="0.45" />
      <circle cx={cx + 9} cy={cy + 4} r="2.2" fill="#f08a8a" opacity="0.45" />
    </>
  )
}

/* arms: sleeve in clothing colour to the elbow, then skin to the hand */
function Arms({ cx, sleeve, short = false, bangles = false }) {
  const ey = short ? 74 : 86
  return (
    <>
      <path d={`M${cx - 16} 64 L${cx - 24} ${ey}`} stroke={sleeve} strokeWidth="9" strokeLinecap="round" />
      <path d={`M${cx + 16} 64 L${cx + 24} ${ey}`} stroke={sleeve} strokeWidth="9" strokeLinecap="round" />
      <path d={`M${cx - 24} ${ey} L${cx - 27} 104`} stroke={SKIN} strokeWidth="5.5" strokeLinecap="round" />
      <path d={`M${cx + 24} ${ey} L${cx + 27} 104`} stroke={SKIN} strokeWidth="5.5" strokeLinecap="round" />
      {bangles && (
        <g stroke="var(--gold)" strokeWidth="2">
          <path d={`M${cx - 30} 97 l7 1`} />
          <path d={`M${cx - 30} 100 l7 1`} />
          <path d={`M${cx + 23} 97 l7 1`} />
          <path d={`M${cx + 23} 100 l7 1`} />
        </g>
      )}
    </>
  )
}

function Legs({ cx, color, from = 112, shoes = 'dark', wide = false }) {
  const w = wide ? 11 : 8
  return (
    <>
      <path d={`M${cx - 7} ${from} L${cx - 9} 150`} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M${cx + 7} ${from} L${cx + 9} 150`} stroke={color} strokeWidth={w} strokeLinecap="round" />
      {shoes === 'dark' && (
        <g fill="#3a2418">
          <ellipse cx={cx - 10} cy="154" rx="7" ry="3.2" />
          <ellipse cx={cx + 10} cy="154" rx="7" ry="3.2" />
        </g>
      )}
      {shoes === 'mojari' && (
        <g fill="var(--gold)">
          <path d={`M${cx - 17} 155 q6 -4 14 0 q-1 3 -7 3 q-6 0 -7 -3 z`} />
          <path d={`M${cx + 3} 155 q6 -4 14 0 q-1 3 -7 3 q-6 0 -7 -3 z`} />
        </g>
      )}
      {shoes === 'slippers' && (
        <g fill={FLUFF} stroke="#d9c7b5" strokeWidth="1">
          <ellipse cx={cx - 10} cy="154" rx="8" ry="4" />
          <ellipse cx={cx + 10} cy="154" rx="8" ry="4" />
        </g>
      )}
      {shoes === 'heels' && (
        <g fill="var(--gold)">
          <path d={`M${cx - 15} 154 h10 l-1 4 h-6 z`} />
          <path d={`M${cx + 5} 154 h10 l-1 4 h-6 z`} />
        </g>
      )}
    </>
  )
}

function SleepMask({ cx }) {
  return (
    <g>
      <path d={`M${cx - 16} 24 Q${cx} 16 ${cx + 16} 24`} fill="none" stroke="var(--c2)" strokeWidth="1.5" />
      <rect x={cx - 11} y="17" width="22" height="8" rx="4" fill="var(--c2)" />
      <circle cx={cx - 5} cy="21" r="1" fill="var(--c3)" />
      <circle cx={cx + 5} cy="21" r="1" fill="var(--c3)" />
    </g>
  )
}

function Man({ cx, look }) {
  if (look === 'wedding') {
    return (
      <g>
        <Arms cx={cx} sleeve="var(--c)" />
        {/* sherwani */}
        <path d={`M${cx - 18} 60 Q${cx} 54 ${cx + 18} 60 L${cx + 21} 126 L${cx - 21} 126 Z`} fill="var(--c)" />
        <path d={`M${cx - 20} 123 L${cx + 20} 123`} stroke="var(--gold)" strokeWidth="2" />
        <path d={`M${cx} 60 L${cx} 124`} stroke="var(--gold)" strokeWidth="1.2" />
        {[70, 82, 94, 106].map((y) => (
          <circle key={y} cx={cx} cy={y} r="1.6" fill="var(--gold)" />
        ))}
        <rect x={cx - 6} y="52" width="12" height="7" rx="2" fill="var(--c2)" stroke="var(--gold)" strokeWidth="0.8" />
        {/* stole */}
        <path d={`M${cx - 16} 62 L${cx + 14} 122`} stroke="var(--c3)" strokeWidth="7" strokeLinecap="round" opacity="0.9" />
        <Legs cx={cx} color={CREAM} from={126} shoes="mojari" />
        <Face cx={cx} />
        {/* safa */}
        <path d={`M${cx - 17} 26 Q${cx} 6 ${cx + 17} 26 Q${cx} 20 ${cx - 17} 26 Z`} fill="var(--c2)" />
        <path d={`M${cx - 15} 24 Q${cx} 15 ${cx + 15} 24`} fill="none" stroke="var(--gold)" strokeWidth="1.5" />
        <path d={`M${cx + 9} 14 q4 -8 1 -13`} fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy="19" r="2" fill="var(--gold)" />
      </g>
    )
  }
  if (look === 'pyjama') {
    return (
      <g>
        <Arms cx={cx} sleeve="var(--c)" />
        {/* pyjama shirt */}
        <rect x={cx - 19} y="58" width="38" height="54" rx="5" fill="var(--c)" />
        <path d={`M${cx - 8} 58 L${cx} 70 L${cx + 8} 58 Z`} fill="var(--c3)" />
        <rect x={cx + 5} y="68" width="10" height="9" rx="1" fill="none" stroke="var(--c3)" strokeWidth="1.2" />
        {[78, 90, 102].map((y) => (
          <circle key={y} cx={cx} cy={y} r="1.6" fill="var(--c3)" />
        ))}
        <Legs cx={cx} color="var(--c3)" from={112} shoes="slippers" wide />
        <Face cx={cx} />
        <path d={`M${cx - 15} 30 Q${cx - 10} 17 ${cx} 18 Q${cx + 10} 17 ${cx + 15} 30 Q${cx} 24 ${cx - 15} 30 Z`} fill={HAIR} />
        <SleepMask cx={cx} />
      </g>
    )
  }
  // cocktail — bandhgala
  return (
    <g>
      <Arms cx={cx} sleeve="var(--c)" />
      <path d={`M${cx - 18} 60 Q${cx} 54 ${cx + 18} 60 L${cx + 20} 114 L${cx - 20} 114 Z`} fill="var(--c)" />
      <rect x={cx - 6} y="52" width="12" height="7" rx="2" fill="var(--c3)" />
      <path d={`M${cx} 60 L${cx} 112`} stroke="var(--c2)" strokeWidth="1.2" />
      {[70, 82, 94, 106].map((y) => (
        <circle key={y} cx={cx} cy={y} r="1.6" fill="var(--gold)" />
      ))}
      <rect x={cx + 7} y="68" width="7" height="3" fill="var(--gold)" />
      <Legs cx={cx} color="var(--c2)" from={112} shoes="dark" />
      <Face cx={cx} />
      <path d={`M${cx - 15} 30 Q${cx - 10} 17 ${cx} 18 Q${cx + 10} 17 ${cx + 15} 30 Q${cx} 24 ${cx - 15} 30 Z`} fill={HAIR} />
    </g>
  )
}

function Woman({ cx, look }) {
  if (look === 'wedding') {
    return (
      <g>
        {/* dupatta over the head, falling to the right */}
        <path d={`M${cx - 26} 44 Q${cx} 4 ${cx + 26} 44 L${cx + 40} 150 L${cx + 26} 150 L${cx + 18} 60 Q${cx} 34 ${cx - 18} 60 Z`} fill="var(--c3)" opacity="0.85" />
        <Arms cx={cx} sleeve="var(--c2)" short bangles />
        {/* blouse + lehenga */}
        <path d={`M${cx - 15} 60 Q${cx} 56 ${cx + 15} 60 L${cx + 16} 88 L${cx - 16} 88 Z`} fill="var(--c2)" />
        <path d={`M${cx - 16} 88 L${cx + 16} 88 L${cx + 38} 152 L${cx - 38} 152 Z`} fill="var(--c)" />
        <path d={`M${cx - 35} 145 L${cx + 35} 145`} stroke="var(--gold)" strokeWidth="2" />
        <path d={`M${cx - 31} 136 L${cx + 31} 136`} stroke="var(--gold)" strokeWidth="1" />
        {[[-12, 104], [10, 100], [-4, 118], [18, 122], [-22, 128]].map(([dx, y]) => (
          <circle key={dx + y} cx={cx + dx} cy={y} r="1.5" fill="var(--gold)" />
        ))}
        <path d={`M${cx - 16} 88 L${cx + 16} 88`} stroke="var(--gold)" strokeWidth="1.5" />
        <Legs cx={cx} color="transparent" from={152} shoes="mojari" />
        <Face cx={cx} />
        <path d={`M${cx - 15} 30 Q${cx - 10} 17 ${cx} 18 Q${cx + 10} 17 ${cx + 15} 30 Q${cx} 24 ${cx - 15} 30 Z`} fill={HAIR} />
        <circle cx={cx} cy="14" r="6" fill={HAIR} />
        {/* jewellery */}
        <circle cx={cx} cy="21" r="1.8" fill="var(--gold)" />
        <path d={`M${cx} 21 L${cx} 16`} stroke="var(--gold)" strokeWidth="0.8" />
        <path d={`M${cx - 15} 36 l0 5 M${cx + 15} 36 l0 5`} stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
        <path d={`M${cx - 8} 54 Q${cx} 62 ${cx + 8} 54`} fill="none" stroke="var(--gold)" strokeWidth="1.5" />
      </g>
    )
  }
  if (look === 'pyjama') {
    return (
      <g>
        <Arms cx={cx} sleeve="var(--c)" />
        <rect x={cx - 17} y="58" width="34" height="46" rx="5" fill="var(--c)" />
        <path d={`M${cx - 7} 58 L${cx} 68 L${cx + 7} 58 Z`} fill="var(--c3)" />
        <rect x={cx + 4} y="66" width="9" height="8" rx="1" fill="none" stroke="var(--c3)" strokeWidth="1.2" />
        {[76, 88].map((y) => (
          <circle key={y} cx={cx} cy={y} r="1.5" fill="var(--c3)" />
        ))}
        <Legs cx={cx} color="var(--c3)" from={104} shoes="slippers" wide />
        <Face cx={cx} />
        <path d={`M${cx - 15} 30 Q${cx - 10} 17 ${cx} 18 Q${cx + 10} 17 ${cx + 15} 30 Q${cx} 24 ${cx - 15} 30 Z`} fill={HAIR} />
        <circle cx={cx} cy="14" r="6" fill={HAIR} />
        <SleepMask cx={cx} />
      </g>
    )
  }
  // cocktail — draped gown with a cape
  return (
    <g>
      <path d={`M${cx + 13} 62 Q${cx + 42} 100 ${cx + 30} 150 L${cx + 16} 92 Z`} fill="var(--c3)" opacity="0.85" />
      <Arms cx={cx} sleeve={SKIN} bangles />
      <path d={`M${cx - 15} 60 Q${cx} 56 ${cx + 15} 60 L${cx + 16} 92 L${cx - 16} 92 Z`} fill="var(--c)" />
      <path d={`M${cx - 16} 92 L${cx + 16} 92 L${cx + 30} 150 L${cx - 30} 150 Z`} fill="var(--c)" />
      <path d={`M${cx - 16} 92 L${cx + 16} 92`} stroke="var(--gold)" strokeWidth="2" />
      <path d={`M${cx - 28} 146 L${cx + 28} 146`} stroke="var(--c2)" strokeWidth="1" opacity="0.6" />
      <Legs cx={cx} color="transparent" from={150} shoes="heels" />
      <Face cx={cx} />
      {/* open hair */}
      <path d={`M${cx - 16} 30 Q${cx} 12 ${cx + 16} 30 L${cx + 19} 62 L${cx + 11} 62 L${cx + 12} 40 Q${cx} 30 ${cx - 12} 40 L${cx - 11} 62 L${cx - 19} 62 Z`} fill={HAIR} />
      <path d={`M${cx - 15} 36 l0 6 M${cx + 15} 36 l0 6`} stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
      <path d={`M${cx - 8} 54 Q${cx} 62 ${cx + 8} 54`} fill="none" stroke="var(--gold)" strokeWidth="1.5" />
    </g>
  )
}

export default function Figures({ look, color }) {
  return (
    <svg
      className="figures"
      viewBox="0 0 240 166"
      role="img"
      aria-label={`Two guests dressed for the ${look === 'wedding' ? 'wedding' : look === 'pyjama' ? 'pyjama party' : 'cocktail dinner'}`}
      style={{ '--c': color }}
    >
      <line x1="10" y1="158" x2="230" y2="158" stroke="var(--gold-dim)" strokeWidth="1" />
      <Man cx={70} look={look} />
      <Woman cx={170} look={look} />
    </svg>
  )
}
