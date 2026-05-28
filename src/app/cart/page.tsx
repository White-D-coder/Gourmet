export default function Cart() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-creme pt-32 pb-48 px-12">
      <h1 className="font-serif text-5xl md:text-7xl text-charcoal font-light mb-16 tracking-wide">
        Your Bag
      </h1>
      <p className="font-sans text-xs uppercase tracking-[0.2em] text-charcoal/60">
        Your selection is currently empty.
      </p>
    </main>
  );
}
