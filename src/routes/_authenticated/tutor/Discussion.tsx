import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";

interface TutorCourse {
  id: number;
  title: string;
  discussions_count: number;
  image_url?: string;
}

interface TutorDiscussion {
  id: number;
  course_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    image_url?: string;
  };
  replies: {
    id: number;
    user_id: number;
    comment: string;
    created_at: string;
    user: {
      id: number;
      name: string;
      image_url?: string;
    };
  }[];
}

const DEFAULT_IMAGE =
  "https://dev.cefonlineacademy.com/uploads/default/instructor-default.png";

export const Route = createFileRoute("/_authenticated/tutor/Discussion")({
  component: TutorDiscussionPage,
});

function TutorDiscussionPage() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<TutorCourse[]>([]);
  const [discussions, setDiscussions] = useState<TutorDiscussion[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [replyComments, setReplyComments] = useState<Record<string, string>>(
    {}
  );
  const [isReplyOpen, setIsReplyOpen] = useState<Record<string, boolean>>({});
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses (First API)
  const fetchCourses = useCallback(async () => {
    try {
      setLoadingCourses(true);
      setError(null);
      const response = await fetch(`${baseUrl}instructor/discussion/index`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      } else {
        setError("Failed to fetch courses.");
      }
    } catch (err) {
      setError("Failed to fetch courses. Please try again.");
      console.error("Fetch courses error:", err);
    } finally {
      setLoadingCourses(false);
    }
  }, [token]);

  // Fetch discussions for selected course (Second API)
  const fetchDiscussions = useCallback(
    async (courseId: number) => {
      try {
        setLoadingDiscussions(true);
        setError(null);
        const response = await fetch(
          `${baseUrl}instructor/discussion/course-discussion-list/${courseId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          setDiscussions(data.discussions);
        } else {
          setError("Failed to fetch discussions.");
        }
      } catch (err) {
        setError("Failed to fetch discussions. Please try again.");
        console.error("Fetch discussions error:", err);
      } finally {
        setLoadingDiscussions(false);
      }
    },
    [token]
  );

  // Post reply (Third API)
  const handleReply = useCallback(
    async (discussionId: string, courseId: number) => {
      const replyComment = replyComments[discussionId];
      if (!replyComment?.trim()) {
        alert("Reply comment cannot be empty.");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("course_id", courseId.toString());
        formData.append("commentReply", replyComment);

        const response = await fetch(
          `${baseUrl}instructor/discussion-reply/${discussionId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
        const data = await response.json();
        if (data.success) {
          alert("Reply posted successfully!");
          setReplyComments((prev) => ({
            ...prev,
            [discussionId]: "",
          }));
          setIsReplyOpen((prev) => ({
            ...prev,
            [discussionId]: false,
          }));
          // Refresh both APIs
          await fetchCourses();
          if (
            selectedCourseId &&
            courses.some((c) => c.id === selectedCourseId)
          ) {
            await fetchDiscussions(selectedCourseId);
          } else if (courses.length > 0) {
            setSelectedCourseId(courses[0].id);
          }
        } else {
          alert("Failed to post reply. Please try again.");
        }
      } catch (err) {
        alert("Failed to post reply. Please try again.");
        console.error("Post reply error:", err);
      }
    },
    [
      token,
      replyComments,
      selectedCourseId,
      courses,
      fetchCourses,
      fetchDiscussions,
    ]
  );

  // Fetch courses and set default course on mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Set default course and fetch discussions after courses are loaded
  useEffect(() => {
    if (!loadingCourses && courses.length > 0 && selectedCourseId === null) {
      const firstCourseId = courses[0].id;
      setSelectedCourseId(firstCourseId);
    }
  }, [loadingCourses, courses, selectedCourseId]);

  // Fetch discussions when selectedCourseId changes
  useEffect(() => {
    if (selectedCourseId !== null) {
      fetchDiscussions(selectedCourseId);
    }
  }, [selectedCourseId, fetchDiscussions]);

  const toggleReplyTextArea = useCallback(
    (discussionId: string) => {
      setIsReplyOpen((prev) => ({
        ...prev,
        [discussionId]: !prev[discussionId],
      }));
      if (isReplyOpen[discussionId]) {
        setReplyComments((prev) => ({
          ...prev,
          [discussionId]: "",
        }));
      }
    },
    [isReplyOpen]
  );

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd hh:mm a");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Discussions</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 min-h-[calc(100vh-12rem)]">
        {/* Left Column: Course List */}
        <div className="border border-gray-300 rounded-lg p-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
          <h2 className="text-lg font-semibold mb-4">Courses</h2>
          {loadingCourses ? (
            <p className="text-gray-500 text-center">Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="text-gray-500 text-center">
              No unread course discussions available.
            </p>
          ) : (
            <ul className="space-y-2">
              {courses.map((course) => (
                <li
                  key={course.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedCourseId === course.id
                      ? "bg-[#013370] text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedCourseId(course.id)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{course.title}</span>
                    <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">
                      {course.discussions_count}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Column: Discussions */}
        <div className="border border-gray-300 rounded-lg p-6 overflow-y-auto lg:max-h-[calc(100vh-12rem)]">
          {loadingDiscussions ? (
            <p className="text-gray-500 text-center">Loading discussions...</p>
          ) : discussions.length === 0 || selectedCourseId === null ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-md text-gray-500">
                {courses.length === 0
                  ? "No unread discussions available."
                  : "No discussions available for this course."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">
                {courses.find((c) => c.id === selectedCourseId)?.title ||
                  "Selected Course"}
              </h2>
              {discussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="border-b border-gray-200 pb-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={discussion.user.image_url || DEFAULT_IMAGE}
                      alt={discussion.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center lg:gap-2">
                        <span className="font-semibold">
                          {discussion.user.name}
                        </span>
                        <span className="text-sm text-gray-500">Student</span>
                        <span className="text-sm text-gray-500">
                          • {formatDate(discussion.created_at)}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-700">{discussion.comment}</p>
                      {discussion.replies.length > 0 && (
                        <div className="mt-4 space-y-2 ml-4">
                          {discussion.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="flex items-start gap-3"
                            >
                              <img
                                src={reply.user.image_url || DEFAULT_IMAGE}
                                alt={reply.user.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <div className="flex flex-col lg:flex-row items-start lg:items-center lg:gap-2">
                                  <span className="font-semibold">
                                    {reply.user.name}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    • {formatDate(reply.created_at)}
                                  </span>
                                </div>
                                <p className="text-gray-600">{reply.comment}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() =>
                            toggleReplyTextArea(discussion.id.toString())
                          }
                          className="px-3 py-1 bg-[#013370] text-white text-sm rounded-md hover:bg-[#012a5b] transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                      {isReplyOpen[discussion.id.toString()] && (
                        <div className="mt-4 relative">
                          <textarea
                            className="w-full h-24 p-4 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#013370] resize-none"
                            placeholder="Write your reply here..."
                            value={
                              replyComments[discussion.id.toString()] || ""
                            }
                            onChange={(e) =>
                              setReplyComments((prev) => ({
                                ...prev,
                                [discussion.id.toString()]: e.target.value,
                              }))
                            }
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              className="px-3 py-1 bg-[#013370] text-white text-sm rounded-md hover:bg-[#012a5b] transition-colors"
                              onClick={() =>
                                handleReply(
                                  discussion.id.toString(),
                                  discussion.course_id
                                )
                              }
                            >
                              Post
                            </button>
                            <button
                              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors"
                              onClick={() =>
                                toggleReplyTextArea(discussion.id.toString())
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
