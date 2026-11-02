import { Star } from "lucide-react";
import ReviewTable from "@/components/tutor/reviewtable";

type ReviewsTabProps = {
  data?:
    | {
        total_reviews: number;
        five_star_percentage: number;
        four_star_percentage: number;
        three_star_percentage: number;
        two_star_percentage: number;
        first_star_percentage: number;
        user_reviews: {
          user_id: number;
          user_name: string;
          user_image: string;
          review: string;
          rating: number;
          submission_at: string;
        }[];
      }
    | undefined;
};

export default function ReviewsTab({ data }: ReviewsTabProps) {
  const ratingPercentages: Record<number, number> = {
    5: data?.five_star_percentage ?? 0,
    4: data?.four_star_percentage ?? 0,
    3: data?.three_star_percentage ?? 0,
    2: data?.two_star_percentage ?? 0,
    1: data?.first_star_percentage ?? 0,
  };

  return (
    <div className="lg:p-4 space-y-8">
      {data ? (
        <>
          {/* Section 1 */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="col-span-12 md:col-span-4 space-y-2">
              <h2 className="text-lg">Total Reviews</h2>
              <p className="text-5xl font-bold text-black">
                {data.total_reviews}
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

          {/* Section 2: Table */}
          <ReviewTable user_reviews={data.user_reviews} />
        </>
      ) : (
        <p className="text-sm text-gray-500">No reviews available.</p>
      )}
    </div>
  );
}
