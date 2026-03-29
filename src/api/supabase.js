import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Tambahkan ini untuk mengecek di inspect element (console) browser
console.log("Cek URL:", supabaseUrl);
console.log("Cek Key:", supabaseKey ? "Key Ada" : "Key Kosong");

export const supabase = createClient(supabaseUrl, supabaseKey);