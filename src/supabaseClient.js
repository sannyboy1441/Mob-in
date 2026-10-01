import { createClient } from '@supabase/supabase-js'

const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};
const supabaseUrl = env.VITE_SUPABASE_URL || "https://pzmubqunhtpvnptnwfgd.supabase.co"
const supabaseKey =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_YkLk2ZdsAHeH1uFiUv4AlQ_-WqTVIka"

export const supabase = createClient(supabaseUrl, supabaseKey)