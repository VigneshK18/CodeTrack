export default function AuthLayout({ eyebrow, title, children }) {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(124,58,237,0.22),transparent_55%)]" aria-hidden="true" />
      <div className="card relative w-full max-w-md p-8 shadow-2xl shadow-black/40 sm:p-10">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mb-8 mt-3 text-3xl font-extrabold tracking-tight text-white">{title}</h1>
        {children}
      </div>
    </section>
  );
}
