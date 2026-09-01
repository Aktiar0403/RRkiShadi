/**
 * RSVP API — Cloudflare Pages Function backed by D1.
 *
 * POST /api/rsvp            — store a guest's RSVP (JSON body)
 * GET  /api/rsvp?key=…      — list RSVPs (requires ADMIN_KEY secret)
 * GET  /api/rsvp?key=…&format=csv — download as CSV
 */

const FIELDS = [
  'full_name', 'phone', 'attending', 'events', 'party_size', 'rooms',
  'travel_mode', 'arrival', 'departure', 'dietary', 'song', 'notes',
]

export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const fullName = String(body.full_name || '').trim().slice(0, 200)
  const phone = String(body.phone || '').trim().slice(0, 40)
  if (!fullName || !phone) {
    return Response.json({ ok: false, error: 'Name and phone are required' }, { status: 400 })
  }

  const clean = (v, n = 300) => String(v ?? '').trim().slice(0, n)
  await env.DB.prepare(
    `INSERT INTO rsvps (full_name, phone, attending, events, party_size, rooms, travel_mode, arrival, departure, dietary, song, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      fullName,
      phone,
      clean(body.attending, 60),
      clean(body.events, 120),
      Number.parseInt(body.party_size, 10) || 1,
      clean(body.rooms, 120),
      clean(body.travel_mode, 40),
      clean(body.arrival, 120),
      clean(body.departure, 120),
      clean(body.dietary, 60),
      clean(body.song, 200),
      clean(body.notes, 1000),
    )
    .run()

  return Response.json({ ok: true })
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const key = url.searchParams.get('key')
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { results } = await env.DB.prepare('SELECT * FROM rsvps ORDER BY created_at DESC').all()

  if (url.searchParams.get('format') === 'csv') {
    const cols = ['id', 'created_at', ...FIELDS]
    const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`
    const csv = [cols.join(','), ...results.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n')
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="rsvps.csv"',
      },
    })
  }

  return Response.json({ count: results.length, rsvps: results })
}
