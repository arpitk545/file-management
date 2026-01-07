"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../ui/card";
import { 
  LayoutDashboard, FileText, HelpCircle, Users, File, MessageSquare, 
  UploadCloud, Megaphone, Trash2, User, Settings, LogOut, Trophy, 
  Eye, Upload, BarChart3, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  PencilLine, Edit, FilePlus, FileSearch, Archive, Info, Mail, AlertCircle, Shield,Folder,
  PlusCircle,
  UserCheck,
  Edit3,
  MapPin,
  PlusSquare,
  ListChecks,
  Send,
  PieChart,
  FileQuestion
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function ManagerDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const navigate = useNavigate();

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard", path: "/dashboard" },
    { icon: User, label: "Profile", id: "profile", path: "/profile",
          subItems: [
          { icon:PlusCircle, label: "Create Profile", path: "/create-profile" },
          { icon:UserCheck, label: "View Profile", path: "/profile" },
      ]
    },
    { 
      icon: FileText, 
      label: "Posts", 
      id: "articles", 
      subItems: [
        {icon:PencilLine, label: "Create Region", path: "/create-region" },
        {icon:Edit, label: "Edit Region", path: "/edit-region" },
        { icon: FilePlus, label: "Create Posts", id: "create-articles", path: "/create-articles" },
        { icon: FileSearch, label: "View", id: "approve-articles", path: "/articles/news" }
      ]
    },
    { icon: Folder, label: "File", id: "files", subItems: [
        {icon:PencilLine, label: "Create Region", path: "/create-file-region" },
        {icon:Edit, label: "Edit Region", path: "/edit-file-region" },
        { icon: FilePlus, label: "Create File", id: "create-file", path: "/create-file" },
        { icon: FileSearch, label: "View Files", path: "/filter-file" }
    ]},
    { 
      icon: HelpCircle, 
      label: "Quiz", 
      id: "quiz", 
      subItems: [
        { icon: FilePlus, label: "Create Quiz Region", id: "create-quiz-region", path: "/create-quiz-region" },
        { icon: Edit, label: "Edit Quiz Region", id: "edit-quiz-region", path: "/edit-quiz-region" },
        { icon: FilePlus, label: "Create Quiz", path: "/create-quizs" },
        { icon: Eye, label: "View Quiz", path: "/view-quiz" },
        { icon: Archive, label: "Quiz Bank", path: "/quiz-bank" }
      ]
    },
    { 
      icon:Trophy, 
      label: "Contest", 
      id: "contest", 
      subItems: [
         { icon: FilePlus, label: "Create Contest Region", id: "create-contest Region", path: "/create-quiz-region" },
         { icon: Edit, label: "Edit Contest Region", id: "edit-quiz-region", path: "/edit-quiz-region" },
        { icon: FilePlus, label: "Create Contests", path: "/create-contests" },
        { icon: Eye, label: "View Contests", path: "/filter-contest" },
        // {icon: BarChart3, label:"Contest Results", path:"/result"}
      ]
    },
    { 
      icon: Users, 
      label: "Users", 
      id: "users", 
      subItems: [
        { icon: User, label: "View Users", path: "/user-details" },
        { icon: MessageSquare, label: "View Messages", path: "/get-messages" }
      ]
    },
    { 
      icon: File, 
      label: "Pages", 
      id: "pages", 
      subItems: [
        { icon: Info, label: "About Us", path: "/edit-about-us" },
        { icon: Mail, label: "Contact Us", path: "/edit-contact-us" },
        { icon: AlertCircle, label: "Disclaimer", path: "/edit-disclaimer" },
        { icon: Shield, label: "Privacy Policy", path: "/edit-privacy-policy" }
      ]
    },
     {
      icon: FileQuestion,
      label: "Q & A Pages",
      id: "qa-pages",
      subItems: [
        { icon: MapPin, label: "Create Q & A Region", id: "create-qa-region", path: "/create-qa-region" },
        { icon: Edit3, label: "Edit Q & A Region", id: "edit-qa-region", path: "/edit-qa-region" },
        { icon: PlusSquare, label: "Create Q & A", id: "create-qa", path: "/create-qa" },
        { icon: ListChecks, label: "View Q & A", id: "view-qa", path: "/view-qa" },
        { icon: Send, label: "Submitted Q & A", id: "submitted-qa", path: "/submitted-qa" },
        { icon: PieChart, label: "Q & A Reports", id: "qa-reports", path: "/qa-reports" }
      ]
    }
    ,
    { icon: MessageSquare, label: "Comments", id: "comments", path: "/comments" },
    { icon: UploadCloud, label: "User Upload Files", id: "uploads", path: "/user-uploaded-file" },
    { icon: Megaphone, label: "Advertisements", id: "ads", path: "/advertisements" },
    { icon: Trash2, label: "Trash", id: "trash", path: "/trash" },
    { icon: Settings, label: "Settings", id: "settings", path: "/settings" },
    { icon: LogOut, label: "Logout", id: "logout", path: "/logout" },
  ];

  const dashboardCards = [
    {
      icon: Trophy,
      title: "Create Contest",
      description: "Design and launch new educational contests for students to participate in.",
      buttonText: "Create Contest",
      color: "from-purple-500 to-purple-600",
      route: "/create-contests"
    },
    {
      icon: Eye,
      title: "See All Contest",
      description: "View and manage all existing contests, monitor participation and results.",
      buttonText: "View Contests",
      color: "from-blue-500 to-blue-600",
      route: "/filter-contest"
    },
    {
      icon: Upload,
      title: "Upload File",
      description: "Upload educational materials, documents, and resources for students.",
      buttonText: "Upload Files",
      color: "from-green-500 to-green-600",
      route: "/upload-files"
    },
    {
      icon: BarChart3,
      title: "See Result",
      description: "Analyze contest results, student performance, and generate detailed reports.",
      buttonText: "View Results",
      color: "from-orange-500 to-orange-600",
      route: "/view-results"
    },
  ];

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Contest Participation',
        data: [30, 45, 28, 80, 55, 70],
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f650',
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4'],
    datasets: [
      {
        label: 'Average Score',
        data: [75, 82, 68, 90],
        backgroundColor: '#10b981',
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
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-gray-50 to-purple-50 flex">
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
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold text-gray-800">
                Manager Panel
              </motion.h2>
            )}
            <motion.button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-600" />
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
                className={`w-full flex items-center px-4 py-3 rounded-full text-gray-700 hover:bg-purple-100 hover:text-purple-600 transition-all duration-200 ${
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
                      className="w-full flex items-center py-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
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
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Manager Dashboard</h1>
            <motion.button
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-colors duration-200"
            >
              Back to Home
            </motion.button>
          </div>
          <p className="text-gray-600 text-sm md:text-base">Manage contests, files, and monitor student performance</p>
        </motion.div>

        {/* Dashboard Cards */}
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
                  <h3 className="text-lg md:text-xl font-bold text-center text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-center text-gray-600 flex-1 mb-4">{card.description}</p>
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

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contest Participation</h3>
            <Line data={lineChartData} />
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quiz Performance</h3>
            <Bar data={barChartData} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}