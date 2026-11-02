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

export default function LatestResources() {
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetch(`${baseUrl}instructor/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setResources(data.latest_resources || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch latest resources", err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return <div className="text-gray-500 px-4">Loading resources...</div>;
  }

  if (resources.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No resources available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-[16rem] overflow-y-auto">
      <div className="overflow-y-auto">
        {resources.map((resource) => (
          <div
            key={resource.lecture_id}
            className="flex items-center justify-between py-2 px-4 border-b border-gray-200"
          >
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
    </div>
  );
}
