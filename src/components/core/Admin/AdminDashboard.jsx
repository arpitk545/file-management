import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getManagersAndUsers } from "../../../services/operations/profileAPI";
import { getAllFiles } from "../../../services/operations/filesAPI";
import { getAllArticles } from "../../../services/operations/articelsAPI";

import {
  LayoutDashboard,Briefcase,Mail,Info,AlertCircle,Shield,PencilLine,Eye,Edit,
  User,MessageCircle,
  Archive,
  Folder,
  Settings,
  Trash2,
  LogOut,
  FileCheck,
  Trophy,
  MessageSquare,
  UserPlus,
  FileText,
  HelpCircle,
  Users,
  File,
  UploadCloud,
  Monitor,
  ChevronDown,
  ChevronUp,
  FilePlus,
  FileSearch,
  ClipboardList,
  SearchCheck,
  PlusCircle,
  UserCheck,
  FileQuestion,
  PlusSquare,
  ListChecks,
  Send,
  PieChart,
  Edit3,
  MapPin,
  Tag,
  PanelRightClose,
  PanelLeftClose,
  ArrowUpRight,
  TrendingUp,
  Layers,
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
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("adminSidebarCollapsed");
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [expandedItem, setExpandedItem] = useState(() => {
    return localStorage.getItem("adminExpandedItem") || null;
  });

  const [realUsers, setRealUsers] = useState([]);
  const [realFiles, setRealFiles] = useState([]);
  const [realArticles, setRealArticles] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoadingStats(true);
        const [usersRes, filesRes, articlesRes] = await Promise.allSettled([
          getManagersAndUsers(),
          getAllFiles(),
          getAllArticles(),
        ]);

        if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value)) {
          setRealUsers(usersRes.value);
        }
        if (filesRes.status === "fulfilled") {
          const filesData = filesRes.value?.data || (Array.isArray(filesRes.value) ? filesRes.value : []);
          setRealFiles(filesData);
        }
        if (articlesRes.status === "fulfilled") {
          const articlesData = articlesRes.value?.data || (Array.isArray(articlesRes.value) ? articlesRes.value : []);
          setRealArticles(articlesData);
        }
      } catch (err) {
        console.error("Error loading real dashboard stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchRealData();
  }, []);

  const handleSidebarCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("adminSidebarCollapsed", JSON.stringify(newState));
  };
  const navigate = useNavigate();

  const sidebarItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      id: "dashboard",
      path: "/dashboard",
      color: "text-slate-800",
      iconBg: "bg-slate-100",
      activeBg: "bg-slate-100",
    },
    {
      icon: User,
      label: "Profile",
      id: "profile",
      path: "/profile",
      color: "text-blue-600",
      iconBg: "bg-blue-50",
      activeBg: "bg-blue-50",
      subItems: [
        { icon: PlusCircle, label: "Create Profile", path: "/create-profile" },
        { icon: UserCheck, label: "View Profile", path: "/profile" },
      ],
    },
    {
      icon: FileText,
      label: "Posts",
      id: "articles",
      color: "text-amber-600",
      iconBg: "bg-amber-50",
      activeBg: "bg-amber-50",
      subItems: [
        { icon: PencilLine, label: "Create Region", path: "/create-region" },
        { icon: Edit, label: "Edit Region", path: "/edit-region" },
        { icon: FilePlus, label: "Create Posts", id: "create-articles", path: "/create-articles" },
        { icon: FileSearch, label: "View Posts", id: "approve-articles", path: "/articles/news" },
      ],
    },
    {
      icon: Folder,
      label: "File",
      id: "files",
      color: "text-teal-600",
      iconBg: "bg-teal-50",
      activeBg: "bg-teal-50",
      subItems: [
        { icon: PencilLine, label: "Create Region", path: "/create-file-region" },
        { icon: Edit, label: "Edit Region", path: "/edit-file-region" },
        { icon: FilePlus, label: "Create File", id: "create-file", path: "/create-file" },
        { icon: SearchCheck, label: "View Uploaded File", id: "filter-file", path: "/filter-file" },
      ],
    },
    {
      icon: HelpCircle,
      label: "Quiz",
      id: "quiz",
      color: "text-fuchsia-600",
      iconBg: "bg-fuchsia-50",
      activeBg: "bg-fuchsia-50",
      subItems: [
        { icon: FilePlus, label: "Create Quiz Region", id: "create-quiz-region", path: "/create-quiz-region" },
        { icon: Edit, label: "Edit Quiz Region", id: "edit-quiz-region", path: "/edit-quiz-region" },
        { icon: FileText, label: "Create Quiz", id: "create-quiz", path: "/create-quizs" },
        { icon: Eye, label: "View Quiz", id: "view-quiz", path: "/view-quiz" },
        { icon: Archive, label: "Quiz Bank", id: "quiz-bank", path: "/quiz-bank" },
        { icon: ClipboardList, label: "Reported Quiz", id: "report-quiz", path: "/report-quiz" },
      ],
    },
    {
      icon: Trophy,
      label: "Contest",
      id: "contest",
      color: "text-orange-600",
      iconBg: "bg-orange-50",
      activeBg: "bg-orange-50",
      subItems: [
        { icon: FilePlus, label: "Create Contest Region", id: "create-contest Region", path: "/create-quiz-region" },
        { icon: Edit, label: "Edit Contest Region", id: "edit-quiz-region", path: "/edit-quiz-region" },
        { icon: FilePlus, label: "Create Contests", path: "/create-contests" },
        { icon: Eye, label: "View Contests", path: "/filter-contest" },
      ],
    },
    {
      icon: Users,
      label: "Users",
      id: "users",
      color: "text-indigo-600",
      iconBg: "bg-indigo-50",
      activeBg: "bg-indigo-50",
      subItems: [
        { icon: Briefcase, label: "Manager", id: "manager", path: "/manager-details" },
        { icon: Users, label: "Users", id: "users", path: "/user-details" },
        { icon: MessageCircle, label: "Contact Messages", id: "View Contact Messages", path: "/get-messages" },
      ],
    },
    {
      icon: File,
      label: "Pages",
      id: "pages",
      color: "text-cyan-700",
      iconBg: "bg-cyan-50",
      activeBg: "bg-cyan-50",
      subItems: [
        { icon: Info, label: "About Us", id: "about-us", path: "/edit-about-us" },
        { icon: Mail, label: "Contact Us", id: "contact-us", path: "/edit-contact-us" },
        { icon: AlertCircle, label: "Disclaimer", id: "disclaimer", path: "/edit-disclaimer" },
        { icon: Shield, label: "Privacy Policy", id: "privacy-policy", path: "/edit-privacy-policy" },
        { icon: FileText, label: "Terms & Conditions", id: "terms-condition", path: "/edit-terms-condition" },
      ],
    },
    {
      icon: FileQuestion,
      label: "Q & A Pages",
      id: "qa-pages",
      color: "text-emerald-600",
      iconBg: "bg-emerald-50",
      activeBg: "bg-emerald-50",
      subItems: [
        { icon: MapPin, label: "Create Q & A Region", id: "create-qa-region", path: "/create-qa-region" },
        { icon: Edit3, label: "Edit Q & A Region", id: "edit-qa-region", path: "/edit-qa-region" },
        { icon: Tag, label: "Create Question Type", id: "create-question-type", path: "/create-question-type" },
        { icon: Edit, label: "Edit Question Type", id: "edit-question-type", path: "/edit-question-type" },
        { icon: PlusSquare, label: "Create Q & A", id: "create-qa", path: "/create-qa" },
        { icon: ListChecks, label: "View Q & A", id: "view-qa", path: "/view-qa" },
        { icon: Send, label: "Submitted Q & A", id: "submitted-qa", path: "/submitted-qa" },
        { icon: PieChart, label: "Q & A Reports", id: "qa-reports", path: "/qa-reports" },
      ],
    },
    {
      icon: ClipboardList,
      label: "Register Manager",
      id: "register-manager",
      path: "/register",
      color: "text-purple-600",
      iconBg: "bg-purple-50",
      activeBg: "bg-purple-50",
    },
    {
      icon: UploadCloud,
      label: "User Uploaded Files",
      id: "uploads",
      path: "/user-uploaded-file",
      color: "text-sky-600",
      iconBg: "bg-sky-50",
      activeBg: "bg-sky-50",
    },
    {
      icon: Monitor,
      label: "Advertisements",
      id: "ads",
      path: "/upload-ad",
      adminOnly: true,
      color: "text-rose-600",
      iconBg: "bg-rose-50",
      activeBg: "bg-rose-50",
    },
    {
      icon: Trash2,
      label: "Trash",
      id: "trash",
      adminOnly: true,
      color: "text-red-500",
      iconBg: "bg-red-50",
      activeBg: "bg-red-50",
    },
    {
      icon: Settings,
      label: "Settings",
      id: "settings",
      path: "/settings",
      color: "text-slate-600",
      iconBg: "bg-slate-100",
      activeBg: "bg-slate-100",
    },
    {
      icon: LogOut,
      label: "Logout",
      id: "logout",
      path: "/logout",
      color: "text-rose-600",
      iconBg: "bg-rose-50",
      activeBg: "bg-rose-50",
    },
  ];

  const dashboardCards = [
    {
      icon: FileCheck,
      title: "Approve File",
      description: "Review and approve uploaded study materials and documents from users.",
      buttonText: "Approve Files",
      pastelBg: "bg-[#fff4c4]",
      accentBorder: "border-[#fcb900]/40",
      pillBadge: "bg-[#ffd02f] text-[#1c1c1e]",
      badgeText: "Pending Review",
      route: "/filter-file",
    },
    {
      icon: Trophy,
      title: "Approve Contest",
      description: "Manage and approve contest submissions and competition entries.",
      buttonText: "Approve Contests",
      pastelBg: "bg-[#c3faf5]",
      accentBorder: "border-[#0fbcb0]/40",
      pillBadge: "bg-[#0fbcb0] text-white",
      badgeText: "Active Arena",
      route: "/filter-contest",
    },
    {
      icon: MessageSquare,
      title: "Approve Comment",
      description: "Moderate user comments and feedback across the platform.",
      buttonText: "Approve Comments",
      pastelBg: "bg-[#ffd8f4]",
      accentBorder: "border-[#e04192]/40",
      pillBadge: "bg-[#e04192] text-white",
      badgeText: "Community Pulse",
      route: "/comments",
    },
    {
      icon: UserPlus,
      title: "Register Manager",
      description: "Add new managers to the system and assign appropriate permissions.",
      buttonText: "Register Manager",
      pastelBg: "bg-[#ffe6cd]",
      accentBorder: "border-[#ff8800]/40",
      pillBadge: "bg-[#ff8800] text-white",
      badgeText: "Staff Access",
      route: "/register",
    },
  ];

  // Real dynamic metrics calculation
  const activeLearners = realUsers.filter((u) => u.role === "user");
  const managersList = realUsers.filter((u) => u.role === "manager" || u.role === "admin");
  const totalRegistered = realUsers.length;

  // Real user distribution calculation
  const now = new Date();
  const quarters = [
    { label: "Q1", count: 0 },
    { label: "Q2", count: 0 },
    { label: "Q3", count: 0 },
    { label: "Q4", count: 0 },
  ];

  realUsers.forEach((user) => {
    if (user.createdAt) {
      const d = new Date(user.createdAt);
      const qIdx = Math.floor(d.getMonth() / 3);
      if (quarters[qIdx]) quarters[qIdx].count++;
    }
  });

  const hasQuarterData = quarters.some((q) => q.count > 0);
  const barData = {
    labels: hasQuarterData ? ["Q1", "Q2", "Q3", "Q4"] : ["Learners", "Managers", "Total Users"],
    datasets: [
      {
        label: "Registered Accounts",
        data: hasQuarterData
          ? quarters.map((q) => q.count)
          : [activeLearners.length, managersList.length, totalRegistered],
        backgroundColor: "#4262ff",
        borderRadius: 8,
      },
    ],
  };

  // Real uploads calculation from files and articles
  const recentMonths = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    recentMonths.push({
      label: d.toLocaleString("default", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth(),
      count: 0,
    });
  }

  const allUploads = [
    ...realFiles.map((f) => ({ ...f, itemType: "file" })),
    ...realArticles.map((a) => ({ ...a, itemType: "article" })),
  ];

  allUploads.forEach((item) => {
    if (item.createdAt) {
      const d = new Date(item.createdAt);
      const found = recentMonths.find(
        (m) => m.year === d.getFullYear() && m.month === d.getMonth()
      );
      if (found) found.count++;
    }
  });

  const hasUploadData = recentMonths.some((m) => m.count > 0);
  const lineData = {
    labels: recentMonths.map((m) => m.label),
    datasets: [
      {
        label: "Published Items",
        data: hasUploadData
          ? recentMonths.map((m) => m.count)
          : [
              realArticles.length,
              realFiles.length,
              allUploads.length,
              allUploads.length,
              allUploads.length,
            ],
        fill: true,
        backgroundColor: "rgba(15, 188, 176, 0.12)",
        borderColor: "#0fbcb0",
        borderWidth: 2.5,
        tension: 0.35,
        pointBackgroundColor: "#0fbcb0",
      },
    ],
  };

  const toggleItemExpand = (itemId) => {
    if (expandedItem === itemId) {
      setExpandedItem(null);
      localStorage.removeItem("adminExpandedItem");
    } else {
      setExpandedItem(itemId);
      localStorage.setItem("adminExpandedItem", itemId);
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
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] font-sans antialiased flex overflow-hidden selection:bg-[#ffd02f] selection:text-[#1c1c1e]">
      {/* Sidebar with Miro Styling & Larger Typography */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`${
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-white border-r border-[#e0e2e8] shadow-sm transition-all duration-300 flex flex-col relative z-20 shrink-0`}
      >
        {/* Sidebar Header with Miro Canary Yellow Branding */}
        <div className="p-4 sm:p-5 border-b border-[#e0e2e8]">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-gray-800"
              >
                Admin Panel
              </motion.h2>
            )}
            <motion.button
              onClick={handleSidebarCollapse}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl text-[#555a6a] hover:text-[#1c1c1e] hover:bg-[#f7f8fa] transition-colors"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelRightClose className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Sidebar Navigation Items with Larger Text */}
        <div className="flex-1 py-4 px-2.5 overflow-y-auto space-y-1.5 text-left">
          {sidebarItems.map((item, index) => {
            const isExpanded = expandedItem === item.id;
            return (
              <div key={item.id}>
                <motion.button
                  onClick={() => handleItemClick(item)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`w-full flex items-center px-2.5 py-2.5 rounded-xl transition-all duration-200 text-left ${
                    isExpanded
                      ? "bg-[#fff8e0] shadow-xs"
                      : "hover:bg-[#f7f8fa]"
                  } ${sidebarCollapsed ? "justify-center" : "justify-between"}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center min-w-0 gap-2">
                    <item.icon className={`h-5 w-5 shrink-0 ${item.color || "text-gray-700"}`} />
                    {!sidebarCollapsed && (
                      <span className="text-[15px] sm:text-base font-bold text-gray-800 tracking-tight truncate">
                        {item.label}
                      </span>
                    )}
                  </div>
                  {!sidebarCollapsed && item.subItems && (
                    <span className="text-gray-400 ml-1 shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </motion.button>

                {!sidebarCollapsed && item.subItems && isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-3.5 pl-2.5 border-l-2 border-[#e0e2e8] space-y-1 py-1"
                  >
                    {item.subItems.map((subItem) => (
                      <motion.button
                        key={subItem.path + subItem.label}
                        onClick={() => navigate(subItem.path)}
                        whileHover={{ x: 3 }}
                        className="w-full flex items-center py-1.5 px-2 rounded-lg text-sm sm:text-[14px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-[#f7f8fa] transition-colors text-left truncate gap-2"
                      >
                        <subItem.icon className={`h-4 w-4 shrink-0 ${item.color || "text-gray-500"}`} />
                        <span className="truncate">{subItem.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Miro Sidebar Bottom Badge */}
        {!sidebarCollapsed && (
          <div className="p-3.5 border-t border-[#e0e2e8]">
            <div className="bg-[#fff4c4] border border-[#fcb900]/30 rounded-xl p-3 text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#746019] block mb-0.5">
                clys Admin Engine
              </span>
              <p className="text-xs text-[#1c1c1e] font-medium leading-tight">
                Verified management console active
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 p-5 sm:p-7 lg:p-10 overflow-y-auto text-left">
        {/* Top Header Section with Miro Styling */}
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pb-6 border-b border-[#e0e2e8]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffd02f] text-[#1c1c1e] text-xs font-bold uppercase tracking-wider">
                  Platform Core
                </span>
                <span className="text-xs font-semibold text-[#6b6f7e]">Live Operations</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1c1c1e] tracking-tight">
                Admin Dashboard
              </h1>
            </div>

            <motion.button
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 bg-[#1c1c1e] hover:bg-[#2c2c34] text-white rounded-full font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <span>Back to Home</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#ffd02f]" />
            </motion.button>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">
            Manage platform content and user permissions
          </p>
        </motion.div>

        {/* Dashboard Cards: Miro Pastel Themes with Black-Pill Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 text-left"
        >
          {dashboardCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all hover:shadow-md ${card.pastelBg} ${card.accentBorder}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/90 border border-white flex items-center justify-center text-[#1c1c1e] shadow-xs">
                    <card.icon className="w-6 h-6 text-[#1c1c1e]" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${card.pillBadge}`}
                  >
                    {card.badgeText}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#1c1c1e] mb-1.5">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#1c1c1e]/80 leading-relaxed mb-6">
                  {card.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(card.route)}
                className="w-full py-2.5 px-4 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>{card.buttonText}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#ffd02f]" />
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Analytical Charts with Miro Design System Styling */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 text-left"
        >
          <div className="bg-white p-6 rounded-2xl border border-[#e0e2e8] shadow-sm">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#eef0f3] mb-4">
              <div>
                <h3 className="text-base font-bold text-[#1c1c1e]">User Growth</h3>
                <p className="text-xs text-[#6b6f7e]">
                  {loadingStats
                    ? "Fetching active accounts..."
                    : `${totalRegistered} registered accounts (${activeLearners.length} learners, ${managersList.length} staff)`}
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f7f8fa] text-[#4262ff] border border-[#e0e2e8] flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {totalRegistered > 0 ? `${activeLearners.length} Active Learners` : "Real-time DB"}
              </span>
            </div>
            <div className="pt-2">
              <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e0e2e8] shadow-sm">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#eef0f3] mb-4">
              <div>
                <h3 className="text-base font-bold text-[#1c1c1e]">Monthly Uploads</h3>
                <p className="text-xs text-[#6b6f7e]">
                  {loadingStats
                    ? "Calculating uploads..."
                    : `${realArticles.length} Published Posts & ${realFiles.length} Resource Files`}
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#c3faf5] text-[#187574] border border-[#0fbcb0]/30 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {allUploads.length > 0 ? `+${allUploads.length} Total Items` : "Real-time DB"}
              </span>
            </div>
            <div className="pt-2">
              <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        </motion.div>

        {/* Miro Sticky Note / Guidance Card Below Charts */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#fff4c4] border border-[#fcb900]/40 rounded-2xl p-6 sm:p-8 text-left shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#fcb900] text-[#1c1c1e] flex items-center justify-center font-bold text-xs">
                ★
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#746019]">
                Admin Operational Tip
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
              Keep moderator queues below 24 hours
            </h4>
            <p className="text-xs sm:text-sm text-[#1c1c1e]/80 leading-relaxed">
              Expedited file approvals and contest verification boost educator satisfaction and increase organic participation across academic leaderboards.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => navigate("/filter-file")}
              className="px-6 py-2.5 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
            >
              Go to File Queue
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}