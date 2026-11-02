import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";

// Interface for Group Class data
interface ClassScheduleEntry {
  id: number; // Serial No.
  studentNo: number;
  courseName: string;
  learningTool: string;
  dateTime: string; // Format: "DD-MM-YYYY HH:MM AM/PM"
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
  };
}

// Status styling helper
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

// Format date and time nicely
const formatDateTime = (date: string, time: string): string => {
  const fullDate = new Date(`${date}T${time}`);
  return fullDate
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", "");
};

// Skeleton component for loading state
const GroupClassSkeleton = () => {
  return (
    <div className="overflow-x-auto border-0 p-4">
      <table className="w-full text-sm bg-white border-collapse rounded-lg p-6">
        <thead className="text-left text-muted-foreground">
          <tr>
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <th
                key={index}
                className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
              >
                <div className="flex items-center gap-1">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
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
                <td key={colIndex} className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
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
  const [classSchedule, setClassSchedule] = useState<ClassScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch group class schedule
  const fetchGroupClasses = async () => {
    try {
      const res = await axios.get(`${baseUrl}instructor/classes-schedule`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data?.data?.group_classes || [];

      const transformed: ClassScheduleEntry[] = data.map((item: any) => ({
        id: item.sr_no,
        studentNo: item.no_of_students,
        courseName: item.course_title,
        learningTool: item.learning_tool.replace("_", " "),
        dateTime: formatDateTime(item.class_date, item.class_time),
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

      setClassSchedule(transformed);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch group classes.");
      setLoading(false);
    }
  };

  // Periodic API call to check for live classes
  const checkLessonStartTime = async () => {
    try {
      const res = await axios.post(
        `${baseUrl}instructor/checkLessonStartTime`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data || [];
      setClassSchedule((prevSchedule) =>
        prevSchedule.map((cls) => {
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
    fetchGroupClasses();

    // Set up polling for live classes every minute
    const intervalId = setInterval(checkLessonStartTime, 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [token]);

  if (loading) {
    return <GroupClassSkeleton />;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  if (classSchedule.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No group classes scheduled
      </div>
    );
  }
  const handleLiveClassClick = (
    lesson_id: string,
    meeting_id: string,
    group_id: string,
    user_id: string,
    learningTool: string,
    btnHref: string | undefined
  ) => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const formdata = new FormData();
    formdata.append("lesson_id", lesson_id);
    formdata.append("meeting_id", meeting_id);
    if (group_id) {
      formdata.append("group_id", group_id);
    }

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch(
      `${baseUrl}instructor/update-class-status`,
      requestOptions as RequestInit
    )
      .then((response) => response.json())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));

    if (learningTool === "Google Meet") {
      window.open(btnHref, "_blank");
    }
    if (learningTool === "Zoom") {
      const url = `/tutor/zoom/${lesson_id}/${meeting_id}/${user_id}`;
      window.open(url, "_blank");
    }
  };
  return (
    <div className="overflow-x-auto border-0 p-4">
      <table className="w-full text-sm bg-white border-collapse rounded-lg p-6">
        <thead className="text-left text-muted-foreground">
          <tr>
            {[
              "No.",
              "No. of Students",
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
                  {header !== "Status" && (
                    <ArrowDown className="size-4 text-gray-400" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {classSchedule.map((schedule) => (
            <tr key={schedule.id} className="bg-white border-b border-gray-200">
              <td className="px-4 py-3">{schedule.id}</td>
              <td className="px-4 py-3">{schedule.studentNo}</td>
              <td className="px-4 py-3" style={{ minWidth: "12rem" }}>
                {schedule.courseName}
              </td>
              <td className="px-4 py-3">{schedule.learningTool}</td>
              <td className="px-4 py-3">{schedule.dateTime}</td>
              <td className="px-4 py-3">
                {schedule.status.btnHref ? (
                  <span
                    className={getStatusClasses("In Progress")}
                    onClick={() => {
                      handleLiveClassClick(
                        schedule?.classDetails?.lesson_id,
                        schedule?.classDetails?.meeting_id,
                        schedule?.classDetails?.group_id,
                        schedule?.classDetails?.user_id,
                        schedule?.learningTool,
                        schedule?.status?.btnHref
                      );
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
