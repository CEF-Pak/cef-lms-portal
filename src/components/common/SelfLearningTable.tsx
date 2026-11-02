import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";
import { Skeleton } from "@/components/ui/skeleton";

// Interface for API course data
interface Course {
  courseID: number;
  courseName: string;
  courseSlug: string;
  courseType: string;
  progress: string;
  totalLessons: number;
  lecturesRemaining: number;
  validity: number;
  coursePrice: string;
}

const getStatusClasses = (status: string): string => {
  switch (status) {
    case "In Progress":
      return "text-blue-800 bg-blue-100 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"; // Added whitespace-nowrap
    case "Completed":
      return "text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"; // Added whitespace-nowrap
    case "Not Started":
      return "text-gray-800 bg-gray-200 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"; // Added whitespace-nowrap
    default:
      return "";
  }
};

const SkeletonTable = () => {
  return (
    <div className="overflow-x-auto border-0">
      {/* Added min-w-max to the table */}
      <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
        <thead className="text-left text-muted-foreground">
          <tr>
            {/* Headers already have whitespace-nowrap */}
            {["Course Name", "Price", "Order ID", "Validity"].map((header) => (
              <th
                key={header}
                className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
              >
                <div className="flex items-center gap-1">
                  {header}
                  <ArrowDown className="size-4 text-gray-400" />
                </div>
              </th>
            ))}
            <th className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">
              Progress
            </th>{" "}
            {/* Added whitespace-nowrap */}
            <th className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">
              Status
            </th>{" "}
            {/* Added whitespace-nowrap */}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((index) => (
            <tr key={index} className="bg-white border-b border-gray-200">
              <td className="px-4 py-3 whitespace-nowrap">
                {" "}
                {/* Added whitespace-nowrap */}
                <div>
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {" "}
                {/* Added whitespace-nowrap */}
                <Skeleton className="h-5 w-20" />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {" "}
                {/* Added whitespace-nowrap */}
                <Skeleton className="h-5 w-16" />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {" "}
                {/* Added whitespace-nowrap */}
                <Skeleton className="h-5 w-24" />
              </td>
              <td className="px-4 py-3 w-56 whitespace-nowrap">
                {" "}
                {/* Added whitespace-nowrap */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 flex-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {" "}
                {/* Added whitespace-nowrap */}
                <Skeleton className="h-6 w-24 rounded-full" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function SelfLearningTable() {
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

        // Combine ongoing and completed courses
        const allCourses = [...data.on_going, ...data.completed];

        // Filter for "General" type and deduplicate by courseSlug
        const generalCourses = allCourses
          .filter((course: Course) => course.courseType === "General")
          .reduce((acc: Course[], course: Course) => {
            if (!acc.some((c) => c.courseSlug === course.courseSlug)) {
              acc.push(course);
            }
            return acc;
          }, []);

        setCourses(generalCourses);
        setLoading(false);
      } catch (err) {
        setError("Error loading courses");
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return <SkeletonTable />;
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
            {/* Headers already have whitespace-nowrap */}
            {["Course Name", "Price", "Order ID", "Validity"].map((header) => (
              <th
                key={header}
                className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
              >
                <div className="flex items-center gap-1">
                  {header}
                  <ArrowDown className="size-4 text-gray-400" />
                </div>
              </th>
            ))}
            <th className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">
              Progress
            </th>{" "}
            {/* Added whitespace-nowrap */}
            <th className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">
              Status
            </th>{" "}
            {/* Added whitespace-nowrap */}
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const progress = parseFloat(course.progress);
            const status =
              progress === 100
                ? "Completed"
                : progress === 0
                  ? "Not Started"
                  : "In Progress";
            const validity =
              course.validity === 0 ? "Lifetime" : `${course.validity} days`;

            return (
              <tr
                key={course.courseSlug}
                className="bg-white border-b border-gray-200"
              >
                {/* Ensure content in td's don't wrap if you want them to contribute to horizontal scroll */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {" "}
                  {/* Added whitespace-nowrap */}
                  <div>
                    <Link
                      to="/mycourses/$slug"
                      params={{ slug: course.courseSlug }}
                      className="text-blue-600 hover:underline block" // Added block to make link fill div
                    >
                      {course.courseName}
                    </Link>
                  </div>
                  {/* Conditionally render lesson/lecture info if available */}
                  {(course.totalLessons > 0 ||
                    course.lecturesRemaining > 0) && (
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      {course.totalLessons} lessons | {course.lecturesRemaining}{" "}
                      lectures
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {" "}
                  {/* Added whitespace-nowrap */}
                  {parseFloat(course.coursePrice) === 0
                    ? "Free"
                    : `Rs. ${course.coursePrice}`}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {course.courseID}
                </td>{" "}
                {/* Added whitespace-nowrap */}
                <td className="px-4 py-3 whitespace-nowrap">{validity}</td>{" "}
                {/* Added whitespace-nowrap */}
                <td className="px-4 py-3 w-56 whitespace-nowrap">
                  {" "}
                  {/* Added whitespace-nowrap */}
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="flex-1" />
                    <span className="text-xs font-medium text-muted-foreground min-w-[2rem]">
                      {progress}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {" "}
                  {/* Added whitespace-nowrap */}
                  <span className={getStatusClasses(status)}>{status}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
