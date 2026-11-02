import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CiCircleChevLeft } from "react-icons/ci";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// import OverviewTab from "@/components/common/overviewtab";
import NoticeTab from "@/components/common/noticetab";
import StudentDiscussionTab from "@/components/common/StudentDiscussionTab";
import MyClassTab from "@/components/common/myclasstab";
import ReviewsTab from "@/components/common/reviewstab";
import Assignments from "@/components/common/Assignments";
import Quizzes from "@/components/common/Quizzes";
import CourseDetailSkeleton from "@/components/common/CourseDetailSkeleton";
import axios from "axios";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";
import AssignmentDetail from "@/components/assignmentdetail";
import QuizDetail from "@/components/quizdetail";

type Lecture = {
  lecture_no: number;
  lecture_id: number;
  lecture_title: string;
  lecture_type: string;
  resource_id: number;
  is_locked: string;
  onclick_api_url: string;
  onclick_api_name: string;
  assignment_id: number;
  quiz_id?: number;
  checkbox_icon_class_type: number;
  type: string;
  preview_src: string;
  name: string;
  sr_no: number;
  data: Lecture[];
};

type Lesson = {
  lesson_id: number;
  lesson_name: string;
  lesson_lectures: Lecture[];
};

type Notice = {
  notice_id: number;
  notice_details: string;
  notice_topic: string;
  created_at: string;
};

type Assignment = {
  action_btn_api_routes: {
    view_details_api_route: string;
  };
  assignment_id: number;
  assignment_topic: string;
  assignment_total_marks: number;
};

type AssignmentDetail = {
  assignment_id: number;
  assignment_topic: string;
  marks: number;
  your_submitted_file: string;
  your_submitted_file_name: string;
  assignment_file: string;
  assignment_file_name: string;
  assignment_description: string;
  result?: {
    obtained_marks: number;
  };
};

type Quiz = {
  quiz_id: number;
  quiz_name: string;
  quiz_type: string;
  quiz_uuid: string;
  time_duration: number;
  total_questions: number;
  status_number: number;
  status_text: string;
};

type Review = {
  average_rating: number;
  first_star_percentage: number;
  five_star_percentage: number;
  four_star_percentage: number;
  three_star_percentage: number;
  two_star_percentage: number;
  total_user_reviews: number;
  user_reviews: {
    comment: number;
    created_at: string;
    id: number;
    rating: number;
    user_id: number;
    user_image: string;
    user_name: string;
  }[];
};

type Discussion = {
  discussion_id: number;
  discussion_user_id: number;
  discussion_user_name: string;
  discussion_user_image: string;
  discussion_user_type: string;
  discussion_comment: string;
  discussion_created_at: string;
  discussion_total_replies: number;
  discussion_replies_list: {
    reply_id?: number;
    reply_user_id?: number;
    reply_user_name?: string;
    reply_user_image?: string;
    reply_comment?: string;
    reply_created_at?: string;
  }[];
};

type GeneralCourseData = {
  course_id: number;
  pageTitle: string;
  preview_src: string;
  course_content_tab: {
    course_content_list_section: Lesson[];
  };
  course_overview_tab: {
    description: string;
  };
  course_notice_tab: Notice[];
  course_assignment_tab: Assignment[];
  course_quiz_tab: Quiz[];
  course_discussion_tab: (
    | Discussion
    | {
        auth_user_images: {
          discussion_form_user_image: string;
          reply_form_user_image: string;
        };
      }
  )[];
  course_review_tab: Review[];
  course_liveclass_tab: LiveClass[];
};

type Category = {
  category_name: string;
  category_id: number;
  category_resources: Resource[];
  sr_no: number;
  name: string;
  data: Lecture[];
};

type Resource = {
  redirect_preview_src: string;
  resource_name: string;
  resource_no: number;
  resource_type: string;
};

type LiveClass = {
  current: [];
  past: [];
  upcoming: [];
};

