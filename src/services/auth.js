import { supabase } from '../lib/supabaseClient.js'

export async function signIn (email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    throw new Error('Usuario o contraseña incorrectos')
  }
  return data.session
}

export async function logOut () {
  await supabase.auth.signOut()
}

export async function getCurrentSession () {
  const { data } = await supabase.auth.getSession()
  return data.session ?? null
}

export function onAuthChange (callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}
