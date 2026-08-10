// Substitui a API window.storage (só existe dentro dos artifacts do Claude)
// por um armazenamento real no Supabase, mantendo a mesma interface get/set.
import { supabase } from './supabaseClient.js'

export const storage = {
  async get(key) {
    const { data, error } = await supabase
      .from('kv_store')
      .select('value')
      .eq('key', key)
      .maybeSingle()

    if (error) {
      console.error('storage.get error:', error)
      return null
    }
    if (!data) return null
    return { key, value: data.value, shared: false }
  },

  async set(key, value) {
    const { error } = await supabase
      .from('kv_store')
      .upsert({ key, value, updated_at: new Date().toISOString() })

    if (error) {
      console.error('storage.set error:', error)
      return null
    }
    return { key, value, shared: false }
  },
}
