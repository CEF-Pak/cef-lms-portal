import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDown, Eye } from "lucide-react";
import { CiCircleChevLeft } from "react-icons/ci"; // ← NEW: Back icon

const categories = [
  { id: "category-1", name: "Lesson 1" },
  { id: "category-2", name: "Lesson 2" },
  { id: "category-3", name: "Lesson 3" },
  { id: "category-4", name: "Lesson 4" },
];

export const Route = createFileRoute("/_authenticated/resourcecategory")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 container mx-auto">
      {/* Heading with new back icon */}
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
              <th className="px-4 py-2 whitespace-nowrap border-b border-gray-200">
                Sr. #
              </th>
              <th className="px-4 py-2 whitespace-nowrap border-b border-gray-200">
                <div className="flex items-center">
                  Category Name
                  <ArrowDown size={14} className="text-gray-400 ml-2" />
                </div>
              </th>
              <th className="px-4 py-2 whitespace-nowrap border-b border-gray-200">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr
                key={category.id}
                className="bg-white border-b border-gray-200"
              >
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">{category.name}</td>
                <td className="px-4 py-3">
                  <button>
                    <Eye size={20} className="text-[#013370]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
