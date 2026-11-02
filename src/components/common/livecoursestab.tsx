import { useState, useEffect } from "react";
import { ArrowDown, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";

// Interface for API course data
interface Course {
  courseID: number;
  courseName: string;
  courseSlug: string;
  courseType: string;
  courseImage: string;
  totalLessons: number;
  lecturesRemaining: number;
  resources: number;
  rating: string;
  coursePrice: string;
  courseUUID: string;
}

// Skeleton component for loading state
function TableSkeleton() {
  return (
    <div className="overflow-x-auto border-0">
      {/* Added min-w-max to the table */}
      <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
        <thead className="text-left text-muted-foreground">
          <tr>
            {["Course Name", "Price", "Rating"].map((header) => (
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
              {/* Added whitespace-nowrap to td elements to prevent content from wrapping and force horizontal expansion */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex gap-3 items-center">
                  <div className="w-14 h-10 rounded bg-gray-200 animate-pulse flex-shrink-0" />
                  <div className="space-y-2 flex-grow">
                    {" "}
                    {/* flex-grow allows space-y-2 to take available space within the cell without wrapping */}
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-4 bg-gray-200 rounded animate-pulse flex-shrink-0" // Added flex-shrink-0
                    />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Livetab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${baseUrl}student/my-learning`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        // Filter courses with courseType: "Live"
        const liveCourses = data.on_going.filter(
          (course: Course) => course.courseType === "Live"
        );
        setCourses(liveCourses);
        setLoading(false);
      } catch (err) {
        setError("Error loading courses");
        console.error("Error loading courses:", err);
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  if (loading) {
    return <TableSkeleton />;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="overflow-x-auto border-0">
      {/* Added min-w-max to the table */}
      <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
        <thead className="text-left text-muted-foreground">
          <tr>
            {/* Headers already have whitespace-nowrap. No change needed here. */}
            {["Course Name", "Price", "Rating"].map((header) => (
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
          {courses.map((course) => {
            const rating = Math.round(parseFloat(course.rating));
            const price =
              parseFloat(course.coursePrice) === 0
                ? "Free"
                : `Rs. ${Number(course.coursePrice).toLocaleString()}`;

            return (
              <tr
                key={course.courseID}
                className="bg-white border-b border-gray-200"
              >
                {/* Added whitespace-nowrap to td elements.
                    Also added flex-shrink-0 to image and link for better control. */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-3 items-center">
                    <img
                      src={course.courseImage}
                      alt={course.courseName}
                      className="w-14 h-10 rounded object-cover flex-shrink-0" // Added flex-shrink-0
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png"; // Fallback image
                      }}
                    />
                    {/* The div around Link also gets whitespace-nowrap */}
                    <div className="whitespace-nowrap">
                      <Link
                        to="/mycourses/$slug"
                        params={{ slug: course.courseSlug }}
                        className="block text-blue-600 hover:underline cursor-pointer whitespace-nowrap" // Added whitespace-nowrap
                      >
                        {course.courseName}
                      </Link>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{price}</td>{" "}
                {/* Added whitespace-nowrap */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-0.5 flex-shrink-0">
                    {" "}
                    {/* Added flex-shrink-0 */}
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
