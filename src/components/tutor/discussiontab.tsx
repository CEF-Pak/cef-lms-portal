import { useState } from "react";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";

interface StudentDiscussionTabProps {
  courseId?: string;
}

export default function DiscussionTab({ courseId }: StudentDiscussionTabProps) {
  const [isTextAreaOpen, setIsTextAreaOpen] = useState(false);
  const [discussionComment, setDiscussionComment] = useState("");
  const { token } = useAuth();

  const toggleTextArea = () => {
    setIsTextAreaOpen(!isTextAreaOpen);
    if (isTextAreaOpen) {
      setDiscussionComment(""); // Clear comment when closing
    }
  };

  const handlePost = async () => {
    if (!discussionComment.trim()) {
      alert("Discussion comment cannot be empty.");
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const formdata = new FormData();
    formdata.append("course_id", courseId || "");
    formdata.append("discussion_comment", discussionComment);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow" as RequestRedirect,
    };

    try {
      const response = await fetch(
        `${baseUrl}student/course/create-discussion`,
        requestOptions
      );
      const result = await response.json();
      if (result.status === 200) {
        alert("Discussion posted successfully!");
        setDiscussionComment(""); // Clear text area after successful post
        setIsTextAreaOpen(false); // Close text area
      } else {
        alert("Failed to post discussion. Please try again.");
      }
    } catch (error) {
      console.error("Error posting discussion:", error);
      alert("An error occurred while posting the discussion.");
    }
  };

  return (
    <div className="w-full h-full p-6 ">
      {!isTextAreaOpen && (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-md text-gray-500">No discussion available</p>
          <button
            onClick={toggleTextArea}
            className="px-3 py-1 bg-[#013370] text-white text-sm rounded-md hover:bg-[#012a5b] transition-colors"
          >
            Create
          </button>
        </div>
      )}
      {isTextAreaOpen && (
        <div className="space-y-4">
          <div className="relative">
            <textarea
              className="w-full h-36 p-4 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#013370] resize-none"
              placeholder="Write your comment or discussion here..."
              value={discussionComment}
              onChange={(e) => setDiscussionComment(e.target.value)}
            />
            <button
              className="absolute bottom-3 right-2 px-3 py-1 bg-[#013370] text-white text-sm rounded-md hover:bg-[#012a5b] transition-colors"
              onClick={handlePost}
            >
              Post
            </button>
          </div>
          <div className="flex justify-start">
            <button
              onClick={toggleTextArea}
              className="px-3 py-1 bg-[#013370] text-white text-sm rounded-md hover:bg-[#012a5b] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
