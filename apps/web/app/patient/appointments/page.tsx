import { Calendar, Plus, Clock } from "lucide-react";
import Link from "next/link";

export default function AppointmentsPage() {
  // Mock upcoming appointments - will be replaced with real data
  const upcomingAppointments = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-2 text-gray-600">
            Manage your medical appointments
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </button>
      </div>

      {/* Calendar/List View Toggle */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium text-sm">
            List View
          </button>
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm">
            Calendar View
          </button>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Upcoming Appointments
          </h2>
        </div>

        {upcomingAppointments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {upcomingAppointments.map((appointment: any, index: number) => (
              <div key={index} className="p-6 hover:bg-gray-50">
                {/* Appointment card content will go here */}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-6">
            <Calendar className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No appointments scheduled
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              Book your first appointment with a healthcare provider
            </p>
            <div className="mt-6">
              <button className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <Plus className="h-5 w-5 mr-2" />
                Book New Appointment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Past Appointments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Past Appointments
          </h2>
        </div>
        <div className="text-center py-8 px-6">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            No past appointments to display
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            General Checkup
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Schedule a routine health examination
          </p>
          <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">
            Book now →
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Specialist Visit
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Consult with a medical specialist
          </p>
          <button className="mt-4 text-sm font-medium text-green-600 hover:text-green-700">
            Book now →
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Lab Tests
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Schedule laboratory testing
          </p>
          <button className="mt-4 text-sm font-medium text-purple-600 hover:text-purple-700">
            Book now →
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Appointment System Coming Soon
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              We're building an integrated appointment booking system with calendar
              sync, reminders, and telemedicine options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
