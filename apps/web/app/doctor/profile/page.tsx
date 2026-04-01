import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { User, Mail, Phone, Building, Award, Stethoscope, Calendar, Shield } from "lucide-react";

async function getDoctorProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      hospital: true,
      department: true,
      specialty: true,
      licenseNumber: true,
      createdAt: true,
      _count: { select: { analyses: true } },
    },
  });
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const profile = await getDoctorProfile(session.user.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end -mt-16 mb-6">
            <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
              <span className="text-white font-bold text-4xl">{profile?.name?.charAt(0) || "D"}</span>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 sm:mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dr. {profile?.name || "Doctor"}</h2>
              <p className="text-gray-500 dark:text-gray-400">{profile?.specialty || "General Medicine"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Mail className="h-5 w-5 text-blue-500" />
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Email</p><p className="font-medium text-gray-900 dark:text-white">{profile?.email}</p></div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Phone className="h-5 w-5 text-green-500" />
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Phone</p><p className="font-medium text-gray-900 dark:text-white">{profile?.phone || "Not provided"}</p></div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Building className="h-5 w-5 text-purple-500" />
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Hospital</p><p className="font-medium text-gray-900 dark:text-white">{profile?.hospital || "Not provided"}</p></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Stethoscope className="h-5 w-5 text-orange-500" />
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Department</p><p className="font-medium text-gray-900 dark:text-white">{profile?.department || "Not provided"}</p></div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Award className="h-5 w-5 text-yellow-500" />
                <div><p className="text-xs text-gray-500 dark:text-gray-400">License Number</p><p className="font-medium text-gray-900 dark:text-white">{profile?.licenseNumber || "Not provided"}</p></div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Calendar className="h-5 w-5 text-indigo-500" />
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p><p className="font-medium text-gray-900 dark:text-white">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Documents Reviewed</p><p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{profile?._count.analyses || 0}</p></div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl"><Shield className="h-6 w-6 text-blue-600" /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Approval Rate</p><p className="text-3xl font-bold text-green-600 mt-1">98%</p></div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl"><Award className="h-6 w-6 text-green-600" /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Avg Response Time</p><p className="text-3xl font-bold text-purple-600 mt-1">~5min</p></div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl"><Calendar className="h-6 w-6 text-purple-600" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
