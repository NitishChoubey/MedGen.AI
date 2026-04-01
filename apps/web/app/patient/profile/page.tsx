import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import {
  User,
  Mail,
  Calendar,
  Droplet,
  Users,
  AlertCircle,
  FileText,
  Edit,
  Phone,
} from "lucide-react";
import Link from "next/link";

async function getPatientProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      dateOfBirth: true,
      gender: true,
      bloodType: true,
      allergies: true,
      medicalHistory: true,
      emergencyContact: true,
      phone: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  return user;
}

export default async function PatientProfile() {
  const session = await getServerSession(authOptions);
  const profile = await getPatientProfile(session!.user.id);

  let allergiesList: string[] = [];
  let medicalHistoryList: string[] = [];
  let emergencyContactData: { name?: string; phone?: string } = {};

  try {
    if (profile.allergies) {
      allergiesList = JSON.parse(profile.allergies);
    }
  } catch (e) {
    if (profile.allergies) allergiesList = [profile.allergies];
  }

  try {
    if (profile.medicalHistory) {
      medicalHistoryList = JSON.parse(profile.medicalHistory);
    }
  } catch (e) {
    if (profile.medicalHistory) medicalHistoryList = [profile.medicalHistory];
  }

  try {
    if (profile.emergencyContact) {
      emergencyContactData = JSON.parse(profile.emergencyContact);
    }
  } catch (e) {
    // Keep empty object
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">
            View and manage your personal information
          </p>
        </div>
        <Link
          href="/patient/settings"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Link>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Personal Information
          </h2>
        </div>
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="mt-1 text-sm text-gray-900">
                {profile.name || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500">Email Address</p>
              <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500">Date of Birth</p>
              <p className="mt-1 text-sm text-gray-900">
                {profile.dateOfBirth
                  ? new Date(profile.dateOfBirth).toLocaleDateString()
                  : "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Users className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500">Gender</p>
              <p className="mt-1 text-sm text-gray-900">
                {profile.gender || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Droplet className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500">Blood Type</p>
              <p className="mt-1 text-sm text-gray-900">
                {profile.bloodType || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Phone className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500">Phone Number</p>
              <p className="mt-1 text-sm text-gray-900">
                {profile.phone || "Not provided"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Medical Information
          </h2>
        </div>
        <div className="px-6 py-4 space-y-6">
          {/* Allergies */}
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">Allergies</p>
              {allergiesList.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {allergiesList.map((allergy, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-900">
                  No known allergies
                </p>
              )}
            </div>
          </div>

          {/* Medical History */}
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-blue-500 mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">
                Medical History
              </p>
              {medicalHistoryList.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {medicalHistoryList.map((condition, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-900 flex items-center"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></span>
                      {condition}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-gray-900">
                  No medical history recorded
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Emergency Contact
          </h2>
        </div>
        <div className="px-6 py-4">
          {emergencyContactData.name || emergencyContactData.phone ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {emergencyContactData.name || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Phone Number
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {emergencyContactData.phone || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Phone className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                No emergency contact information on file
              </p>
              <Link
                href="/patient/settings"
                className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Add emergency contact
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Member since:</span>{" "}
          {new Date(profile.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
