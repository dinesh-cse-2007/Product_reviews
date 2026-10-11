import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import StarRating from "./StarRating";

interface ReviewFormProps {
  onSubmit: (data: { author_name: string; rating: number; comment: string }) => Promise<void>;
}

export default function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating");
      return;
    }
    if (authorName.trim().length < 2) {
      setError("Please enter your name (at least 2 characters)");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Please write a review of at least 10 characters");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        author_name: authorName.trim(),
        rating,
        comment: comment.trim(),
      });
      setAuthorName("");
      setRating(0);
      setComment("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6">
      <h3 className="text-lg font-bold text-gray-900">Write a Review</h3>
      <p className="mt-1 text-sm text-gray-500">Share your experience with this product</p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Your Rating</label>
          <StarRating rating={rating} size={28} interactive onRatingChange={setRating} />
        </div>

        <div>
          <label htmlFor="author-name" className="mb-2 block text-sm font-semibold text-gray-700">
            Your Name
          </label>
          <input
            id="author-name"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="e.g. Jane Doe"
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div>
          <label htmlFor="review-comment" className="mb-2 block text-sm font-semibold text-gray-700">
            Your Review
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Tell others what you think about this product..."
            className="w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-4 py-2.5 text-sm text-rose-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send size={18} />
              Submit Review
            </>
          )}
        </button>
      </div>
    </form>
  );
}
