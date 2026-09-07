import { useState, useMemo, useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// GROOVE & CO. — a from-scratch demo storefront built to teach the same
// structural patterns you'll find in Shopify-style themes:
//   1) sticky header nav + region/language switcher
//   2) collection sections with sale-price / regular-price product cards
//   3) a slide-out cart drawer (not a full page navigation)
//   4) a search overlay
//   5) newsletter capture in the footer
// All state is local (useState) — in a real Shopify theme this would be
// backed by the Ajax Cart API and Storefront API instead.
// ---------------------------------------------------------------------------

const CATEGORIES = ["Test", "New arrivals", "Jazz", "Soul & Funk", "Turntables"];

const PRODUCTS = [
  { id: "t1", name: "Test Order — do not ship", category: "Test", price: 0.01, salePrice: null, art: "#5F574C" },
  { id: "p1", name: "Kind of Blue — reissue LP", category: "Jazz", price: 34, salePrice: 28, art: "#D9A441" },
  { id: "p2", name: "Head Hunters — 180g LP", category: "Jazz", price: 32, salePrice: 26, art: "#8C5E3C" },
  { id: "p3", name: "What's Going On — LP", category: "Soul & Funk", price: 30, salePrice: null, art: "#3E6259" },
  { id: "p4", name: "Songs in the Key of Life — 2LP", category: "Soul & Funk", price: 45, salePrice: 38, art: "#B24C3A" },
  { id: "p5", name: "Belle & the Devil — new pressing", category: "New arrivals", price: 26, salePrice: null, art: "#6B4E71" },
  { id: "p6", name: "Portable Turntable — walnut", category: "Turntables", price: 189, salePrice: 159, art: "#2B4747" },
  { id: "p7", name: "Concrete Jungle — 7\" single", category: "New arrivals", price: 12, salePrice: null, art: "#C97B4A" },
  { id: "p8", name: "Studio Slipmat — felt pair", category: "Turntables", price: 18, salePrice: 14, art: "#9C8B6E" },
];

const REGIONS = ["United States", "United Kingdom", "Canada", "Japan", "Germany"];
const LANGUAGES = ["English", "日本語", "Deutsch", "Français"];

function Money({ value }) {
  return <span>${value.toFixed(2)}</span>;
}

function RecordArt({ id, color }) {
  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-sm"
      style={{ backgroundColor: "#181614" }}
    >
      <img
        src={`https://picsum.photos/seed/${id}/400/400`}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(180deg, transparent 60%, ${color}55 100%)` }}
      />
      <div className="absolute inset-0 m-auto h-5 w-5 rounded-full border-2 border-[#F2E9DC] bg-[#181614]" />
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  const [justAdded, setJustAdded] = useState(false);
  const onSale = product.salePrice != null;

  const handleAdd = () => {
    onAdd(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1000);
  };

  return (
    <div className="group flex flex-col">
      <RecordArt id={product.id} color={product.art} />
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-[15px] leading-snug text-[#F2E9DC]">{product.name}</p>
          <p className="mt-1 text-sm text-[#A79A87]">
            {onSale ? (
              <>
                <span className="text-[#D9A441]"><Money value={product.salePrice} /></span>{" "}
                <span className="line-through">{"$" + product.price.toFixed(2)}</span>
              </>
            ) : (
              <Money value={product.price} />
            )}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className={`shrink-0 rounded-sm border px-3 py-1.5 text-xs tracking-wide transition-colors ${
            justAdded
              ? "border-[#D9A441] text-[#D9A441]"
              : "border-[#443F3A] text-[#F2E9DC] hover:border-[#D9A441] hover:text-[#D9A441]"
          }`}
        >
          {justAdded ? "Added ✓" : "Add"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PayPalCheckout — mounts the official PayPal Buttons widget (loaded via the
// <script src="...paypal.com/sdk/js..."> tag in index.html) into a div.
// window.paypal only exists once that script tag has loaded, so we guard
// against it being undefined and re-render whenever the cart total changes.
// ---------------------------------------------------------------------------
function PayPalCheckout({ total, onSuccess }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (total <= 0) return;
    if (!window.paypal) {
      console.warn("PayPal SDK not loaded — check the <script> tag in index.html");
      return;
    }

    // Clear any previously rendered button before re-rendering with a new total
    containerRef.current.innerHTML = "";

    const buttons = window.paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: { value: total.toFixed(2), currency_code: "USD" },
            },
          ],
        });
      },
      onApprove: async (data, actions) => {
        const details = await actions.order.capture();
        onSuccess(details);
      },
      onError: (err) => {
        console.error("PayPal Checkout error:", err);
        alert("Something went wrong with the PayPal checkout. Check the console for details.");
      },
    });

    buttons.render(containerRef.current);

    return () => {
      // Clean up on unmount / total change to avoid duplicate buttons
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [total]);

  return <div ref={containerRef} className="mt-4" />;
}

export default function GrooveStoreDemo() {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [region, setRegion] = useState("United States");
  const [language, setLanguage] = useState("English");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]); // { id, name, price, qty }

  const addToCart = (product) => {
    setCart((prev) => {
      const price = product.salePrice ?? product.price;
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: product.id, name: product.name, price, qty: 1 }];
    });
    // Note: we deliberately do NOT open the drawer here.
    // "Add" should feel silent (like a real store) — the cart badge count
    // updates, and the shopper opens the drawer themselves when ready to
    // review items and check out.
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.qty * i.price, 0);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return PRODUCTS.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: PRODUCTS.filter((p) => p.category === cat),
  }));

  return (
    <div className="min-h-screen bg-[#181614] font-sans text-[#F2E9DC]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&family=Inter:wght@400;500;600&display=swap');
        .font-serif { font-family: 'Fraunces', serif; }
      `}</style>

      {/* ---------------- Header ---------------- */}
      <header className="sticky top-0 z-30 border-b border-[#2A2724] bg-[#181614]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="font-serif text-lg tracking-wide">Groove &amp; Co.</span>
            <nav className="hidden gap-6 text-sm text-[#C9BCA8] md:flex">
              {CATEGORIES.map((c) => (
                <a key={c} href={`#${c}`} className="hover:text-[#F2E9DC]">
                  {c}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-5 text-sm text-[#C9BCA8]">
            {/* region/language switcher */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setRegionOpen((v) => !v)}
                className="flex items-center gap-1 hover:text-[#F2E9DC]"
              >
                {region.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()} / {language.slice(0, 2).toUpperCase()}
                <span className="text-xs">▾</span>
              </button>
              {regionOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-sm border border-[#2A2724] bg-[#1F1C19] p-3 shadow-xl">
                  <p className="mb-1 text-xs uppercase tracking-wide text-[#7A7064]">Region</p>
                  {REGIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRegion(r)}
                      className={`block w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-[#2A2724] ${r === region ? "text-[#D9A441]" : ""}`}
                    >
                      {r}
                    </button>
                  ))}
                  <p className="mb-1 mt-3 text-xs uppercase tracking-wide text-[#7A7064]">Language</p>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`block w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-[#2A2724] ${l === language ? "text-[#D9A441]" : ""}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setSearchOpen(true)} className="hover:text-[#F2E9DC]" aria-label="Search">
              Search
            </button>

            <button onClick={() => setCartOpen(true)} className="relative hover:text-[#F2E9DC]" aria-label="Cart">
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#D9A441] text-[10px] font-semibold text-[#181614]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.2em] text-[#7A7064]">Pressed weekly, since 2019</p>
        <h1 className="mt-3 max-w-xl font-serif text-4xl leading-tight text-[#F2E9DC] md:text-5xl">
          Records worth cleaning your needle for.
        </h1>
        <p className="mt-4 max-w-md text-[#A79A87]">
          A small shop sourcing original pressings and faithful reissues — jazz, soul, and the
          turntables to play them properly.
        </p>
      </section>

      {/* ---------------- Collections ---------------- */}
      <main className="mx-auto max-w-6xl px-6 pb-24">
        {grouped.map(({ category, items }) => (
          <section key={category} id={category} className="mb-16 scroll-mt-20">
            <div className="mb-6 flex items-baseline justify-between border-b border-[#2A2724] pb-3">
              <h2 className="font-serif text-2xl">{category}</h2>
              <span className="text-sm text-[#7A7064]">{items.length} items</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-[#2A2724] px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-serif text-lg">Join the mailing list</p>
            <p className="mt-1 text-sm text-[#7A7064]">New arrivals and restocks, twice a month.</p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-sm items-center gap-2 border-b border-[#443F3A] pb-1 sm:w-auto"
          >
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full bg-transparent text-sm text-[#F2E9DC] placeholder:text-[#5F574C] focus:outline-none"
            />
            <button type="submit" className="text-sm text-[#D9A441]">
              Subscribe
            </button>
          </form>
        </div>
        <p className="mx-auto mt-10 max-w-6xl text-xs text-[#5F574C]">© 2026 Groove &amp; Co. — demo storefront for learning purposes.</p>
      </footer>

      {/* ---------------- Search overlay ---------------- */}
      {searchOpen && (
        <div className="fixed inset-0 z-40 bg-[#181614]/90 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div
            className="mx-auto mt-24 w-full max-w-xl px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search records, artists, gear…"
              className="w-full border-b border-[#443F3A] bg-transparent pb-3 font-serif text-2xl text-[#F2E9DC] placeholder:text-[#5F574C] focus:outline-none"
            />
            <div className="mt-6 space-y-3">
              {query.trim() && searchResults.length === 0 && (
                <p className="text-sm text-[#7A7064]">No matches for "{query}".</p>
              )}
              {searchResults.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="text-[#7A7064]">
                    <Money value={p.salePrice ?? p.price} />
                  </span>
                </div>
              ))}
            </div>
            <button onClick={() => setSearchOpen(false)} className="mt-8 text-xs uppercase tracking-wide text-[#7A7064]">
              Close ✕
            </button>
          </div>
        </div>
      )}

      {/* ---------------- Cart drawer ---------------- */}
      <div
        className={`fixed inset-0 z-40 transition-opacity ${cartOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-sm transform bg-[#1F1C19] p-6 shadow-2xl transition-transform ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl">Your cart</h3>
            <button onClick={() => setCartOpen(false)} className="text-sm text-[#7A7064]">
              Close ✕
            </button>
          </div>

          {cart.length === 0 ? (
            <p className="mt-10 text-sm text-[#7A7064]">Your cart is empty.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-[#2A2724] pb-3 text-sm">
                  <div>
                    <p>{item.name}</p>
                    <p className="text-[#7A7064]">
                      Qty {item.qty} · <Money value={item.price} /> each
                    </p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-xs text-[#7A7064] hover:text-[#D9A441]">
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 font-serif text-lg">
                <span>Total</span>
                <Money value={cartTotal} />
              </div>
              <PayPalCheckout
                total={cartTotal}
                onSuccess={(details) => {
                  alert(`Sandbox payment complete! Thanks, ${details.payer.name.given_name}.`);
                  setCart([]);
                  setCartOpen(false);
                }}
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
