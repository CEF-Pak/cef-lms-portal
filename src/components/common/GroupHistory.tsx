import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";
import axios from "axios";

// Interface for Class History data
interface ClassHistoryEntry {
  id: number;
  instructor: string;
  courseName: string;
  dateTime: string;
  status: "Completed" | "Missed";
}

// Helper for status styling
const getStatusClasses = (status: ClassHistoryEntry["status"]): string => {
  switch (status) {
    case "Completed":
      return "text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
    case "Missed":
      return "text-red-800 bg-red-100 px-6 py-1 rounded-full text-xs font-medium whitespace-nowrap";
    default:
      return "";
  }
};

// Skeleton component for loading state
const GroupHistorySkeleton = () => {
  return (
    <div className="overflow-x-auto border-0 p-2 sm:p-4 md:p-6">
      <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
        <thead className="text-left text-muted-foreground">
          <tr>
            {["No.", "Student Name", "Status", "Course", "Date Time"].map(
              (header) => (
                <th
                  key={header}
                  className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
                >
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    {header !== "Status" && (
                      <ArrowDown className="size-4 text-gray-400" />
                    )}
                  </div>
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="bg-white border-b border-gray-200">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-4 w-8 bg-gray-200 rounded animate-pulse " />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse " />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse " />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse " />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function GroupHistory() {
  const { token } = useAuth();
  const [classHistory, setClassHistory] = useState<ClassHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${baseUrl}student/class-history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const groupData = res.data.group || [];

        const transformed: ClassHistoryEntry[] = groupData.map((item: any) => ({
          id: item.sr_no,
          instructor: item.instructor,
          courseName: item.course,
          dateTime: item.date_time,
          status: item.status === "Completed" ? "Completed" : "Missed",
        }));

        setClassHistory(transformed);
      } catch (error) {
        console.error("Failed to fetch group history", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  if (isLoading) {
    return <GroupHistorySkeleton />;
  }

  // Filter to only Completed or Missed
  const filteredHistory = classHistory.filter(
    (entry) => entry.status === "Completed" || entry.status === "Missed"
  );

  return (
    <div className="overflow-x-auto border-0 p-2 sm:p-4 md:p-6">
      <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
        <thead className="text-left text-muted-foreground">
          <tr>
            {["No.", "Student Name", "Status", "Course", "Date Time"].map(
              (header) => (
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
              )
            )}
          </tr>
        </thead>
        <tbody>
          {filteredHistory.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-6 text-center text-gray-500 text-sm"
              >
                No Completed or Missed classes yet.
              </td>
            </tr>
          ) : (
            filteredHistory.map((history) => (
              <tr
                key={history.id}
                className="bg-white border-b border-gray-200 last:border-b-0"
              >
                <td className="px-4 py-3 whitespace-nowrap">{history.id}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {history.instructor}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={getStatusClasses(history.status)}>
                    {history.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {history.courseName}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {history.dateTime}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