type LiveCourseData = {
  course_id: number;
  pageTitle: string;
  preview_src: string;
  course_content_tab: {
    course_content_list_section: Category[];
  };
  course_overview_tab: {
    description: string;
  };
  course_notice_tab: Notice[];
  course_review_tab: Review[];
  course_discussion_tab: (
    | Discussion
    | {
        auth_user_images: {
          discussion_form_user_image: string;
          reply_form_user_image: string;
        };
      }
  )[];
  course_liveclass_tab: LiveClass[];
};

type QuizDetail = {
  lecture_id: number;
  quiz_id: number;
  quiz_uuid: string;
  course_uuid: string;
  question_uuid: string;
  take_exam_id: number;
  quiz_name: string;
  current_question_no: number;
  total_questions: number;
  quiz_attempt_progress: string;
  time_remaining: string;
  total_time: string;
  question: {
    question_id: number;
    question_uuid: string;
    question_name: string;
    question_options: {
      option_id: number;
      option_uuid: string;
      option_name: string;
    }[];
  };
  quiz_result?: {
    total_marks?: number;
    obtained_marks?: number;
    passing_marks?: number;
    is_passed?: boolean;
  };
};

export const Route = createFileRoute("/_authenticated/mycourses/$slug")({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { slug } = useParams({ from: "/_authenticated/mycourses/$slug" });
  const [activeTab, setActiveTab] = useState("overview");
  const [courseType, setCourseType] = useState<"General" | "Live" | null>(null);
  const [generalCourseData, setGeneralCourseData] =
    useState<GeneralCourseData | null>(null);
  const [liveCourseData, setLiveCourseData] = useState<LiveCourseData | null>(
    null
  );
  const { token } = useAuth();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [featureType, setFeatureType] = useState<number | string | null>(null);
  const [assignmentId, setAssignmentId] = useState<number | null>(null);
  const [assignmentDetail, setAssignmentDetail] =
    useState<AssignmentDetail | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizRetryCounter, setQuizRetryCounter] = useState(0);

  const [quizId, setQuizId] = useState<string | null>(null);
  const [currentLectureId, setCurrentLectureId] = useState<number>(0);

  const [quizDetail, setQuizDetail] = useState<QuizDetail | null>(null);

  const refreshReviews = async () => {
    if (!courseData?.course_id) return;

    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const response = await fetch(
        `${baseUrl}student/course/review-list/${courseData.course_id}`,
        {
          method: "GET",
          headers: myHeaders,
        }
      );

      const result = await response.json();

      // Update the course data with new reviews
      if (courseType === "General" && generalCourseData) {
        setGeneralCourseData({
          ...generalCourseData,
          course_review_tab: result,
        });
      } else if (courseType === "Live" && liveCourseData) {
        setLiveCourseData({
          ...liveCourseData,
          course_review_tab: result,
        });
      }
    } catch (error) {
      console.error("Error refreshing reviews:", error);
    }
  };

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

  useEffect(() => {
    if (quizId) {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const formdata = new FormData();
      formdata.append("quiz_uuid", quizId);
      formdata.append("lecture_id", currentLectureId.toString());

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow" as RequestRedirect,
      };

      fetch(`${baseUrl}student/course/start-quiz`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
          if (result.status == 200) {
            setQuizDetail(result.data);
            setAssignmentDetail(null);
            setFeatureType(null);
            setVideoUrl(null);
          }
        })
        .catch((error) => console.error(error));
    }
  }, [quizId, token]);

  useEffect(() => {
    if (assignmentId) {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const formdata = new FormData();
      formdata.append("assignment_id", assignmentId.toString());

      setShowResult(false);
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow" as RequestRedirect,
      };

      fetch(`${baseUrl}student/course/assignment-detail`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
          if (result.assignment_id) {
            setAssignmentDetail(result);
            setQuizDetail(null);
            setFeatureType(null);
            setVideoUrl(null);
          }
        })
        .catch((error) => console.error(error));
    }
  }, [assignmentId, token]);

  const fetchCourseData = async (fetchType: string) => {
    if (fetchType == "General") {
      try {
        const res = await axios.get(`${baseUrl}student/my-course/${slug}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Access-Control-Allow-Origin": "*",
          },
        });
        const data = res.data;

        setVideoUrl(data.featured_image_or_video);
        setFeatureType(data.featured_image_or_video_type);
        setGeneralCourseData({
          course_id: data.course_id,
          pageTitle: data.pageTitle,
          preview_src: data.featured_image_or_video,
          course_content_tab: data.course_content_tab,
          course_overview_tab: data.course_overview_tab,
          course_notice_tab: data.course_notice_tab,
          course_assignment_tab: data.course_assignment_tab,
          course_quiz_tab: data.course_quiz_tab,
          course_discussion_tab: data.course_discussion_tab,
          course_review_tab: data.course_review_tab,
          course_liveclass_tab: data.course_liveclass_tab,
        });
      } catch (err) {
        console.error("Error fetching course content:", err);
      }
    } else if (fetchType == "Live") {
      try {
        const res = await axios.get(`${baseUrl}student/my-course/${slug}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Access-Control-Allow-Origin": "*",
          },
        });
        const data = res.data;
        setVideoUrl(data.featured_image_or_video);
        setFeatureType(data.featured_image_or_video_type);
        setLiveCourseData({
          course_id: data.course_id,
          pageTitle: data.pageTitle,
          preview_src: data.featured_image_or_video,
          course_content_tab: data.course_content_tab,
          course_overview_tab: data.course_overview_tab,
          course_notice_tab: data.course_notice_tab,
          course_review_tab: data.course_review_tab,
          course_discussion_tab: data.course_discussion_tab || [],
          course_liveclass_tab: data.course_liveclass_tab,
        });
      } catch (err) {
        console.error("Error fetching course content:", err);
      }
    }
  };

  const fetchCourseType = async () => {
    try {
      const res = await axios.get(`${baseUrl}student/my-learning`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      const allCourses = [...data.on_going, ...data.completed];
      const currentCourse = allCourses.find((c) => c.courseSlug === slug);
      setCourseType(currentCourse?.courseType ?? null);
      if (currentCourse?.courseType) {
        fetchCourseData(currentCourse?.courseType);
      }
    } catch (err) {
      console.error("Error fetching course type:", err);
    }
  };

  useEffect(() => {
    fetchCourseType();
  }, [slug, token]);

  const handleLectureClick = async (lecture: Lecture) => {
    if (lecture.is_locked === "No") {
      try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);

        const formdata = new FormData();

        if (lecture.lecture_type == "Assignment") {
          setActiveTab("assignments");
          formdata.append("assignment_id", lecture.assignment_id.toString());

          const response = await fetch(
            `${baseUrl}student/course/assignment-detail`,
            {
              method: "POST",
              headers: myHeaders,
              body: formdata,
              redirect: "follow" as RequestRedirect,
            }
          );

          const result = await response.json();
          setAssignmentDetail(result);
          setQuizDetail(null);
          setFeatureType(null);
          setVideoUrl(null);
        } else if (lecture.lecture_type == "Quiz") {
          setActiveTab("quizzes");
          const matchingQuiz = generalCourseData?.course_quiz_tab?.find(
            (q: Quiz) => q.quiz_id === lecture.quiz_id
          );
          if (matchingQuiz && matchingQuiz.quiz_uuid) {
            // Force effect re-run
            setQuizId(null);
            setTimeout(() => {
              setQuizId(matchingQuiz.quiz_uuid);
              setCurrentLectureId(lecture.lecture_id);
            }, 0);
          }
        } else if (lecture.lecture_type == "Resource") {
          // Updated: Remove || "Quiz" from this condition
          formdata.append("lecture_id", lecture.lecture_id.toString());

          const response = await fetch(
            `${baseUrl}student/course/click-lecture`,
            {
              method: "POST",
              headers: myHeaders,
              body: formdata,
              redirect: "follow" as RequestRedirect,
            }
          );

          const result = await response.json();
          setFeatureType(result.data.lecture_resource_type);
          setVideoUrl(result.data.lecture_preview_src);
          setAssignmentDetail(null);
          setQuizDetail(null);
          try {
            const res = await axios.get(`${baseUrl}student/my-course/${slug}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Access-Control-Allow-Origin": "*",
              },
            });
            const data = res.data;
            setGeneralCourseData({
              course_id: data.course_id,
              pageTitle: data.pageTitle,
              preview_src: data.featured_image_or_video,
              course_content_tab: data.course_content_tab,
              course_overview_tab: data.course_overview_tab,
              course_notice_tab: data.course_notice_tab,
              course_assignment_tab: data.course_assignment_tab,
              course_quiz_tab: data.course_quiz_tab,
              course_discussion_tab: data.course_discussion_tab,
              course_review_tab: data.course_review_tab,
              course_liveclass_tab: data.course_liveclass_tab,
            });
          } catch (err) {
            console.error("Error fetching course content:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching lecture:", error);
      }
    }
  };

  const handleLiveLectureClick = async (lecture: Lecture) => {
    if (lecture) {
      setFeatureType(lecture.type);
      setVideoUrl(lecture.preview_src);
    }
  };

  useEffect(() => {
    if (featureType === "Youtube" || (featureType === 2 && videoUrl)) {
      const youtubeRegex =
        /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/s]{11})/;
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
    ...(courseType == "General" ? [{ id: "myclass", label: "My Class" }] : []),
    ...(courseType == "General"
      ? [{ id: "assignments", label: "Assignments" }]
      : []),
    ...(courseType == "General" ? [{ id: "quizzes", label: "Quizzes" }] : []),
    { id: "discussion", label: "Discussion" },
    { id: "reviews", label: "Reviews" },
  ];

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
      `${baseUrl}student/checkLessonStartTimeLiveClass`,
      requestOptions as RequestInit
    )
      .then((response) => response.json())
      .then((result) => {
        if (result.ID) {
          fetchCourseData("General");
        }
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    if (!generalCourseData || !token) return;

    const intervalId = setInterval(() => {
      checkLessonStartTime();
    }, 60000); // 60000 ms = 1 minute

    checkLessonStartTime();

    return () => clearInterval(intervalId);
  }, [generalCourseData, token]);

  const courseData =
    courseType == "General" ? generalCourseData : liveCourseData;
  if (!courseData) return <CourseDetailSkeleton />;

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row w-full justify-around gap-4">
        <div className="w-full md:w-[70%] bg-white mt-4 p-4 rounded-lg">
          <div className="flex items-center pt-2 gap-2 mb-4">
            <Link to="/mycourses" className="text-black rounded-full">
              <CiCircleChevLeft size={24} />
            </Link>
            <h2 className="text-lg sm:text-xl font-semibold">Course Details</h2>
          </div>
          <div className="sticky top-0 z-10 bg-white w-full pb-4 md:static">
            {featureType == 1 && (
              <video
                controls
                src={videoUrl || undefined}
                className="w-full min-h-[20rem] sm:min-h-[30rem] aspect-video mb-12 bg-black rounded-lg object-cover"
              />
            )}

            {featureType === "Youtube" && (
              <iframe
                src={videoUrl || undefined}
                title="Youtube Video"
                className="w-full min-h-[20rem] sm:min-h-[30rem] aspect-video mb-12 rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}

            {featureType === "PDF" && (
              <div
                id="pdf-viewer"
                className="w-full h-[30rem] bg-gray-100 rounded-lg flex items-center justify-center relative"
              >
                <iframe
                  src={
                    videoUrl
                      ? `${videoUrl}#toolbar=0&navpanes=0&scrollbar=0`
                      : undefined
                  }
                  className="w-full h-full rounded-lg"
                  onContextMenu={(e) => e.preventDefault()}
                  allow="fullscreen"
                />
                <button
                  onClick={() => toggleFullscreen("pdf-viewer")}
                  className="cursor-pointer absolute bottom-1 right-5 bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition-colors"
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

            {featureType === "Video" && (
              <video
                controls
                src={videoUrl || undefined}
                className="w-full min-h-[20rem] sm:min-h-[30rem] aspect-video mb-12 bg-black rounded-lg object-cover"
              />
            )}

            {featureType === "Image" && (
              <div
                id="image-viewer"
                className="w-full h-[20rem] sm:h-[30rem] bg-gray-100 rounded-lg flex items-center justify-center relative"
              >
                <img
                  src={videoUrl || undefined}
                  alt="Resource"
                  className="w-full h-[20rem] sm:h-[30rem] object-contain rounded-lg"
                />
                <button
                  onClick={() => toggleFullscreen("image-viewer")}
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
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 0 0 0 2 2h3" />
                  </svg>
                </button>
              </div>
            )}

            {featureType === "Audio" && (
              <audio
                controls
                src={videoUrl || undefined}
                className="w-full sm:w-[50%] mb-12 mt-4"
              />
            )}

            {featureType === "Text" && (
              <div className="w-full max-h-[38rem] overflow-y-auto mb-12 aspect-auto object-contain rounded-lg">
                <p className="text-xs sm:text-sm">{videoUrl || undefined}</p>
              </div>
            )}

            {featureType == 2 && (
              <iframe
                src={videoUrl || undefined}
                className="w-full min-h-[20rem] sm:min-h-[30rem] aspect-video mb-12 rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}

            {featureType == 3 && (
              <div
                id="image-viewer"
                className="w-full h-[20rem] sm:h-[30rem] bg-gray-100 rounded-lg flex items-center justify-center relative"
              >
                <img
                  src={videoUrl || undefined}
                  className="w-full h-[20rem] sm:h-[30rem] object-contain rounded-lg"
                />
                <button
                  onClick={() => toggleFullscreen("image-viewer")}
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
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 0 0 0 2 2h3" />
                  </svg>
                </button>
              </div>
            )}

            {featureType === "Slide Document" && (
              <div className="w-full h-[20rem] sm:h-[30rem] bg-gray-100 rounded-lg flex items-center justify-center relative">
                <iframe
                  id="slide-document-viewer"
                  src={videoUrl || undefined}
                  title={videoUrl || undefined}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                />
              </div>
            )}
          </div>

          {assignmentDetail && (
            <AssignmentDetail
              courseId={generalCourseData?.course_id?.toString() || ""}
              setShowResult={setShowResult}
              setAssignmentDetail={setAssignmentDetail}
              assignmentDetail={assignmentDetail}
              showResult={showResult}
            />
          )}

          {quizDetail && (
            <QuizDetail
              key={quizRetryCounter}
              setQuizDetail={setQuizDetail}
              quizDetail={quizDetail}
            />
          )}

          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-semibold">
              {courseType == "General"
                ? generalCourseData?.pageTitle
                : liveCourseData?.pageTitle}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {courseType == "General" &&
                generalCourseData?.course_content_tab
                  .course_content_list_section.length + " lessons"}
            </p>
          </div>
          {/* Mobile-only course content section */}
          <div className="w-full mt-4 md:hidden">
            {courseType == "General" ? (
              <div className="w-full bg-white p-4 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold border-b border-gray-400 mb-4">
                  Course Content
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {generalCourseData?.course_content_tab.course_content_list_section.map(
                    (lesson) => (
                      <AccordionItem
                        key={lesson.lesson_id}
                        value={`lesson-${lesson.lesson_id}`}
                      >
                        <AccordionTrigger className="text-sm sm:text-base">
                          {lesson.lesson_name}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pl-2">
                            {lesson.lesson_lectures.map((lecture) => (
                              <div
                                key={lecture.lecture_id}
                                className={`flex items-start gap-3 cursor-pointer ${lecture.is_locked === "No" ? "cursor-pointer" : "cursor-not-allowed"}`}
                                onClick={() => handleLectureClick(lecture)}
                              >
                                <div className="mt-1">
                                  {lecture.checkbox_icon_class_type === 3 ? (
                                    <div className="w-4 h-4 border border-gray-400 rounded-full" />
                                  ) : lecture.checkbox_icon_class_type === 2 ? (
                                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                                      ✓
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">
                                      ✓
                                    </div>
                                  )}
                                </div>
                                <div
                                  className={`${lecture.is_locked === "No" ? "cursor-pointer" : "cursor-not-allowed"}`}
                                >
                                  <p className="text-xs sm:text-sm font-medium">
                                    {lecture.lecture_title}
                                  </p>
                                  {lecture.is_locked === "Yes" && (
                                    <span className="text-gray-400 text-xs flex items-center">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="mr-1"
                                      >
                                        <rect
                                          x="3"
                                          y="11"
                                          width="18"
                                          height="11"
                                          rx="2"
                                          ry="2"
                                        />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                      </svg>
                                      Locked
                                    </span>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    {lecture.lecture_type === "Resource" ? (
                                      <>
                                        Resource <span>({lecture.type})</span>
                                      </>
                                    ) : (
                                      lecture.lecture_type
                                    )}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  )}
                </Accordion>
              </div>
            ) : (
              <div className="w-full bg-white p-4 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold border-b border-gray-400 mb-4">
                  Course Content
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {liveCourseData?.course_content_tab.course_content_list_section.map(
                    (lesson) => (
                      <AccordionItem
                        key={lesson.sr_no}
                        value={`lesson-${lesson.name}`}
                      >
                        <AccordionTrigger className="text-sm sm:text-base">
                          {lesson.name}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pl-2">
                            {lesson.data.map((lecture) => (
                              <div
                                key={lecture.sr_no}
                                className={`flex items-start gap-3 cursor-pointer`}
                                onClick={() => handleLiveLectureClick(lecture)}
                              >
                                <div className="mt-1">
                                  <div className="w-4 h-4 border border-gray-400 rounded-full" />
                                </div>
                                <div>
                                  <p className="text-xs sm:text-sm font-medium">
                                    {lecture.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {lecture.type}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  )}
                </Accordion>
              </div>
            )}
          </div>

          <div>
            <div className="flex  flex-nowrap overflow-x-auto gap-4 sm:gap-6 mb-4 border-b">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2 capitalize text-xs sm:text-sm font-medium transition-colors cursor-pointer mb-2 sm:mb-0 scrollbar-hide flex-shrink-0 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-[#013370] border-b-2 border-[#013370]"
                      : "text-gray-500 hover:text-[#013370]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div>
              {/* {activeTab === "overview" && (
                <OverviewTab
                  overview={
                    courseType == "General"
                      ? generalCourseData?.course_overview_tab.description
                      : liveCourseData?.course_overview_tab.description
                  }
                />
              )} */}
              {activeTab === "notice" && (
                <NoticeTab
                  notice={
                    courseType == "General"
                      ? generalCourseData?.course_notice_tab
                      : liveCourseData?.course_notice_tab
                  }
                />
              )}
              {activeTab === "myclass" && courseType == "General" && (
                <MyClassTab
                  course_liveclass_tab={generalCourseData?.course_liveclass_tab}
                />
              )}
              {activeTab === "assignments" && courseType == "General" && (
                <Assignments
                  courseId={generalCourseData?.course_id || 0}
                  assignments={generalCourseData?.course_assignment_tab}
                  setAssignmentId={setAssignmentId}
                />
              )}
              {activeTab === "quizzes" && courseType == "General" && (
                <Quizzes
                  quizzes={generalCourseData?.course_quiz_tab || []}
                  setQuizId={(uuid) => {
                    setQuizId(null);
                    setTimeout(() => {
                      setQuizId(uuid);
                      setQuizRetryCounter((prev) => prev + 1); // Increment on retry
                    }, 0);
                  }}
                />
              )}
              {activeTab === "reviews" && (
                <ReviewsTab
                  reviews={
                    courseType == "General"
                      ? generalCourseData?.course_review_tab
                      : liveCourseData?.course_review_tab
                  }
                  refreshReviews={refreshReviews}
                  courseId={courseData?.course_id}
                />
              )}
              {activeTab === "discussion" && (
                <StudentDiscussionTab
                  courseId={
                    courseType === "General"
                      ? generalCourseData?.course_id?.toString() || ""
                      : liveCourseData?.course_id?.toString() || ""
                  }
                  courseType={courseType || "General"}
                  discussionData={
                    (courseType === "General"
                      ? generalCourseData?.course_discussion_tab
                      : liveCourseData?.course_discussion_tab
                    )?.filter(
                      (item): item is Discussion => "discussion_id" in item
                    ) || []
                  }
                  onDiscussionPosted={() =>
                    fetchCourseData(courseType || "General")
                  }
                />
              )}
            </div>
          </div>
        </div>

        {courseType == "General" ? (
          <div className="w-full md:w-[25%] bg-white mt-4 p-4 rounded-lg max-h-screen overflow-y-auto top-4 md:block hidden">
            <h3 className="text-base sm:text-lg font-semibold border-b border-gray-400 mb-4">
              Course Content
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {generalCourseData?.course_content_tab.course_content_list_section.map(
                (lesson) => (
                  <AccordionItem
                    key={lesson.lesson_id}
                    value={`lesson-${lesson.lesson_id}`}
                  >
                    <AccordionTrigger className="text-sm sm:text-base">
                      {lesson.lesson_name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pl-2">
                        {lesson.lesson_lectures.map((lecture) => (
                          <div
                            key={lecture.lecture_id}
                            className={`flex items-start gap-3 cursor-pointer ${lecture.is_locked === "No" ? "cursor-pointer" : "cursor-not-allowed"}`}
                            onClick={() => handleLectureClick(lecture)}
                          >
                            <div className="mt-1">
                              {lecture.checkbox_icon_class_type === 3 ? (
                                <div className="w-4 h-4 border border-gray-400 rounded-full" />
                              ) : lecture.checkbox_icon_class_type === 2 ? (
                                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                                  ✓
                                </div>
                              ) : (
                                <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">
                                  ✓
                                </div>
                              )}
                            </div>
                            <div
                              className={`${lecture.is_locked === "No" ? "cursor-pointer" : "cursor-not-allowed"}`}
                            >
                              <p className="text-xs sm:text-sm font-medium">
                                {lecture.lecture_title}
                              </p>
                              {lecture.is_locked === "Yes" && (
                                <span className="text-gray-400 text-xs flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                  >
                                    <rect
                                      x="3"
                                      y="11"
                                      width="18"
                                      height="11"
                                      rx="2"
                                      ry="2"
                                    />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                  </svg>
                                  Locked
                                </span>
                              )}
                              <p className="text-xs text-gray-500">
                                {lecture.lecture_type === "Resource" ? (
                                  <>
                                    Resource <span>({lecture.type})</span>
                                  </>
                                ) : (
                                  lecture.lecture_type
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              )}
            </Accordion>
          </div>
        ) : (
          <div className="w-full md:w-[25%] bg-white mt-4 p-4 rounded-lg max-h-screen overflow-y-auto top-4 md:block hidden">
            <h3 className="text-base sm:text-lg font-semibold border-b border-gray-400 mb-4">
              Course Content
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {liveCourseData?.course_content_tab.course_content_list_section.map(
                (lesson) => (
                  <AccordionItem
                    key={lesson.sr_no}
                    value={`lesson-${lesson.name}`}
                  >
                    <AccordionTrigger className="text-sm sm:text-base">
                      {lesson.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pl-2">
                        {lesson.data.map((lecture) => (
                          <div
                            key={lecture.sr_no}
                            className={`flex items-start gap-3 cursor-pointer`}
                            onClick={() => handleLiveLectureClick(lecture)}
                          >
                            <div className="mt-1">
                              <div className="w-4 h-4 border border-gray-400 rounded-full" />
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-medium">
                                {lecture.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {lecture.type}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              )}
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
}
