import './globals.css'
import { Barlow_Condensed, Inter } from 'next/font/google'
const display = Barlow_Condensed({ subsets: ['latin', 'latin-ext'], weight: ['600', '800'], variable: '--fd' })
const body = Inter({ subsets: ['latin', 'latin-ext'], variable: '--fb' })
export const metadata = { title: 'Smilšu strūkla — detaļu tīrīšana un apstrāde', description: 'Smilšu strūklas pakalpojumi mazām un vidējām detaļām: rūsas, krāsas un oksīdu noņemšana.' }
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="lv" className={`${display.variable} ${body.variable}`}><body>{children}</body></html>
}
