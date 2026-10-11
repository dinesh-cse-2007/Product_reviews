import { Star, MessageSquare } from "lucide-react";
import type { ProductWithStats } from "@/types";

interface ProductCardProps {
  product: ProductWithStats;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const avgRating = product.avg_rating ?? 0;

  return (
    <button
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-100/50"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-teal-700 backdrop-blur-sm">
          {product.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-base font-bold text-gray-900 transition-colors group-hover:text-teal-700">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-500">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={
                    star <= Math.round(avgRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  }
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-700">
              {avgRating > 0 ? avgRating.toFixed(1) : "New"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <MessageSquare size={14} />
            <span>{product.review_count}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
