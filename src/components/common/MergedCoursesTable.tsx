import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";

// Unified course interface
interface Course {
  courseID: number;
  courseName: string;
  courseSlug: string;
  courseType: string;
  courseImage?: string; // Optional for self-learning
  totalLessons?: number;
  lecturesRemaining?: number;
  resources?: number;
  rating?: string;
  coursePrice: string;
  progress?: string;
  validity?: number;
  type: "Live" | "Self Learning"; // New type field
}

// Status classes for self-learning courses
const getStatusClasses = (status: string): string => {
  switch (status) {
    case "In Progress":
      return "text-blue-800 bg-blue-100";
    case "Completed":
      return "text-green-600 bg-green-100";
    case "Not Started":
      return "text-gray-800 bg-gray-200";
    default:
      return "text-gray-800 bg-gray-200";
  }
};

// Skeleton component
function TableSkeleton() {
  return (
    <div className="overflow-x-auto border-0">
      <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
        <thead className="text-left text-muted-foreground">
          <tr>
            {["Type", "Course Name", "Price", "Metrics"].map((header) => (
              <th
                key={header}
                className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
              >
                <div className="flex items-center gap-1">
                  {header}
                  {header !== "Metrics" && (
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
              {/* Type Column Skeleton */}
              <td className="px-4 py-3 whitespace-nowrap">
                <Skeleton className="h-6 w-24 rounded-full" />
              </td>

              {/* Course Name Column Skeleton */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex gap-3 items-center">
                  <Skeleton className="w-14 h-10 rounded flex-shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </td>

              {/* Price Column Skeleton */}
              <td className="px-4 py-3 whitespace-nowrap">
                <Skeleton className="h-4 w-12" />
              </td>

              {/* Metrics Column Skeleton */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MergedCoursesTable() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${baseUrl}student/my-learning`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch courses");

        const data = await response.json();

        // Process Live Courses (from on_going)
        const liveCourses = data.on_going
          .filter((course: any) => course.courseType === "Live")
          .map((course: any) => ({
            ...course,
            type: "Live",
          }));

        // Process Self Learning Courses (from on_going + completed)
        const selfLearningMap = new Map();
        [...data.on_going, ...data.completed]
          .filter((course: any) => course.courseType === "General")
          .forEach((course: any) => {
            if (!selfLearningMap.has(course.courseSlug)) {
              selfLearningMap.set(course.courseSlug, {
                ...course,
                type: "Self Learning",
              });
            }
          });

        const selfLearningCourses = Array.from(selfLearningMap.values());

        // Combine and set courses
        setCourses([...liveCourses, ...selfLearningCourses]);
        setLoading(false);
      } catch (err) {
        setError("Error loading courses");
        console.error("Error loading courses:", err);
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  if (loading) return <TableSkeleton />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="overflow-x-auto border-0">
      <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
        <thead className="text-left text-muted-foreground">
          <tr>
            {["Type", "Course Name", "Price", "Metrics"].map((header) => (
              <th
                key={header}
                className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
              >
                <div className="flex items-center gap-1">
                  {header}
                  {header !== "Metrics" && (
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
              parseFloat(course.coursePrice) === 0
                ? "Free"
                : `Rs. ${Number(course.coursePrice).toLocaleString()}`;

            return (
              <tr
                key={`${course.courseID}-${course.type}`}
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
                    {course.type === "Live" && course.courseImage ? (
                      <img
                        src={course.courseImage}
                        alt={course.courseName}
                        className="w-14 h-10 rounded object-cover flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />
                    ) : (
                      <div className="w-14 h-10 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                        <span className="text-xs text-gray-500">SL</span>
                      </div>
                    )}
                    <div>
                      <Link
                        to="/mycourses/$slug"
                        params={{ slug: course.courseSlug }}
                        className="block text-blue-600 hover:underline cursor-pointer whitespace-nowrap"
                      >
                        {course.courseName}
                      </Link>
                      {course.type === "Self Learning" && (
                        <div className="text-sm text-gray-500 mt-1">
                          {course.totalLessons} lessons |{" "}
                          {course.lecturesRemaining} lectures
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Price Column */}
                <td className="px-4 py-3 whitespace-nowrap">{price}</td>

                {/* Metrics Column */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {course.type === "Live" ? (
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={cn("text-yellow-400", {
                            "text-gray-300":
                              i >= Math.round(parseFloat(course.rating || "0")),
                          })}
                          fill={
                            i < Math.round(parseFloat(course.rating || "0"))
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={parseFloat(course.progress || "0")}
                          className="flex-1 h-2"
                        />
                        <span className="text-xs font-medium text-muted-foreground min-w-[2rem]">
                          {course.progress}%
                        </span>
                      </div>
                      {course.progress && (
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium inline-block",
                            getStatusClasses(
                              parseFloat(course.progress) === 100
                                ? "Completed"
                                : parseFloat(course.progress) === 0
                                  ? "Not Started"
                                  : "In Progress"
                            )
                          )}
                        >
                          {parseFloat(course.progress) === 100
                            ? "Completed"
                            : parseFloat(course.progress) === 0
                              ? "Not Started"
                              : "In Progress"}
                        </span>
                      )}
                    </div>
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
