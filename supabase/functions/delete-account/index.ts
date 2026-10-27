import { createClient } from 'npm:@supabase/supabase-js@2';

const allowedOrigins = new Set([
  'https://financeiro.dozecloud.com.br',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': origin && allowedOrigins.has(origin) ? origin : 'https://financeiro.dozecloud.com.br',
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

Deno.serve(async (request) => {
  const corsHeaders = getCorsHeaders(request);
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return Response.json({ error: 'Método não permitido.' }, { status: 405, headers: corsHeaders });
  }

  const authorization = request.headers.get('Authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return Response.json({ error: 'Autenticação necessária.' }, { status: 401, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Account deletion is missing required Supabase environment variables.');
    return Response.json({ error: 'Não foi possível excluir a conta.' }, { status: 500, headers: corsHeaders });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user) {
    return Response.json({ error: 'Sessão inválida ou expirada.' }, { status: 401, headers: corsHeaders });
  }

  const storage = admin.storage.from('avatars');
  const { data: files, error: listError } = await storage.list(user.id, { limit: 100 });
  if (listError) {
    console.error('Account deletion could not list profile images:', listError.message);
    return Response.json({ error: 'Não foi possível excluir a conta.' }, { status: 500, headers: corsHeaders });
  }
  if (files?.length) {
    const { error: removeError } = await storage.remove(files.map((file) => `${user.id}/${file.name}`));
    if (removeError) {
      console.error('Account deletion could not remove profile images:', removeError.message);
      return Response.json({ error: 'Não foi possível excluir a conta.' }, { status: 500, headers: corsHeaders });
    }
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error('Supabase Auth account deletion failed:', deleteError.message);
    return Response.json({ error: 'Não foi possível excluir a conta.' }, { status: 500, headers: corsHeaders });
  }

  return Response.json({ success: true }, { status: 200, headers: corsHeaders });
});
