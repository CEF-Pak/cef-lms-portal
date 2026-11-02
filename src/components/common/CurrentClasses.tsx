import { useEffect, useState } from "react";

export default function CurrentClasses(currentClasses: any) {
  const [classData, setClassData] = useState<any[]>([]);

  useEffect(() => {
    setClassData(currentClasses.currentClasses);
  }, [currentClasses]);

  // Function to handle joining a class via Zoom
  const handleJoinClass = (item: any) => {
    if (item.meeting_id) {
      // Create Zoom meeting URL with the meeting ID
      const zoomUrl = `https://zoom.us/j/${item.meeting_id}`;
      // Open in a new tab
      window.open(zoomUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 h-[24rem] overflow-y-auto">
      {classData && classData.length > 0 ? (
        <div className="p-4 bg-white overflow-x-auto w-full">
          <table className="w-full text-sm text-left text-gray-700 border-separate border-spacing-0">
            <thead>
              <tr className="border-b border-gray-400 bg-[#FFFFFF]">
                <th className="px-4 py-3 font-medium text-black whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    Starting At{" "}
                  </div>
                </th>
                <th className="px-4 py-3 font-medium text-black whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    Duration
                  </div>
                </th>
                <th className="px-4 py-3 font-medium text-black whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    Topic
                  </div>
                </th>
                <th className="px-4 py-3 font-medium text-black whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    Status
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {classData.map((item: any) => (
                <tr key={item.id} className="border-t border-gray-400 hover:bg-gray-200 cursor-pointer">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {item.date}, {item.time}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {item.duration}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{item.topic}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button 
                      onClick={() => handleJoinClass(item.meetingInfo)} 
                      className={`flex items-center gap-1 text-white px-4 py-1 rounded-full w-max ${
                        item.status === "Waiting" 
                          ? "bg-yellow-500" 
                          : item.status === "Join Class" 
                            ? "bg-green-600" 
                            : "bg-red-500"
                      }`}
                      disabled={item.status !== "Join Class"}
                    >
                      {item.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-lg mt-8">No Classes to show</p>
      )}
    </div>
  );
}
