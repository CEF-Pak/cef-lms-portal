import { useState } from "react";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";
import { IoChatbubbleOutline } from "react-icons/io5";

interface Discussion {
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
}

interface StudentDiscussionTabProps {
  courseId: string;
  courseType: "General" | "Live";
  discussionData?: (
    | Discussion
    | {
        auth_user_images: {
          discussion_form_user_image: string;
          reply_form_user_image: string;
        };
      }
  )[];
  onDiscussionPosted?: () => void; // Added callback for refresh
}

export default function StudentDiscussionTab({
  courseId,
  courseType,
  discussionData = [],
  onDiscussionPosted,
}: StudentDiscussionTabProps) {
  const [isTextAreaOpen, setIsTextAreaOpen] = useState(false);
  const [discussionComment, setDiscussionComment] = useState("");
  const [replyComments, setReplyComments] = useState<{ [key: string]: string }>(
    {}
  );
  const [isReplyOpen, setIsReplyOpen] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isRepliesVisible, setIsRepliesVisible] = useState<{
    [key: string]: boolean;
  }>({}); // State for replies visibility
  const { token } = useAuth();

  const toggleTextArea = () => {
    setIsTextAreaOpen(!isTextAreaOpen);
    if (isTextAreaOpen) {
      setDiscussionComment("");
    }
  };

  const toggleReplyTextArea = (discussionId: string) => {
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
  };

  const toggleRepliesVisibility = (discussionId: string) => {
    setIsRepliesVisible((prev) => ({
      ...prev,
      [discussionId]: !prev[discussionId],
    }));
  };

  const handlePost = async () => {
    if (!discussionComment.trim()) {
      alert("Discussion comment cannot be empty.");
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const formdata = new FormData();
    formdata.append("course_id", courseId);
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
        setDiscussionComment("");
        setIsTextAreaOpen(false);
        onDiscussionPosted?.(); // Trigger refresh
      } else {
        alert("Failed to post discussion. Please try again.");
      }
    } catch (error) {
      console.error(`[${courseType} Course] Error posting discussion:`, error);
      alert("An error occurred while posting the discussion.");
    }
  };

  const handleReply = async (discussionId: string) => {
    const replyComment = replyComments[discussionId];
    if (!replyComment?.trim()) {
      alert("Reply comment cannot be empty.");
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const formdata = new FormData();
    formdata.append("discussion_id", discussionId);
    formdata.append("course_id", courseId);
    formdata.append("reply_comment", replyComment);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow" as RequestRedirect,
    };

    try {
      const response = await fetch(
        `${baseUrl}student/course/create-discussion-reply`,
        requestOptions
      );
      const result = await response.json();
      if (result.status === 200) {
        alert("Reply posted successfully!");
        setReplyComments((prev) => ({
          ...prev,
          [discussionId]: "",
        }));
        setIsReplyOpen((prev) => ({
          ...prev,
          [discussionId]: false,
        }));
        setIsRepliesVisible((prev) => ({
          ...prev,
          [discussionId]: true, // Show replies after posting
        }));
        onDiscussionPosted?.(); // Trigger refresh
      } else {
        alert("Failed to post reply. Please try again.");
      }
    } catch (error) {
      console.error(`[${courseType} Course] Error posting reply:`, error);
      alert("An error occurred while posting the reply.");
    }
  };

  const discussions = discussionData.filter(
    (item): item is Discussion => "discussion_id" in item
  );

  return (
    // Applied overflow-auto to the main container
    <div className="w-full h-full p-6 border border-gray-300 rounded-lg overflow-auto">
      {isTextAreaOpen && (
        <div className="space-y-4 mb-6">
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
          <button
            onClick={toggleTextArea}
            className="px-3 py-1 bg-[#013370] text-white text-sm rounded-md hover:bg-[#012a5b] transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {discussions.length === 0 && !isTextAreaOpen && (
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

      {discussions.length > 0 && !isTextAreaOpen && (
        // Applied min-w-max to ensure content expands, triggering overflow-x-auto on parent
        // Removed explicit max-w-full to allow natural content width
        <div className="space-y-6 min-w-max">
          <div className="flex justify-center">
            <button
              onClick={toggleTextArea}
              className="px-3 py-1 bg-[#013370] text-white text-sm rounded-md hover:bg-[#012a5b] transition-colors"
            >
              Create
            </button>
          </div>
          {discussions.map((discussion) => (
            <div
              key={discussion.discussion_id}
              className="border-b border-gray-200 pb-4"
            >
              {/* Ensure this flex container does not wrap if you want its content to scroll */}
              <div className="flex items-start gap-4 flex-nowrap">
                <img
                  src={discussion.discussion_user_image}
                  alt={discussion.discussion_user_name}
                  className="w-10 h-10 rounded-full flex-shrink-0" // Prevent image from shrinking
                />
                <div className="flex-1 flex-shrink-0">
                  {" "}
                  {/* flex-shrink-0 to ensure it doesn't shrink */}
                  {/* Ensure user details don't wrap */}
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="font-semibold">
                      {discussion.discussion_user_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {discussion.discussion_user_type}
                    </span>
                    <span className="text-sm text-gray-500">
                      • {discussion.discussion_created_at}
                    </span>
                  </div>
                  {/* Discussion comment itself - allow wrapping, but its container should contribute to overall width */}
                  <p className="mt-1 text-gray-700 max-w-full overflow-hidden text-ellipsis">
                    {discussion.discussion_comment}
                  </p>
                  {isRepliesVisible[discussion.discussion_id] &&
                    discussion.discussion_replies_list.length > 0 && (
                      <div className="mt-4 space-y-2 ml-4">
                        {discussion.discussion_replies_list.map((reply) => (
                          <div
                            key={reply.reply_id}
                            className="flex items-start gap-3 flex-nowrap" // flex-nowrap for replies
                          >
                            <img
                              src={reply.reply_user_image}
                              alt={reply.reply_user_name}
                              className="w-8 h-8 rounded-full flex-shrink-0" // Prevent image from shrinking
                            />
                            <div className="flex-1 flex-shrink-0">
                              {" "}
                              {/* flex-shrink-0 here */}
                              {/* Reply details - ensure no wrapping */}
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className="font-medium">
                                  {reply.reply_user_name}
                                </span>
                                <span className="text-sm text-gray-500">
                                  • {reply.reply_created_at}
                                </span>
                              </div>
                              {/* Reply comment itself - allow wrapping, but container should contribute to overall width */}
                              <p className="text-gray-600 max-w-full overflow-hidden text-ellipsis">
                                {reply.reply_comment}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      onClick={() =>
                        toggleReplyTextArea(discussion.discussion_id.toString())
                      }
                      className="px-3 py-1 bg-[#013370] text-white text-sm rounded-md hover:bg-[#012a5b] transition-colors flex-shrink-0 whitespace-nowrap" // Add flex-shrink-0, whitespace-nowrap
                    >
                      Reply
                    </button>
                    <button
                      onClick={() =>
                        toggleRepliesVisibility(
                          discussion.discussion_id.toString()
                        )
                      }
                      className="flex items-center gap-1 text-gray-500 hover:text-[#013370] transition-colors flex-shrink-0 whitespace-nowrap" // Add flex-shrink-0, whitespace-nowrap
                      title={
                        isRepliesVisible[discussion.discussion_id]
                          ? "Hide replies"
                          : "Show replies"
                      }
                    >
                      <IoChatbubbleOutline className="w-5 h-5 flex-shrink-0" />{" "}
                      {/* flex-shrink-0 for icon */}
                      <span className="text-sm flex-shrink-0">
                        {" "}
                        {/* flex-shrink-0 for text */}
                        {discussion.discussion_total_replies}
                      </span>
                    </button>
                  </div>
                  {isReplyOpen[discussion.discussion_id] && (
                    <div className="mt-4 relative">
                      <textarea
                        className="w-full h-24 p-4 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#013370] resize-none"
                        placeholder="Write your reply here..."
                        value={replyComments[discussion.discussion_id] || ""}
                        onChange={(e) =>
                          setReplyComments((prev) => ({
                            ...prev,
                            [discussion.discussion_id]: e.target.value,
                          }))
                        }
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          className="px-3 py-1 bg-[#013370] text-white text-sm rounded-md hover:bg-[#012a5b] transition-colors flex-shrink-0 whitespace-nowrap" // Add flex-shrink-0, whitespace-nowrap
                          onClick={() =>
                            handleReply(discussion.discussion_id.toString())
                          }
                        >
                          Post Reply
                        </button>
                        <button
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors flex-shrink-0 whitespace-nowrap" // Add flex-shrink-0, whitespace-nowrap
                          onClick={() =>
                            toggleReplyTextArea(
                              discussion.discussion_id.toString()
                            )
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
  );
}
