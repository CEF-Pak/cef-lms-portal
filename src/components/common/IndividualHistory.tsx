import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";

// Interface for Class History data
interface ClassHistoryEntry {
  sr_no: number;
  id: number;
  instructor: string;
  course: string;
  date_time: string;
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
const HistorySkeleton = () => {
  return (
    <div className="overflow-x-auto border-0 p-2 sm:p-4 md:p-6">
      <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
        <thead className="text-left text-muted-foreground">
          <tr>
            {["No.", "Instructor Name", "Status", "Course", "Date Time"].map(
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
                <div className="h-4 w-6 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
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

export default function IndividualHistory() {
  const { token } = useAuth();
  const [history, setHistory] = useState<ClassHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${baseUrl}student/class-history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch individual class history");
        }

        const data = await res.json();

        const transformedData: ClassHistoryEntry[] = data.individual.map(
          (item: any) => ({
            sr_no: item.sr_no,
            id: item.id,
            instructor: item.instructor,
            course: item.course,
            date_time: item.date_time,
            status:
              item.status === "Completed" ? "Completed" : "Missed",
          })
        );
        setHistory(transformedData || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching individual history:", error);
        setError("Could not load individual class history.");
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  if (loading) {
    return <HistorySkeleton />;
  }

  if (error) {
    return <div className="p-4 text-red-600 text-center">{error}</div>;
  }

  // Filter to only show Completed or Missed
  const filteredHistory = history.filter(
    (entry) => entry.status === "Completed" || entry.status === "Missed"
  );

  return (
    <div className="overflow-x-auto border-0 p-2 sm:p-4 md:p-6">
      <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
        <thead className="text-left text-muted-foreground">
          <tr>
            {["No.", "Instructor Name", "Status", "Course", "Date Time"].map(
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
            filteredHistory.map((entry) => (
              <tr
                key={entry.id}
                className="bg-white border-b border-gray-200 last:border-b-0"
              >
                <td className="px-4 py-3 whitespace-nowrap">{entry.sr_no}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {entry.instructor}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={getStatusClasses(entry.status)}>
                    {entry.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{entry.course}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {entry.date_time}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
