"use client";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip, Legend);

export default function Overview() {
  const [labels, setLabels] = useState<string[]>([]);
  const [CompletedData, setCompletedData] = useState<number[]>([]);
  const [missedData, setMissedData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const res = await fetch(`${baseUrl}instructor/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        const summary: Record<string, { Completed: number; Missed: number }> =
          {};

        data.monthly_classes.forEach((item: any) => {
          const month = item.month_Name;
          if (!summary[month]) summary[month] = { Completed: 0, Missed: 0 };
          summary[month].Completed += item.total_Completed_Classes;
          summary[month].Missed += item.total_Missed_Classes;
        });

        const monthOrder = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const filteredMonths = monthOrder.filter((m) => summary[m]);
        setLabels(filteredMonths);
        setCompletedData(filteredMonths.map((m) => summary[m].Completed));
        setMissedData(filteredMonths.map((m) => summary[m].Missed));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching graph data:", err);
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Completed",
        data: CompletedData,
        backgroundColor: "#8CBF3F",
        barThickness: 18,
        borderRadius: 4,
      },
      {
        label: "Missed",
        data: missedData,
        backgroundColor: "#FF888A",
        barThickness: 18,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 12,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  if (loading)
    return <div className="p-4 text-sm text-gray-500">Loading overview...</div>;

  return (
    <div className="p-4 bg-white h-[17rem] lg:h-[18rem] rounded-md">
      <div className="h-[12rem]">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
