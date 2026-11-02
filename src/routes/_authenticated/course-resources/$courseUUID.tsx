import {
  createFileRoute,
  useNavigate,
  useParams,
  Link,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, Eye } from "lucide-react";
import { CiCircleChevLeft } from "react-icons/ci";
import { baseUrl } from "@/config/authConfig"; // Auth token
import { useAuth } from "@/api/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  category_id: number;
  category_name: string;
  course_id: number;
  course_uuid: string;
}

export const Route = createFileRoute("/_authenticated/course-resources/$courseUUID")({
  component: CourseResourceCategoryPage,
});

function CourseResourceCategoryPage() {
  const navigate = useNavigate();
  const { courseUUID } = useParams({ strict: false }) as { courseUUID: string };
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${baseUrl}student/resources/${courseUUID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        setCategories(data.resources || []);
      } catch (err) {
        setError("Error loading categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [courseUUID]);

  if (loading) return (
    <div className="space-y-6 container mx-auto">
      {/* Back Button + Heading Skeleton */}
      <div className="flex items-center mt-4 gap-2">
        <Skeleton className="h-7 w-7 rounded-full ml-4" />
        <Skeleton className="h-8 w-64" />
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto border-0">
        <div className="w-full text-sm bg-white border-collapse rounded-lg">
          {/* Table Header Skeleton */}
          <div className="flex border-b border-gray-200">
            <div className="px-4 py-2 w-20">
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="px-4 py-2 flex-1">
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="px-4 py-2 w-20">
              <Skeleton className="h-4 w-12" />
            </div>
          </div>

          {/* Table Rows Skeleton */}
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex border-b border-gray-200">
              <div className="px-4 py-3 w-20">
                <Skeleton className="h-4 w-8" />
              </div>
              <div className="px-4 py-3 flex-1">
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="px-4 py-3 w-20">
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-6 container mx-auto">
      {/* Back Button + Heading */}
      <div className="flex items-center mt-4 gap-2">
        <button
          onClick={() => navigate({ to: "/mycourses" })}
          className="bg-white text-black rounded-full ml-4"
        >
          <CiCircleChevLeft size={28} />
        </button>
        <h1 className="text-2xl font-bold">Course Resource Category</h1>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border-0">
        <table className="w-full text-sm bg-white border-collapse rounded-lg">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 border-b border-gray-200">Sr. #</th>
              <th className="px-4 py-2 border-b border-gray-200">
                <div className="flex items-center">
                  Category Name
                  <ArrowDown size={14} className="text-gray-400 ml-2" />
                </div>
              </th>
              <th className="px-4 py-2 border-b border-gray-200">Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr
                key={category.category_id}
                className="bg-white border-b border-gray-200"
              >
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">{category.category_name}</td>
                <td className="px-4 py-3">
                  <Link
                    to="/course-resources/$course_id/$category_id"
                    params={{
                      course_id: String(category.course_id),
                      category_id: String(category.category_id),
                    }}
                  >
                    <Eye size={20} className="text-[#013370]" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
