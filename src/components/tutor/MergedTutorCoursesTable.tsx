import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";

// Unified course interface
interface Course {
  id: number;
  uuid: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  enrolled: number;
  // Live course specific
  resources?: number;
  average_rating?: string;
  // Self learning specific
  lessons?: number;
  lectures?: number;
  // Unified fields
  type: "Live" | "Self Learning";
}

// Skeleton component
function TableSkeleton() {
  return (
    <div className="overflow-x-auto border-0">
      <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
        <thead className="text-left text-muted-foreground">
          <tr>
            {[
              "Type",
              "Course Name",
              "Price",
              "Enrolled",
              "Details",
              "Action",
            ].map((header) => (
              <th
                key={header}
                className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
              >
                <div className="flex items-center gap-1">
                  {header}
                  {["Action"].includes(header) ? null : (
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
              {/* Type Column */}
              <td className="px-4 py-3 whitespace-nowrap">
                <Skeleton className="h-6 w-24 rounded-full" />
              </td>

              {/* Course Name Column */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex gap-3 items-center">
                  <Skeleton className="w-14 h-10 rounded flex-shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </td>

              {/* Price Column */}
              <td className="px-4 py-3 whitespace-nowrap">
                <Skeleton className="h-4 w-16" />
              </td>

              {/* Enrolled Column */}
              <td className="px-4 py-3 whitespace-nowrap">
                <Skeleton className="h-4 w-8" />
              </td>

              {/* Details Column */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </td>

              {/* Action Column */}
              <td className="px-4 py-3 whitespace-nowrap">
                <Skeleton className="h-8 w-32 rounded-lg" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MergedTutorCoursesTable() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch both course types in parallel
        const [liveRes, selfRes] = await Promise.all([
          fetch(`${baseUrl}instructor/my-courses?type=2`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${baseUrl}instructor/my-courses?type=1`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!liveRes.ok || !selfRes.ok) {
          throw new Error("Failed to fetch courses");
        }

        const liveData = await liveRes.json();
        const selfData = await selfRes.json();

        // Process live courses
        const liveCourses = (liveData.data || []).map((course: any) => ({
          ...course,
          type: "Live",
          lessons: undefined,
          lectures: undefined,
        }));

        // Process self learning courses
        const selfCourses = (selfData.data || []).map((course: any) => ({
          ...course,
          type: "Self Learning",
          resources: undefined,
          average_rating: undefined,
        }));

        // Combine and set courses
        setCourses([...liveCourses, ...selfCourses]);
        setLoading(false);
      } catch (err) {
        setError("Something went wrong while loading courses.");
        console.error("Error loading courses:", err);
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  if (loading) return <TableSkeleton />;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (courses.length === 0)
    return (
      <div className="p-4 text-center text-gray-500">No courses found</div>
    );

  return (
    <div className="overflow-x-auto border-0">
      <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
        <thead className="text-left text-muted-foreground">
          <tr>
            {[
              "Type",
              "Course Name",
              "Price",
              "Enrolled",
              "Details",
              "Action",
            ].map((header) => (
              <th
                key={header}
                className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
              >
                <div className="flex items-center gap-1">
                  {header}
                  {!["Action"].includes(header) && (
                    <ArrowDown size={14} className="text-gray-400" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const price =
              course.price === 0
                ? "Free"
                : `Rs. ${course.price.toLocaleString()}`;

            const rating = course.average_rating
              ? Math.round(parseFloat(course.average_rating))
              : 0;

            return (
              <tr
                key={`${course.id}-${course.type}`}
                className="bg-white border-b border-gray-200"
              >
                {/* Type Column */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      course.type === "Live"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    )}
                  >
                    {course.type}
                  </span>
                </td>

                {/* Course Name Column */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-3 items-center">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-14 h-10 rounded object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/150/CCCCCC/FFFFFF?text=NoImage";
                      }}
                    />
                    <div>
                      <Link
                        to="/tutor/mycourses/$slug"
                        params={{ slug: course.slug }}
                        className="block text-blue-600 hover:underline cursor-pointer whitespace-nowrap"
                      >
                        {course.title}
                      </Link>
                      {course.type === "Self Learning" && (
                        <div className="text-sm text-gray-500 mt-1 whitespace-nowrap">
                          {course.lessons} lessons | {course.lectures} lectures
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Price Column */}
                <td className="px-4 py-3 whitespace-nowrap min-w-[8rem]">
                  {price}
                </td>

                {/* Enrolled Column */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {course.enrolled}
                </td>

                {/* Details Column */}
                <td className="px-4 py-3 whitespace-nowrap min-w-[12rem]">
                  {course.type === "Live" ? (
                    <div className="space-y-1">
                      <div>Resources: {course.resources}</div>
                      <div className="flex items-center gap-0.5 mt-1">
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
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div>Lessons: {course.lessons}</div>
                      <div>Lectures: {course.lectures}</div>
                    </div>
                  )}
                </td>

                {/* Action Column */}
                <td className="px-4 py-3 whitespace-nowrap min-w-[12rem]">
                  {course.type === "Live" && (
                    <Link
                      to="/tutor/mycourses/$slug"
                      params={{ slug: course.slug }}
                      className="px-4 py-2 rounded-lg text-white font-medium whitespace-nowrap bg-[#013370]"
                    >
                      View Resources
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
