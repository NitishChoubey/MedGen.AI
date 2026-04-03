import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import PatientSidebar from "./components/PatientSidebar";

export const metadata = {
  title: "Patient Dashboard - MedGen.AI",
  description: "Manage your medical records and health data",
};

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Protect routes - require authentication and PATIENT role
  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "PATIENT") {
    redirect("/dashboard"); // Redirect to appropriate dashboard
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
      <PatientSidebar user={session.user} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
