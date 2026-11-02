import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";

// Interface for Class Schedule data
interface ClassScheduleEntry {
  sr_no: number;
  id: number;
  instructor: string;
  course: string;
  date_time: string;
  learning_tool: string;
  status: {
    btnText: "Scheduled" | "Completed" | "Missed" | "Pending" | "In Progress";
    btnHref?: string; // Join link for live classes
    classType?: string; // e.g., Google_Meet
  };
  classDetails: {
    lesson_id: string;
    meeting_id: string;
    group_id: string;
    user_id: string;
  }
}

// 🔸 Helper for status styling
const getStatusClasses = (
  status: ClassScheduleEntry["status"]["btnText"]
): string => {
  switch (status) {
    case "Scheduled":
      return "text-blue-800 bg-blue-100 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"; // Added whitespace-nowrap
    case "Completed":
      return "text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"; // Added whitespace-nowrap
    case "Pending":
      return "text-yellow-700 bg-yellow-200 px-5 py-1 rounded-full text-xs font-medium whitespace-nowrap"; // Added whitespace-nowrap
    case "Missed":
      return "text-red-800 bg-red-100 px-6 py-1 rounded-full text-xs font-medium whitespace-nowrap"; // Added whitespace-nowrap
    case "In Progress":
      return "text-white bg-green-600 px-4 py-1 rounded-full text-xs font-medium hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"; // Added whitespace-nowrap
    default:
      return "";
  }
};

// Skeleton component for loading state
const GroupClassSkeleton = () => {
  return (
    // The wrapper div already has overflow-x-auto, which is good.
    // Ensure it also has sensible padding.
    <div className="overflow-x-auto border-0 p-2 sm:p-4 md:p-6">
      <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
        {" "}
        {/* Added min-w-max */}
        <thead className="text-left text-muted-foreground">
          <tr>
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <th
                key={index}
                className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
              >
                <div className="flex items-center gap-1">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />{" "}
                  {/* Added w-full for skeleton cell */}
                  {index !== 6 && (
                    <ArrowDown className="size-4 text-gray-400" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((rowIndex) => (
            <tr key={rowIndex} className="bg-white border-b border-gray-200">
              {[1, 2, 3, 4, 5, 6].map((colIndex) => (
                <td key={colIndex} className="px-4 py-3 whitespace-nowrap">
                  {" "}
                  {/* Added whitespace-nowrap */}
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />{" "}
                  {/* Added w-full */}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function GroupClass() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<ClassScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial class schedule
  const fetchClasses = async () => {
    try {
      const res = await fetch(`${baseUrl}student/class-schedule`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch group class schedule");
      }

      const data = await res.json();
      const transformed = (data.group || []).map((item: any) => ({
        sr_no: item.sr_no,
        id: item.id,
        instructor: item.instructor,
        course: item.course,
        date_time: item.date_time,
        learning_tool: item.learning_tool,
        status: {
          btnText: (item.status?.btnText ||
            "Scheduled") as ClassScheduleEntry["status"]["btnText"],
          btnHref: item.status?.btnHref,
          classType: item.status?.classType,
        },
        classDetails: {
          lesson_id: item.status?.classDetails?.lesson_id,
          meeting_id: item.status?.classDetails?.meeting_id,
          group_id: item.status?.classDetails?.group_id,
          user_id: item.status?.classDetails?.user_id,
        },
      }));
      setClasses(transformed);
      setLoading(false);
    } catch (err) {
      setError("Something went wrong while loading classes.");
      setLoading(false);
    }
  };

  // Periodic API call to check for live classes
  const checkLessonStartTime = async () => {
    try {
      const res = await axios.post(
        `${baseUrl}student/checkLessonStartTime`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data || [];
      setClasses((prevClasses) =>
        prevClasses.map((cls) => {
          const matchingLesson = data.find(
            (lesson: { id: number; btnHref?: string; classType?: string }) =>
              lesson.id === cls.id
          );
          if (matchingLesson?.btnHref) {
            return {
              ...cls,
              status: {
                btnText: "In Progress",
                btnHref: matchingLesson.btnHref,
                classType: matchingLesson.classType || cls.status.classType,
              },
            };
          }
          return cls;
        })
      );
    } catch (err) {
      console.error("Error checking lesson start time:", err);
    }
  };

  useEffect(() => {
    fetchClasses();

    // Set up polling for live classes every minute
    const intervalId = setInterval(checkLessonStartTime, 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [token]);

  if (loading) return <GroupClassSkeleton />;
  if (error) return <div className="p-4 text-red-600 text-center">{error}</div>; // Added text-center
  if (classes.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No classes scheduled
      </div>
    );
  }

  const handleLiveClassClick = (lesson_id: string, meeting_id: string, user_id: string, learningTool: string, btnHref: string | undefined) => {
    if (learningTool === "Google_Meet") {
      window.open(btnHref, "_blank")
    }
    if (learningTool === "Zoom") {
      const url = `/zoom/${lesson_id}/${meeting_id}/${user_id}`;
      window.open(url, "_blank");
    }
  }

  return (
    // This div makes the table horizontally scrollable on smaller screens.
    // Added responsive padding.
    <div className="overflow-x-auto border-0 p-2 sm:p-4 md:p-6">
      <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
        {" "}
        {/* Added min-w-max */}
        <thead className="text-left text-muted-foreground">
          <tr>
            {[
              "No.",
              "Instructor Name",
              "Course",
              "Learning Tool",
              "Date Time",
              "Status",
            ].map((header) => (
              <th
                key={header}
                className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
              >
                <div className="flex items-center gap-1">
                  {header}
                  {/* Keep ArrowDown only for sortable columns */}
                  {header !== "Status" && (
                    <ArrowDown className="size-4 text-gray-400" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {classes.map((schedule) => (
            <tr
              key={schedule.id}
              className="bg-white border-b border-gray-200 last:border-b-0"
            >
              {" "}
              {/* last:border-b-0 for cleaner last row */}
              <td className="px-4 py-3 whitespace-nowrap">{schedule.sr_no}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {schedule.instructor}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{schedule.course}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {schedule.learning_tool.replace("_", " ")}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {schedule.date_time}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {schedule.status.btnHref ? (
                  <span
                    className={getStatusClasses("In Progress")}
                    onClick={() => {
                      handleLiveClassClick(schedule?.classDetails?.lesson_id, schedule?.classDetails?.meeting_id, schedule?.classDetails?.user_id, schedule?.learning_tool, schedule?.status?.btnHref)
                    }}
                  >
                    In Progress
                  </span>
                ) : (
                  <span className={getStatusClasses(schedule.status.btnText)}>
                    {schedule.status.btnText}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
