import { useEffect, useState } from "react";
import { ArrowDown, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";

interface Course {
  id: number;
  uuid: string;
  slug: string;
  title: string;
  type: string;
  image: string;
  resources: number;
  enrolled: number;
  price: number;
  average_rating: string;
}

// Skeleton component for loading state
function TableSkeleton() {
  return (
    <div className="overflow-x-auto border-0">
      <table className="w-full text-sm bg-white border-collapse rounded-lg">
        <thead className="text-left text-muted-foreground">
          <tr>
            {[
              "Course Name",
              "Resources",
              "Enrolled",
              "Price",
              "Rating",
              "Action",
            ].map((header) => (
              <th
                key={header}
                className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
              >
                <div className="flex items-center gap-1">
                  {header}
                  {["Rating", "Action"].includes(header) ? null : (
                    <ArrowDown size={14} className="text-gray-400" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="bg-white border-b border-gray-200">
              <td className="px-4 py-3">
                <div className="flex gap-3 items-center">
                  <div className="w-14 h-10 rounded bg-gray-200 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LiveClassTutor() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(
          `${baseUrl}instructor/my-courses?type=2`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch live courses");
        }

        const data = await res.json();
        setCourses(data.data || []);
        setLoading(false);
      } catch (err) {
        setError("Something went wrong while loading courses.");
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  if (loading) {
    return <TableSkeleton />;
  }
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="overflow-x-auto border-0">
      <table className="w-full text-sm table-auto bg-white border-collapse rounded-lg">
        <thead className="text-left text-muted-foreground">
          <tr>
            {[
              "Course Name",
              "Resources",
              "Enrolled",
              "Price",
              "Rating",
              "Action",
            ].map((header) => (
              <th
                key={header}
                className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
              >
                <div className="flex items-center gap-1">
                  {header}
                  {!["Rating", "Action"].includes(header) && (
                    <ArrowDown size={14} className="text-gray-400" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const rating = Math.round(parseFloat(course.average_rating));
            const price =
              course.price === 0
                ? "Free"
                : `Rs. ${course.price.toLocaleString()}`;

            return (
              <tr key={course.id} className="bg-white border-b border-gray-200">
                <td className="px-4 py-3" style={{ minWidth: "12rem" }}>
                  <div className="flex flex-col lg:flex-row gap-3 items-center">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-24 h-auto rounded object-cover flex-shrink-0 lg:w-14 lg:h-10"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/150/CCCCCC/FFFFFF?text=NoImage";
                      }}
                    />
                    <div>
                      <Link
                        to="/tutor/mycourses/$slug"
                        params={{ slug: course.slug }}
                        className="block text-blue-600 hover:underline cursor-pointer"
                      >
                        {course.title}
                      </Link>
                      <div className="text-xs text-gray-500 mt-2">Live Course</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{course.resources}</td>
                <td className="px-4 py-3">{course.enrolled}</td>
                <td className="px-4 py-3" style={{ minWidth: "8rem" }}>{price}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={cn("text-yellow-400", {
                          "text-gray-300": i >= rating,
                        })}
                        fill={i < rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3" style={{ minWidth: "12rem" }}>
                  <Link
                    to="/tutor/mycourses/$slug"
                    params={{ slug: course.slug }}
                    className="text-white bg-[#013370] px-4 py-2 rounded-lg"
                  >
                    View Resources
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
