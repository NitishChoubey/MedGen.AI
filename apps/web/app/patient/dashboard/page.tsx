import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import {
  Activity,
  FileText,
  Calendar,
  TrendingUp,
  Upload,
  Eye,
  Clock,
} from "lucide-react";
import Link from "next/link";

async function getDashboardData(userId: string) {
  const [user, analysesCount, recentAnalyses, appointmentsCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        createdAt: true,
      },
    }),
    prisma.analysis.count({
      where: { userId },
    }),
    prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        summary: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.appointment.count({
      where: { 
        patientId: userId,
        scheduledDate: { gte: new Date() },
        status: { in: ["PENDING", "APPROVED"] },
      },
    }),
  ]);

  return {
    user,
    analysesCount,
    recentAnalyses,
    appointmentsCount,
  };
}

export default async function PatientDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "PATIENT") {
    redirect("/dashboard");
  }

  const userId = session.user.id;

  const { user, analysesCount, recentAnalyses, appointmentsCount } = await getDashboardData(userId);

  const stats = [
    {
      name: "Total Analyses",
      value: analysesCount,
      icon: Activity,
      color: "bg-blue-500",
      change: "+3 this month",
    },
    {
      name: "Medical Records",
      value: analysesCount,
      icon: FileText,
      color: "bg-green-500",
      change: "All secure",
    },
    {
      name: "Appointments",
      value: appointmentsCount,
      icon: Calendar,
      color: "bg-purple-500",
      change: appointmentsCount > 0 ? "Upcoming" : "Book now",
    },
    {
      name: "Health Score",
      value: "85%",
      icon: TrendingUp,
      color: "bg-orange-500",
      change: "+5% improvement",
    },
  ];

  const quickActions = [
    {
      name: "Upload Document",
      href: "/patient/upload",
      icon: Upload,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Book Appointment",
      href: "/patient/appointments",
      icon: Calendar,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      name: "View Profile",
      href: "/patient/profile",
      icon: Eye,
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name || "Patient"}! 👋
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here's an overview of your health dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                href={action.href}
                className={`${action.color} text-white rounded-lg p-4 flex items-center space-x-3 transition-colors`}
              >
                <Icon className="h-6 w-6" />
                <span className="font-medium">{action.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
          <Link
            href="/patient/analyses"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all
          </Link>
        </div>

        {recentAnalyses.length > 0 ? (
          <div className="space-y-4">
            {recentAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:bg-slate-950 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    AI Analysis Completed
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {analysis.summary.substring(0, 100)}...
                  </p>
                  <div className="mt-1 flex items-center space-x-4">
                    <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        analysis.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {analysis.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No activity yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Upload your first document to get started
            </p>
            <div className="mt-6">
              <Link
                href="/patient/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Health Tips */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">💡 Health Tip of the Day</h2>
        <p className="text-blue-50">
          Regular health checkups can help detect potential health issues before
          they become serious. Schedule your next appointment today!
        </p>
      </div>
    </div>
  );
}
