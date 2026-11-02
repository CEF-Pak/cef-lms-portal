import { Loader2 } from "lucide-react";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";
import { useState } from "react";

type AssignmentDetail = {
  assignment_id: number;
  assignment_topic: string;
  marks: number;
  your_submitted_file: string;
  your_submitted_file_name: string;
  assignment_file: string;
  assignment_file_name: string;
  assignment_description: string;
  result?: {
    obtained_marks: number;
  };
};

export default function AssignmentDetail({
  assignmentDetail,
  courseId,
  setAssignmentDetail,
  setShowResult,
}: {
  courseId: string;
  assignmentDetail: AssignmentDetail;
  showResult: boolean;
  setAssignmentDetail: React.Dispatch<
    React.SetStateAction<AssignmentDetail | null>
  >;
  setShowResult: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<
    Record<number, File | null>
  >({});
  const { token } = useAuth();

  const handleSubmitAssignment = (assignmentId: number) => {
    setIsLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const formdata = new FormData();
    formdata.append("course_id", courseId || "");
    formdata.append("assignment_id", assignmentId.toString());
    formdata.append("file", selectedFiles[assignmentId] || "");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow" as RequestRedirect,
    };

    fetch(`${baseUrl}student/course/submit-assignment-store`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        setIsLoading(false);
        setSelectedFiles({});
        setShowResult(false);

        // Refresh assignment detail data after submission
        const detailHeaders = new Headers();
        detailHeaders.append("Authorization", `Bearer ${token}`);

        const detailFormdata = new FormData();
        detailFormdata.append("assignment_id", assignmentId.toString());

        fetch(`${baseUrl}student/course/assignment-detail`, {
          method: "POST",
          headers: detailHeaders,
          body: detailFormdata,
          redirect: "follow" as RequestRedirect,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.assignment_id) {
              setAssignmentDetail(data);
            }
          })
          .catch((error) =>
            console.error("Error refreshing assignment detail:", error)
          );
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  };

  return (
    <div className="w-full mb-6 border border-gray-200 p-6 bg-gray-200 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">
        {assignmentDetail.assignment_topic}
      </h3>

      <div className="mb-6">
        <p className="text-gray-700 whitespace-pre-wrap">
          {assignmentDetail?.assignment_description}
        </p>
      </div>

      {/* Changed grid layout for responsiveness */}
      <div className="flex flex-wrap gap-4 mb-6 md:grid md:grid-cols-6 md:gap-4 overflow-x-auto">
        <div
          className={`bg-gray-50 p-4 rounded-lg flex-shrink-0 min-w-[150px] ${assignmentDetail.your_submitted_file ? "md:col-span-1" : "md:col-span-2"}`}
        >
          <p className="text-sm text-gray-500">Total Marks</p>
          <p className="text-lg font-medium">{assignmentDetail.marks}</p>
        </div>
        <div
          className={`bg-gray-50 p-4 rounded-lg flex-shrink-0 min-w-[150px] ${assignmentDetail.your_submitted_file ? "md:col-span-1" : "md:col-span-2"}`}
        >
          <p className="text-sm text-gray-500">Status</p>
          <p className="text-lg font-medium">
            {assignmentDetail.your_submitted_file
              ? "Submitted"
              : "Not Submitted"}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg flex-shrink-0 min-w-[250px] md:col-span-2">
          <h4 className="text-sm text-gray-500">Assignment File</h4>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500 flex-shrink-0"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="flex-1 truncate whitespace-nowrap">
              {assignmentDetail.assignment_file_name}
            </span>
            <a
              href={assignmentDetail.assignment_file}
              target="_blank"
              download={assignmentDetail.assignment_file_name}
              rel="noopener noreferrer"
              className="px-3 py-2 bg-secondary text-white text-sm rounded-md hover:secondary flex-shrink-0 whitespace-nowrap"
            >
              View
            </a>
          </div>
        </div>
        {assignmentDetail.your_submitted_file ? (
          <div className="p-4 bg-gray-50 rounded-lg flex-shrink-0 min-w-[250px] md:col-span-2">
            <h4 className="text-sm text-gray-500">Your Submission</h4>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500 flex-shrink-0"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="flex-1 truncate whitespace-nowrap">
                {assignmentDetail.your_submitted_file_name}
              </span>
              <a
                href={assignmentDetail.your_submitted_file}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-secondary text-white text-sm rounded-md hover:secondary flex-shrink-0 whitespace-nowrap"
              >
                View
              </a>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg mb-6 flex-grow col-span-6">
            {" "}
            {/* Use flex-grow for full width on mobile */}
            <h4 className="font-medium mb-2">Submit Your Assignment</h4>
            <form
              className="space-y-4 flex flex-col items-end"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitAssignment(assignmentDetail.assignment_id);
              }}
            >
              <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto text-gray-400 mb-2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop your file here or
                </p>
                <label className="px-4 py-2 bg-secondary text-white text-sm rounded-md hover:secondary cursor-pointer whitespace-nowrap">
                  Browse Files
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.zip"
                    required
                    onChange={(e) => {
                      setSelectedFiles({
                        [assignmentDetail.assignment_id]:
                          e.target.files?.[0] || null,
                      });
                      const fileName = e.target.files?.[0]?.name;
                      if (fileName) {
                        const fileNameElement =
                          document.getElementById("selectedFileName");
                        if (fileNameElement)
                          fileNameElement.textContent = fileName;
                      }
                    }}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-4">
                  Supported formats: PDF, ZIP
                  <br />
                  <span id="selectedFileName" className="font-medium"></span>
                </p>
              </div>
              <button
                type="submit"
                className="w-max px-4 py-2 bg-secondary ms-auto text-white rounded-md hover:bg-secondary cursor-pointer whitespace-nowrap"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Submit"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
