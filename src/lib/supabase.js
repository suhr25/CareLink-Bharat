import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'https://your-project-id.supabase.co') {
  console.warn('Supabase not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

/**
 * Upload a screenshot blob to Supabase Storage.
 * Bucket: "screenshots" (create it in your Supabase dashboard with public read access)
 * Returns the public URL or null on failure.
 */
export async function uploadScreenshot(blob, userId) {
  if (!supabaseUrl || supabaseUrl === 'https://your-project-id.supabase.co') return null;

  const filename = `${userId || 'anon'}/${Date.now()}.png`;
  const { error } = await supabase.storage
    .from('screenshots')
    .upload(filename, blob, { contentType: 'image/png', upsert: false });

  if (error) {
    console.error('Screenshot upload failed:', error.message);
    return null;
  }

  const { data } = supabase.storage.from('screenshots').getPublicUrl(filename);
  return data.publicUrl;
}
