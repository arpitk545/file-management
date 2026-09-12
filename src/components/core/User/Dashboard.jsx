"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../ui/card";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlayCircle,
  Gamepad2,
  Sparkles,
  FolderOpen,
  User,
  Settings,
  LogOut,
  Brain,
  Trophy,
  BookOpenIcon,
  Newspaper,
  Upload,
  ChevronDown,
  ChevronUp,
  FilePlus,
  FolderSearch,
  NewspaperIcon,
  ListOrdered,
  Medal,
  UserCheck,
  PlusCircle,
  PlusCircleIcon,
  ScanEyeIcon,
  PuzzleIcon,
  FilePenLineIcon,
  PenTool,
  BookOpen,
  ListCheck,
  PanelLeftClose,
  PanelRightClose,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { getQuizSubmission } from "../../../services/operations/quizAPI";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function UserDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("userSidebarCollapsed");
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [expandedItem, setExpandedItem] = useState(() => {
    return localStorage.getItem("userExpandedItem") || null;
  });

  const [quizResults, setQuizResults] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchRealScores = async () => {
      try {
        const res = await getQuizSubmission();
        const results = Array.isArray(res?.result)
          ? res.result
          : res?.result
          ? [res.result]
          : [];
        if (isMounted) {
          setQuizResults(results);
        }
      } catch (err) {
        console.warn("Could not load real quiz submissions:", err);
      }
    };
    fetchRealScores();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSidebarCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("userSidebarCollapsed", JSON.stringify(newState));
  };
  const navigate = useNavigate();

  const sidebarItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      id: "dashboard",
      path: "/dashboard",
      iconColor: "text-slate-800",
    },
    {
      icon: User,
      label: "Profile",
      id: "profile",
      path: "/profile",
      iconColor: "text-blue-600",
      subItems: [
        { icon: PlusCircle, label: "Create Profile", path: "/create-profile", iconColor: "text-blue-500" },
        { icon: UserCheck, label: "View Profile", path: "/profile", iconColor: "text-blue-500" },
      ],
    },
    {
      icon: NewspaperIcon,
      label: "Posts",
      id: "post",
      iconColor: "text-indigo-600",
      subItems: [
        { icon: ListOrdered, label: "View All Posts", path: "/user-all-post-view", iconColor: "text-indigo-500" },
      ],
    },
    {
      icon: Upload,
      label: "Upload file",
      id: "upload",
      iconColor: "text-teal-600",
      subItems: [
        { icon: FilePlus, label: "Upload New File", path: "/user-upload-file", iconColor: "text-teal-500" },
        { icon: FolderSearch, label: "View Your Files", path: "/filter-user-file", iconColor: "text-teal-500" },
        { icon: FolderOpen, label: "View Uploaded Files", path: "/file-view", iconColor: "text-teal-500" },
      ],
    },
    {
      icon: PenTool,
      label: "Create Contest",
      id: "contestsection",
      iconColor: "text-pink-600",
      subItems: [
        { icon: FilePenLineIcon, label: "Create Contest", path: "/build-contest", iconColor: "text-pink-500" },
      ],
    },
    {
      icon: Trophy,
      label: "Contest Section",
      id: "contest",
      iconColor: "text-amber-600",
      subItems: [
        { icon: Medal, label: "Enroll Contests", path: "/Contest-Details", iconColor: "text-amber-500" },
      ],
    },
    {
      icon: PuzzleIcon,
      label: "Create Quiz",
      id: "quiz",
      iconColor: "text-purple-600",
      subItems: [
        { icon: PlusCircleIcon, label: "Create Quiz", path: "/build-quiz", iconColor: "text-purple-500" },
        { icon: ScanEyeIcon, label: "View Your Quizzes", path: "/filter-user-quiz", iconColor: "text-purple-500" },
      ],
    },
    {
      icon: Gamepad2,
      label: "Play Quiz",
      id: "play-quiz",
      iconColor: "text-sky-600",
      subItems: [
        { icon: PlayCircle, label: "Play Quiz", path: "/view-user-quiz", iconColor: "text-sky-500" },
        { icon: Sparkles, label: "Play AI Quiz", path: "/create-quiz", iconColor: "text-sky-500" },
      ],
    },
    {
      icon: BookOpen,
      label: "Q & A Page",
      id: "q-and-a-page",
      iconColor: "text-emerald-600",
      subItems: [
        { icon: Upload, label: "Upload Q & A", path: "/upload-q-and-a", iconColor: "text-emerald-500" },
        { icon: ListCheck, label: "View All Q & A", path: "/view-all-q-and-a", iconColor: "text-emerald-500" },
        { icon: User, label: "View Your Q & A", path: "/view-your-q-and-a", iconColor: "text-emerald-500" },
      ],
    },
    { icon: Settings, label: "Settings", id: "settings", path: "/settings", iconColor: "text-slate-600" },
    { icon: LogOut, label: "Logout", id: "logout", path: "/logout", iconColor: "text-red-600" },
  ];

  // Colors replaced strictly from DESIGN-miro.md
  const dashboardCards = [
    {
      icon: Brain,
      title: "Play AI Quiz",
      description: "Design custom quizzes to test your knowledge.",
      buttonText: "Play Quiz",
      iconBg: "bg-[#4262ff]", // Miro Brand Blue
      iconColor: "text-white",
      buttonBg: "bg-[#4262ff] hover:bg-[#2a41b6] text-white",
      route: "/create-quiz",
    },
    {
      icon: Trophy,
      title: "Enroll Contest",
      description: "Join exciting educational contests.",
      buttonText: "Enroll Now",
      iconBg: "bg-[#fcb900]", // Miro Brand Yellow Deep
      iconColor: "text-[#1c1c1e]",
      buttonBg: "bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e]",
      route: "/Contest-Details",
    },
    {
      icon: BookOpenIcon,
      title: "Documentation",
      description: "Access comprehensive guides and resources.",
      buttonText: "View Docs",
      iconBg: "bg-[#187574]", // Miro Moss Dark
      iconColor: "text-white",
      buttonBg: "bg-[#187574] hover:bg-[#135d5c] text-white",
      route: "/file-view",
    },
    {
      icon: Newspaper,
      title: "Posts",
      description: "Browse insightful tutorials and posts.",
      buttonText: "Read More",
      iconBg: "bg-[#7c3aed]", // Miro Vibrant Purple
      iconColor: "text-white",
      buttonBg: "bg-[#7c3aed] hover:bg-[#6d28d9] text-white",
      route: "/user-all-post-view",
    },
  ];

  // REAL Quiz Scores Bar Data
  const barData = useMemo(() => {
    if (!quizResults || quizResults.length === 0) {
      return {
        labels: ["Quiz 1", "Quiz 2", "Quiz 3", "Quiz 4"],
        datasets: [
          {
            label: "Scores (%)",
            data: [0, 0, 0, 0],
            backgroundColor: "#4262ff", // Miro Blue
          },
        ],
      };
    }

    const sorted = [...quizResults].sort(
      (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    );
    const recent = sorted.slice(-6);

    const labels = recent.map((item, idx) => {
      const subject = item.metadata?.subject || item.metadata?.examType || `Quiz ${idx + 1}`;
      return subject.length > 10 ? `${subject.slice(0, 8)}...` : subject;
    });

    const data = recent.map((item) => {
      const total = item.metadata?.totalQuestions || item.questions?.length || 1;
      const correct = item.correctCount ?? 0;
      return Math.min(100, Math.round((correct / total) * 100));
    });

    return {
      labels,
      datasets: [
        {
          label: "Scores (%)",
          data,
          backgroundColor: "#4262ff", // Miro Blue
        },
      ],
    };
  }, [quizResults]);

  // REAL Learning Progress Line Data
  const lineData = useMemo(() => {
    if (!quizResults || quizResults.length === 0) {
      return {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [
          {
            label: "Learning Progress (%)",
            data: [0, 0, 0, 0, 0],
            borderColor: "#187574", // Miro Moss
            backgroundColor: "rgba(24, 117, 116, 0.2)",
            tension: 0.4,
          },
        ],
      };
    }

    const sorted = [...quizResults].sort(
      (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    );

    const monthMap = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    sorted.forEach((item) => {
      const date = item.createdAt ? new Date(item.createdAt) : new Date();
      const monthKey = monthNames[date.getMonth()];
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = [];
      }
      const total = item.metadata?.totalQuestions || item.questions?.length || 1;
      const correct = item.correctCount ?? 0;
      const pct = Math.min(100, Math.round((correct / total) * 100));
      monthMap[monthKey].push(pct);
    });

    const monthKeys = Object.keys(monthMap);

    let labels = [];
    let progressData = [];

    if (monthKeys.length >= 2) {
      labels = monthKeys;
      progressData = monthKeys.map((m) => {
        const scores = monthMap[m];
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      });
    } else {
      labels = sorted.slice(-6).map((_, idx) => `Test ${idx + 1}`);
      progressData = sorted.slice(-6).map((item) => {
        const total = item.metadata?.totalQuestions || item.questions?.length || 1;
        const correct = item.correctCount ?? 0;
        return Math.min(100, Math.round((correct / total) * 100));
      });
    }

    return {
      labels,
      datasets: [
        {
          label: "Learning Progress (%)",
          data: progressData,
          borderColor: "#187574", // Miro Moss
          backgroundColor: "rgba(24, 117, 116, 0.2)",
          tension: 0.4,
        },
      ],
    };
  }, [quizResults]);

  const toggleItemExpand = (itemId) => {
    if (expandedItem === itemId) {
      setExpandedItem(null);
      localStorage.removeItem("userExpandedItem");
    } else {
      setExpandedItem(itemId);
      localStorage.setItem("userExpandedItem", itemId);
    }
  };

  const handleItemClick = (item) => {
    if (item.subItems) {
      toggleItemExpand(item.id);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-gray-50 to-indigo-50 flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-white shadow-xl transition-all duration-300 flex flex-col relative z-10`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-gray-800"
              >
                User Panel
              </motion.h2>
            )}
            <motion.button
              onClick={handleSidebarCollapse}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              {sidebarCollapsed ? (
                <PanelRightClose className="h-5 w-5 text-gray-600" />
              ) : (
                <PanelLeftClose className="h-5 w-5 text-gray-600" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Sidebar Items */}
        <div className="flex-1 py-4 overflow-y-auto">
          {sidebarItems.map((item, index) => (
            <div key={item.id}>
              <motion.button
                onClick={() => handleItemClick(item)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`w-full flex items-center px-4 py-3 rounded-full text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 ${
                  sidebarCollapsed ? "justify-center" : "justify-between"
                }`}
              >
                <div className="flex items-center">
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${item.iconColor || ""}`} />
                  {!sidebarCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.subItems && (
                  expandedItem === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                )}
              </motion.button>

              {!sidebarCollapsed && item.subItems && expandedItem === item.id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pl-12 pr-4 overflow-hidden"
                >
                  {item.subItems.map((subItem) => (
                    <motion.button
                      key={subItem.path}
                      onClick={() => navigate(subItem.path)}
                      whileHover={{ x: 5 }}
                      className="w-full flex items-center py-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                    >
                      <subItem.icon className={`h-4 w-4 mr-2 ${subItem.iconColor || item.iconColor || "text-gray-700"}`} />
                      <span className="text-sm font-medium">{subItem.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">User Dashboard</h1>
            <motion.button
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-[#1c1c1e] text-white rounded-full hover:bg-[#2c2c34] transition-all duration-200 shadow-sm text-sm font-medium cursor-pointer"
            >
              Back to Home
            </motion.button>
          </div>
          <p className="text-gray-600 text-sm md:text-base">Create quizzes and participate in educational contests</p>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
        >
          {dashboardCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white">
                <CardContent className="p-6 flex flex-col h-full">
                  <motion.div
                    whileHover={{ rotate: 5 }}
                    className={`w-14 h-14 ${card.iconBg} rounded-xl flex items-center justify-center mx-auto mb-4`}
                  >
                    <card.icon className={`${card.iconColor} w-7 h-7`} />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-center text-gray-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-center text-gray-600 flex-1 mb-4">
                    {card.description}
                  </p>
                  <motion.button
                    onClick={() => navigate(card.route)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`mt-auto w-full ${card.buttonBg} py-2.5 px-6 rounded-full shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium cursor-pointer`}
                  >
                    {card.buttonText}
                  </motion.button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Learning Progress Line Chart */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Progress</h3>
            <Line data={lineData} />
          </motion.div>

          {/* Contest Score Bar Chart */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quiz Scores</h3>
            <Bar data={barData} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}