import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  const authorization = request.headers.get('Authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return Response.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ error: 'Account deletion is not configured' }, { status: 500, headers: corsHeaders });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user) {
    return Response.json({ error: 'Invalid or expired session' }, { status: 401, headers: corsHeaders });
  }

  const storage = admin.storage.from('avatars');
  const { data: files, error: listError } = await storage.list(user.id, { limit: 100 });
  if (listError) {
    return Response.json({ error: 'Could not remove profile image' }, { status: 500, headers: corsHeaders });
  }
  if (files?.length) {
    const { error: removeError } = await storage.remove(files.map((file) => `${user.id}/${file.name}`));
    if (removeError) {
      return Response.json({ error: 'Could not remove profile image' }, { status: 500, headers: corsHeaders });
    }
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500, headers: corsHeaders });
  }

  return Response.json({ success: true }, { status: 200, headers: corsHeaders });
});
