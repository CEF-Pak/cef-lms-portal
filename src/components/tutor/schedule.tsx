import { useState, useEffect } from "react";
import { baseUrl } from "@/config/authConfig"; // Import auth key for token
import { useAuth } from "@/api/useAuth";
import { Calendar } from "../ui/calendar";

export default function Schedule() {
  const [attend, setAttend] = useState<any>([]);
  const [missed, setMissed] = useState<any>([]);
  const [upcoming, setUpcoming] = useState<any>([]);
  const { token } = useAuth();
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchSchedule = async () => {
      const response = await fetch(`${baseUrl}instructor/my-schedule`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setAttend(data.attend);
      setMissed(data.missed);
      setUpcoming(data.upcoming);
    };

    fetchSchedule();
  }, []);

  return (
    <div className="w-full h-full">
      <Calendar
        mode="single"
        selected={selected}
        onSelect={setSelected}
        attendClasses={attend}
        missedClasses={missed}
        upcomingClasses={upcoming}
      />
      <div className="flex justify-center gap-2 mt-2">
        <div className="flex items-center gap-1">
          <svg
            className="w-3 h-3"
            viewBox="0 0 11 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.52637 3.25L4.52637 6.25L10.0264 0.75"
              stroke="#8CBF3F"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span className="text-gray-500 text-xs">Attend Classes</span>
        </div>
        <div className="flex items-center gap-1">
          <svg
            className="w-3 h-3"
            viewBox="0 0 8 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.02637 1.5L7.02637 7.5"
              stroke="#FD3B3F"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M7.02637 1.5L1.02637 7.5"
              stroke="#FD3B3F"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <span className="text-gray-500 text-xs">Missed Classes</span>
        </div>
        <div className="flex items-center gap-1">
          <svg
            className="w-3 h-3"
            viewBox="0 0 11 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.02637 3.25L4.02637 6.25L9.52637 0.75"
              stroke="#1D407D"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span className="text-gray-500 text-xs">Upcoming Classes</span>
        </div>
      </div>
    </div>
  );
}
