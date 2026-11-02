import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";
import {
  ClockIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  Loader2Icon,
} from "lucide-react";

interface QuizDetailType {
  lecture_id: number;
  quiz_id: number;
  quiz_uuid: string;
  course_uuid: string;
  question_uuid: string;
  take_exam_id: number;
  quiz_name: string;
  current_question_no: number;
  total_questions: number;
  quiz_attempt_progress: string;
  time_remaining: string;
  total_time: string;
  question: {
    question_id: number;
    question_uuid: string;
    question_name: string;
    question_options: {
      option_id: number;
      option_uuid: string;
      option_name: string;
    }[];
  };
  quiz_result?: {
    total_marks?: number;
    obtained_marks?: number;
    passing_marks?: number;
    is_passed?: boolean;
  };
  quizID?: number;
  quizName?: string;
  TotalScore?: number;
  YourScore?: number;
  action_api_routes?: {
    back?: string;
    leaderboard?: string;
  };
  examQuestions?: Array<{
    id: number;
    name: string;
    options: Array<{
      id: number;
      name: string;
      answer_class: string;
    }>;
  }>;
}

export default function QuizDetail({
  quizDetail,
  setQuizDetail,
}: {
  quizDetail: QuizDetailType;
  setQuizDetail: (quizDetail: QuizDetailType | null) => void;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>(
    quizDetail?.time_remaining || "00:55:00"
  );
  const [timeIsUp, setTimeIsUp] = useState<boolean>(false);
  const [quizFailed, setQuizFailed] = useState<boolean>(false);
  const [failData, setFailData] = useState<{
    obtained: number;
    passing: number;
    message: string;
  } | null>(null);

  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { token } = useAuth();

  const parseTimeToSeconds = (timeStr: string): number => {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatSecondsToTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours == 0 && minutes == 0 && seconds == 0) {
      return "00:00:00";
    } else {
      return [
        hours.toString().padStart(2, "0"),
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0"),
      ].join(":");
    }
  };

  useEffect(() => {
    if (quizDetail?.time_remaining) {
      setTimeRemaining(quizDetail.time_remaining);
      setTimeIsUp(false);
    }

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        const seconds = parseTimeToSeconds(prevTime) - 1;

        if (seconds <= 0) {
          clearInterval(timer);
          if (selectedAnswer) {
            handleSubmitAnswer();
          } else {
            setTimeIsUp(true);
          }
          return "00:00:00";
        }

        return formatSecondsToTime(seconds);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizDetail]);

  const handleAnswerSelect = (optionId: string) => {
    setSelectedAnswer(optionId);
  };

  const handleSubmitAnswer = () => {
    setIsLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const formdata = new FormData();
    formdata.append("question_uuid", quizDetail?.question?.question_uuid || "");
    formdata.append("take_exam_id", quizDetail?.take_exam_id?.toString());
    formdata.append("selected_option_uuid", selectedAnswer || "");
    formdata.append("lecture_id", quizDetail?.lecture_id?.toString() || "");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch(
      `${baseUrl}student/course/submit-quiz-answer`,
      requestOptions as RequestInit
    )
      .then((response) => response.json())
      .then((result) => {
        if (result.status == 200) {
          if (result.message?.includes("Re Attempt")) {
            setQuizFailed(true);
            setFailData({
              obtained: result.obtained_percentage,
              passing: result.passing_percentage,
              message: result.message,
            });
            setIsLoading(false);
            return;
          }
          if (quizDetail?.current_question_no === quizDetail?.total_questions) {
            setQuizCompleted(true);
          }
          setQuizDetail(result.data);

          if (result.data?.quiz_result || result.data?.examQuestions) {
            setQuizCompleted(true);
          }
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  };

  if (quizFailed && failData) {
    return (
      <div className="bg-gray-100 p-8 rounded-md shadow-sm mb-6 flex flex-col items-center justify-center">
        <AlertCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Failed</h2>
        <p className="text-gray-600 mb-4 text-center px-4 md:px-6 lg:px-8 xl:px-10">
          {failData.message}
        </p>

        <div className="mb-6">
          <p className="text-md font-medium">
            Your Score:{" "}
            <span className="font-bold text-red-600">{failData.obtained}%</span>
          </p>
          <p className="text-md font-medium">
            Passing Score:{" "}
            <span className="font-bold">{failData.passing}%</span>
          </p>
        </div>

        {/* <Button
          variant="primary"
          onClick={() => window.location.reload()} // or trigger reset API if available
        >
          Retry Quiz
        </Button> */}
      </div>
    );
  }

  if (quizCompleted || quizDetail?.quiz_result || quizDetail?.examQuestions) {
    return (
      <div className="bg-gray-100 p-8 rounded-md shadow-sm mb-6 flex flex-col items-center justify-center">
        <div className="w-full">
          <div className="text-center mb-8">
            <CheckCircle2Icon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Quiz Completed!
            </h2>
            <p className="text-gray-600 mb-6">
              You have successfully completed the quiz.
            </p>
          </div>

          <div className="w-full mb-8">
            <h3 className="text-lg font-bold mb-2">
              {quizDetail?.quizName || quizDetail?.quiz_name} (Your Result)
            </h3>

            <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-4">
              <div>
                <span className="text-md font-medium">Total Score: </span>
                <span className="text-md font-bold">
                  {quizDetail?.TotalScore ||
                    quizDetail?.quiz_result?.total_marks}
                </span>
              </div>
              <div>
                <span className="text-md font-medium">Your Score: </span>
                <span className="text-md font-bold">
                  {quizDetail?.YourScore ||
                    quizDetail?.quiz_result?.obtained_marks}
                </span>
              </div>
            </div>

            {quizDetail?.examQuestions && (
              <div className="space-y-6">
                {quizDetail.examQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <h4 className="text-md font-medium mb-2">
                      {question.name}
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="mb-1">
                        <span className="text-sm font-medium text-gray-600">
                          Correct Answer:{" "}
                        </span>
                        <span className="text-sm text-green-600">
                          {
                            question.options.find(
                              (opt) =>
                                opt.answer_class === "given-answer-right" ||
                                opt.answer_class === "original-correct-answer"
                            )?.name
                          }
                        </span>
                      </div>
                      <div className="mb-1">
                        <span className="text-sm font-medium text-gray-600">
                          Your Answer:{" "}
                        </span>
                        <span className="text-sm">
                          {
                            question.options.find(
                              (opt) =>
                                opt.answer_class === "given-answer-right" ||
                                opt.answer_class === "given-answer-wrong"
                            )?.name
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {quizDetail?.quiz_result && !quizDetail?.examQuestions && (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Score</p>
                    <p className="text-xl font-medium">
                      {quizDetail.quiz_result.obtained_marks} /{" "}
                      {quizDetail.quiz_result.total_marks}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Status</p>
                    <p
                      className={`text-xl font-medium ${quizDetail.quiz_result.is_passed ? "text-green-600" : "text-red-600"}`}
                    >
                      {quizDetail.quiz_result.is_passed ? "Passed" : "Failed"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded mb-4">
                  <p className="text-sm text-gray-500">Passing Score</p>
                  <p className="text-lg">
                    {quizDetail.quiz_result.passing_marks} points
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (timeIsUp) {
    return (
      <div className="bg-gray-100 p-8 rounded-md shadow-sm mb-6 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <AlertCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Time's Up!</h2>
          <p className="text-gray-600 mb-6">
            Your time for this quiz has expired.
          </p>
          <div className="flex items-center justify-center gap-2 text-red-500 mb-6">
            <ClockIcon className="h-5 w-5" />
            <span className="font-semibold">00:00:00</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 rounded-md shadow-sm mb-6">
      <h1 className="text-2xl font-bold text-secondary mb-2">
        {quizDetail?.quiz_name}
      </h1>

      {/* Progress information */}
      <div className="mb-4 text-gray-600">
        <div className="flex justify-between mb-1">
          <span>
            Question {quizDetail?.current_question_no || 1} of{" "}
            {quizDetail?.total_questions || 5}
          </span>
          <span>
            Time remaining: {timeRemaining} of{" "}
            {quizDetail?.total_time || "00:55:00"}
          </span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="bg-secondary h-2 rounded-full"
            style={{ width: `${quizDetail?.quiz_attempt_progress || "20%"}` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6 mt-12 flex flex-col">
        <h2 className="text-md font-semibold mb-4">
          {quizDetail?.question?.question_name}
        </h2>
        {
          <div className="space-y-3 ms-4">
            {quizDetail?.question?.question_options &&
              quizDetail.question.question_options.map((option) => (
                <div key={option.option_uuid} className="flex items-center">
                  <input
                    type="radio"
                    id={`option-${option.option_uuid}`}
                    name="quiz-option"
                    className="mr-3 h-4 w-4 cursor-pointer"
                    checked={selectedAnswer === option.option_uuid}
                    onChange={() => handleAnswerSelect(option.option_uuid)}
                  />
                  <label
                    htmlFor={`option-${option.option_uuid}`}
                    className="text-gray-700 text-sm"
                  >
                    {option.option_name}
                  </label>
                </div>
              ))}
          </div>
        }
        <Button
          variant="primary"
          className="w-28 mt-8"
          onClick={() => handleSubmitAnswer()}
          disabled={!selectedAnswer || isLoading}
        >
          {isLoading ? (
            <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
          ) : quizDetail?.current_question_no == quizDetail?.total_questions ? (
            "Submit"
          ) : (
            "Next"
          )}
        </Button>
      </div>
    </div>
  );
}
