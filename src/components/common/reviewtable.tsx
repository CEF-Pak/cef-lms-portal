// components/common/reviewtable.tsx
import { ArrowDown, Star } from "lucide-react";
import { useState } from "react";
import { baseUrl } from "@/config/authConfig";

export default function ReviewTable({
  user_reviews,
  pagination,
  courseId,
  token,
  onUpdateReviews,
}: {
  user_reviews?: any[];
  pagination?: any;
  courseId: number | string;
  token: string;
  onUpdateReviews: (reviews: any) => void;
}) {
  const [currentPage, setCurrentPage] = useState(pagination?.current_page || 1);

  const fetchPage = async (page: number) => {
    if (!courseId || !token || page === currentPage) return;

    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const response = await fetch(
        `${baseUrl}student/course/review-list/${courseId}?page=${page}`,
        {
          method: "GET",
          headers: myHeaders,
        }
      );

      const result = await response.json();
      setCurrentPage(page);
      onUpdateReviews(result);
    } catch (error) {
      console.error("Error fetching reviews page:", error);
    }
  };

  if (!user_reviews || user_reviews.length === 0) {
    return <div className="text-center py-4">No reviews found</div>;
  }

  return (
    <div className="bg-white overflow-x-auto mt-4">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="bg-white text-gray-600 border-b border-gray-400">
          <tr>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              <div className="flex items-center gap-1 text-black">
                Username <ArrowDown size={14} className="text-gray-400" />
              </div>
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              <div className="flex items-center gap-1 text-black">
                Reviews <ArrowDown size={14} className="text-gray-400" />
              </div>
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              <div className="flex items-center gap-1 text-black">
                Rating <ArrowDown size={14} className="text-gray-400" />
              </div>
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              <div className="flex items-center gap-1 text-black">
                Submission At <ArrowDown size={14} className="text-gray-400" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {user_reviews.map((review: any) => (
            <tr key={review.id} className="border-t">
              <td className="px-4 py-3 whitespace-nowrap">
                {review.user_name}
              </td>
              <td className="px-4 py-3 wrap">{review.comment}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex gap-x-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="text-yellow-500"
                      fill="#facc15"
                    />
                  ))}
                  {[...Array(5 - review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="text-gray-300"
                      fill="#d1d5db"
                    />
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {review.created_at}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls with numbered buttons */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => fetchPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? "bg-white text-black border-1"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
