import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";

interface ClassHistoryEntry {
  id: number;
  studentName: string;
  courseName: string;
  learningTool: string;
  dateTime: string;
  status: "Completed" | "Missed";
}

// 🔸 Status class helper
const getStatusClasses = (status: ClassHistoryEntry["status"]): string => {
  switch (status) {
    case "Completed":
      return "text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-medium";
    case "Missed":
      return "text-red-800 bg-red-100 px-6 py-1 rounded-full text-xs font-medium";
    default:
      return "";
  }
};

// 🔸 Date formatting helper
const formatDateTime = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", options).replace(",", "");
};

// 🔸 Skeleton component for loading state
const HistorySkeleton = () => {
  return (
    <div className="overflow-x-auto border-0 p-4">
      <table className="w-full text-sm bg-white border-collapse rounded-lg p-6">
        <thead className="text-left text-muted-foreground">
          <tr>
            {[
              "No.",
              "Student Name",
              "Status",
              "Course",
              "Learning Tool",
              "Date Time",
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
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="bg-white border-b border-gray-200">
              <td className="px-4 py-3">
                <div className="h-4 w-6 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-4 py-3">
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function IndividualHistory() {
  const [historyData, setHistoryData] = useState<ClassHistoryEntry[]>([]);
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClassHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}instructor/class-history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const rawData = response.data?.data?.individual_classes || [];

        const mappedData = rawData.map((item: any, index: number) => ({
          id: index + 1,
          studentName: item.student_name,
          courseName: item.course_title,
          learningTool: item.learning_tool.replace("_", " "),
          dateTime: formatDateTime(item.class_date_time),
          status: item.status === "Completed" ? "Completed" : "Missed",
        }));

        setHistoryData(mappedData);
      } catch (error) {
        console.error("Error fetching class history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassHistory();
  }, [token]);

  if (loading) return <HistorySkeleton />;

  // 🔸 Filter to show only Completed & Missed
  const filteredData = historyData.filter(
    (item) => item.status === "Completed" || item.status === "Missed"
  );

  return (
    <div className="overflow-x-auto border-0 p-4">
      <table className="table-auto w-full text-sm bg-white border-collapse rounded-lg p-6">
        <thead className="text-left text-muted-foreground">
          <tr>
            {[
              "No.",
              "Student Name",
              "Status",
              "Course",
              "Learning Tool",
              "Date Time",
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
          {filteredData.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-6 text-center text-gray-500 text-sm"
              >
                No Data to show for now
              </td>
            </tr>
          ) : (
            filteredData.map((history) => (
              <tr
                key={history.id}
                className="bg-white border-b border-gray-200"
              >
                <td className="px-4 py-3">{history.id}</td>
                <td className="px-4 py-3">{history.studentName}</td>
                <td className="px-4 py-3">
                  <span className={getStatusClasses(history.status)}>
                    {history.status}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ minWidth: "12rem" }}>
                  {history.courseName}
                </td>
                <td className="px-4 py-3">{history.learningTool}</td>
                <td className="px-4 py-3">{history.dateTime}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
