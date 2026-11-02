import { Star } from "lucide-react";
import ReviewTable from "@/components/common/reviewtable";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { FaStar } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";

export default function ReviewsTab({
  reviews,
  refreshReviews,
  courseId,
}: {
  reviews?: any;
  refreshReviews: () => void;
  courseId: number | string | null;
}) {
  const { token } = useAuth();
  const [currentReviews, setCurrentReviews] = useState(reviews);

  useEffect(() => {
    setCurrentReviews(reviews);
  }, [reviews]);

  // Handle the case where reviews might be an array instead of an object
  const reviewsData = Array.isArray(currentReviews)
    ? currentReviews[0]
    : currentReviews;

  const ratingPercentages: Record<number, number> = {
    5: parseFloat(String(reviewsData?.five_star_percentage ?? "0")),
    4: parseFloat(String(reviewsData?.four_star_percentage ?? "0")),
    3: parseFloat(String(reviewsData?.three_star_percentage ?? "0")),
    2: parseFloat(String(reviewsData?.two_star_percentage ?? "0")),
    1: parseFloat(String(reviewsData?.first_star_percentage ?? "0")),
  };

  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");

  const handleReviewsUpdate = (updatedReviews: any) => {
    setCurrentReviews(updatedReviews);
  };

  const handleSubmit = () => {
    if (!courseId) {
      setResponse("Course ID is missing");
      return;
    }

    if (!token) {
      setResponse("Authentication token is missing");
      return;
    }

    setIsLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const formdata = new FormData();
    formdata.append("course_id", String(courseId));
    formdata.append("rating", rating.toString());
    formdata.append("comment", feedback);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow" as RequestRedirect,
    };

    fetch(`${baseUrl}student/course/review-create`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.status === 200 || result.status === "success") {
          setShowModal(false);
          setResponse("");
          setRating(0);
          setFeedback("");
          // Refresh only reviews data
          refreshReviews();
        } else {
          setResponse(result.message || "Failed to submit review");
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setResponse("An error occurred while submitting the review");
        setIsLoading(false);
      });
  };

  return (
    <div className="p-4 space-y-8">
      {/* Section 1 */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-12 md:col-span-4 space-y-2">
          <h2 className="text-lg">Total Reviews</h2>
          <p className="text-5xl font-bold text-black">
            {reviewsData?.total_user_reviews}
          </p>
          <p className="text-gray-700 text-sm">
            Growth in reviews on this month
          </p>
        </div>
        {/* Right Column */}
        <div className="col-span-12 md:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const percent = ratingPercentages[star] || 0;
            return (
              <div key={star} className="flex items-center gap-3">
                {/* Star + Label */}
                <div className="flex items-center gap-1 text-yellow-500 w-10 shrink-0">
                  <Star size={16} fill="#facc15" />
                  <span className="text-gray-700 text-sm">{star}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-200 rounded relative">
                  <div
                    className="h-full bg-[#1D407D] rounded transition-all duration-500"
                    style={{ width: `${percent.toFixed(2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conditionally show Add Review button based on can_review */}
      {reviewsData?.can_review && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="default"
            onClick={() => setShowModal(true)}
          >
            Add Review
          </Button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 h-screen overflow-hidden bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold mb-6">Write a Review</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="flex justify-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`w-5 h-5 cursor-pointer ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
              <div className="mb-2">
                <label className="block text-md font-medium mb-2">
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-3 h-28 resize-none focus:outline-none focus:ring-1 focus:ring-secondary"
                  placeholder="Please write your feedback here"
                  required
                />
              </div>
              <p className="mb-4 text-xs text-red-500">{response}</p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80 text-sm cursor-pointer flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "SUBMIT REVIEW"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reviewsData?.user_reviews && reviewsData?.user_reviews.length > 0 ? (
        <ReviewTable
          user_reviews={reviewsData?.user_reviews}
          pagination={reviewsData?.pagination}
          courseId={courseId || 0}
          token={token || ""} // Fix: Provide empty string as fallback
          onUpdateReviews={handleReviewsUpdate}
        />
      ) : (
        <div>No reviews found</div>
      )}
    </div>
  );
}
