import { createClient } from '@supabase/supabase-js'
import ContactForm from './ContactForm'
import './site.css'
export type Lang = 'lv' | 'en'
const T = {
  lv: { home: '/', nav: ['Pakalpojumi', 'Darbi', 'Kontakti'], h1: ['Rūsa nost.', 'Tīrs metāls.'],
    p: 'Smilšu strūklas apstrāde mazām un vidējām detaļām. Noņemam rūsu, veco krāsu, oksīdus un nogulsnes.',
    cta: ['Pieprasīt cenu', 'Skatīt darbus'], strip: ['Rūsa', 'Veca krāsa', 'Oksīdi', 'Nogulsnes'],
    sv: 'Pakalpojumi', svEmpty: 'Pakalpojumu saraksts tiek papildināts. Raksti, un pateiksim cenu konkrētai detaļai.',
    how: 'Kā tas notiek', steps: [['Atved detaļu', 'Atnes to vai atsūti bildes un īsu aprakstu.'], ['Vienojamies', 'Novērtējam apjomu un nosaucam cenu un termiņu.'], ['Apstrādājam', 'Noņemam rūsu, veco krāsu un nogulsnes līdz tīram metālam.'], ['Saņem tīru detaļu', 'Gatava krāsošanai, pārklāšanai vai atkārtotai lietošanai.']],
    gal: 'Paveiktie darbi', galEmpty: 'Darbu piemēri drīzumā.', alt: 'Apstrādāta detaļa',
    ct: 'Nosūti detaļu aprakstu', lead: 'Uzraksti, kas jātīra, aptuvenos izmērus un materiālu. Atbildēsim ar cenu un termiņu.' },
  en: { home: '/en', nav: ['Services', 'Work', 'Contact'], h1: ['Rust off.', 'Clean metal.'],
    p: 'Sandblasting for small and medium-sized parts. We remove rust, old paint, oxides and deposits.',
    cta: ['Get a quote', 'See our work'], strip: ['Rust', 'Old paint', 'Oxides', 'Deposits'],
    sv: 'Services', svEmpty: 'The service list is being updated. Write to us and we will quote your part.',
    how: 'How it works', steps: [['Bring the part', 'Drop it off or send photos and a short description.'], ['Agree on the job', 'We assess the work and give you a price and a deadline.'], ['We blast it', 'Rust, old paint and deposits come off down to clean metal.'], ['Collect it clean', 'Ready for painting, coating or reuse.']],
    gal: 'Finished work', galEmpty: 'Examples coming soon.', alt: 'Blasted part',
    ct: 'Send us your part details', lead: 'Tell us what needs cleaning, the approximate size and the material. We will reply with a price and a deadline.' },
}
export default async function Site({ lang }: { lang: Lang }) {
  const t = T[lang]; const en = lang === 'en'
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const [{ data: services }, { data: images }] = await Promise.all([
    sb.from('services').select('*').order('id'),
    sb.from('images').select('*').order('id', { ascending: false }),
  ])
  const url = (p: string) => sb.storage.from('gallery').getPublicUrl(p).data.publicUrl
  return <main className="site">
    <nav className="s-nav"><div className="s-wrap">
      <a className="s-logo" href={t.home}>SMILŠU <i>STRŪKLA</i></a>
      <div className="s-links"><a href="#pak">{t.nav[0]}</a><a href="#gal">{t.nav[1]}</a><a href="#kon">{t.nav[2]}</a>
        <span className="s-lang"><a href="/" aria-current={!en}>LV</a><a href="/en" aria-current={en}>EN</a></span></div>
    </div></nav>

    <div className="s-hero">
      <div className="s-plate" /><div className="s-clean" /><div className="s-edge" />
      <div className="s-wrap">
        <h1>{t.h1[0]}<br />{t.h1[1]}</h1><p>{t.p}</p>
        <div className="s-cta"><a className="s-btn" href="#kon">{t.cta[0]}</a><a className="s-btn alt" href="#gal">{t.cta[1]}</a></div>
      </div>
    </div>

    <div className="s-strip"><div className="s-wrap">{t.strip.map(x => <span key={x}>{x}</span>)}</div></div>

    <div className="s-sec" id="pak"><div className="s-wrap">
      <h2 className="s-h">{t.sv}</h2>
      {services?.length ? services.map(s => <div className="s-row" key={s.id}>
        <h3>{(en && s.title_en) || s.title}</h3><p>{(en && s.description_en) || s.description}</p><span className="s-price">{s.price}</span>
      </div>) : <p className="s-empty">{t.svEmpty}</p>}
    </div></div>

    <div className="s-sec s-alt"><div className="s-wrap">
      <h2 className="s-h">{t.how}</h2>
      <div className="s-steps">{t.steps.map(([a, d], i) => <div className="s-step" key={a}><b>{i + 1}</b><h3>{a}</h3><p>{d}</p></div>)}</div>
    </div></div>

    <div className="s-sec" id="gal"><div className="s-wrap">
      <h2 className="s-h">{t.gal}</h2>
      {images?.length ? <div className="s-gal">{images.map(i => { const c = (en && i.caption_en) || i.caption; return <figure key={i.id}>
        <img src={url(i.path)} alt={c || t.alt} loading="lazy" />{c && <figcaption>{c}</figcaption>}</figure> })}</div> : <p className="s-empty">{t.galEmpty}</p>}
    </div></div>

    <div className="s-sec s-alt" id="kon"><div className="s-wrap s-contact">
      <div><h2 className="s-h">{t.ct}</h2><p className="s-lead">{t.lead}</p></div>
      <ContactForm lang={lang} />
    </div></div>

    <div className="s-foot"><div className="s-wrap">© Smilšu strūkla <a href="/admin">Admin</a></div></div>
  </main>
}
