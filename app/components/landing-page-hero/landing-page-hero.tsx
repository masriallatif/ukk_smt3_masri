import Image from "next/image"
import Link from "next/link"

export default function LandingPageHero() {
  return (
    <section className="mx-auto grid max-w-5xl items-center gap-8 px-6 py-14 sm:grid-cols-2 sm:py-20">
      <div>
        <p className="text-sm font-medium text-blue-700">
          Selamat datang di
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
          SMK MVP ARS Internasional
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          Sekolah untuk belajar, mengembangkan keterampilan, dan meraih masa
          depan yang lebih baik.
        </p>
        <Link
          className="mt-6 inline-flex rounded-md bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
          href="#program"
        >
          Lihat Program Keahlian
        </Link>
      </div>
      <div className="flex justify-center">
        <Image
          alt="Logo SMK MVP ARS Internasional"
          className="size-52 rounded-full bg-white object-contain shadow-sm sm:size-64"
          height={200}
          priority
          src="/logo.jpg"
          width={200}
        />
      </div>
    </section>
  )
}
