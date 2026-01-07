"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../ui/card";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,PlayCircle,Gamepad2,Sparkles,FolderOpen,
  User,
  Settings,
  LogOut,
  Brain,
  Trophy,
  ChevronLeft,
  ChevronRight,
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
  TriangleAlert,
  FilePenLineIcon,
  PenTool,
  BookOpen,
  ListCheck,
  PanelLeftClose,
  PanelRightClose
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const navigate = useNavigate();

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard", path: "/dashboard" },
    { icon: User, label: "Profile", id: "profile", path: "/profile",
      subItems: [
         { icon: PlusCircle, label: "Create Profile", path: "/create-profile" },
         { icon: UserCheck, label: "View Profile", path: "/profile" },
      ]
     },

    {icon:NewspaperIcon,label:"Posts",id: "post",
      subItems: [
         {icon:ListOrdered, label: "View All Posts",path: "/user-all-post-view",},
      ]
    },
    { 
      icon: Upload, 
      label: "Upload file", 
      id: "upload", 
      subItems: [
        { icon: FilePlus, label: "Upload New File", path: "/user-upload-file" },
        { icon: FolderSearch, label: "View Your Files", path: "/filter-user-file" },
        { icon: FolderOpen, label: "View Uploaded Files", path: "/file-view" }
      ]
    },
    {icon:PenTool, label: "Create Contest",id: "contestsection",
      subItems: [
         {icon:FilePenLineIcon, label: "Create Contest",path: "/build-contest",},
      ]
     },
    {icon: Trophy, label: "Contest Section",id: "contest",
      subItems: [
         {icon:Medal, label: "Enroll Contests",path: "/Contest-Details",},
      ]
     },

     { icon:PuzzleIcon, label: "Create Quiz", id: "quiz",
      subItems: [
        {icon:PlusCircleIcon, label: "Create Quiz", path: "/build-quiz" },
        {icon:ScanEyeIcon,label: "View Your Quizzes", path: "/filter-user-quiz" },
      ]
    },
    { icon: Gamepad2, label: "Play Quiz", id: "play-quiz",
      subItems: [
        { icon: PlayCircle, label: "Play Quiz", path: "/view-user-quiz" },
        { icon: Sparkles, label: "Play AI Quiz", path: "/create-quiz" },
      ]
    },
    {
  icon: BookOpen, 
  label: "Q & A Page", 
  id: "q-and-a-page",
  subItems: [
    { icon: Upload, label: "Upload Q & A", path: "/upload-q-and-a" },
    { icon: ListCheck, label: "View All Q & A", path: "/view-all-q-and-a" },
    { icon: User, label: "View Your Q & A", path: "/view-your-q-and-a" },
  ]
},

    { icon: Settings, label: "Settings", id: "settings", path: "/settings" },
    { icon: LogOut, label: "Logout", id: "logout", path: "/logout" },
  ];

  const dashboardCards = [
    {
      icon: Brain,
      title: "Play AI Quiz",
      description: "Design custom quizzes to test your knowledge.",
      buttonText: "Play Quiz",
      color: "from-indigo-500 to-indigo-600",
      route: "/create-quiz",
    },
    {
      icon: Trophy,
      title: "Enroll Contest",
      description: "Join exciting educational contests.",
      buttonText: "Enroll Now",
      color: "from-emerald-500 to-emerald-600",
      route:"/Contest-Details"
    },
    {
      icon: BookOpenIcon,
      title: "Documentation",
      description: "Access comprehensive guides and resources.",
      buttonText: "View Docs",
      color: "from-blue-500 to-blue-600",
      route: "/file-view"
    },
    {
      icon: Newspaper,
      title: "Posts",
      description: "Browse insightful tutorials and posts.",
      buttonText: "Read More",
      color: "from-indigo-500 to-indigo-600",
      route:"/user-all-post-view"
    },
  ];

  const barData = {
    labels: ["Quiz 1", "Quiz 2", "Quiz 3", "Quiz 4"],
    datasets: [
      {
        label: "Scores",
        data: [65, 75, 80, 90],
        backgroundColor: "#6366f1",
      },
    ],
  };

  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Learning Progress",
        data: [20, 40, 60, 80, 95],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const toggleItemExpand = (itemId) => {
    if (expandedItem === itemId) {
      setExpandedItem(null);
    } else {
      setExpandedItem(itemId);
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
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
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
                  <item.icon className="h-5 w-5 flex-shrink-0" />
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
                      <subItem.icon className="h-4 w-4 mr-2 text-gray-700" />
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors duration-200"
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
                    className={`w-14 h-14 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center mx-auto mb-4`}
                  >
                    <card.icon className="text-white w-7 h-7" />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-center text-gray-900 mb-2 group-hover:text-indigo-600">
                    {card.title}
                  </h3>
                  <p className="text-sm text-center text-gray-600 flex-1 mb-4">
                    {card.description}
                  </p>
                  <motion.button
                    onClick={() => navigate(card.route)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`mt-auto w-full bg-gradient-to-r ${card.color} text-white py-2 rounded-xl shadow-md hover:shadow-lg transition duration-300`}
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