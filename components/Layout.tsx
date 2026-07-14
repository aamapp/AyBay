import React, { useState, useEffect, useTransition } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  Receipt,
  Menu,
  X,
  LogOut,
  Settings,
  BarChart3,
  Users,
  Tags,
  Trash2,
  HardDrive,
  Info,
  Globe,
  Phone,
  Facebook,
  Instagram,
  Send,
  MessageCircle,
  ArrowLeft,
  UserCog,
  BookOpen,
  User,
  ShoppingBag,
  Bot,
  Bell,
  Plus,
  ListTodo,
  Wallet,
  Car,
  Moon,
} from "lucide-react";
import { createPortal } from "react-dom";
import { APP_NAME } from "@/constants";
import { User as UserType } from "@/types";
import { useAppContext } from "@/context/AppContext";
import { OfflineBanner } from "./OfflineBanner";
import { AppLogo } from "./AppLogo";

interface LayoutProps {
  children: React.ReactNode;
  user: UserType;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isAboutOpen, setAboutOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false); // New state for logout confirmation
  const [isProcessing, setIsProcessing] = useState(false); // New state for processing animation
  const [processingMessage, setProcessingMessage] = useState(
    "কন্টেন্ট তৈরি হচ্ছে...",
  ); // Dynamic message
  const [activeExpenseTab, setActiveExpenseTab] = useState<string>("expenses");
  const [headerSwipeState, setHeaderSwipeState] = useState<{
    isSwiping: boolean;
    swipeOffset: number;
    activeTab: string;
  }>({
    isSwiping: false,
    swipeOffset: 0,
    activeTab: "expenses",
  });
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const [resizeKey, setResizeKey] = useState(0);
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return typeof document !== "undefined" && (document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark");
  });

  // Swipe state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(
    null,
  );

  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);

  const {
    adminSelectedUserId,
    setAdminSelectedUserId,
    trashedProjects,
    trashedExpenses,
    trashedGhazalNotes,
    isOnline,
    notifications,
  } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const isAiAssistant = location.pathname === "/ai-assistant";
  const isNotifications = location.pathname === "/notifications";
  const isReports = location.pathname === "/reports";
  const isSettings = location.pathname === "/settings";
  const isTrash = location.pathname === "/trash";
  const isShoppingLists = location.pathname === "/shopping-lists";
  const isCarRent = location.pathname === "/car-rent";
  const isFullScreenPage =
    isAiAssistant ||
    isNotifications ||
    isReportPreviewOpen ||
    isReports ||
    isSettings ||
    isTrash ||
    isShoppingLists ||
    isCarRent;
  const isExpensesPage = location.pathname === "/expenses";

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    const handleActiveTabChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.activeTab) {
        setActiveExpenseTab(customEvent.detail.activeTab);
      }
    };
    window.addEventListener("expense-active-tab-changed", handleActiveTabChange);

    const handleSwipeUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { isSwiping, swipeOffset, activeTab } = customEvent.detail;
        setHeaderSwipeState({
          isSwiping,
          swipeOffset,
          activeTab,
        });
        if (activeTab) {
          setActiveExpenseTab(activeTab);
        }
      }
    };
    window.addEventListener("expense-swipe-update", handleSwipeUpdate);
    
    const handleToggleMoreMenu = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.open === "boolean") {
        setMoreMenuOpen(customEvent.detail.open);
      } else {
        setMoreMenuOpen(prev => !prev);
      }
    };
    window.addEventListener("toggle-more-menu", handleToggleMoreMenu);

    return () => {
      window.removeEventListener(
        "expense-active-tab-changed",
        handleActiveTabChange
      );
      window.removeEventListener("expense-swipe-update", handleSwipeUpdate);
      window.removeEventListener("toggle-more-menu", handleToggleMoreMenu);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setResizeKey((prev) => prev + 1);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isExpensesPage) return;

    const tabs = ["expenses", "dues", "reports", "savings", "tasks", "menu"];
    const currentTab = headerSwipeState.isSwiping ? headerSwipeState.activeTab : activeExpenseTab;
    const currEl = tabRefs.current[currentTab];
    if (!currEl) return;

    const screenWidth = window.innerWidth || 360;
    const swipeOffset = headerSwipeState.swipeOffset;
    const isSwiping = headerSwipeState.isSwiping;

    const getTabProps = (tab: string) => {
      const el = tabRefs.current[tab];
      if (!el) return { left: 0, width: 28 };
      
      const isSm = window.innerWidth >= 640;
      const indicatorWidth = isSm ? 32 : 28;
      const left = el.offsetLeft + (el.offsetWidth - indicatorWidth) / 2;
      return { left, width: indicatorWidth };
    };

    const currentProps = getTabProps(currentTab);
    let targetLeft = currentProps.left;
    let targetWidth = currentProps.width;

    if (isSwiping && swipeOffset !== 0) {
      const currentIndex = tabs.indexOf(currentTab);
      let targetIndex = currentIndex;
      if (swipeOffset > 0 && currentIndex < tabs.length - 1) {
        targetIndex = currentIndex + 1;
      } else if (swipeOffset < 0 && currentIndex > 0) {
        targetIndex = currentIndex - 1;
      }

      if (targetIndex !== currentIndex) {
        const targetTab = tabs[targetIndex];
        const targetProps = getTabProps(targetTab);

        const t = Math.min(1, Math.abs(swipeOffset) / screenWidth);

        const L_curr = currentProps.left;
        const R_curr = currentProps.left + currentProps.width;
        const L_target = targetProps.left;
        const R_target = targetProps.left + targetProps.width;

        let L_t = L_curr;
        let R_t = R_curr;

        if (targetIndex > currentIndex) {
          L_t = L_curr + Math.pow(t, 1.5) * (L_target - L_curr);
          R_t = R_curr + Math.pow(t, 0.5) * (R_target - R_curr);
        } else {
          L_t = L_curr + Math.pow(t, 0.5) * (L_target - L_curr);
          R_t = R_curr + Math.pow(t, 1.5) * (R_target - R_curr);
        }

        targetLeft = L_t;
        targetWidth = Math.max(10, R_t - L_t);
      } else {
        const t = Math.min(1, Math.abs(swipeOffset) / screenWidth);
        const stretchFactor = 1 + t * 0.5;
        const w = currentProps.width * stretchFactor;
        targetWidth = w;
        targetLeft = currentProps.left - (w - currentProps.width) / 2;
      }
    }

    setIndicatorStyle({ left: targetLeft, width: targetWidth });
  }, [activeExpenseTab, headerSwipeState, isExpensesPage, resizeKey]);

  const handleExpenseTabClick = (tabName: string) => {
    setActiveExpenseTab(tabName);
    window.dispatchEvent(
      new CustomEvent("expense-set-tab", { detail: { tab: tabName } })
    );
  };

  const handleNavigate = (path: string) => {
    setMoreMenuOpen(false);

    if (
      location.pathname + location.search === path ||
      location.pathname === path
    ) {
      return;
    }

    navigate(path);
  };

  useEffect(() => {
    // Relying on `reports:preview` event to manage report preview state.
    // Removing the explicit reset on location change to prevent race conditions 
    // where parent's effect runs after child's effect and overwrites its `true` state.
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleReportPreview = (e: any) => {
      setIsReportPreviewOpen(!!e?.detail?.active);
    };
    window.addEventListener("reports:preview", handleReportPreview);
    return () => {
      window.removeEventListener("reports:preview", handleReportPreview);
    };
  }, []);

  useEffect(() => {
    const handleProcessing = (e: any) => {
      if (typeof e.detail === "object") {
        setIsProcessing(e.detail.show);
        setProcessingMessage(e.detail.message || "প্রসেস হচ্ছে...");
      } else {
        setIsProcessing(e.detail);
        setProcessingMessage("প্রসেস হচ্ছে...");
      }
    };
    window.addEventListener("app:processing", handleProcessing);
    return () => window.removeEventListener("app:processing", handleProcessing);
  }, []);

  useEffect(() => {
    if (isMoreMenuOpen || isAboutOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMoreMenuOpen, isAboutOpen]);

  const trashCount =
    trashedProjects.length + trashedExpenses.length + trashedGhazalNotes.length;

  const isAdmin = user.role === "admin";
  const showAdminUserList = isAdmin && !adminSelectedUserId;
  const hasBottomNav = false;

  // Primary Tabs for Bottom Nav (Most used features)
  const PRIMARY_NAV = [
    { name: "খরচ", path: "/expenses", icon: <Receipt size={22} /> },
  ];

  // Secondary items for "More" Menu Drawer
  const SECONDARY_NAV = [
    {
      name: "এআই অ্যাসিস্ট্যান্ট",
      path: "/ai-assistant",
      icon: <Bot size={20} />,
      desc: "স্মার্ট হেল্পার",
    },
    {
      name: "ফর্দি",
      path: "/shopping-lists",
      icon: <ShoppingBag size={20} />,
      desc: "বাজারের তালিকা",
    },
    {
      name: "গাড়ি ভাড়া হিসাব",
      path: "/car-rent",
      icon: <Car size={20} />,
      desc: "ভাড়া ও বকেয়া হিসাব",
    },
    {
      name: "রিপোর্ট",
      path: "/reports",
      icon: <BarChart3 size={20} />,
      desc: "আয়-ব্যয় রিপোর্ট",
    },
    {
      name: "রিসাইকেল বিন",
      path: "/trash",
      icon: <Trash2 size={20} />,
      desc: "ডিলিট করা প্রজেক্ট",
    },
    {
      name: "সেটিংস",
      path: "/settings",
      icon: <Settings size={20} />,
      desc: "অ্যাপ কনফিগারেশন",
    },
  ];

  const handleNavigation = (path: string) => {
    setMoreMenuOpen(false);
    if (
      location.pathname + location.search === path ||
      location.pathname === path
    ) {
      return;
    }

    navigate(path);
  };

  const handleBackToUsers = () => {
    setAdminSelectedUserId(null);
    handleNavigate("/admin-users");
  };

  // Developer Contact Links
  const DEVELOPER_INFO = {
    image:
      "https://drive.google.com/thumbnail?id=1SQpzaFRvgwEaKI8wbnNkvt_JhrxrjhGb&sz=w500",
    name: "আব্দুল্লাহ আল মামুন",
    title: "Full Stack Developer",
    facebook: "https://facebook.com/share/1C5Sw9sBRR/",
    whatsapp: "https://wa.me/8801612505145",
    instagram:
      "https://instagram.com/h.m.abdullah_al_mamun?igsh=d3NpZjBjYWRhMXly",
    telegram: "https://t.me/abdullahalmamunofficial",
    website: "https://aam.infinityfreeapp.com/",
    phone: "tel:+8801612505145",
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    if (isExpensesPage) return;
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isExpensesPage) return;
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEndHandler = () => {
    if (isExpensesPage) return;
    if (!touchStart || !touchEnd) return;

    if (isMoreMenuOpen || isAboutOpen || isProcessing) return;

    const dx = touchStart.x - touchEnd.x;
    const dy = touchStart.y - touchEnd.y;

    const isHorizontalSwipe = Math.abs(dx) > Math.abs(dy);

    if (isHorizontalSwipe && Math.abs(dx) > minSwipeDistance) {
      const isLeftSwipe = dx > 0;
      const isRightSwipe = dx < 0;

      if (isExpensesPage) {
        const expenseTabs = ["expenses", "dues", "reports", "savings", "tasks", "menu"];
        const currentIndex = expenseTabs.indexOf(activeExpenseTab);
        if (currentIndex !== -1) {
          if (isLeftSwipe && currentIndex < expenseTabs.length - 1) {
            handleExpenseTabClick(expenseTabs[currentIndex + 1]);
          } else if (isRightSwipe && currentIndex > 0) {
            handleExpenseTabClick(expenseTabs[currentIndex - 1]);
          }
        }
      } else {
        const currentPath = location.pathname;
        const primaryPaths = PRIMARY_NAV.map((nav) => nav.path);
        const currentIndex = primaryPaths.indexOf(currentPath);

        if (currentIndex !== -1) {
          if (isLeftSwipe && currentIndex < primaryPaths.length - 1) {
            handleNavigate(primaryPaths[currentIndex + 1]);
          } else if (isRightSwipe && currentIndex > 0) {
            handleNavigate(primaryPaths[currentIndex - 1]);
          }
        }
      }
    }
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
      className={`min-h-screen ${isExpensesPage ? 'bg-white' : 'bg-[#fafbfd]'} font-sans w-full selection:bg-indigo-100 selection:text-indigo-700 flex flex-col lg:flex-row ${isExpensesPage ? 'overflow-x-clip' : 'overflow-x-hidden'}`}
    >
      {/* Desktop Sidebar - Visible only on LG screens */}
      {!isTrash && (
        <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 h-screen lg:fixed lg:top-0 lg:left-0 z-50">
        <div className="p-6 border-b border-slate-100">
          <div
            onClick={() => setAboutOpen(true)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div
              className={`w-10 h-10 flex items-center justify-center transition-all duration-300 ${isProcessing ? "logo-processing" : "group-hover:scale-105"}`}
            >
              <AppLogo variant="transparent-color" strokeColor="#1a73e8" size="100%" />
            </div>
            <span className="font-bold text-slate-800 text-xl tracking-tight group-hover:text-indigo-600 transition-colors">
              {APP_NAME}
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <div className="px-3 mb-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              প্রধান মেনু
            </h3>
          </div>
          {PRIMARY_NAV.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200
                  ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent"
                  }
                `}
              >
                <span
                  className={`relative ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                >
                  {item.icon}
                  {item.path === "/trash" && trashCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black px-1 py-0.5 rounded-full min-w-[16px] h-[16px] flex items-center justify-center shadow-sm ring-2 ring-white animate-in zoom-in duration-300">
                      {trashCount}
                    </span>
                  )}
                </span>
                {item.name}
              </button>
            );
          })}

          <div className="px-3 mt-6 mb-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              অন্যান্য
            </h3>
          </div>
          {SECONDARY_NAV.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200
                  ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent"
                  }
                `}
              >
                <span
                  className={`relative ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                >
                  {item.icon}
                  {item.path === "/trash" && trashCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black px-1 py-0.5 rounded-full min-w-[16px] h-[16px] flex items-center justify-center shadow-sm ring-2 ring-white animate-in zoom-in duration-300">
                      {trashCount}
                    </span>
                  )}
                </span>
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div
            onClick={() => handleNavigate("/profile")}
            className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3 mb-3 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <User size={20} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate font-medium">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-colors border border-rose-100"
          >
            <LogOut size={16} />
            লগআউট করুন
          </button>
        </div>
      </aside>
      )}

      {/* Mobile Header (App Bar) - Fixed to ensure it stays on top */}
      {!isFullScreenPage && (
        <header className={`fixed top-0 inset-x-0 bg-white/95 backdrop-blur-md border-slate-300 ${isExpensesPage ? "" : "border-b-[1.5px]"} lg:hidden z-40 max-w-[100vw] shadow-none overflow-visible flex flex-col transition-all duration-300 ${isExpensesPage ? "h-[92px]" : "h-11"}`}>
          
          {/* Row 1: App Branding, Notifications, Theme & Settings (Always Visible at the Top) */}
          <div className="h-[44px] px-4 flex items-center justify-between w-full shrink-0">
            {/* Left Area: Branding */}
            <div className="flex items-center gap-2.5">
              {isAdmin && adminSelectedUserId ? (
                <button
                  onClick={handleBackToUsers}
                  className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 active:scale-95 transition-transform"
                >
                  <ArrowLeft size={18} />
                </button>
              ) : (
                <div
                  onClick={() => setAboutOpen(true)}
                  className="flex items-center gap-2 cursor-pointer active:opacity-80 transition-opacity group"
                >
                  <div
                    className={`w-9 h-9 flex items-center justify-center transition-all duration-300 ${isProcessing ? "logo-processing" : "group-active:scale-95"}`}
                  >
                    <AppLogo variant="transparent-color" strokeColor="#1a73e8" size="100%" />
                  </div>
                  <span className="font-black text-[#1a73e8] text-[17px] sm:text-xl tracking-tight select-none">
                    {APP_NAME}
                  </span>
                </div>
              )}
            </div>

            {/* Right Area: Redesigned Notification & Settings Icons with Clean Backgrounds */}
            <div className="flex items-center gap-1.5">
              {/* Notification Button */}
              <button
                onClick={() => handleNavigate("/notifications")}
                className="w-9 h-9 text-slate-700 hover:text-[#1a73e8] active:scale-90 transition-all duration-200 flex items-center justify-center relative bg-transparent"
                title="নোটিফিকেশন"
              >
                <Bell size={22} strokeWidth={1.5} fill="currentColor" />
                {notifications && notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                )}
              </button>

              {/* Settings/Gear Button */}
              <button
                onClick={() => handleNavigate("/settings")}
                className="w-9 h-9 text-slate-800 hover:text-[#1a73e8] active:scale-90 transition-all duration-200 flex items-center justify-center bg-transparent"
                title="সেটিংস"
              >
                <Settings size={21} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Row 2: Expenses Tab Header (Sub-navigation tabs, only visible on the Expenses page) */}
          {isExpensesPage && (
            <div className="h-[48px] px-4 flex items-center justify-between w-full bg-white shrink-0 relative">
              {/* Tab 1: Expenses / Dashboard / লেনদেন */}
              <button
                ref={(el) => { tabRefs.current["expenses"] = el; }}
                onClick={() => handleExpenseTabClick("expenses")}
                title="লেনদেন / ড্যাশবোর্ড"
                className="flex flex-col items-center justify-start pt-2 h-full w-8 sm:w-10 cursor-pointer group focus:outline-none relative"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] flex items-center justify-center transition-all border relative ${
                    activeExpenseTab === "expenses"
                      ? "border-[#1a73e8] text-white bg-[#1a73e8] shadow-xs"
                      : "border-[#cdd5de] text-[#8e9aa8] hover:border-slate-300 hover:text-slate-600 bg-white"
                  }`}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 9H4l4.5-4.5" />
                    <path d="M4 15h16l-4.5 4.5" />
                  </svg>
                </div>
              </button>

              {/* Tab 2: Dues / লেনা-দেনা */}
              <button
                ref={(el) => { tabRefs.current["dues"] = el; }}
                onClick={() => handleExpenseTabClick("dues")}
                title="লেনা-দেনা / দেনা-পাওনা"
                className="flex flex-col items-center justify-start pt-2 h-full w-8 sm:w-10 cursor-pointer group focus:outline-none relative"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] flex items-center justify-center transition-all border relative ${
                    activeExpenseTab === "dues"
                      ? "border-[#1a73e8] text-white bg-[#1a73e8] shadow-xs"
                      : "border-[#cdd5de] text-[#8e9aa8] hover:border-slate-300 hover:text-slate-600 bg-white"
                  }`}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 4v16l-4.5-4.5" />
                    <path d="M15 20V4l4.5 4.5" />
                  </svg>
                </div>
              </button>

              {/* Tab 3: Reports / বাজেট ও রিপোর্ট */}
              <button
                ref={(el) => { tabRefs.current["reports"] = el; }}
                onClick={() => handleExpenseTabClick("reports")}
                title="বজেট"
                className="flex flex-col items-center justify-start pt-2 h-full w-8 sm:w-10 cursor-pointer group focus:outline-none relative"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] flex items-center justify-center transition-all border relative ${
                    activeExpenseTab === "reports"
                      ? "border-[#1a73e8] text-white bg-[#1a73e8] shadow-xs"
                      : "border-[#cdd5de] text-[#8e9aa8] hover:border-slate-300 hover:text-slate-600 bg-white"
                  }`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M 5.5 14.5 C 8 11.5, 9.5 9.5, 11.5 9.5 C 13.5 9.5, 14.5 14.5, 16.5 14.5 C 18 14.5, 19 13, 20 12" />
                  </svg>
                </div>
              </button>

              {/* Tab 4: Savings / সঞ্চয় ও লক্ষ্য */}
              <button
                ref={(el) => { tabRefs.current["savings"] = el; }}
                onClick={() => handleExpenseTabClick("savings")}
                title="সঞ্চয় ও লক্ষ্য"
                className="flex flex-col items-center justify-start pt-2 h-full w-8 sm:w-10 cursor-pointer group focus:outline-none relative"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] flex items-center justify-center transition-all border relative ${
                    activeExpenseTab === "savings"
                      ? "border-[#1a73e8] text-white bg-[#1a73e8] shadow-xs"
                      : "border-[#cdd5de] text-[#8e9aa8] hover:border-slate-300 hover:text-slate-600 bg-white"
                  }`}
                >
                  <Plus size={13} strokeWidth={2.5} />
                </div>
              </button>

              {/* Tab 5: Tasks / টাস্ক */}
              <button
                ref={(el) => { tabRefs.current["tasks"] = el; }}
                onClick={() => handleExpenseTabClick("tasks")}
                title="টাস্ক"
                className="flex flex-col items-center justify-start pt-2 h-full w-8 sm:w-10 cursor-pointer group focus:outline-none relative"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] flex items-center justify-center transition-all border relative ${
                    activeExpenseTab === "tasks"
                      ? "border-[#1a73e8] text-white bg-[#1a73e8] shadow-xs"
                      : "border-[#cdd5de] text-[#8e9aa8] hover:border-slate-300 hover:text-slate-600 bg-white"
                  }`}
                >
                  <ListTodo size={13} strokeWidth={2.5} />
                </div>
              </button>

              {/* Tab 7: Menu / মেনু */}
              <button
                ref={(el) => { tabRefs.current["menu"] = el; }}
                onClick={() => handleExpenseTabClick("menu")}
                title="মেনু"
                className="flex flex-col items-center justify-start pt-2 h-full w-8 sm:w-10 cursor-pointer group focus:outline-none relative"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all border overflow-hidden relative ${
                    activeExpenseTab === "menu"
                      ? "border-[#1a73e8] text-white bg-[#1a73e8] shadow-xs"
                      : "border-[#cdd5de] text-[#8e9aa8] hover:border-slate-300 hover:text-slate-600 bg-white"
                  }`}
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Menu"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`;
                      }}
                    />
                  ) : (
                    <User size={13} strokeWidth={2.5} />
                  )}
                </div>
              </button>

              {/* Bottom border line as an absolute-positioned div so that indicators can perfectly sit on top and mask it */}
              <div className="absolute bottom-0 inset-x-0 h-[1px] bg-slate-200 z-10" />

              {/* Dynamic Sliding and Stretching Active Indicator */}
              <div
                className="absolute bottom-0 h-[4px] bg-[#1a73e8] rounded-t-[3px] z-20 pointer-events-none"
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                  transitionProperty: "left, width",
                  transitionDuration: headerSwipeState.isSwiping ? "0s" : "0.75s",
                  transitionTimingFunction: "cubic-bezier(0.4, 1.65, 0.45, 1.0)",
                }}
              />
            </div>
          )}
        </header>
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 ${
          isFullScreenPage
            ? "p-0"
            : isExpensesPage
            ? `pt-[92px] lg:pt-8 pb-0 lg:pb-8 px-0 lg:px-8`
            : `pt-11 lg:pt-8 ${!isOnline ? "pb-[38px]" : "pb-4"} lg:pb-8 px-3 lg:px-8`
        } ${isExpensesPage ? "" : "animate-in fade-in duration-150"} w-full max-w-[100vw] lg:max-w-none ${isExpensesPage ? 'overflow-x-clip' : 'overflow-x-hidden'} ${isTrash ? "" : "lg:ml-72"}`}
      >
        <div
          className={`max-w-4xl lg:max-w-5xl mx-auto w-full ${isFullScreenPage ? "h-[100dvh] lg:h-auto" : ""}`}
        >
          <OfflineBanner className={`fixed bottom-0 left-0 right-0 ${isTrash ? '' : 'lg:left-72'} z-[51] border-t border-[#eb3b30] shadow-lg`} />
          {children}
        </div>
      </main>

      {/* Fixed Bottom Navigation Bar - Hide if Admin is on User List page or on Desktop */}
      {hasBottomNav && (
        <div 
          className="fixed inset-x-0 z-50 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-safe lg:hidden transition-all duration-300"
          style={{ bottom: !isOnline ? '38px' : '0px' }}
        >
          <nav className="flex justify-between items-center px-6 h-[60px] w-full max-w-lg mx-auto">
            {PRIMARY_NAV.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`
                      flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200
                      ${isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}
                    `}
                >
                  <div
                    className={`transition-transform duration-200 ${isActive ? "-translate-y-0.5" : ""}`}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`text-[10px] font-bold ${isActive ? "text-indigo-600" : "text-slate-500"} ${isActive ? "opacity-100" : "opacity-80"}`}
                  >
                    {item.name}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => setMoreMenuOpen(true)}
              className={`
                  flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200
                  ${isMoreMenuOpen ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}
                `}
            >
              <div
                className={`transition-transform duration-200 ${isMoreMenuOpen ? "-translate-y-0.5" : ""} relative`}
              >
                <Menu size={22} />
                {trashCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm ring-1 ring-white animate-in zoom-in duration-300">
                    {trashCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-bold ${isMoreMenuOpen ? "text-indigo-600" : "text-slate-500"} ${isMoreMenuOpen ? "opacity-100" : "opacity-80"}`}
              >
                মেনু
              </span>
            </button>
          </nav>
        </div>
      )}

      {/* "More" Menu Drawer */}
      {isMoreMenuOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setMoreMenuOpen(false)}
            />

            <div className="relative bg-white rounded-t-[2rem] p-4 pb-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[75vh] overflow-y-auto w-full max-w-lg mx-auto border-t border-slate-100">
              <div
                className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4 cursor-pointer"
                onClick={() => setMoreMenuOpen(false)}
              />

              <div
                onClick={() => handleNavigation("/profile")}
                className="flex items-center justify-between gap-1 mb-5 bg-slate-50 p-2.5 rounded-3xl border border-slate-100 relative overflow-hidden cursor-pointer active:bg-slate-100 transition-colors"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-full -mr-10 -mt-10 opacity-50 blur-xl"></div>

                <div className="flex items-center gap-2 relative z-10 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white border-2 border-white flex items-center justify-center shadow-md">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <User size={18} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-800 truncate leading-tight">
                      {user.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                      {isAdmin ? "Admin" : user.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLogoutConfirmOpen(true);
                  }}
                  className="relative z-10 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-[10px] active:scale-95 transition-all border border-rose-100 shadow-sm flex-shrink-0"
                >
                  <LogOut size={12} />
                  লগআউট
                </button>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    handleBackToUsers();
                    setMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3.5 mb-4 rounded-2xl bg-indigo-50 text-indigo-600 font-bold text-sm active:scale-[0.98] transition-all border border-indigo-100"
                >
                  <UserCog size={18} />
                  ইউজার লিস্টে ফিরে যান
                </button>
              )}

              <h3
                className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2"
                style={{ fontFamily: "'Kohinoor Bangla', sans-serif" }}
              >
                অন্যান্য মেনু
              </h3>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {SECONDARY_NAV.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-100 shadow-sm active:scale-95 transition-all group hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm mb-1.5 relative">
                      {React.cloneElement(
                        item.icon as React.ReactElement<{ size?: number }>,
                        { size: 14 },
                      )}
                      {item.path === "/trash" && trashCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm ring-2 bg-white group-hover:ring-indigo-600 transition-all animate-in zoom-in duration-300">
                          {trashCount}
                        </span>
                      )}
                    </div>
                    <p
                      className="font-normal text-slate-700 text-[10px] leading-tight text-center"
                      style={{ fontFamily: "'Kohinoor Bangla', sans-serif" }}
                    >
                      {item.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ABOUT MODAL (Developer Info) - Keeps existing code structure... */}
      {isAboutOpen &&
        createPortal(
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setAboutOpen(false)}
            />

            <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 pt-8 text-center relative">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-10 -left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2.5 text-indigo-700 font-black text-3xl mb-3 shadow-lg ring-4 ring-white/20">
                    <AppLogo variant="color" size="100%" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {APP_NAME}
                  </h2>
                  <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mt-1">
                    ভার্সন ২.০.০
                  </p>
                </div>

                <button
                  onClick={() => setAboutOpen(false)}
                  className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-50 active:scale-90"
                  aria-label="Close"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-slate-500 text-sm leading-relaxed">
                    অডিও প্রফেশনালদের জন্য একটি পূর্ণাঙ্গ প্রজেক্ট এবং আর্থিক
                    ব্যবস্থাপনা সিস্টেম। আপনার সাউন্ড ডিজাইনিং ক্যারিয়ারকে সহজ ও
                    গোছানো রাখুন।
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex flex-col items-center mb-4 -mt-10">
                    <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-200">
                      <img
                        src={DEVELOPER_INFO.image}
                        alt="Developer"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h3 className="font-bold text-slate-800 mt-2">
                      {DEVELOPER_INFO.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {DEVELOPER_INFO.title}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <a
                      href={DEVELOPER_INFO.facebook}
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(DEVELOPER_INFO.facebook, "_blank");
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Facebook size={20} />
                      <span className="text-[10px] font-bold">ফেইসবুক</span>
                    </a>
                    <a
                      href={DEVELOPER_INFO.whatsapp}
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(DEVELOPER_INFO.whatsapp, "_blank");
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                    >
                      <MessageCircle size={20} />
                      <span className="text-[10px] font-bold">হোয়াটসঅ্যাপ</span>
                    </a>
                    <a
                      href={DEVELOPER_INFO.phone}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                    >
                      <Phone size={20} />
                      <span className="text-[10px] font-bold">কল করুন</span>
                    </a>
                    <a
                      href={DEVELOPER_INFO.instagram}
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(DEVELOPER_INFO.instagram, "_blank");
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 p-2 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors"
                    >
                      <Instagram size={20} />
                      <span className="text-[10px] font-bold">ইন্সটাগ্রাম</span>
                    </a>
                    <a
                      href={DEVELOPER_INFO.telegram}
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(DEVELOPER_INFO.telegram, "_blank");
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 p-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                    >
                      <Send size={20} />
                      <span className="text-[10px] font-bold">টেলিগ্রাম</span>
                    </a>
                    <a
                      href={DEVELOPER_INFO.website}
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(DEVELOPER_INFO.website, "_blank");
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                    >
                      <Globe size={20} />
                      <span className="text-[10px] font-bold">ওয়েবসাইট</span>
                    </a>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-[10px] text-slate-400 font-medium">
                    Developed with ❤️ by{" "}
                    <span className="text-indigo-600 font-bold">
                      {DEVELOPER_INFO.name}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Fullscreen Processing Overlay */}
      {isProcessing &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-slate-50/95 flex flex-col items-center justify-center animate-in fade-in duration-150">
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="premium-loader-container !w-16 !h-16 p-3.5">
                <div className="premium-loader-ring"></div>
                <div className="premium-loader-text w-full h-full flex items-center justify-center">
                  <AppLogo variant="transparent-color" size="100%" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-slate-600 font-medium text-lg tracking-wide animate-pulse">
                  {processingMessage}
                </p>
                <p className="text-slate-400 text-sm">দয়া করে অপেক্ষা করুন</p>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* App Logout Confirmation Modal */}
      {isLogoutConfirmOpen &&
        createPortal(
          <div className="fixed inset-0 z-[10050] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
            {/* Overlay background click to close */}
            <div 
              className="absolute inset-0" 
              onClick={() => setIsLogoutConfirmOpen(false)} 
            />
            
            <div 
              className="relative bg-white rounded-[32px] shadow-2xl max-w-[340px] w-full p-6 pb-7 animate-in zoom-in-95 duration-200 border border-slate-50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title matches the screenshot */}
              <h3 className="text-[25px] font-black text-slate-900 text-center mb-3 leading-tight tracking-tight">
                লগ আউট
              </h3>
              
              {/* Message matches the screenshot */}
              <p className="text-[17px] font-semibold text-slate-800 text-center mb-7 max-w-[270px] mx-auto leading-relaxed">
                আপনি কি আসলেই লগ আউট করতে চান?
              </p>

              {/* Confirm & Cancel Buttons formatted like the screenshot:
                  "না" (vibrant blue container, white text, prominent/primary action to stay)
                  "হ্যাঁ" (light grey container, dark slate/black text, secondary action to exit)
              */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  className="flex-1 py-3.5 rounded-full font-black text-white bg-[#1e75eb] hover:bg-blue-600 shadow-lg shadow-blue-100 transition-all active:scale-[0.96] text-[16.5px] cursor-pointer"
                >
                  না
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogoutConfirmOpen(false);
                    onLogout();
                  }}
                  className="flex-1 py-3.5 rounded-full font-bold text-slate-900 bg-[#eaeaea] hover:bg-[#dfdfdf] transition-all active:scale-[0.96] text-[16.5px] cursor-pointer"
                >
                  হ্যাঁ
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
