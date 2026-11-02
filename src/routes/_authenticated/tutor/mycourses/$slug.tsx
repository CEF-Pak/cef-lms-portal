import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CiCircleChevLeft } from "react-icons/ci";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// import OverviewTab from "@/components/tutor/overviewtab";
import NoticeTab from "@/components/tutor/noticetab";
import ReviewsTab from "@/components/tutor/reviewstab";
import axios from "axios";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";
import CourseDetailSkeleton from "@/components/common/CourseDetailSkeleton";

type Resource = {
  sr_no: number;
  name: string;
  type: string;
  preview_src: string;
};

type ContentSection = {
  sr_no: number;
  name: string;
  data: Resource[];
};

type CourseData = {
  course_id: number;
  course_title: string;
  course_type: "Live" | "General";
  resources: number;
  lessons?: number; // For General courses
  lectures?: number; // For General courses
  featured_image_or_video: string;
  featured_image_or_video_type: number;
  course_content: ContentSection[];
  overview_tab: {
    keyPoints: string[];
    description: string;
  };
  notice_tab: {
    notice_id: number;
    created_at: string;
    notice_topic: string;
    notice_details: string;
  }[];
  review_tab: {
    total_reviews: number;
    five_star_percentage: number;
    four_star_percentage: number;
    three_star_percentage: number;
    two_star_percentage: number;
    first_star_percentage: number;
    user_reviews: {
      user_id: number;
      user_name: string;
      user_image: string;
      review: string;
      rating: number;
      submission_at: string;
    }[];
  };
};

