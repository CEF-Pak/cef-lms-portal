import { useEffect, useState } from "react";
import { FaEye, FaFilePdf, FaYoutube } from "react-icons/fa";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";

interface ResourceType {
  lecture_id: number;
  lecture_title: string;
  lecture_type: string;
  lecture_view: string;
}

const ResourceSkeleton = () => {
  return (
    <div className="flex items-center justify-between py-2 px-4 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
      </div>
      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
    </div>
  );
};

export default function LatestResources() {
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetch(`${baseUrl}student/latestResources`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setResources(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch latest resources", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 h-[16rem] overflow-y-auto">
        {[...Array(5)].map((_, index) => (
          <ResourceSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-[16rem] overflow-y-auto">
      {resources.length === 0 ? (
        <div className="text-gray-500 px-4">No resources available</div>
      ) : (
        <div className="overflow-y-auto">
          {resources && resources.map((resource, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 px-4 border-b border-gray-200"
            >
              {/* Icon depending on resource type */}
              <div className="flex items-center gap-2">
                {resource.lecture_type.toLowerCase().includes("slide") ? (
                  <FaFilePdf className="text-red-600" />
                ) : (
                  <FaYoutube className="text-red-600" />
                )}
                <span className="text-sm line-clamp-1">
                  {resource.lecture_title}
                </span>
              </div>

              {/* Eye icon opens the lecture_view link */}
              <a
                href={resource.lecture_view}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaEye className="text-[#013370] cursor-pointer hover:scale-105 transition-transform" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
