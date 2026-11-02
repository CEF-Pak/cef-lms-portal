import { useEffect, useState } from "react";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";

interface StudentType {
  id: number;
  studentImage: string;
  studentName: string;
  courseName: string | null;
  obtainedPercentage: number | null;
  passingPercentage: number | null;
  status: string;
}

function LeaderboardSkeleton() {
  return (
    // Changed overflow-y-auto to overflow-auto to allow horizontal scrolling
    <div className="flex flex-col gap-2 h-[16rem] overflow-auto px-2">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between border border-gray-300 rounded-md p-3 animate-pulse min-w-max" // Added min-w-max
        >
          {/* Ensure elements inside flex containers don't wrap if they're meant to contribute to horizontal scroll */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {" "}
            {/* Added flex-shrink-0 */}
            <div className="w-10 h-10 rounded-full bg-gray-400 flex-shrink-0"></div>{" "}
            {/* Added flex-shrink-0 */}
            <div className="w-24 h-3 bg-gray-400 rounded flex-shrink-0"></div>{" "}
            {/* Added flex-shrink-0 */}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {" "}
            {/* Added flex-shrink-0 */}
            <div className="w-12 h-4 bg-gray-400 rounded flex-shrink-0"></div>{" "}
            {/* Added flex-shrink-0 */}
            <div className="w-16 h-4 bg-gray-400 rounded flex-shrink-0"></div>{" "}
            {/* Added flex-shrink-0 */}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Leaderboard() {
  const [students, setStudents] = useState<StudentType[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetch(`${baseUrl}student/latestLeaderBoard`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        // API returns a JSON array on success, or { message: string } for no access / not logged in (still 200).
        setStudents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch leaderboard data", err);
        setStudents([]);
        setLoading(false);
      });
  }, [token]);

  if (loading) return <LeaderboardSkeleton />;

  if (students.length === 0)
    return (
      <div className="text-gray-500 text-center mt-10 px-4">
        No leaderboard data available
      </div>
    );

  return (
    // Changed overflow-y-auto to overflow-auto to allow horizontal scrolling
    <div className="flex flex-col gap-2 h-[16rem] overflow-auto px-2 text-black">
      {students &&
        students.map((student) => (
          <div
            key={student.id}
            // Added min-w-max to each student div to force it to take full content width
            className="flex items-center justify-between border border-gray-300 rounded-md p-3 min-w-max"
          >
            {/* ID from API - ensuring it doesn't wrap */}
            <div className="w-8 text-sm font-medium text-center flex-shrink-0 whitespace-nowrap">
              {student.id}
            </div>

            {/* Image + Course - ensuring they don't wrap and contribute to min-width */}
            <div className="flex items-center gap-3 flex-1 flex-shrink-0">
              <img
                src={student.studentImage}
                alt="Student"
                className="w-10 h-10 rounded-full object-cover border border-gray-300 flex-shrink-0" // flex-shrink-0 here
              />
              {/* Added whitespace-nowrap to the course name div */}
              <div className="text-xs text-gray-600 whitespace-nowrap">
                {student.courseName ?? "No course"}
              </div>
            </div>

            {/* Marks + Status - ensuring they don't wrap */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {" "}
              {/* flex-shrink-0 here */}
              {student.obtainedPercentage === null ||
              student.passingPercentage === null ? (
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  No record
                </div> // Added whitespace-nowrap
              ) : (
                <>
                  <div className="text-sm whitespace-nowrap">
                    {student.obtainedPercentage}%
                  </div>{" "}
                  {/* Added whitespace-nowrap */}
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${
                      // Added whitespace-nowrap
                      student.status === "Passed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {student.status}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
