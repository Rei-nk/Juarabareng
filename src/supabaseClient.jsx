// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// URL dari screenshot-mu
const supabaseUrl = 'https://ohmwfkfqxqalbafiwham.supabase.co'

// PASTE KUNCI FULL-NYA DI SINI (Pencet tombol Copy di web Supabase)
const supabaseKey = 'sb_publishable_ddo9VLtZDd9A2yWt2aryzQ_bkfI...' 

export const supabase = createClient(supabaseUrl, supabaseKey)