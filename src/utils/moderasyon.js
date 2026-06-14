import { supabase } from '../supabaseClient'

export async function engellenenleriGetir(uid) {
  if (!uid) return []
  const { data } = await supabase.from('engellemeler').select('engellenen_id').eq('engelleyen_id', uid)
  return (data || []).map(x => x.engellenen_id)
}

export async function engelle(benimId, hedefId) {
  return supabase.from('engellemeler').insert({ engelleyen_id: benimId, engellenen_id: hedefId })
}

export async function engelKaldir(benimId, hedefId) {
  return supabase.from('engellemeler').delete().eq('engelleyen_id', benimId).eq('engellenen_id', hedefId)
}

export async function engelliMi(benimId, hedefId) {
  if (!benimId || !hedefId) return false
  const { data } = await supabase.from('engellemeler').select('id')
    .eq('engelleyen_id', benimId).eq('engellenen_id', hedefId)
  return !!(data && data.length)
}

// Iki yonlu engel kontrolu (ben onu VEYA o beni engellemis mi)
export async function aramizdaEngelVarMi(benimId, digerId) {
  if (!benimId || !digerId) return false
  const { data } = await supabase.from('engellemeler').select('id')
    .or('and(engelleyen_id.eq.' + benimId + ',engellenen_id.eq.' + digerId + '),and(engelleyen_id.eq.' + digerId + ',engellenen_id.eq.' + benimId + ')')
  return !!(data && data.length)
}

export async function sikayetEt(benimId, hedefId, sebep) {
  return supabase.from('sikayetler').insert({
    sikayet_eden_id: benimId,
    sikayet_edilen_id: hedefId,
    sebep: sebep || null,
  })
}
