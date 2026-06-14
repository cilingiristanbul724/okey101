import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://svmheoavzdyclqpevwtp.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_j41hDIlKYcBEVBMyzQ2OVg_ppwZbDom'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// "Beni hatırla" kapalıysa: tarayıcı tamamen kapatılıp yeniden açıldığında
// oturumu otomatik kapat. Aynı oturumda sayfa yenilense bile giriş korunur.
if (typeof window !== 'undefined') {
  const hatirla = localStorage.getItem('okey101-hatirla')
  if (hatirla === 'false' && !sessionStorage.getItem('okey101-oturum-aktif')) {
    supabase.auth.signOut()
  }
  sessionStorage.setItem('okey101-oturum-aktif', '1')
}
