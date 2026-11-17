import Link from "next/link"

import LandingPageHero from "./components/landing-page-hero/landing-page-hero"
import SiteHeader from "./components/site-header"

const programs = ["Rekayasa Perangkat Lunak", "Desain Komunikasi Visual", "Bisnis Digital"]

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <LandingPageHero />

      <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16" id="program">
        <h2 className="text-center text-2xl font-bold">Program Keahlian</h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Pilih bidang yang sesuai dengan minatmu.
        </p>
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {programs.map((program) => (
            <div
              className="rounded-lg border bg-white p-5 text-center text-sm font-medium shadow-sm"
              key={program}
            >
              {program}
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t bg-white py-5 text-center text-sm text-slate-500">
        © SMK MVP ARS Internasional
        <Link className="ml-2 underline hover:text-slate-900" href="/login">
          Login
        </Link>
      </footer>
    </main>
  )
}
