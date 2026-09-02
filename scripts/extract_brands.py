"""Build src/brandThemes.js from awesome-design-md/design-md/<brand>/DESIGN.md.

Per brand: colours (dark canvas, light canvas, accent) and design style
(display/body typefaces with Google-Fonts stand-ins, display weight and
tracking, uppercase or not, corner radii for buttons / inputs / cards).
"""
import re, glob, os, colorsys, json
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

def hsl(hex_):
    hex_ = hex_.lstrip('#')
    if len(hex_) == 3: hex_ = ''.join(c*2 for c in hex_)
    r, g, b = (int(hex_[i:i+2], 16)/255 for i in (0, 2, 4))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return h*360, s*100, l*100
def norm(h):
    h = h.lower().lstrip('#')
    if len(h) == 3: h = ''.join(c*2 for c in h)
    return '#' + h[:6]

NAMES = {
  'linear.app': 'Linear', 'x.ai': 'xAI', 'mistral.ai': 'Mistral', 'together.ai': 'Together',
  'opencode.ai': 'OpenCode', 'bmw-m': 'BMW M', 'bmw': 'BMW', 'hp': 'HP', 'ibm': 'IBM',
  'nvidia': 'NVIDIA', 'dell-1996': 'Dell 1996', 'nintendo-2001': 'Nintendo 2001',
  'elevenlabs': 'ElevenLabs', 'clickhouse': 'ClickHouse', 'hashicorp': 'HashiCorp',
  'mongodb': 'MongoDB', 'posthog': 'PostHog', 'runwayml': 'Runway', 'spacex': 'SpaceX',
  'theverge': 'The Verge', 'voltagent': 'VoltAgent', 'playstation': 'PlayStation',
  'minimax': 'MiniMax', 'cal': 'Cal.com', 'clay': 'Clay', 'wise': 'Wise',
}
# files without a colors: block — canvas / accent / type chosen by hand from their text
MANUAL = {
  'kraken': dict(light='#ffffff', dark='#120b2a', accent='#7132f5', display='Inter', body='Inter', btn=8, input=8, card=16),
  'lamborghini': dict(dark='#000000', accent='#ffc000', display='Lamborghini Display', body='Inter', upper=True, btn=0, input=0, card=0, weight=700),
  'lovable': dict(light='#f7f4ed', dark='#1c1c1c', accent='#f0562a', display='Inter', body='Inter', btn=9999, input=12, card=16),
  'mastercard': dict(light='#f3f0ee', dark='#141413', accent='#eb001b', display='Mark', body='Mark', btn=9999, input=4, card=12),
  'runwayml': dict(dark='#030303', accent='#767d88', display='Inter', body='Inter', btn=6, input=6, card=8),
  'sanity': dict(dark='#0b0b0b', accent='#f03e2f', display='Inter', body='Inter', btn=4, input=4, card=8),
  'spotify': dict(dark='#121212', accent='#1ed760', display='Circular', body='Circular', btn=9999, input=9999, card=8, weight=700),
  'starbucks': dict(light='#f2f0eb', dark='#1e3932', accent='#00754a', display='SoDoSans', body='SoDoSans', btn=9999, input=4, card=12, weight=700),
  'tesla': dict(light='#ffffff', dark='#171a20', accent='#3e6ae1', display='Universal Sans', body='Universal Sans', btn=4, input=4, card=4, weight=500),
  'theverge': dict(dark='#131313', accent='#3cffd0', display='Polysans', body='Inter', btn=0, input=0, card=0, weight=800),
  'sentry': dict(dark='#181225', light='#ffffff', accent='#7553ff', display='Rubik', body='Rubik', btn=4, input=4, card=8),
}
DARK_KEYS = ['canvas-dark', 'surface-dark', 'inverse-canvas', 'charcoal', 'surface-strong', 'ink-deep', 'ink']
LIGHT_KEYS = ['canvas-light', 'inverse-canvas', 'canvas-soft', 'surface-soft', 'surface-card', 'on-primary']

