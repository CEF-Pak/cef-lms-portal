import { createFileRoute, useParams } from "@tanstack/react-router";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";
import { useEffect, useState } from "react";

export const Route = createFileRoute(
  "/_authenticated/course-resources/$course_id/$category_id"
)({
  component: ResourceMessageOnly,
});

type Resource = {
  file_url: string;
  resource_ext: string;
  resource_id: number;
  resource_name: string;
  resource_path: string;
  resource_type: string;
};

function ResourceSkeleton() {
  return (
    <div className="container mx-auto">
      <div className="flex gap-6 w-full">
        <div className="w-[70%] bg-white mt-4 p-4 rounded-lg">
          <div className="w-full h-[30rem] bg-gray-200 animate-pulse rounded-lg" />
        </div>

        <div className="w-[25%] bg-white mt-4 p-4 rounded-lg">
          <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4" />
          <div className="space-y-4 pl-2">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-full">
                  <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceMessageOnly() {
  const { course_id, category_id } = useParams({ from: "/_authenticated/course-resources/$course_id/$category_id" });
  const { token } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [resourceType, setResourceType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${baseUrl}student/courses/${course_id}/categories/${category_id}/resources`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch resources");
        }

        const json = await res.json();
        setResources(json.data);
        setSelectedResource(json.data[0].file_url);
        setResourceType(json.data[0].resource_type);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResources();
  }, [course_id, category_id, token]);

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource.file_url);
    setResourceType(resource.resource_type);
  }

  const toggleFullscreen = (containerId: string) => {
    try {
      const container = document.getElementById(containerId);
      if (!container) return;

      if (!document.fullscreenElement) {
        container.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  if (isLoading) {
    return <ResourceSkeleton />;
  }

  return (
    <div className="container mx-auto">
      <div className="flex gap-6 w-full">
        <div className="w-[70%] bg-white mt-4 p-4 rounded-lg">
          {selectedResource && resourceType === "Youtube" && (
            <iframe
              src={selectedResource}
              className="w-full h-[30rem] mb-12 rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          {selectedResource && resourceType === "PDF" && (
            <div
              id="pdf-container"
              className="w-full h-[38rem] bg-gray-100 rounded-lg flex items-center justify-center relative"
            >
              <object
                data={selectedResource}
                type="application/pdf"
                className="w-full h-full rounded-lg"
              >
                <p>Your browser does not support PDFs. Please download the PDF to view it.</p>
              </object>
              <button
                onClick={() => toggleFullscreen("pdf-container")}
                className="cursor-pointer absolute bottom-1 right-5 bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition-colors"
                title="Toggle fullscreen"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              </button>
            </div>
          )}
          {selectedResource && resourceType === "Video" && (
            <video
              controls
              src={selectedResource}
              className="w-full h-[30rem] mb-12 bg-black rounded-lg object-cover"
            />
          )}
          {selectedResource && resourceType === "Image" && (
            <div
              id="image-container"
              className="w-full h-[30rem] mb-12 bg-gray-100 rounded-lg flex items-center justify-center relative"
            >
              <img
                src={selectedResource}
                alt="Resource"
                className="w-full h-[30rem] object-contain rounded-lg"
              />

              <button
                onClick={() => toggleFullscreen("image-container")}
                className="cursor-pointer absolute bottom-4 right-4 bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition-colors"
                title="Toggle fullscreen"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              </button>
            </div>
          )}
          {selectedResource && resourceType === "Audio" && (
            <audio
              controls
              src={selectedResource}
              className="w-[50%] mb-12  mt-4"
            />
          )}
          {selectedResource && resourceType === "Text" && (
            <div className="w-full max-h-[38rem] overflow-y-auto mb-12 aspect-auto object-contain rounded-lg">
              <p className="text-sm">
                {selectedResource}
              </p>
            </div>
          )}
          {selectedResource && resourceType === "Slide Document" && (
            <div className="w-full h-[38rem] p-4 bg-gray-100 rounded-lg flex items-center justify-center relative">
              <iframe
                src={selectedResource}
                title={selectedResource}
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="w-[25%] bg-white mt-4 p-4 rounded-lg max-h-screen overflow-y-auto top-4">
          <h3 className="text-lg font-semibold border-b border-gray-400 mb-4">
            Course Resources
          </h3>
          <div className="space-y-4 pl-2">
            {resources && resources.length > 0 && resources.map((resource) => (
              <div
                key={resource.resource_id}
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => handleResourceClick(resource)}
              >
                <div>
                  <p className="text-sm font-medium">
                    {resource.resource_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {resource.resource_type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
