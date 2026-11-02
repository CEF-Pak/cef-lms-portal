import { useState } from "react";
import { useEffect } from "react";

export default function PastClasses(pastClasses: any) {
  const [pastClass, setPastClass] = useState<any[]>([]);

  useEffect(() => {
    setPastClass(pastClasses.pastClasses);
  }, [pastClasses]);

  return (
    <div className="flex flex-col items-center gap-4 h-[24rem] overflow-y-auto">
      {pastClass && pastClass.length > 0 ? (
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
              {pastClass.map((item: any) => (
                <tr key={item.id} className="border-t border-gray-400 hover:bg-gray-200 cursor-pointer">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {item.date}, {item.time}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {item.duration}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{item.topic}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1 bg-red-500 text-white px-4 py-1 rounded-full w-max">
                      {item.status}
                    </div>
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