# proprietary face -> Google Fonts stand-in (substring match, first hit wins)
GOOGLE = [
  ('plex mono', 'IBM Plex Mono'), ('plex', 'IBM Plex Sans'),
  ('geist mono', 'Geist Mono'), ('berkeley', 'JetBrains Mono'), ('jetbrains', 'JetBrains Mono'), (' mono', 'JetBrains Mono'),
  ('geist', 'Geist'), ('cal sans', 'Cal Sans'),
  ('cereal', 'DM Sans'), ('circular', 'DM Sans'), ('euclid', 'DM Sans'), ('apercu', 'DM Sans'), ('optimistic', 'DM Sans'),
  ('sodosans', 'DM Sans'), ('forma', 'DM Sans'), ('plain', 'DM Sans'), ('dm sans', 'DM Sans'),
  ('roobert', 'Manrope'), ('pin sans', 'Manrope'), ('saans', 'Manrope'), ('uber', 'Manrope'), ('basier', 'Manrope'),
  ('aeonik', 'Plus Jakarta Sans'), ('jakarta', 'Plus Jakarta Sans'), ('mark', 'Manrope'),
  ('styrene', 'Space Grotesk'), ('space grotesk', 'Space Grotesk'), ('polysans', 'Space Grotesk'),
  ('copernicus', 'Lora'), ('tiempos', 'Lora'), ('georgia', 'Lora'), ('lora', 'Lora'),
  ('editorial', 'Fraunces'), ('domaine', 'Fraunces'), ('arial black', 'Archivo Black'), ('walsheim', 'Outfit'),
  ('waldenburg', 'Fraunces'), ('times', 'Times New Roman'), ('serif', 'Fraunces'),
  ('d-din', 'Barlow'), ('din', 'Barlow'), ('nvidia', 'Barlow'), ('barlow', 'Barlow'), ('lamborghini', 'Barlow Condensed'),
  ('bmw', 'Titillium Web'), ('avant', 'Outfit'), ('freigeist', 'Outfit'), ('futura', 'Outfit'), ('outfit', 'Outfit'),
  ('rubik', 'Rubik'), ('roboto', 'Roboto'), ('montserrat', 'Montserrat'),
]
SYSTEM = {'Times New Roman'}
def google_for(family):
    f = family.lower()
    for key, g in GOOGLE:
        if key in f: return g
    return 'Inter'
def first_family(stack):
    fam = stack.strip().strip('"').strip("'").split(',')[0].strip().strip('"').strip("'")
    return fam or 'Inter'

def parse_typo(block):
    """-> list of (name, {fontFamily,fontSize,fontWeight,letterSpacing,textTransform})"""
    out = []
    for m in re.finditer(r'^  ([\w-]+):\n((?:    .*\n)+)', block, re.M):
        d = dict(re.findall(r'^    ([\w-]+):\s*(.+)$', m.group(2), re.M))
        out.append((m.group(1), d))
    return out
def px(v):
    m = re.search(r'-?[\d.]+', str(v or ''))
    return float(m.group()) if m else None

def style_from_frontmatter(fm):
    st = {}
    m = re.search(r'^typography:\n((?:[ \t]+.*\n)+)', fm, re.M)
    typo = parse_typo(m.group(1)) if m else []
    disp = None
    cands = [(px(d.get('fontSize')) or 0, n, d) for n, d in typo if 'fontFamily' in d]
    if cands:
        disp = max(cands)[2]
    body = None
    for n, d in typo:
        if n in ('body-md', 'body', 'body-lg', 'body-sm', 'paragraph') and 'fontFamily' in d:
            body = d; break
    if disp:
        fam = first_family(disp['fontFamily'])
        st['display'] = fam
        st['weight'] = int(px(disp.get('fontWeight')) or 600)
        fs = px(disp.get('fontSize')) or 56
        ls = px(disp.get('letterSpacing'))
        if ls is not None and 'em' in str(disp.get('letterSpacing')): st['tracking'] = round(ls, 3)
        elif ls is not None: st['tracking'] = round(ls / fs, 3)
        st['upper'] = 'upper' in str(disp.get('textTransform', '')).lower()
    st['body'] = first_family(body['fontFamily']) if body else st.get('display', 'Inter')
    # radii
    m = re.search(r'^rounded:\n((?:[ \t]+.*\n)+)', fm, re.M)
    rad = {k: px(v) for k, v in re.findall(r'^\s+([\w-]+):\s*(.+)$', m.group(1), re.M)} if m else {}
    def resolve(ref, default):
        mm = re.search(r'rounded\.([\w-]+)', str(ref or ''))
        if mm and mm.group(1) in rad and rad[mm.group(1)] is not None: return rad[mm.group(1)]
        v = px(ref)
        return v if v is not None else default
    m = re.search(r'^components:\n((?:[ \t]+.*\n)+)', fm, re.M)
    comp = {}
    if m:
        for mm in re.finditer(r'^  ([\w-]+):\n((?:    .*\n)+)', m.group(1), re.M):
            comp[mm.group(1)] = dict(re.findall(r'^    ([\w-]+):\s*(.+)$', mm.group(2), re.M))
    def comp_radius(names, default):
        for n in names:
            if n in comp and 'rounded' in comp[n]: return resolve(comp[n]['rounded'], default)
        return default
    st['btn'] = comp_radius(['button-primary', 'button-primary-lg', 'button-md', 'button'], rad.get('md') or 6)
    st['input'] = comp_radius(['text-input', 'input', 'search-input'], rad.get('sm') or 4)
    st['card'] = comp_radius(['feature-card', 'pricing-card', 'card', 'testimonial-card', 'product-card'], rad.get('lg') or rad.get('md') or 8)
    for k in ('btn', 'input', 'card'):
        st[k] = int(min(st[k], 9999))
    return st

