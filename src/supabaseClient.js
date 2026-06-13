import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://svmheoavzdyclqpevwtp.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_j41hDIlKYcBEVBMyzQ2OVg_ppwZbDom'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)