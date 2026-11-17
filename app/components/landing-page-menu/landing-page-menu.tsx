const menuItems = [
  { label: "Tentang", href: "#tentang" },
  { label: "Program", href: "#program" },
  { label: "Kontak", href: "#kontak" },
]

export default function LandingPageMenu() {
  return (
    <nav aria-label="Navigasi utama" className="hidden items-center gap-8 md:flex">
      {menuItems.map((item) => (
        <a
          className="text-sm font-medium text-slate-600 transition-colors hover:text-amber-800"
          href={item.href}
          key={item.label}
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}
