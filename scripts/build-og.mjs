/**
 * Renders public/og.png — the social-share card:
 * Rahul's photo and an illustrated bride in ghunghat, in twin gold
 * Mughal arches on midnight, with names and date.
 * Run: node scripts/build-og.mjs
 */
import { readFileSync } from 'fs'
import sharp from 'sharp'

const photo = readFileSync('raw_venue/rahul.png').toString('base64')

// bandhani dots scattered on the veil
let dots = ''
const rand = (a, b) => a + Math.random() * (b - a)
for (let i = 0; i < 60; i++) {
  const x = rand(700, 945)
  const y = rand(180, 470)
  // keep dots off the central face-shadow area
  if (Math.abs(x - 822) < 70 && y > 220 && y < 420) continue
  dots += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rand(1.5, 3).toFixed(1)}" fill="#f0d98c" opacity="0.85"/>`
}

// hanging gold drops along the veil's front edge
let drops = ''
for (let t = 0; t <= 1; t += 0.09) {
  const x = 742 + t * 160
  const y = 255 + Math.sin(Math.PI * t) * 95
  drops += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 14}" stroke="#d4af37" stroke-width="1.6"/><circle cx="${x}" cy="${y + 17}" r="3" fill="#d4af37"/>`
}

const arch = (cx) =>
  `M ${cx - 145} 505 L ${cx - 145} 235 Q ${cx - 145} 118 ${cx} 105 Q ${cx + 145} 118 ${cx + 145} 235 L ${cx + 145} 505 Z`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#131730"/>
      <stop offset="1" stop-color="#0a0d16"/>
    </linearGradient>
    <radialGradient id="bridebg" cx="0.5" cy="0.35" r="0.9">
      <stop offset="0" stop-color="#f0c9a0"/>
      <stop offset="1" stop-color="#c98a5a"/>
    </radialGradient>
    <clipPath id="archL"><path d="${arch(378)}"/></clipPath>
    <clipPath id="archR"><path d="${arch(822)}"/></clipPath>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Rahul -->
  <g clip-path="url(#archL)">
    <image href="data:image/png;base64,${photo}" x="218" y="95" width="320" height="420" preserveAspectRatio="xMidYMid slice"/>
  </g>
  <path d="${arch(378)}" fill="none" stroke="#d4af37" stroke-width="5"/>
  <path d="${arch(378)}" fill="none" stroke="#f0d98c" stroke-width="1.5" transform="translate(0,0)" stroke-dasharray="2 6"/>

  <!-- Ruchi, in ghunghat -->
  <g clip-path="url(#archR)">
    <rect x="670" y="100" width="310" height="410" fill="url(#bridebg)"/>
    <!-- veil -->
    <path d="M 822 128 C 905 134 952 205 957 300 C 960 380 942 462 952 510 L 692 510 C 702 462 684 380 687 300 C 692 205 739 134 822 128 Z" fill="#a91d45"/>
    <path d="M 822 128 C 905 134 952 205 957 300 C 960 380 942 462 952 510 L 692 510 C 702 462 684 380 687 300 C 692 205 739 134 822 128 Z" fill="none" stroke="#d4af37" stroke-width="4"/>
    <!-- shadow where the face stays hidden -->
    <ellipse cx="822" cy="315" rx="78" ry="108" fill="#7d1533"/>
    <ellipse cx="822" cy="315" rx="78" ry="108" fill="none" stroke="#8f1f3e" stroke-width="8" opacity="0.6"/>
    <!-- front edge of the ghunghat -->
    <path d="M 742 250 C 775 355 869 355 902 250" fill="none" stroke="#d4af37" stroke-width="3.5"/>
    ${drops}
    <!-- maang tikka resting over the veil -->
    <line x1="822" y1="132" x2="822" y2="212" stroke="#d4af37" stroke-width="2"/>
    <circle cx="822" cy="222" r="9" fill="#d4af37"/>
    <circle cx="822" cy="222" r="4" fill="#fff2d0"/>
    ${dots}
    <!-- necklace hint at the neckline -->
    <path d="M 764 486 C 790 512 854 512 880 486" fill="none" stroke="#d4af37" stroke-width="5" stroke-linecap="round"/>
    <path d="M 776 496 C 798 516 846 516 868 496" fill="none" stroke="#f0d98c" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <path d="${arch(822)}" fill="none" stroke="#d4af37" stroke-width="5"/>

  <!-- weds -->
  <text x="600" y="330" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="44" fill="#e2799f">weds</text>

  <!-- names and date -->
  <text x="600" y="570" text-anchor="middle" font-family="Georgia, serif" font-size="52" letter-spacing="14" fill="#f4ead8">RUCHI &amp; RAHUL</text>
  <text x="600" y="606" text-anchor="middle" font-family="Georgia, serif" font-size="19" letter-spacing="6" fill="#d4af37">16 · 17 DECEMBER 2026 — STARDOM RESORT, JAIPUR</text>

  <!-- corner flourishes -->
  <path d="M 40 40 h 46 M 40 40 v 46" stroke="#d4af37" stroke-width="2.5" fill="none"/>
  <path d="M 1160 590 h -46 M 1160 590 v -46" stroke="#d4af37" stroke-width="2.5" fill="none"/>
</svg>`

await sharp(Buffer.from(svg)).png({ quality: 92 }).toFile('public/og.png')
console.log('og.png written')
