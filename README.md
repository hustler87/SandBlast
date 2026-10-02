# Smilšu strūkla — pakalpojuma mājaslapa

Mājaslapa smilšu strūklas pakalpojumam mazām un vidējām detaļām. Publiska vietne ar pakalpojumiem, galeriju un kontaktformu, kā arī aizsargāts admin panelis satura pārvaldībai.

**Tehnoloģijas:** Next.js 14 (App Router, TypeScript) · Supabase (PostgreSQL, Auth, Storage) · Vercel (hostings)

---

## Saturs

1. [Funkcijas](#funkcijas)
2. [Projekta struktūra](#projekta-struktūra)
3. [Prasības](#prasības)
4. [Uzstādīšana](#uzstādīšana)
5. [Izvietošana Vercel](#izvietošana-vercel)
6. [Admin paneļa lietošana](#admin-paneļa-lietošana)
7. [Drošība](#drošība)
8. [Pielāgošana](#pielāgošana)
9. [Biežākās problēmas](#biežākās-problēmas)
10. [Zināmie ierobežojumi un idejas](#zināmie-ierobežojumi-un-idejas)

---

## Funkcijas

**Publiskā daļa (`/`)**
- Hero sekcija ar aicinājumu pieprasīt cenu
- Pakalpojumu saraksts (nosaukums, apraksts, cena)
- Darbu galerija ar parakstiem
- Kontaktforma — pieprasījumi tiek saglabāti datubāzē
- Latviešu valodas saskarne, SEO `title` un `description`
- Lapa atjaunojas ik pēc 30 sekundēm (`revalidate = 30`)

**Admin daļa (`/admin`)**
- Pieslēgšanās ar e-pastu un paroli (Supabase Auth)
- Pakalpojumu pievienošana un dzēšana
- Bilžu augšupielāde un dzēšana (JPG / PNG / WEBP, līdz 8 MB)
- Klientu pieprasījumu skatīšana un dzēšana

---

## Projekta struktūra

```
smilsu-strukla/
├── app/
│   ├── layout.tsx            # Pamata izkārtojums, metadati
│   ├── globals.css           # Visi stili (krāsas — :root mainīgajos)
│   ├── page.tsx              # Publiskā lapa (servera komponente)
│   ├── ContactForm.tsx       # Kontaktforma (klienta komponente)
│   └── admin/
│       ├── page.tsx          # Admin panelis
│       └── login/page.tsx    # Pieslēgšanās lapa
├── lib/
│   └── supabase.ts           # Supabase klients pārlūkam
├── supabase/
│   └── schema.sql            # Tabulas, RLS politikas, Storage bucket
├── middleware.ts             # Aizsargā /admin (novirza uz /admin/login)
├── .env.example              # Vides mainīgo paraugs
├── package.json
└── tsconfig.json
```

### Datubāzes tabulas

| Tabula       | Lauki                                       | Piekļuve                         |
|--------------|---------------------------------------------|----------------------------------|
| `services`   | id, title, description, price               | Lasīt — visi; rakstīt — admins   |
| `images`     | id, path, caption, created_at               | Lasīt — visi; rakstīt — admins   |
| `inquiries`  | id, name, contact, message, created_at      | Ievietot — visi; lasīt/dzēst — admins |

Bildes glabājas Supabase Storage bucket `gallery` (publiski lasāms, rakstīt drīkst tikai admins).

---

## Prasības

- Node.js 18.17 vai jaunāks
- Supabase konts (der bezmaksas plāns)
- Vercel konts un GitHub repozitorijs (izvietošanai)

---

## Uzstādīšana

### 1. Supabase projekts

1. Izveido jaunu projektu Supabase panelī.
2. Atver **SQL Editor**, ielīmē visu `supabase/schema.sql` saturu un palaid. Tas izveido tabulas, drošības politikas un `gallery` bucket.
3. Authentication iestatījumos **izslēdz jaunu lietotāju reģistrāciju** ("Allow new users to sign up"). Tas ir obligāti, citādi jebkurš varēs izveidot kontu un iegūt admin tiesības.
4. Authentication → Users → **Add user**: ievadi savu admin e-pastu un paroli (atzīmē, ka e-pasts ir apstiprināts, ja šāda opcija ir).
5. Project Settings → API: nokopē **Project URL** un **anon public** atslēgu.

### 2. Lokālā palaišana

```bash
cp .env.example .env.local
# ieraksti .env.local savu URL un anon key

npm install
npm run dev
```

- Vietne: http://localhost:3000
- Admin: http://localhost:3000/admin

### Vides mainīgie

| Mainīgais                        | Apraksts                          |
|----------------------------------|-----------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`       | Supabase projekta URL             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Supabase anon (publiskā) atslēga  |

Anon atslēga ir paredzēta publiskai lietošanai, jo drošību nodrošina RLS politikas. **Nekad** nelieto `service_role` atslēgu šajā projektā un neliec to `NEXT_PUBLIC_` mainīgajos.

---

## Izvietošana Vercel

1. Ieliec projektu GitHub repozitorijā (`.env.local` netiek commitots).
2. Vercel → **Add New → Project** → importē repozitoriju. Framework tiks atpazīts automātiski kā Next.js.
3. Sadaļā **Environment Variables** pievieno abus mainīgos no tabulas augstāk.
4. Spied **Deploy**.
5. Pēc izvietošanas Supabase → Authentication → URL Configuration iestatī **Site URL** uz savu Vercel (vai pašu domēna) adresi.

Pašu domēnu pievieno Vercel projektā sadaļā Domains.

---

## Admin paneļa lietošana

1. Atver `/admin` — tevi novirzīs uz pieslēgšanās lapu.
2. Piesakies ar Supabase izveidotā lietotāja e-pastu un paroli.
3. **Pakalpojumi:** aizpildi nosaukumu (obligāts), aprakstu un cenu, spied "Pievienot". Dzēšana ar ✕.
4. **Galerija:** ieraksti parakstu, izvēlies attēlu, spied "Augšupielādēt". Dzēšot ierakstu, tiek dzēsts arī fails no Storage.
5. **Pieprasījumi:** klientu ziņas no kontaktformas, jaunākās augšā.
6. Pārmaiņas publiskajā lapā parādās līdz 30 sekundēm.

Paroles maiņa vai papildu admini: Supabase panelī Authentication → Users.

---

## Drošība

- **Datu aizsardzību nodrošina RLS**, nevis tikai `middleware.ts`. Middleware tikai novirza neielogotus lietotājus, bet pat ja kāds apietu lapu, datubāze un Storage noraidīs neautorizētas rakstīšanas operācijas.
- Reģistrācija jāatstāj **izslēgta** (skat. uzstādīšanas 3. soli). Politikas dod pilnas tiesības jebkuram `authenticated` lietotājam.
- Bilžu augšupielādi ierobežo bucket: tikai JPG/PNG/WEBP, līdz 8 MB.
- Kontaktformas lauku garumi ir ierobežoti arī datubāzes līmenī.
- Teksts no datubāzes tiek attēlots caur React, kas to automātiski escapē (XSS aizsardzība).
- Kontaktformai nav surogātpasta aizsardzības — skat. idejas zemāk.

---

## Pielāgošana

| Ko mainīt                        | Kur                                              |
|----------------------------------|--------------------------------------------------|
| Nosaukums, hero teksts, sekcijas | `app/page.tsx`                                   |
| Lapas virsraksts un apraksts (SEO) | `app/layout.tsx`                               |
| Krāsas (grafīts + oranžs akcents)| `app/globals.css`, mainīgie `:root` blokā        |
| Atjaunošanās biežums             | `export const revalidate = 30` failā `app/page.tsx` |
| Atļautie bilžu formāti/izmērs    | `supabase/schema.sql` (bucket) un `accept` atribūts `app/admin/page.tsx` |

Kontaktinformāciju (tālrunis, adrese, e-pasts) pagaidām var pievienot tieši `app/page.tsx` kontaktu sekcijā.

---

## Biežākās problēmas

**Pēc ielogošanās atkal atgriež uz login lapu**
Pārbaudi, vai `.env.local` mainīgie ir pareizi un vai dev serveris pēc to izmaiņas ir restartēts.

**"Nepareizi dati" ar pareizu paroli**
Pārliecinies, ka lietotājs ir izveidots tajā pašā Supabase projektā, uz kuru norāda URL, un ka e-pasts ir apstiprināts.

**Bilde netiek augšupielādēta**
Pārbaudi formātu (JPG/PNG/WEBP) un izmēru (līdz 8 MB), kā arī to, vai `schema.sql` Storage daļa ir izpildīta (bucket `gallery` pastāv).

**Pakalpojumi vai galerija nerādās publiskajā lapā**
Pārbaudi, vai RLS politikas "public read" ir izveidotas. Atceries arī 30 sekunžu kešatmiņu.

**`schema.sql` met kļūdu, ka bucket vai tabula jau eksistē**
Skripts paredzēts palaišanai vienu reizi tīrā projektā. Atkārtotai palaišanai vispirms izdzēs esošos objektus.

**Bezmaksas Supabase projekts "aizmieg"**
Bezmaksas plānā projekts tiek pauzēts pēc ilgākas neaktivitātes. Atjaunošana notiek Supabase panelī ar vienu klikšķi.

---

## Zināmie ierobežojumi un idejas

- Nav bilžu automātiskas izmēra samazināšanas (Supabase var piedāvāt transformācijas atkarībā no plāna; alternatīva ir kompresija pirms augšupielādes).
- Nav pakalpojumu rediģēšanas — tikai pievienošana un dzēšana.
- Nav e-pasta paziņojuma par jaunu pieprasījumu (var pievienot ar Supabase Database Webhook + Resend vai līdzīgu pakalpojumu).
- Nav surogātpasta aizsardzības kontaktformai (var pievienot Cloudflare Turnstile vai hCaptcha).
- Nav angļu valodas versijas (var pievienot ar `next-intl`).
- Nav `sitemap.xml`, `robots.txt` un Open Graph attēla.

---

## Valodas (LV / EN)

- Latviešu versija: `/`, angļu versija: `/en`. Pārslēgs ir augšējā izvēlnē.
- Statiskie teksti atrodas `app/Site.tsx` objektā `T`.
- Pakalpojumiem un bilžu parakstiem admin panelī ir atsevišķi EN lauki. Ja EN lauks tukšs, tiek rādīts latviskais teksts.
- **Esošai datubāzei vienreiz jāizpilda `supabase/migration-en.sql`** (SQL Editor), citādi pievienošana adminā dos kļūdu.
- Akcenta krāsa mainās vienā vietā: `--ac` failos `app/site.css` un `app/admin/admin.css`.
