import Image from "next/image"
import Link from "next/link"

export default function SiteHeader() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link aria-label="SMK MVP ARS Internasional" className="flex items-center gap-2" href="/">
          <Image
            alt="Logo SMK MVP ARS"
            className="size-10 rounded-full object-contain"
            height={200}
            priority
            src="/logo.jpg"
            width={200}
          />
          <span className="text-sm font-semibold">SMK MVP ARS</span>
        </Link>
        <nav aria-label="Navigasi utama" className="flex items-center gap-5 text-sm">
          <Link className="text-slate-600 hover:text-slate-950" href="/">
            Beranda
          </Link>
          <Link className="text-slate-600 hover:text-slate-950" href="#program">
            Program
          </Link>
          <Link
            className="rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"
            href="/login"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  )
}
