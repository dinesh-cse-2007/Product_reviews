import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Star, MessageSquare, Loader2, X } from "lucide-react";
import type { Product, Review } from "@/types";
import { supabase } from "@/lib/supabase";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

export default function ProductDetail({ product, onBack }: ProductDetailProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load reviews:", error);
    }

    const fetched = data ?? [];
    setReviews(fetched);
    if (fetched.length > 0) {
      setAvgRating(fetched.reduce((sum, r) => sum + r.rating, 0) / fetched.length);
    } else {
      setAvgRating(0);
    }
    setLoading(false);
  }, [product.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReviewSubmit = async (data: { author_name: string; rating: number; comment: string }) => {
    const { error } = await supabase.from("reviews").insert({
      product_id: product.id,
      author_name: data.author_name,
      rating: data.rating,
      comment: data.comment,
    });

    if (error) throw error;
    await fetchReviews();
    setShowForm(false);
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="animate-[fadeIn_0.3s_ease]">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-teal-600"
      >
        <ArrowLeft size={18} />
        Back to all products
      </button>

      {/* Product header */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gray-50">
          <img
            src={product.image_url}
            alt={product.name}
            className="aspect-[4/3] w-full object-cover"
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-teal-700 backdrop-blur-sm">
            {product.category}
          </span>
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            {avgRating > 0 ? (
              <>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={star <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <span className="text-lg font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
              </>
            ) : (
              <span className="text-sm text-gray-400">No reviews yet — be the first!</span>
            )}
          </div>

          <p className="mt-5 text-base leading-relaxed text-gray-600">{product.description}</p>

          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-6 flex w-fit items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-200"
          >
            {showForm ? (
              <>
                <X size={18} />
                Cancel
              </>
            ) : (
              <>
                <MessageSquare size={18} />
                Write a Review
              </>
            )}
          </button>
        </div>
      </div>

      {/* Review form */}
      {showForm && (
        <div className="mt-8 max-w-2xl">
          <ReviewForm onSubmit={handleReviewSubmit} />
        </div>
      )}

      {/* Reviews section */}
      <div className="mt-10">
        <div className="border-t border-gray-100 pt-8">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Rating summary */}
            <div className="lg:sticky lg:top-6 lg:h-fit">
              <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-400">Rating Breakdown</h3>

                {reviews.length > 0 ? (
                  <>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                      <span className="text-sm text-gray-400">out of 5</span>
                    </div>
                    <div className="mt-2 flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-400">{reviews.length} total review{reviews.length !== 1 ? "s" : ""}</p>

                    <div className="mt-5 space-y-2">
                      {ratingDistribution.map(({ star, count, percentage }) => (
                        <div key={star} className="flex items-center gap-2">
                          <span className="w-3 text-xs font-medium text-gray-500">{star}</span>
                          <Star size={10} className="fill-amber-400 text-amber-400" strokeWidth={1.5} />
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-amber-400 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-6 text-right text-xs text-gray-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-gray-400">No ratings yet. Share your experience to get the conversation started!</p>
                )}
              </div>
            </div>

            {/* Review list */}
            <div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Customer Reviews {reviews.length > 0 && <span className="text-gray-400">({reviews.length})</span>}
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={28} className="animate-spin text-teal-500" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
                  <MessageSquare size={36} className="mx-auto text-gray-300" />
                  <p className="mt-4 text-sm font-medium text-gray-500">No reviews yet</p>
                  <p className="mt-1 text-sm text-gray-400">Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      authorName={review.author_name}
                      rating={review.rating}
                      comment={review.comment}
                      createdAt={review.created_at}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
