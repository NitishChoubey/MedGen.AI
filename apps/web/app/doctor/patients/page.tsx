import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { Users, Search, Filter, User, Mail, Calendar, FileText } from "lucide-react";

async function getPatients() {
  return prisma.user.findMany({
    where: { role: "PATIENT" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      gender: true,
      bloodType: true,
      _count: { select: { analyses: true } },
    },
  });
}

export default async function PatientsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const patients = await getPatients();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="h-8 w-8 mr-3 text-blue-600" />
            Patients
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{patients.length} registered patient{patients.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search patients..." className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400" />
          </div>
          <button className="flex items-center px-4 py-2 bg-white dark:bg-slate-900 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:bg-slate-950 dark:hover:bg-gray-700">
            <Filter className="h-4 w-4 mr-2" />Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <div key={patient.id} className="bg-white dark:bg-slate-900 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
            <div className="flex items-start space-x-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">{patient.name?.charAt(0) || "P"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{patient.name || "Unknown"}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                  <Mail className="h-3 w-3 mr-1" />{patient.email}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 dark:bg-slate-950 dark:bg-gray-700/50 rounded-lg p-2">
                <p className="text-2xl font-bold text-blue-600">{patient._count.analyses}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Reports</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-950 dark:bg-gray-700/50 rounded-lg p-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{patient.gender || "-"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-950 dark:bg-gray-700/50 rounded-lg p-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{patient.bloodType || "-"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Blood</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Joined {new Date(patient.createdAt).toLocaleDateString()}
              </span>
              <button className="text-blue-600 hover:text-blue-700 font-medium">View Details</button>
            </div>
          </div>
        ))}
      </div>

      {patients.length === 0 && (
        <div className="bg-white dark:bg-slate-900 dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Patients Yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Patients will appear here once they register.</p>
        </div>
      )}
    </div>
  );
}