export const Route = createFileRoute("/_authenticated/tutor/mycourses/$slug")({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { slug } = useParams({ from: "/_authenticated/tutor/mycourses/$slug" });
  const [activeTab, setActiveTab] = useState("overview");
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [featureType, setFeatureType] = useState<number | string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchCourseData = async () => {
    try {
      const res = await axios.get(`${baseUrl}instructor/my-course/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourseData(res.data);
      setVideoUrl(res.data.featured_image_or_video);
      setFeatureType(res.data.featured_image_or_video_type);
    } catch (err) {
      console.error("Error fetching course content:", err);
    }
  };

  // Fetch course details
  useEffect(() => {
    fetchCourseData();
  }, [slug, token]);

  const checkLessonStartTime = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Accept-Language", "en");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      `${baseUrl}instructor/checkLessonStartTimeLiveClass`,
      requestOptions as RequestInit
    )
      .then((response) => response.json())
      .then((result) => {
        if (result.id) {
          fetchCourseData();
        }
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    if (!courseData || !token) return;

    const intervalId = setInterval(() => {
      checkLessonStartTime();
    }, 60000); // 60000 ms = 1 minute

    checkLessonStartTime();

    return () => clearInterval(intervalId);
  }, [courseData, token]);

  // Handle resource click to display in main content
  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
  };

  useEffect(() => {
    if (featureType === "Youtube" || (featureType === 2 && videoUrl)) {
      // eslint-disable-next-line no-useless-escape
      const youtubeRegex =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/s]{11})/;
      const match = videoUrl?.match(youtubeRegex);

      if (match) {
        const videoId = match[1];
        setVideoUrl(`https://www.youtube.com/embed/${videoId}`);
      }
    }
  }, [videoUrl, featureType]);

  const tabs = [
    // { id: "overview", label: "Overview" },
    { id: "notice", label: "Notice" },
    { id: "reviews", label: "Reviews" },
  ];

  if (!courseData) return <CourseDetailSkeleton />;

  return (
    <div className="flex flex-col lg:flex-row gap-6 pl-6 pr-4">
      {/* Left Column - Main Content */}
      <div className="w-full lg:w-[70%] bg-white mt-4 p-4 rounded-lg">
        {/* Back + Title */}
        <div className="flex items-center pt-2 gap-2 mb-4">
          <Link to="/tutor/mycourses" className="text-black rounded-full">
            <CiCircleChevLeft size={30} />
          </Link>
          <h2 className="text-xl font-semibold">Course Details</h2>
        </div>
        <div className="sticky top-0 z-10 bg-white w-full pb-4 md:static">
          {/* Resource Display or Featured Image/Video */}
          {selectedResource ? (
            <div className="w-full h-auto rounded-lg mb-4">
              {selectedResource.type === "Image" && (
                <img
                  src={selectedResource.preview_src}
                  alt={selectedResource.name}
                  className="w-full min-h-[14rem] lg:h-[30rem] mb-12 object-contain rounded-lg"
                />
              )}
              {selectedResource.type === "Video" && (
                <video
                  controls
                  src={selectedResource.preview_src}
                  className="w-full min-h-[14rem] lg:min-h-[30rem] aspect-video mb-12 bg-black rounded-lg object-cover"
                />
              )}
              {selectedResource.type === "Audio" && (
                <audio
                  controls
                  src={selectedResource.preview_src}
                  className="w-[50%] mb-12 mt-4"
                />
              )}
              {selectedResource.type === "Text" && (
                <div className="w-full max-h-[38rem] overflow-y-auto mb-12 aspect-auto object-contain rounded-lg">
                  <p className="text-sm">{selectedResource.preview_src}</p>
                </div>
              )}
              {selectedResource.type === "Youtube" && (
                <iframe
                  src={selectedResource.preview_src}
                  title={selectedResource.name}
                  className="w-full min-h-[14rem] lg:min-h-[30rem] aspect-video mb-12 rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              {selectedResource.type === "PDF" && (
                <div className="w-full min-h-[14rem] lg:h-[30rem] bg-gray-100 rounded-lg flex items-center justify-center relative">
                  <iframe
                    src={
                      selectedResource.preview_src
                        ? `${selectedResource.preview_src}#toolbar=0&navpanes=0&scrollbar=0`
                        : undefined
                    }
                    className="w-full h-full rounded-lg"
                  />
                  <button
                    onClick={() => {
                      const object = document.querySelector("iframe");
                      if (object) {
                        if (document.fullscreenElement) {
                          document.exitFullscreen();
                        } else {
                          object.requestFullscreen();
                        }
                      }
                    }}
                    className="cursor-pointer absolute bottom-4 right-4 bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition-colors"
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
              {selectedResource.type === "Slide Document" && (
                <div className="w-full min-h-[14rem] lg:h-[30rem] p-4 bg-gray-100 rounded-lg flex items-center justify-center relative">
                  <iframe
                    src={selectedResource.preview_src}
                    title={selectedResource.name}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          ) : courseData.featured_image_or_video_type === 3 ? (
            <img
              src={courseData.featured_image_or_video}
              alt={courseData.course_title}
              className="w-full min-h-[14rem] lg:h-[30rem] mb-12 rounded-lg object-contain"
            />
          ) : courseData.featured_image_or_video_type === 1 ? (
            <video
              controls
              src={courseData.featured_image_or_video}
              className="w-full min-h-[14rem] lg:min-h-[30rem] aspect-video mb-12 bg-black rounded-lg object-cover"
            />
          ) : (
            <iframe
              src={videoUrl || undefined}
              title={courseData.course_title}
              className="w-full min-h-[14rem] lg:min-h-[30rem] aspect-video mb-12 rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        {/* Course Title and Info */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{courseData.course_title}</h3>
          <p className="text-sm text-gray-500">
            {courseData.course_type === "General"
              ? `${courseData.lessons} Lessons | ${courseData.lectures} Lectures`
              : `${courseData.resources} Resources`}
          </p>
        </div>
        {/* Mobile-only course content section */}
        <div className="w-full mt-4 md:hidden">
          <div className="w-full bg-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold border-b border-gray-400 mb-4">
              {courseData.course_type === "General"
                ? "Course Details"
                : "Course Resources"}
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {courseData.course_content.map((section) => (
                <AccordionItem
                  key={section.sr_no}
                  value={`section-${section.sr_no}`}
                >
                  <AccordionTrigger>{section.name}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-2">
                      {section.data.map((resource) => (
                        <div
                          key={resource.sr_no}
                          className="flex items-start gap-3 cursor-pointer hover:bg-gray-100 p-1 rounded"
                          onClick={() => handleResourceClick(resource)}
                        >
                          <div className="mt-1">
                            <div className="w-4 h-4 border border-gray-400 rounded-full" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {resource.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {resource.type}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Custom Tabs */}
        <div>
          <div className="flex gap-6 mb-4 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 capitalize text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-[#013370] border-b-2 border-[#013370]"
                    : "text-gray-500 hover:text-[#013370]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* {activeTab === "overview" && (
              <OverviewTab data={courseData.overview_tab.description} />
            )} */}
            {activeTab === "notice" && (
              <NoticeTab data={courseData.notice_tab} />
            )}
            {activeTab === "reviews" && (
              <ReviewsTab data={courseData.review_tab} />
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Sidebar */}
      <div className="w-full lg:w-[25%] bg-white mt-4 p-4 rounded-lg lg:max-h-screen overflow-y-auto top-4 md:block hidden">
        <h3 className="text-lg font-semibold border-b border-gray-400 mb-4">
          {courseData.course_type === "General"
            ? "Course Details"
            : "Course Resources"}
        </h3>
        <Accordion type="single" collapsible className="w-full">
          {courseData.course_content.map((section) => (
            <AccordionItem
              key={section.sr_no}
              value={`section-${section.sr_no}`}
            >
              <AccordionTrigger>{section.name}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pl-2">
                  {section.data.map((resource) => (
                    <div
                      key={resource.sr_no}
                      className="flex items-start gap-3 cursor-pointer hover:bg-gray-100 p-1 rounded"
                      onClick={() => handleResourceClick(resource)}
                    >
                      <div className="mt-1">
                        <div className="w-4 h-4 border border-gray-400 rounded-full" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{resource.name}</p>
                        <p className="text-xs text-gray-500">{resource.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
