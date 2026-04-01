import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardCheck, Search, Filter, Clock, AlertCircle, ArrowRight, FileText, User } from "lucide-react";

async function getPendingReviews() {
  return prisma.analysis.findMany({
    where: { reviewStatus: "pending_review" },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    include: { user: { select: { name: true, email: true } } },
  });
}

export default async function PendingReviewsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const pendingReviews = await getPendingReviews();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <ClipboardCheck className="h-8 w-8 mr-3 text-blue-600" />
            Pending Reviews
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{pendingReviews.length} document{pendingReviews.length !== 1 ? "s" : ""} awaiting your review</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search documents..." className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400" />
          </div>
          <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="h-4 w-4 mr-2" />Filter
          </button>
        </div>
      </div>

      {pendingReviews.length > 0 ? (
        <div className="grid gap-4">
          {pendingReviews.map((review) => (
            <Link key={review.id} href={`/doctor/review/${review.id}`} className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all group">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${review.priority === "urgent" ? "bg-red-100 dark:bg-red-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
                      {review.priority === "urgent" ? <AlertCircle className="h-6 w-6 text-red-600" /> : <FileText className="h-6 w-6 text-blue-600" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{review.patientName || review.user?.name || "Unknown Patient"}</h3>
                        {review.priority === "urgent" && <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium rounded-full">URGENT</span>}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{review.documentType || "Medical Report"}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{review.summary?.substring(0, 150)}...</p>
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-400">
                        <span className="flex items-center"><User className="h-3 w-3 mr-1" />{review.user?.email}</span>
                        <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <ClipboardCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">All Caught Up! 🎉</h3>
          <p className="text-gray-500 dark:text-gray-400">No documents pending review. Great work!</p>
        </div>
      )}
    </div>
  );
}
