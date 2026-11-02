import { EyeIcon } from "lucide-react";
import { Button } from "../ui/button";

export default function Assignments({
  assignments,
  setAssignmentId,
}: {
  assignments: any;
  setAssignmentId: (assignmentId: number) => void;
  courseId: number;
}) {
  return (
    <div className="bg-white overflow-x-auto">
      {assignments && assignments.length > 0 ? (
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-white text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium whitespace-nowrap">
                <div className="flex items-center gap-1 text-black">Topic</div>
              </th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">
                <div className="flex items-center gap-1 text-black">
                  Total Marks
                </div>
              </th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">
                <div className="flex items-center gap-1 text-black">Status</div>
              </th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">
                <div className="flex items-center gap-1 text-black">Result</div>
              </th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">
                <div className="flex items-center gap-1 text-black">Notes</div>
              </th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">
                <div className="flex items-center gap-1 text-black">Action</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {assignments &&
              assignments.length > 0 &&
              assignments.map((assignment: any) => (
                <tr
                  className="border-y border-gray-300 hover:bg-gray-200 cursor-pointer"
                  key={assignment.assignment_id}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {assignment.assignment_topic}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {assignment.assignment_total_marks}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {assignment.assignment_status_text}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {assignment.student_marks
                      ? assignment.student_marks
                      : "Pending"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {assignment.notes}
                  </td>
                  <td className="px-4 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group"
                      onClick={() => {
                        setAssignmentId(assignment.assignment_id);
                      }}
                    >
                      <EyeIcon
                        size={20}
                        className="size-5 text-gray-400 group-hover:text-secondary"
                      />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <div>No assignments found</div>
      )}
    </div>
  );
}
