export function PreviewStrip() {
  return (
    <section className="bg-asphalt px-6 py-16 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal">3D city rules</p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">Every metric changes the skyline.</h2>
          <p className="mt-4 leading-7 text-slate-300">
            Followers lift the tower, posts add floors, average likes widen the footprint, views power neon, and category places each creator in a themed district.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {["Tech glass", "Fashion arcade", "Food district", "Gaming neon"].map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-brand-panel/70 p-4 shadow-glow">
              <div className="mb-3 h-24 rounded-md bg-brand-gradient opacity-90" />
              <div className="text-sm font-semibold text-white">{item}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
