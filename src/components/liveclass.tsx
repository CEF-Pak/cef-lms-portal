import { useState, useEffect } from "react";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";
import { Button } from "./ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface LiveClassData {
  courseName: string;
  dateTime: string;
  btnStatus: string;
  btnCssClass: string;
  studentUri: string;
  learningTool: string;
  meetingId: string;
  lessonId: string;
}

export default function LiveClass() {
  const [classData, setClassData] = useState<LiveClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const userId = localStorage.getItem("user_id");

  const getButtonClass = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "text-blue-800 bg-blue-100 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap";
      case "Completed":
        return "text-green-600 bg-green-100 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap";
      case "Pending":
        return "text-yellow-700 bg-yellow-200 px-5 py-1 rounded-lg text-xs font-medium whitespace-nowrap";
      case "Missed":
        return "text-red-800 bg-red-100 px-6 py-1 rounded-lg text-xs font-medium whitespace-nowrap";
      case "In Progress":
        return "text-white bg-green-600 px-4 py-1 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap";
      default:
        return "";
    }
  };

  const fetchLiveClass = async () => {
    try {
      const response = await fetch(`${baseUrl}student/TodayLiveClass`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data && data.length === 0) {
        setClassData(null);
      } else if (data && Object.keys(data).length > 0) {
        const md = data.Meeting_Details;
        const meeting =
          md && typeof md === "object" && !Array.isArray(md) ? md : {};
        setClassData({
          courseName: data.courseName,
          dateTime: data.Date_Time,
          btnStatus: data.Btn_Status,
          btnCssClass: data.Btn_Css_Class,
          studentUri: meeting.student_uri ?? "",
          learningTool: data.learningTool,
          meetingId: meeting.meeting_id ?? "",
          lessonId: meeting.lesson_id ?? "",
        });
      }
    } catch (error) {
      console.error("Error fetching live class:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkLessonStartTime = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Accept-Language", "en");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      `${baseUrl}student/checkLessonStartTime`,
      requestOptions as RequestInit
    )
      .then((response) => response.json())
      .then((result) => {
        if (result) {
          fetchLiveClass();
        }
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    fetchLiveClass();
  }, []);

  useEffect(() => {
    if (!classData || !token) return;
    const intervalId = setInterval(() => {
      checkLessonStartTime();
    }, 60000); // 60000 ms = 1 minute

    // run it once immediately too if needed
    checkLessonStartTime();

    return () => clearInterval(intervalId); // clean up on unmount or dependencies change
  }, [classData, token]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
        <Skeleton className="h-[6rem] w-[10rem] sm:h-[4rem] sm:w-[7rem]" />
        <Skeleton className="h-[2rem] w-[14rem] sm:h-[1.5rem] sm:w-[10rem]" />
        <Skeleton className="h-[2rem] w-[14rem] sm:h-[1.5rem] sm:w-[10rem]" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-md sm:text-sm text-gray-500 mt-8">
          No class for today
        </p>
      </div>
    );
  }
  const handleLiveClassClick = async () => {
    if (!classData || !token || !userId) return;
    if (classData.learningTool === "Google_Meet") {
      const url = classData.studentUri?.trim();
      if (!url) return;
      window.open(url, "_blank", "noopener,noreferrer");
    }
    if (classData.learningTool === "Zoom") {
      const url = `/zoom/${classData.lessonId}/${classData.meetingId}/${userId}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <svg
        className="w-36 h-32 md:w-32 md:h-28 sm:w-28 sm:h-24"
        viewBox="0 0 179 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_1542_419)">
          <path
            d="M165.09 8.86719H11.0114C8.16725 8.86719 5.86157 11.1717 5.86157 14.0144V112.366C5.86157 115.208 8.16725 117.513 11.0114 117.513H165.09C167.934 117.513 170.24 115.208 170.24 112.366V14.0144C170.24 11.1717 167.934 8.86719 165.09 8.86719Z"
            fill="#455A64"
          />
          <path
            d="M0.481934 110.493H178.571V113.712C178.571 117.181 175.754 120 172.28 120H6.77346C3.30252 120 0.481934 117.184 0.481934 113.712V110.493Z"
            fill="#455A64"
          />
          <path
            d="M71.8484 109.476L74.0575 112.988H105.155L107.205 109.476H71.8484Z"
            fill="#263238"
          />
        </g>
        <defs>
          <clipPath id="clip0_1542_419">
            <rect
              width="178.089"
              height="120"
              fill="white"
              transform="translate(0.481934)"
            />
          </clipPath>
        </defs>
      </svg>
      <h1 className="text-lg md:text-base sm:text-sm font-semibold my-1">
        {classData.courseName}
      </h1>
      <p className="text-sm md:text-xs sm:text-xs text-gray-500 mb-4">
        {classData.dateTime}
      </p>
      <Button
        variant="primary"
        className={`${getButtonClass(classData.btnStatus)} ${
          classData.btnStatus !== "In Progress" ? "pointer-events-none" : ""
        }`}
        onClick={() => handleLiveClassClick()}
      >
        {classData.btnStatus}
      </Button>
    </div>
  );
}
