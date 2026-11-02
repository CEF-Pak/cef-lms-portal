import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  id: number;
  uuid: string;
  slug: string;
  title: string;
  type: string;
  image: string;
  lessons: number;
  lectures: number;
  price: number;
  enrolled: number;
}

const SkeletonTable = () => {
  return (
    <div className="overflow-x-auto border-0">
      <table className="w-full text-sm bg-white border-collapse rounded-lg">
        <thead className="text-left text-muted-foreground">
          <tr>
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
            <th className="px-4 py-2 border-b border-gray-200">Progress</th>
            <th className="px-4 py-2 border-b border-gray-200">Status</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((index) => (
            <tr key={index} className="bg-white border-b border-gray-200">
              <td className="px-4 py-3">
                <div>
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-5 w-20" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-5 w-16" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-5 w-24" />
              </td>
              <td className="px-4 py-3 w-56">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 flex-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-6 w-24 rounded-full" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function SelfLearningTutor() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${baseUrl}instructor/my-courses?type=1`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch Self Learning courses");
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
    return <SkeletonTable />;
  }
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (courses.length === 0)
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No Self Learning courses found.
      </div>
    );

  return (
    <div className="overflow-x-auto border-0">
      <table className="w-full text-sm table-auto bg-white border-collapse rounded-lg">
        <thead className="text-left text-muted-foreground">
          <tr>
            {["Course Name", "Price"].map((header) => (
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
            <th className="px-4 py-2 border-b border-gray-200">Enrolled</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.uuid} className="bg-white border-b border-gray-200">
              <td className="px-4 py-3" style={{ minWidth: "12rem" }}>
              <div className="flex flex-col lg:flex-row gap-3 items-center">
              <img
                    src={course.image}
                    alt={course.title}
                    className="w-24 h-auto rounded object-cover flex-shrink-0 lg:w-14 lg:h-10"
                    />

                  <div>
                    <Link
                      to="/tutor/mycourses/$slug"
                      params={{ slug: course.slug }}
                      className="block text-blue-600 hover:underline cursor-pointer"
                      >
                      {course.title}
                    </Link>
                    <div className="text-sm text-gray-500 mt-2">
                      {course.lessons} lessons | {course.lectures} lectures
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3" style={{ minWidth: "8rem" }}>
                {parseFloat(course.price.toString()) === 0
                  ? "Free"
                  : `Rs. ${Number(course.price).toLocaleString()}`}
              </td>
              <td className="px-4 py-3">{course.enrolled}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
