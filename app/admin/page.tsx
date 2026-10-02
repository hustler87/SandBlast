'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import './admin.css'
type Row = Record<string, any>
type Tab = 'sv' | 'im' | 'q'
const href = (c: string) => (c.includes('@') ? `mailto:${c}` : `tel:${c.replace(/\s/g, '')}`)
export default function Admin() {
  const sb = useMemo(() => supabase(), []); const r = useRouter()
  const [tab, setTab] = useState<Tab>('sv'); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(''); const [prev, setPrev] = useState('')
  const [sv, setSv] = useState<Row[]>([]); const [im, setIm] = useState<Row[]>([]); const [q, setQ] = useState<Row[]>([])
  const say = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500) }
  const load = useCallback(async () => {
    setSv((await sb.from('services').select('*').order('id')).data || [])
    setIm((await sb.from('images').select('*').order('id', { ascending: false })).data || [])
    setQ((await sb.from('inquiries').select('*').order('id', { ascending: false })).data || [])
  }, [sb])
  useEffect(() => { load() }, [load])
  async function addS(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget; const d = Object.fromEntries(new FormData(f))
    const { error } = await sb.from('services').insert({ title: d.title, description: d.description, price: d.price, title_en: d.title_en || null, description_en: d.description_en || null })
    if (error) return say('Kļūda: nesaglabājās'); f.reset(); say('Pakalpojums pievienots'); load()
  }
  async function addI(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget; const d = new FormData(f); const file = d.get('file') as File
    if (!file?.size) return say('Izvēlies bildi')
    setBusy(true)
    const path = `${crypto.randomUUID()}.${file.name.split('.').pop()?.toLowerCase()}`
    const up = await sb.storage.from('gallery').upload(path, file)
    if (up.error) { setBusy(false); return say('Kļūda: tikai JPG/PNG/WEBP līdz 8 MB') }
    await sb.from('images').insert({ path, caption: String(d.get('caption') || ''), caption_en: String(d.get('caption_en') || '') || null })
    f.reset(); setPrev(''); setBusy(false); say('Bilde augšupielādēta'); load()
  }
  async function delI(i: Row) { if (!confirm('Dzēst šo bildi?')) return; await sb.storage.from('gallery').remove([i.path]); await sb.from('images').delete().eq('id', i.id); say('Bilde dzēsta'); load() }
  async function del(t: string, id: number, what: string) { if (!confirm(`Dzēst ${what}?`)) return; await sb.from(t).delete().eq('id', id); say('Dzēsts'); load() }
  async function out() { await sb.auth.signOut(); r.push('/admin/login'); r.refresh() }
  const stats: [Tab, number, string][] = [['sv', sv.length, 'Pakalpojumi'], ['im', im.length, 'Bildes galerijā'], ['q', q.length, 'Pieprasījumi']]
  return <div className="adm">
    <div className="a-top"><div className="a-wrap">
      <span className="a-logo">SMILŠU <i>STRŪKLA</i><em>admin</em></span>
      <div className="a-nav"><a href="/" target="_blank">Atvērt lapu</a><button className="a-ghost" onClick={out}>Iziet</button></div>
    </div></div>
    <div className="a-wrap">
      <div className="a-stats" role="tablist">{stats.map(([k, n, l]) =>
        <button key={k} role="tab" aria-selected={tab === k} className="a-stat" onClick={() => setTab(k)}><b>{n}</b><span>{l}</span></button>)}</div>

      {tab === 'sv' && <>
        <h2 className="a-title">Pakalpojumi</h2>
        <form className="a-card a-form" onSubmit={addS}>
          <label className="a-f">Nosaukums (LV)<input name="title" required placeholder="Rūsas noņemšana" /></label>
          <label className="a-f">Apraksts (LV)<input name="description" placeholder="Īss apraksts" /></label>
          <label className="a-f">Cena<input name="price" placeholder="no 15 €" /></label>
          <label className="a-f">Title (EN)<input name="title_en" placeholder="Rust removal" /></label>
          <label className="a-f">Description (EN)<input name="description_en" placeholder="Short description" /></label>
          <span />
          <button className="a-btn">Pievienot</button>
        </form>
        <div className="a-list">{sv.map(s => <div key={s.id}><h3>{s.title}</h3><p>{s.description}</p><span className="a-price">{s.price}</span>
          <button className="a-del" onClick={() => del('services', s.id, 'pakalpojumu')}>Dzēst</button></div>)}</div>
        {!sv.length && <p className="a-empty">Vēl nav pakalpojumu. Pievieno pirmo augstāk, un tas parādīsies sākumlapā.</p>}
      </>}

      {tab === 'im' && <>
        <h2 className="a-title">Galerija</h2>
        <form className="a-card a-up" onSubmit={addI}>
          <label className="a-drop">
            {prev ? <img src={prev} alt="Priekšskatījums" /> : <><b>Izvēlies bildi</b><span>JPG, PNG vai WEBP, līdz 8 MB</span></>}
            <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required
              onChange={e => { const f = e.target.files?.[0]; setPrev(f ? URL.createObjectURL(f) : '') }} />
          </label>
          <div><label className="a-f">Paraksts<input name="caption" placeholder="Piem. Motocikla rāmis pēc apstrādes" /></label>
            <label className="a-f" style={{ display: 'block', marginTop: 10 }}>Caption (EN)<input name="caption_en" placeholder="E.g. Motorcycle frame after blasting" /></label>
            <button className="a-btn" style={{ marginTop: 12 }} disabled={busy}>{busy ? 'Augšupielādē...' : 'Augšupielādēt'}</button></div>
        </form>
        <div className="a-gal">{im.map(i => <div className="a-img" key={i.id}>
          <img src={sb.storage.from('gallery').getPublicUrl(i.path).data.publicUrl} alt={i.caption} loading="lazy" />
          <div><span>{i.caption}</span><button className="a-del" onClick={() => delI(i)}>Dzēst</button></div></div>)}</div>
        {!im.length && <p className="a-empty">Galerija ir tukša. Augšupielādē pirmo darba bildi.</p>}
      </>}

      {tab === 'q' && <>
        <h2 className="a-title">Pieprasījumi</h2>
        {q.map(x => <div className="a-q" key={x.id}>
          <div className="a-qh"><b>{x.name}</b><time>{new Date(x.created_at).toLocaleString('lv-LV')}</time></div>
          <a href={href(x.contact)}>{x.contact}</a>
          <p>{x.message}</p>
          <button className="a-del" onClick={() => del('inquiries', x.id, 'pieprasījumu')}>Dzēst</button></div>)}
        {!q.length && <p className="a-empty">Pagaidām nav jaunu pieprasījumu. Tie parādīsies šeit, kad klienti aizpildīs kontaktformu.</p>}
      </>}
    </div>
    {msg && <div className="a-toast" role="status">{msg}</div>}
  </div>
}
