import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ClipboardCheck,
  FileCheck,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowRight,
  Activity,
  CheckCircle2,
  XCircle,
  CalendarDays,
} from "lucide-react";

async function getDashboardData(doctorId: string) {
  const [pendingReviews, approvedToday, totalApproved, recentActivity, urgentCases, pendingAppointments, todayAppointments] = await Promise.all([
    prisma.analysis.count({ where: { reviewStatus: "pending_review" } }),
    prisma.analysis.count({
      where: {
        reviewStatus: "approved",
        reviewedBy: doctorId,
        reviewedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.analysis.count({ where: { reviewStatus: "approved", reviewedBy: doctorId } }),
    prisma.analysis.findMany({
      where: { OR: [{ reviewStatus: "pending_review" }, { reviewedBy: doctorId }] },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.analysis.count({ where: { reviewStatus: "pending_review", priority: "urgent" } }),
    prisma.appointment.count({ 
      where: { 
        doctorId, 
        status: "PENDING" 
      } 
    }),
    prisma.appointment.count({
      where: {
        doctorId,
        scheduledDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        status: { in: ["PENDING", "APPROVED"] },
      },
    }),
  ]);
  return { pendingReviews, approvedToday, totalApproved, recentActivity, urgentCases, pendingAppointments, todayAppointments };
}

export default async function DoctorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");

  const doctorId = session.user.id;
  const { pendingReviews, approvedToday, totalApproved, recentActivity, urgentCases, pendingAppointments, todayAppointments } = await getDashboardData(doctorId);

  const stats = [
    { name: "Pending Reviews", value: pendingReviews, icon: ClipboardCheck, color: "from-orange-500 to-amber-500", href: "/doctor/pending-reviews", change: urgentCases > 0 ? urgentCases + " urgent" : "All normal priority", changeColor: urgentCases > 0 ? "text-red-600" : "text-green-600" },
    { name: "Appointments", value: pendingAppointments, icon: CalendarDays, color: "from-purple-500 to-pink-500", href: "/doctor/appointments", change: todayAppointments > 0 ? `${todayAppointments} today` : "No appointments today", changeColor: pendingAppointments > 0 ? "text-amber-600" : "text-gray-500 dark:text-gray-400" },
    { name: "Approved Today", value: approvedToday, icon: CheckCircle2, color: "from-green-500 to-emerald-500", href: "/doctor/approved", change: "Keep up the good work!", changeColor: "text-green-600" },
    { name: "Total Approved", value: totalApproved, icon: FileCheck, color: "from-blue-500 to-indigo-500", href: "/doctor/approved", change: "All time", changeColor: "text-gray-500 dark:text-gray-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, Dr. {session.user.name?.split(" ")[0] || "Doctor"}! 👋</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Here's what's happening with your medical reviews today.</p>
        </div>
        {pendingReviews > 0 && (
          <Link href="/doctor/pending-reviews" className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
            Start Reviewing <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        )}
      </div>

      {/* Urgent Alert */}
      {urgentCases > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center space-x-4">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-red-800 dark:text-red-200 font-semibold">{urgentCases} Urgent Case{urgentCases > 1 ? "s" : ""} Require Immediate Attention</h3>
            <p className="text-red-600 dark:text-red-300 text-sm">Please review these cases as soon as possible.</p>
          </div>
          <Link href="/doctor/pending-reviews?priority=urgent" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">View Urgent</Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.name} href={stat.href} className="group bg-white dark:bg-slate-900 dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}><Icon className="h-6 w-6 text-white" /></div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className={`mt-2 text-sm ${stat.changeColor}`}>{stat.change}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center"><Activity className="h-5 w-5 mr-2 text-blue-600" />Recent Activity</h2>
            <Link href="/doctor/approved" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentActivity.length > 0 ? recentActivity.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50 dark:bg-slate-950 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${item.reviewStatus === "approved" ? "bg-green-100 dark:bg-green-900/30" : item.reviewStatus === "rejected" ? "bg-red-100 dark:bg-red-900/30" : "bg-orange-100 dark:bg-orange-900/30"}`}>
                    {item.reviewStatus === "approved" ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : item.reviewStatus === "rejected" ? <XCircle className="h-5 w-5 text-red-600" /> : <Clock className="h-5 w-5 text-orange-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.patientName || item.user?.name || "Unknown Patient"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.documentType || "Medical Report"} - {item.summary?.substring(0, 50)}...</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-1">{new Date(item.updatedAt).toLocaleDateString()} at {new Date(item.updatedAt).toLocaleTimeString()}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.reviewStatus === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : item.reviewStatus === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"}`}>
                    {item.reviewStatus === "pending_review" ? "Pending" : item.reviewStatus}
                  </span>
                </div>
              </div>
            )) : (
              <div className="px-6 py-12 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/doctor/pending-reviews" className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl hover:shadow-md transition-all group">
              <ClipboardCheck className="h-8 w-8 text-blue-600 mr-4" />
              <div><p className="font-medium text-gray-900 dark:text-white">Review Documents</p><p className="text-sm text-gray-500 dark:text-gray-400">{pendingReviews} pending</p></div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/doctor/appointments" className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl hover:shadow-md transition-all group">
              <CalendarDays className="h-8 w-8 text-purple-600 mr-4" />
              <div><p className="font-medium text-gray-900 dark:text-white">Appointments</p><p className="text-sm text-gray-500 dark:text-gray-400">{pendingAppointments} pending approval</p></div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/doctor/patients" className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl hover:shadow-md transition-all group">
              <Users className="h-8 w-8 text-green-600 mr-4" />
              <div><p className="font-medium text-gray-900 dark:text-white">View Patients</p><p className="text-sm text-gray-500 dark:text-gray-400">Manage patient list</p></div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/doctor/approved" className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl hover:shadow-md transition-all group">
              <FileCheck className="h-8 w-8 text-purple-600 mr-4" />
              <div><p className="font-medium text-gray-900 dark:text-white">Review History</p><p className="text-sm text-gray-500 dark:text-gray-400">{totalApproved} approved</p></div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
            <div className="flex items-center justify-between mb-2"><TrendingUp className="h-6 w-6" /><span className="text-sm opacity-80">This Week</span></div>
            <p className="text-2xl font-bold">{approvedToday * 5}+</p>
            <p className="text-sm opacity-80">Documents Reviewed</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">💡 Pro Tip</h2>
        <p className="opacity-90">Use keyboard shortcuts to speed up your review process. Press <kbd className="px-2 py-1 bg-white/20 rounded text-sm mx-1">A</kbd> to approve and <kbd className="px-2 py-1 bg-white/20 rounded text-sm mx-1">R</kbd> to reject while reviewing a document.</p>
      </div>
    </div>
  );
}
