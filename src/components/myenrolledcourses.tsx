"use client";
import { baseUrl } from "@/config/authConfig"; // Import the authKey from the config file
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/api/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

type CourseAPIResponse = {
  id: number;
  courseID: number;
  courseName: string;
  courseSlug: string;
  courseProgress: number;
  TotalLessons: number;
  TotalLessonsLectures: number;
};

const MyEnrolledCoursesSkeleton = () => {
  return (
    <section className="bg-white text-xs">
      <div className="overflow-x-auto">
        {/* Added min-w-max to the table */}
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full border-collapse text-xs min-w-max">
            <thead className="text-left text-muted-foreground sticky top-0 bg-white z-10">
              <tr>
                <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    Course Name
                    <ArrowDown className="size-3 text-gray-400" />
                  </div>
                </th>
                <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                  Progress
                </th>
                <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((_, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  {/* Added whitespace-nowrap to td */}
                  <td className="px-3 py-2 align-top whitespace-nowrap">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </td>
                  {/* Added whitespace-nowrap to td */}
                  <td className="px-3 py-2 w-48 align-top whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Skeleton className="flex-1 h-2" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  </td>
                  {/* Already has whitespace-nowrap */}
                  <td className="px-3 py-2 align-top whitespace-nowrap">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

const MyEnrolledCourses = () => {
  const [courses, setCourses] = useState<CourseAPIResponse[] | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `${baseUrl}student/latestEnrolledCourses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        setCourses(data);
      } catch (err) {
        console.error("API Error:", err);
        setCourses([]);
      }
    };

    fetchCourses();
  }, []);

  const getStatus = (progress: number) => {
    if (progress === 0) return "Not Started";
    if (progress === 100) return "Completed";
    return "In Progress";
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "In Progress":
        return "text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"; // Ensure status text doesn't wrap
      case "Completed":
        return "text-green-600 bg-green-100 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"; // Ensure status text doesn't wrap
      case "Not Started":
        return "text-gray-800 bg-gray-200 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"; // Ensure status text doesn't wrap
      default:
        return "";
    }
  };

  if (courses === null) return <MyEnrolledCoursesSkeleton />;

  if (courses.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        You have no Enrolled Courses
      </div>
    );
  }

  return (
    <section className="bg-white text-xs">
      <div className="overflow-x-auto">
        {/* Added min-w-max to the table */}
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full border-collapse text-xs min-w-max">
            <thead className="text-left text-muted-foreground sticky top-0 bg-white z-10">
              <tr>
                <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    Course Name
                    <ArrowDown className="size-3 text-gray-400" />
                  </div>
                </th>
                <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                  Progress
                </th>
                <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {courses &&
                courses.map((course, idx) => {
                  const status = getStatus(course.courseProgress);
                  return (
                    <tr key={idx} className="border-b border-gray-100">
                      {/* Added whitespace-nowrap to td and nested elements */}
                      <td className="px-3 py-2 align-top whitespace-nowrap">
                        <Link
                          to="/mycourses/$slug"
                          params={{ slug: course.courseSlug }}
                          className="font-medium text-[#013370] hover:underline block whitespace-nowrap" // Added whitespace-nowrap
                        >
                          {course.courseName}
                        </Link>
                        <div className="text-gray-500 mt-0.5 whitespace-nowrap">
                          {" "}
                          {/* Added whitespace-nowrap */}
                          {course.TotalLessons > 0 && 
                            <span>{course.TotalLessons} lessons |{" "}</span>
                          }
                          {course.TotalLessonsLectures > 0 && 
                            <span>{course.TotalLessonsLectures} lectures</span>
                          }
                        </div>
                      </td>
                      {/* Added whitespace-nowrap to td */}
                      <td className="px-3 py-2 w-48 align-top whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={course.courseProgress}
                            className="flex-1 h-2"
                          />
                          <span className="min-w-[2rem] whitespace-nowrap">
                            {" "}
                            {/* Added whitespace-nowrap */}
                            {course.courseProgress}%
                          </span>
                        </div>
                      </td>
                      {/* Already has whitespace-nowrap, but ensure getStatusClasses also applies it */}
                      <td className="px-3 py-3 align-top whitespace-nowrap">
                        <span className={getStatusClasses(status)}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default MyEnrolledCourses;
