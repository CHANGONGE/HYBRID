import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
    _supabase = createClient(url, key);
  }
  return _supabase;
}

function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Supabase 서비스 키가 설정되지 않았습니다.");
    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}

const BUCKET = "receipts";

export async function uploadImage(
  file: File,
  userEmail: string
): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName = `${userEmail}/${Date.now()}.${ext}`;

  const admin = getSupabaseAdmin();
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(fileName, file, { upsert: true });

  if (error) throw new Error(error.message);

  const { data } = admin.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function deleteImage(url: string): Promise<void> {
  const path = url.split(`${BUCKET}/`)[1];
  if (!path) return;
  await getSupabaseAdmin().storage.from(BUCKET).remove([path]);
}
