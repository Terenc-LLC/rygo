import { createClient } from 'npm:@supabase/supabase-js';
import { parsePayload, validateSubmission, BadRequestError } from './validate.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
// Service-role key: read only via env — never hardcoded, never returned to callers.
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function serverToday(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Step 1: Method / CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    // Step 2: Auth → user_id from verified token only, never from body
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Missing or invalid Authorization header' }, 401);
    }
    const jwt = authHeader.slice(7);

    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(jwt);
    if (authError || !user) {
      return json({ error: 'Invalid or expired token' }, 401);
    }
    const userId = user.id;

    // Step 3: Body parse + field validation
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    const payload = parsePayload(body);

    // Steps 4–7: pure validation (day bounds, event cap, replay, elapsed)
    const result = validateSubmission(payload, serverToday());

    if (!result.accepted) {
      return json({ accepted: false, reason: result.reason });
    }

    // Step 8: service-role INSERT; unique conflict → no-op (first-write-wins)
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error: insertError } = await serviceClient.from('scores').insert({
      user_id: userId,
      day: payload.day,
      grid_size: payload.grid_size,
      moves: payload.moveCount,
      elapsed_ms: payload.elapsedMs,
    });

    if (insertError && insertError.code !== '23505') {
      console.error('DB insert error:', insertError);
      return json({ error: 'Database error' }, 500);
    }

    return json({ accepted: true });
  } catch (err) {
    if (err instanceof BadRequestError) {
      return json({ error: err.message }, 400);
    }
    console.error('Unexpected error:', err);
    return json({ error: 'Internal server error' }, 500);
  }
});
