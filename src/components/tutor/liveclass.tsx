import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface LiveClassData {
  id: number;
  courseName: string;
  dateTime: string;
  btnStatus: string;
  btnCssClass: string;
  tutorUri: string;
  learningTool: "Google_Meet" | "Zoom";
  meetingDetails: {
    meeting_id?: string;
    tutor_uri?: string;
    btnBackGround?: string;
    btnColor?: string;
    lesson_id?: string;
    group_id?: string;
    user_id?: string;
  };
}

// 🔥 Helper for consistent styles
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

export default function LiveClass() {
  const [classData, setClassData] = useState<LiveClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchLiveClass = async () => {
    try {
      const response = await fetch(`${baseUrl}instructor/dashboard`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      const todayClass = data?.today_live_class;

      if (!todayClass || Object.keys(todayClass).length === 0) {
        setClassData(null);
      } else {
        const isGoogleMeet = todayClass.learningTool === "Google_Meet";
        const isZoom = todayClass.learningTool === "Zoom";

        setClassData({
          id: todayClass.id,
          courseName: todayClass.courseName,
          dateTime: isGoogleMeet
            ? todayClass["Date/Time"]
            : todayClass.Date_Time,
          btnStatus: todayClass.Btn_Status,
          btnCssClass: todayClass.Btn_Css_Class,
          tutorUri: isGoogleMeet
            ? todayClass.Meeting_Details.tutor_uri
            : isZoom
              ? `https://zoom.us/j/${todayClass.Meeting_Details.meeting_id}`
              : "",
          learningTool: todayClass.learningTool,
          meetingDetails: todayClass.Meeting_Details || {},
        });
      }
    } catch (error) {
      console.error("Error fetching live class:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkLessonStartTime = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Accept-Language", "en");
      myHeaders.append("Authorization", `Bearer ${token}`);

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow",
      };

      const res = await fetch(
        `${baseUrl}instructor/checkLessonStartTime`,
        requestOptions as RequestInit
      );
      const result = await res.json();
      if (result) fetchLiveClass();
    } catch (err) {
      console.error("checkLessonStartTime error:", err);
    }
  };

  useEffect(() => {
    fetchLiveClass();
  }, []);

  useEffect(() => {
    if (!classData || !token) return;

    const intervalId = setInterval(() => {
      checkLessonStartTime();
    }, 60000);

    checkLessonStartTime();

    return () => clearInterval(intervalId);
  }, [classData, token]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
        <Skeleton className="h-[6rem] w-[10rem]" />
        <Skeleton className="h-[2rem] w-[14rem]" />
        <Skeleton className="h-[2rem] w-[14rem]" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-md text-gray-500 mt-8">No class for today</p>
      </div>
    );
  }

  const handleLiveClassClick = (lesson_id: string, meeting_id: string, group_id?: string) => {
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
      redirect: "follow"
    };

    fetch(`${baseUrl}instructor/update-class-status`, requestOptions as RequestInit)
      .then((response) => response.json())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));


    if (classData.learningTool === "Google_Meet") {
      window.open(classData.tutorUri, "_blank")
    }
    if (classData.learningTool === "Zoom") {
      const url = `/tutor/zoom/${classData.meetingDetails.lesson_id}/${classData.meetingDetails.meeting_id}/${classData.meetingDetails.user_id}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <svg
        className="w-36 h-32"
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

      <h1 className="text-md text-center p-1">{classData.courseName}</h1>
      <p className="text-gray-500 text-sm mb-3">{classData.dateTime}</p>

      {classData.btnStatus === "In Progress" ? (
        <Button
          variant="primary"
          className={getButtonClass(classData.btnStatus)}
          onClick={() => handleLiveClassClick(classData.meetingDetails?.lesson_id || "", classData.meetingDetails?.meeting_id || "", classData.meetingDetails?.group_id || "" )}
          style={{
            backgroundColor:
              classData.meetingDetails.btnBackGround || "#499619",
            color: classData.meetingDetails.btnColor || "#fff",
          }}
        >
          {classData.btnStatus}
        </Button>
      ) : (
        <div className={getButtonClass(classData.btnStatus)}>
          {classData.btnStatus}
        </div>
      )}
    </div>
  );
}
