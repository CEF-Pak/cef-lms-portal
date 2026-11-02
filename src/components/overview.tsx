import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const generateLast6Months = () => {
  const months = [];
  const currentMonth = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(currentMonth);
    month.setMonth(currentMonth.getMonth() - i);
    months.push(month.toLocaleString("default", { month: "short" }));
  }
  return months;
};

const Overview = () => {
  const [isWeekly] = useState(false);
  const { token } = useAuth();
  const last6Months = generateLast6Months();
  const [monthlyData, setMonthlyData] = useState({
    labels: last6Months,
    datasets: [
      {
        label: "Attended",
        data: [15, 5, 18, 12, 20, 14],
        backgroundColor: "#8CBF3F", // updated green
        stack: "stack1",
        barThickness: 30,
      },
      {
        label: "Missed",
        data: [2, 3, 1, 4, 2, 3],
        backgroundColor: "#FF888A", // updated red
        stack: "stack1",
        barThickness: 30,
      },
    ],
  });

  const weeklyData = {
    labels: ["M", "T", "W", "T", "F", "S", "S"],
    datasets: [
      {
        label: "Attended",
        data: [2, 1, 3, 2, 4, 3, 2],
        backgroundColor: "#8CBF3F", // updated green
        stack: "stack1",
        barThickness: 30,
      },
      {
        label: "Missed",
        data: [0, 1, 0, 1, 0, 0, 1],
        backgroundColor: "#FF888A", // updated red
        stack: "stack1",
        barThickness: 30,
      },
    ],
  };

  useEffect(() => {
    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Accept-Language", "en");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow" as RequestRedirect,
    };

    fetch(`${baseUrl}student/monthlyClasses`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (Array.isArray(result)) {
          const labels = result.map((item) => item.month_Name);
          const attendedData = result.map(
            (item) => item.total_Completed_Classes
          );
          const missedData = result.map((item) => item.total_Missed_Classes);

          setMonthlyData({
            labels,
            datasets: [
              {
                label: "Attended",
                data: attendedData,
                backgroundColor: "#8CBF3F",
                stack: "stack1",
                barThickness: 40,
              },
              {
                label: "Missed",
                data: missedData,
                backgroundColor: "#FF888A",
                stack: "stack1",
                barThickness: 40,
              },
            ],
          });
        }
      })
      .catch((error) => console.error(error));
  }, [token]);

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          stepSize: 5,
        },
      },
    },
  };

  const chartData = isWeekly ? weeklyData : monthlyData;

  return (
    <div className="bg-white h-[16rem] md:h-[14rem] sm:h-[12rem] flex flex-col gap-4 overflow-hidden">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 md:w-3 md:h-3 sm:w-3 sm:h-3 rounded-full"
              style={{ backgroundColor: "#8CBF3F" }}
            ></div>
            <span className="text-sm md:text-xs sm:text-xs">Attended</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 md:w-3 md:h-3 sm:w-3 sm:h-3 rounded-full"
              style={{ backgroundColor: "#FF888A" }}
            ></div>
            <span className="text-sm md:text-xs sm:text-xs">Missed</span>
          </div>
        </div>
      </div>
      <div className="h-[14rem] md:h-[12rem] sm:h-[10rem] w-full relative flex items-center justify-center">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default Overview;
