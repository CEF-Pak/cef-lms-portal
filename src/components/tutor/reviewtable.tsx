// components/common/reviewtable.tsx
import { ArrowDown, Star } from "lucide-react";

export default function ReviewTable({ user_reviews }: { user_reviews?: any }) {
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
          {user_reviews &&
            user_reviews.length > 0 &&
            user_reviews.map((review: any) => (
              <tr className="border-t">
                <td className="px-4 py-3 whitespace-nowrap">
                  {review.user_name}
                </td>
                <td className="px-4 py-3 whitespace-wrap" style={{ minWidth: "16rem" }}>{review.review}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex  gap-x-1">
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
                  {review.submission_at}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