out = []
for f in sorted(glob.glob('awesome-design-md/design-md/*/DESIGN.md')):
    slug = f.replace('\\', '/').split('/')[-2]
    name = NAMES.get(slug, slug.replace('-', ' ').title())
    s = open(f, encoding='utf-8').read()
    fm = s.split('---')[1] if s.startswith('---') else ''
    m = re.search(r'^colors:\n((?:[ \t]+.*\n)+)', fm, re.M)
    canvas = accent = None
    if m:
        kv = {k: norm(v) for k, v in re.findall(r'^\s+([\w-]+):\s*"?(#[0-9a-fA-F]{3,8})', m.group(1), re.M)}
        canvas = kv.get('canvas') or kv.get('surface-1') or kv.get('surface') or kv.get('canvas-dark') or kv.get('canvas-light')
        accent = kv.get('primary') or kv.get('accent')
    if m and canvas and accent:
        cl = hsl(canvas)[2]
        dark = light = None
        if cl < 45:
            dark = canvas
            for k in LIGHT_KEYS:
                if k in kv and hsl(kv[k])[2] > 88: light = kv[k]; break
        else:
            light = canvas
            for k in DARK_KEYS:
                if k in kv and hsl(kv[k])[2] < 30: dark = kv[k]; break
        t = dict(dark=dark, light=light, accent=accent)
        ah, as_, al = hsl(t['accent'])
        if as_ < 15 or al > 85:
            skip = ('primary', 'on-primary', 'success', 'error', 'warning', 'info', 'semantic', 'link')
            alt = [v for k, v in kv.items() if not any(x in k for x in skip) and 22 < hsl(v)[2] < 78 and hsl(v)[1] > 45]
            if alt: t['accent'] = alt[0]
            elif al > 85: t['accent'] = '#d4af37'
        st = style_from_frontmatter(fm)
    elif slug in MANUAL:
        mm = MANUAL[slug]
        t = dict(dark=mm.get('dark'), light=mm.get('light'), accent=mm['accent'])
        st = dict(display=mm['display'], body=mm['body'], weight=mm.get('weight', 600), tracking=-0.02,
                  upper=mm.get('upper', False), btn=mm['btn'], input=mm['input'], card=mm['card'])
    else:
        print('skip', slug); continue

    entry = {'id': 'brand-' + re.sub(r'[^a-z0-9]+', '-', slug), 'name': name, 'accent': t['accent'], 'brand': True, 'flat': True}
    if t.get('dark'): entry['hex'] = t['dark']
    if t.get('light') and hsl(t['light'])[2] > 80: entry['light'] = t['light']
    if 'hex' not in entry and 'light' not in entry:
        print('skip (no base)', slug); continue
    dg, bg = google_for(st.get('display', 'Inter')), google_for(st.get('body', 'Inter'))
    entry['style'] = {
        'display': st.get('display', 'Inter'), 'displayGoogle': dg,
        'body': st.get('body', 'Inter'), 'bodyGoogle': bg,
        'weight': st.get('weight', 600), 'tracking': st.get('tracking', -0.02), 'upper': bool(st.get('upper')),
        'btn': st['btn'], 'input': st['input'], 'card': st['card'],
    }
    out.append(entry)

lines = [json.dumps(e, ensure_ascii=False) for e in out]
js = ("/* Generated by scripts/extract_brands.py from awesome-design-md/design-md/<brand>/DESIGN.md\n"
      "   (brand colour + type systems used purely as design inspiration). Each entry:\n"
      "   hex = dark canvas, light = light canvas (either may be absent), accent = brand primary,\n"
      "   style = { display/body face (+ Google Fonts stand-in), display weight, tracking (em),\n"
      "             upper (uppercase display), btn/input/card corner radii in px }. */\n"
      "export const BRAND_THEMES = [\n" + ''.join('  ' + l + ',\n' for l in lines) + "]\n")
open('src/brandThemes.js', 'w', encoding='utf-8').write(js)
print(len(out), 'brand themes written')
for e in out:
    st = e['style']
    print(f"{e['name']:14} {st['display'][:22]:22} -> {st['displayGoogle']:18} w{st['weight']} t{st['tracking']} {'UP' if st['upper'] else '  '} btn{st['btn']} in{st['input']} card{st['card']}")
