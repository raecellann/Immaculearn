// DashboardCharts.jsx
// Usage: npm install chart.js react-chartjs-2
// Then import and use <DashboardCharts students={students} teachers={teachers} /> in AdminDashboard

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/* ─────────────────────────────────────────────
   THEME
───────────────────────────────────────────── */
const THEME = {
  bg: "#1E242E",
  card: "#2E3440",
  border: "#3B4457",
  text: "#FFFFFF",
  muted: "#9CA3AF",
  blue: "#3B82F6",
  green: "#10B981",
  indigo: "#6366F1",
  teal: "#14B8A6",
  amber: "#F59E0B",
  rose: "#F43F5E",
  purple: "#A855F7",
  orange: "#F97316",
};

const PALETTE = [
  THEME.blue,
  THEME.green,
  THEME.indigo,
  THEME.teal,
  THEME.amber,
  THEME.rose,
  THEME.purple,
  THEME.orange,
];

const baseTooltip = {
  backgroundColor: "#2E3440",
  borderColor: "#3B4457",
  borderWidth: 1,
  titleColor: "#FFFFFF",
  bodyColor: "#9CA3AF",
  padding: 10,
  cornerRadius: 8,
};

const baseGrid = {
  color: "rgba(59,68,87,0.4)",
  drawBorder: false,
};

const baseTick = { color: THEME.muted, font: { size: 11 } };

/* ─────────────────────────────────────────────
   WRAPPER: ChartCard
───────────────────────────────────────────── */
const ChartCard = ({ title, children }) => (
  <div className="bg-[#1E242E] rounded-xl p-5 sm:p-6 h-full">
    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
      {title}
    </h3>
    {children}
  </div>
);

