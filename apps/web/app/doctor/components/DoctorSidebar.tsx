"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  FileCheck,
  Users,
  User,
  Settings,
  LogOut,
  Stethoscope,
  Bell,
  ChevronLeft,
  ChevronRight,
  Search,
  Moon,
  Sun,
  CalendarDays,
} from "lucide-react";

interface DoctorSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    specialty?: string | null;
    hospital?: string | null;
  };
}

const menuItems = [
  { name: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard, description: "Overview & stats" },
  { name: "Appointments", href: "/doctor/appointments", icon: CalendarDays, description: "Manage bookings", badge: true },
  { name: "Pending Reviews", href: "/doctor/pending-reviews", icon: ClipboardCheck, description: "Documents to review", badge: true },
  { name: "Approved", href: "/doctor/approved", icon: FileCheck, description: "Review history" },
  { name: "Patients", href: "/doctor/patients", icon: Users, description: "Patient list" },
  { name: "Profile", href: "/doctor/profile", icon: User, description: "Your information" },
  { name: "Settings", href: "/doctor/settings", icon: Settings, description: "Preferences" },
];

export default function DoctorSidebar({ user }: DoctorSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await fetch("/api/doctor/stats");
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.pendingReviews || 0);
        }
      } catch (error) {
        console.error("Failed to fetch pending count:", error);
      }
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setDarkMode(!darkMode);
  };

  return (
    <aside className={`${collapsed ? "w-20" : "w-72"} bg-white dark:bg-slate-900 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 shadow-lg`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Link href="/doctor/dashboard" className="flex items-center space-x-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            )}
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MedGen.AI</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Doctor Portal</p>
            </div>
          )}
        </Link>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search patients..." className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-slate-950 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-400" />
          </div>
        </div>
      )}

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">{user.name?.charAt(0) || user.email?.charAt(0) || "D"}</span>
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Dr. {user.name || "Doctor"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.specialty || "General Medicine"}</p>
              {user.hospital && <p className="text-xs text-blue-600 dark:text-blue-400 truncate">{user.hospital}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 ${collapsed ? "text-center" : ""}`}>
          {collapsed ? "..." : "Main Menu"}
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/doctor/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`group flex items-center ${collapsed ? "justify-center" : "space-x-3"} px-3 py-3 rounded-xl transition-all duration-200 ${isActive ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`} title={collapsed ? item.name : undefined}>
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600"}`} />
                {item.badge && pendingCount > 0 && !collapsed && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{pendingCount > 9 ? "9+" : pendingCount}</span>
                )}
              </div>
              {!collapsed && (
                <div className="flex-1">
                  <span className="text-sm font-medium">{item.name}</span>
                  {!isActive && <p className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">{item.description}</p>}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button onClick={toggleDarkMode} className={`w-full flex items-center ${collapsed ? "justify-center" : "space-x-3"} px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
          {darkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
          {!collapsed && <span className="text-sm font-medium">{darkMode ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <button className={`w-full flex items-center ${collapsed ? "justify-center" : "space-x-3"} px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative`}>
          <Bell className="h-5 w-5" />
          {!collapsed && <span className="text-sm font-medium">Notifications</span>}
          {pendingCount > 0 && <span className={`${collapsed ? "absolute top-0 right-0" : "ml-auto"} h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center`}>{pendingCount}</span>}
        </button>
        <button onClick={() => signOut({ callbackUrl: "/" })} className={`w-full flex items-center ${collapsed ? "justify-center" : "space-x-3"} px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors`}>
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)} className={`w-full flex items-center ${collapsed ? "justify-center" : "space-x-3"} px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <><ChevronLeft className="h-5 w-5" /><span className="text-sm">Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
