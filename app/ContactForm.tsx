'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
const L = {
  lv: { n: 'Vārds', c: 'Tālrunis vai e-pasts', m: 'Apraksti detaļu un darbu', s: 'Nosūtīt', ok: 'Paldies! Sazināsimies.', er: 'Kļūda, mēģini vēlreiz.' },
  en: { n: 'Name', c: 'Phone or email', m: 'Describe the part and the job', s: 'Send', ok: 'Thank you! We will be in touch.', er: 'Something went wrong. Please try again.' },
}
export default function ContactForm({ lang = 'lv' }: { lang?: 'lv' | 'en' }) {
  const t = L[lang]; const [st, setSt] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget; setBusy(true)
    const d = Object.fromEntries(new FormData(f)) as Record<string, string>
    const { error } = await supabase().from('inquiries').insert({ name: d.name, contact: d.contact, message: d.message })
    setSt(error ? t.er : t.ok); setBusy(false); if (!error) f.reset()
  }
  return <form onSubmit={submit} style={{ maxWidth: 500 }}>
    <input name="name" placeholder={t.n} required maxLength={100} autoComplete="name" />
    <input name="contact" placeholder={t.c} required maxLength={100} />
    <textarea name="message" rows={5} placeholder={t.m} required maxLength={2000} />
    <button disabled={busy}>{t.s}</button> <span className="m" role="status">{st}</span>
  </form>
}
