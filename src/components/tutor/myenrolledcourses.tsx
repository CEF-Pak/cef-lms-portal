"use client";
import { useEffect, useState } from "react";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown } from "lucide-react";

type CourseAPIResponse = {
  id: number;
  courseID: number;
  courseSlug: string;
  courseName: string;
  courseType: "Live" | "Self Learning";
  TotalResources?: number;
  TotalLessons?: number;
  TotalLessonsLectures?: number;
};

const MyEnrolledCoursesSkeleton = () => {
  return (
    <section className="bg-white text-xs">
      <div className="overflow-x-auto">
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full border-collapse text-xs">
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
                  <td className="px-3 py-2 align-top">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </td>
                  <td className="px-3 py-2 w-48 align-top">
                    <div className="flex items-center gap-2">
                      <Skeleton className="flex-1 h-2" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top">
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
  const [courses, setCourses] = useState<CourseAPIResponse[]>([]);
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}instructor/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        setCourses(data.latest_enrolled_courses || []);
        setLoading(false);
      } catch (err) {
        console.error("API Error:", err);
        setCourses([]);
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  if (loading) return <MyEnrolledCoursesSkeleton />;

  if (courses.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        You have no Courses
      </div>
    );
  }

  return (
    <section className="bg-white text-xs">
      <div className="overflow-x-auto">
        <div className="max-h-64 overflow-y-auto">
          <table className="table-auto w-full border-collapse text-xs">
            <thead className="text-left text-muted-foreground sticky top-0 bg-white z-10">
              <tr>
                <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                  Course Name
                </th>
                <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const isLive = course.courseType === "Live";
                const isSelfLearning = course.courseType === "Self Learning";
                return (
                  <tr
                    key={course.courseID}
                    className="border-b border-gray-100"
                  >
                    <td className="px-3 py-2 align-top">
                      <a
                        href={`/tutor/mycourses/${course.courseSlug}`}
                        className="text-[#013370] hover:underline font-medium block"
                      >
                        {course.courseName}
                      </a>

                      {isLive && course.TotalResources !== undefined && (
                        <div className="text-gray-500 mt-0.5">
                           {course.TotalResources && course.TotalResources > 0 && 
                            <span>{course.TotalResources} Resources |{" "}</span>
                          }
                        </div>
                      )}

                      {isSelfLearning && (
                        <div className="text-gray-500 mt-0.5">
                          {course.TotalLessons && course.TotalLessons > 0 && 
                            <span>{course.TotalLessons} lessons |{" "}</span>
                          }
                          {course.TotalLessonsLectures && course.TotalLessonsLectures > 0 && 
                            <span>{course.TotalLessonsLectures} lectures</span>
                          }
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top" style={{ minWidth: "8rem" }}>
                      <a
                        href={`/tutor/mycourses/${course.courseSlug}`}
                        className="inline-block bg-[#013370] text-white px-3 py-1 rounded text-xs hover:bg-[#013370d8]"
                      >
                        Go to Course
                      </a>
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
