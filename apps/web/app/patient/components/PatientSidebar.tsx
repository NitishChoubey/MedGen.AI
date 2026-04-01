"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  FileText,
  Upload,
  Activity,
  Calendar,
  Settings,
  LogOut,
  Heart,
} from "lucide-react";

interface PatientSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const menuItems = [
  {
    name: "Dashboard",
    href: "/patient/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Profile",
    href: "/patient/profile",
    icon: User,
  },
  {
    name: "Medical Records",
    href: "/patient/medical-records",
    icon: FileText,
  },
  {
    name: "Upload Document",
    href: "/patient/upload",
    icon: Upload,
  },
  {
    name: "Analyses",
    href: "/patient/analyses",
    icon: Activity,
  },
  {
    name: "Appointments",
    href: "/patient/appointments",
    icon: Calendar,
  },
  {
    name: "Settings",
    href: "/patient/settings",
    icon: Settings,
  },
];

export default function PatientSidebar({ user }: PatientSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/patient/dashboard" className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">MedGen.AI</h1>
            <p className="text-xs text-gray-500">Patient Portal</p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {user.name?.charAt(0) || user.email?.charAt(0) || "P"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || "Patient"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
