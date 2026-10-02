'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import '../admin.css'
export default function Login() {
  const r = useRouter(); const [er, setEr] = useState(''); const [busy, setBusy] = useState(false)
  async function go(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setEr('')
    const d = new FormData(e.currentTarget)
    const { error } = await supabase().auth.signInWithPassword({ email: String(d.get('email')), password: String(d.get('password')) })
    if (error) { setEr('Nepareizs e-pasts vai parole.'); setBusy(false) } else { r.push('/admin'); r.refresh() }
  }
  return <div className="adm a-login"><form onSubmit={go}>
    <h1>Admin</h1><p>Smilšu strūkla — satura pārvaldība</p>
    <label className="a-f">E-pasts<input name="email" type="email" required autoComplete="email" /></label>
    <label className="a-f" style={{ marginTop: 12, display: 'block' }}>Parole<input name="password" type="password" required autoComplete="current-password" /></label>
    <button className="a-btn" disabled={busy}>{busy ? 'Ieiet...' : 'Ieiet'}</button>
    <div className="a-err" role="alert">{er}</div>
  </form></div>
}
