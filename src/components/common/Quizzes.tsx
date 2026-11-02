import { Button } from "../ui/button";

type Quiz = {
  quiz_id: number;
  quiz_name: string;
  quiz_type: string;
  quiz_uuid: string;
  time_duration: number;
  status_number: number;
  total_questions: number;
  status_text: string;
};

export default function Quizzes({ quizzes, setQuizId }: { quizzes?: Quiz[], setQuizId: (quizId: string) => void }) {

  return (
    <div className="bg-white overflow-x-auto">
      {quizzes && quizzes.length > 0 ? (
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="bg-white text-gray-600 border-b border-gray-400">
          <tr>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              <div className="flex items-center gap-1 text-black">
                Name
              </div>
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              <div className="flex items-center gap-1 text-black">
                Type
              </div>
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              <div className="flex items-center gap-1 text-black">
                Total Questions
              </div>
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              <div className="flex items-center gap-1 text-black">
                Time Duration
              </div>
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              <div className="flex items-center gap-1 text-black">
                Result
              </div>
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              <div className="flex items-center gap-1 text-black">
                Action
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {quizzes && quizzes.length > 0 && quizzes.map((quiz: Quiz) => (
            <tr className="border-y border-gray-300 hover:bg-gray-200 cursor-pointer" key={quiz.quiz_id}>
              <td className="px-4 py-3 whitespace-nowrap">{quiz.quiz_name}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {quiz.quiz_type}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {quiz.total_questions}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {quiz.time_duration}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {quiz.status_text}
              </td>
              <td className="px-4 whitespace-nowrap">
                <Button variant="primary" size="sm" className="group !w-24" onClick={() => {
                  setQuizId(quiz.quiz_uuid);
                }}>
                  {quiz.status_number === 3 ? 
                  "View Result" : quiz.status_number === 2 ? "Retry" : "Start Quiz"
                  }
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div>No quizzes found</div>
    )}
    </div>
  );
}