/* ─────────────────────────────────────────────
   1. GENDER DISTRIBUTION — Doughnut
───────────────────────────────────────────── */
export const GenderChart = ({ students = [], teachers = [] }) => {
  const data = useMemo(() => {
    const count = (arr, val) =>
      arr.filter((x) => x.gender?.toLowerCase() === val).length;
    return {
      labels: ["Male Students", "Female Students", "Male Teachers", "Female Teachers"],
      datasets: [
        {
          data: [
            count(students, "male"),
            count(students, "female"),
            count(teachers, "male"),
            count(teachers, "female"),
          ],
          backgroundColor: [THEME.blue, THEME.green, THEME.indigo, THEME.teal],
          borderColor: THEME.bg,
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    };
  }, [students, teachers]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: THEME.muted,
          padding: 16,
          font: { size: 11 },
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: { ...baseTooltip },
    },
  };

  return (
    <ChartCard title="Gender Distribution">
      <div style={{ height: 260 }}>
        <Doughnut data={data} options={options} />
      </div>
    </ChartCard>
  );
};

/* ─────────────────────────────────────────────
   2. STUDENTS BY YEAR LEVEL — Horizontal Bar
───────────────────────────────────────────── */
export const YearLevelChart = ({ students = [] }) => {
  const data = useMemo(() => {
    const yearMap = {};
    students.forEach((s) => {
      const key = s.yearLevel || "Unknown";
      yearMap[key] = (yearMap[key] || 0) + 1;
    });
    const labels = Object.keys(yearMap);
    const values = Object.values(yearMap);
    return {
      labels,
      datasets: [
        {
          label: "Students",
          data: values,
          backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [students]);

  const options = {
    indexAxis: "y", // ← horizontal bar
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { ...baseTooltip },
    },
    scales: {
      x: {
        grid: baseGrid,
        ticks: { ...baseTick, stepSize: 1 },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: { ...baseTick },
        border: { color: THEME.border },
      },
    },
  };

  return (
    <ChartCard title="Students by Year Level">
      <div style={{ height: 260 }}>
        <Bar data={data} options={options} />
      </div>
    </ChartCard>
  );
};

/* ─────────────────────────────────────────────
   4. GROWTH OVERVIEW LINE — inner (flex-fills)
───────────────────────────────────────────── */
const OverviewLineChartInner = ({ students = [], teachers = [] }) => {
  const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];

  const mockStudentTrend = [
    Math.round(students.length * 0.5),
    Math.round(students.length * 0.62),
    Math.round(students.length * 0.71),
    Math.round(students.length * 0.83),
    Math.round(students.length * 0.93),
    students.length,
  ];

  const mockTeacherTrend = [
    Math.round(teachers.length * 0.7),
    Math.round(teachers.length * 0.75),
    Math.round(teachers.length * 0.82),
    Math.round(teachers.length * 0.88),
    Math.round(teachers.length * 0.95),
    teachers.length,
  ];

  const data = {
    labels: months,
    datasets: [
      {
        label: "Students",
        data: mockStudentTrend,
        borderColor: THEME.green,
        backgroundColor: "rgba(16,185,129,0.08)",
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: THEME.green,
        pointBorderColor: THEME.bg,
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: "Teachers",
        data: mockTeacherTrend,
        borderColor: THEME.blue,
        backgroundColor: "rgba(59,130,246,0.08)",
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: THEME.blue,
        pointBorderColor: THEME.bg,
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          color: THEME.muted,
          font: { size: 11 },
          usePointStyle: true,
          pointStyleWidth: 8,
          padding: 16,
        },
      },
      tooltip: { ...baseTooltip },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { ...baseTick },
        border: { color: THEME.border },
      },
      y: {
        grid: baseGrid,
        ticks: { ...baseTick },
        border: { display: false },
      },
    },
  };

  return <Line data={data} options={options} />;
};

/* ─────────────────────────────────────────────
   5. COURSES DISTRIBUTION — Pie Chart
───────────────────────────────────────────── */
export const CoursesChart = ({ students = [] }) => {
  const data = useMemo(() => {
    const courseMap = {};
    students.forEach((s) => {
      const courseCode = s.courseCode || "Unknown";
      courseMap[courseCode] = (courseMap[courseCode] || 0) + 1;
    });

    const labels = Object.keys(courseMap);
    const values = Object.values(courseMap);

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
          borderColor: THEME.bg,
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    };
  }, [students]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: THEME.muted,
          padding: 10,
          font: { size: 10 },
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        ...baseTooltip,
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = ((ctx.parsed / total) * 100).toFixed(1);
            return `  ${ctx.label}: ${ctx.parsed} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <ChartCard title="Courses Distribution">
      <div style={{ height: 260 }}>
        <Pie data={data} options={options} />
      </div>
    </ChartCard>
  );
};

/* ─────────────────────────────────────────────
   MAIN EXPORT: DashboardCharts

   Layout (3-column grid):
   ┌─────────────────────────┬─────────────────┐
   │  Growth Overview (×2)   │  Gender (×1)    │  ← Row 1
   ├─────────────────────────┼─────────────────┤
   │  Year Level H-Bar (×2)  │  Courses Pie(×1)│  ← Row 2 (same col widths)
   └─────────────────────────┴─────────────────┘
───────────────────────────────────────────── */
const DashboardCharts = ({ students = [], teachers = [] }) => (
  <div className="w-full mb-6 space-y-6">

    {/* ROW 1: Growth Overview (col-2) + Gender (col-1) */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      <div className="lg:col-span-2 flex flex-col">
        <div className="bg-[#1E242E] rounded-xl p-5 sm:p-6 flex flex-col flex-1" style={{ minHeight: 340 }}>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Growth Overview (Current Term)
          </h3>
          <div className="flex-1 min-h-0">
            <OverviewLineChartInner students={students} teachers={teachers} />
          </div>
        </div>
      </div>
      <div className="lg:col-span-1">
        <GenderChart students={students} teachers={teachers} />
      </div>
    </div>

    {/* ROW 2: Year Level H-Bar (col-2) + Courses Pie (col-1) — same widths as Row 1 */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      <div className="lg:col-span-2">
        <YearLevelChart students={students} />
      </div>
      <div className="lg:col-span-1">
        <CoursesChart students={students} />
      </div>
    </div>

  </div>
);

export default DashboardCharts;