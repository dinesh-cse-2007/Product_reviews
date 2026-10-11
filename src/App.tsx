import { useEffect, useState, useMemo, useCallback } from "react";
import { Search, SlidersHorizontal, Star, MessageSquare, Loader2, X } from "lucide-react";
import type { Product, ProductWithStats } from "@/types";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import ProductDetail from "@/components/ProductDetail";

type SortOption = "top-rated" | "most-reviewed" | "newest";

export default function App() {
  const [products, setProducts] = useState<ProductWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("top-rated");
  const [categories, setCategories] = useState<string[]>(["All"]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load products:", error);
      setLoading(false);
      return;
    }

    const productsData = data ?? [];

    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("product_id, rating");

    const reviewMap = new Map<string, { total: number; count: number }>();
    (reviewsData ?? []).forEach((r) => {
      const existing = reviewMap.get(r.product_id) ?? { total: 0, count: 0 };
      existing.total += r.rating;
      existing.count += 1;
      reviewMap.set(r.product_id, existing);
    });

    const productsWithStats: ProductWithStats[] = productsData.map((p) => {
      const stats = reviewMap.get(p.id);
      return {
        ...p,
        avg_rating: stats ? stats.total / stats.count : null,
        review_count: stats?.count ?? 0,
      };
    });

    const uniqueCategories = ["All", ...Array.from(new Set(productsData.map((p) => p.category)))];
    setCategories(uniqueCategories);
    setProducts(productsWithStats);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case "top-rated":
        result.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0));
        break;
      case "most-reviewed":
        result.sort((a, b) => b.review_count - a.review_count);
        break;
      case "newest":
        result.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return result;
  }, [products, activeCategory, searchQuery, sortBy]);

  const totalReviews = products.reduce((sum, p) => sum + p.review_count, 0);
  const overallRating =
    products.length > 0 && totalReviews > 0
      ? products.reduce((sum, p) => sum + (p.avg_rating ?? 0) * p.review_count, 0) / totalReviews
      : 0;

  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <ProductDetail
            product={selectedProduct}
            onBack={() => {
              setSelectedProduct(null);
              fetchProducts();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Hero */}
      <header className="bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Star size={26} className="fill-amber-300 text-amber-300" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">ReviewHub</h1>
              <p className="text-sm text-teal-100">Real reviews. Real products.</p>
            </div>
          </div>

          <div className="mt-8 max-w-2xl">
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              Discover what people really think
            </h2>
            <p className="mt-3 text-base text-teal-100">
              Browse honest, community-driven reviews across tech, home, and lifestyle products.
              Share your own experience and help others make smarter choices.
            </p>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Star size={20} className="fill-amber-300 text-amber-300" strokeWidth={1.5} />
                <span className="font-bold">{overallRating.toFixed(1)}</span>
                <span className="text-sm text-teal-100">overall rating</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare size={20} />
                <span className="font-bold">{totalReviews}</span>
                <span className="text-sm text-teal-100">total reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{products.length}</span>
                <span className="text-sm text-teal-100">products</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search + Sort bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition-colors focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm font-medium text-gray-700 outline-none transition-colors focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            >
              <option value="top-rated">Top Rated</option>
              <option value="most-reviewed">Most Reviewed</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Category pills */}
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-teal-600 text-white shadow-md shadow-teal-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="mt-8">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 size={32} className="animate-spin text-teal-500" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center">
              <Search size={36} className="mx-auto text-gray-300" />
              <p className="mt-4 text-sm font-medium text-gray-500">No products found</p>
              <p className="mt-1 text-sm text-gray-400">Try a different search or category</p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-400">
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
                {activeCategory !== "All" && ` in ${activeCategory}`}
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Star size={18} className="fill-teal-600 text-teal-600" strokeWidth={1.5} />
              <span className="font-bold text-gray-800">ReviewHub</span>
            </div>
            <p className="text-sm text-gray-400">Built for discovering the best products, powered by real reviews.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
