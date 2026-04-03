"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Video,
  Phone,
  Mail,
  Building2,
  Stethoscope,
  CalendarDays,
  Loader2,
  UserCheck,
  UserX,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

type Patient = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
};

type Appointment = {
  id: string;
  title: string;
  description: string | null;
  appointmentType: string;
  scheduledDate: string;
  duration: number;
  status: string;
  isVirtual: boolean;
  meetingLink: string | null;
  doctorNotes: string | null;
  rejectionReason: string | null;
  patient: Patient;
  createdAt: string;
  approvedAt: string | null;
};

type Stats = {
  pending: number;
  today: number;
  approved: number;
  completed: number;
};

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, today: 0, approved: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "complete">("approve");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [activeFilter, selectedDate]);

  const fetchAppointments = async () => {
    try {
      const params = new URLSearchParams();
      if (activeFilter !== "all") params.set("status", activeFilter);
      if (selectedDate) params.set("date", selectedDate);

      const response = await fetch(`/api/doctor/appointments?${params}`);
      const data = await response.json();
      
      if (data.appointments) {
        setAppointments(data.appointments);
      }
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedAppointment) return;
    
    setSubmitting(true);
    try {
      const body: any = {};
      
      if (actionType === "approve") {
        body.status = "APPROVED";
        body.doctorNotes = doctorNotes;
        if (selectedAppointment.isVirtual && meetingLink) {
          body.meetingLink = meetingLink;
        }
      } else if (actionType === "reject") {
        body.status = "REJECTED";
        body.rejectionReason = rejectionReason;
      } else if (actionType === "complete") {
        body.status = "COMPLETED";
        body.doctorNotes = doctorNotes;
      }

      const response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowActionModal(false);
        resetModal();
        fetchAppointments();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update appointment");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Failed to update appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const resetModal = () => {
    setSelectedAppointment(null);
    setDoctorNotes("");
    setRejectionReason("");
    setMeetingLink("");
  };

  const openActionModal = (appointment: Appointment, action: "approve" | "reject" | "complete") => {
    setSelectedAppointment(appointment);
    setActionType(action);
    setShowActionModal(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
      PENDING: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-700 dark:text-amber-400",
        icon: <AlertCircle className="h-4 w-4" />,
      },
      APPROVED: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-400",
        icon: <CheckCircle2 className="h-4 w-4" />,
      },
      REJECTED: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        icon: <XCircle className="h-4 w-4" />,
      },
      COMPLETED: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-400",
        icon: <CheckCircle2 className="h-4 w-4" />,
      },
      CANCELLED: {
        bg: "bg-gray-100 dark:bg-gray-900/30",
        text: "text-gray-700 dark:text-gray-400",
        icon: <XCircle className="h-4 w-4" />,
      },
      NO_SHOW: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        icon: <UserX className="h-4 w-4" />,
      },
    };

    const style = styles[status] || styles.PENDING;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.icon}
        {status.replace("_", " ").charAt(0) + status.replace("_", " ").slice(1).toLowerCase()}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      apt.patient.name?.toLowerCase().includes(query) ||
      apt.patient.email?.toLowerCase().includes(query) ||
      apt.title.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointments</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage patient appointments and approve booking requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Pending Approval",
            count: stats.pending,
            color: "from-amber-500 to-orange-600",
            icon: AlertCircle,
            filterValue: "PENDING",
          },
          {
            label: "Today's Appointments",
            count: stats.today,
            color: "from-blue-500 to-indigo-600",
            icon: CalendarDays,
            filterValue: "",
          },
          {
            label: "Approved",
            count: stats.approved,
            color: "from-green-500 to-emerald-600",
            icon: CheckCircle2,
            filterValue: "APPROVED",
          },
          {
            label: "Completed",
            count: stats.completed,
            color: "from-purple-500 to-indigo-600",
            icon: UserCheck,
            filterValue: "COMPLETED",
          },
        ].map((stat, idx) => (
          <button
            key={idx}
            onClick={() => setActiveFilter(stat.filterValue || "all")}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-gray-100 dark:border-gray-800 text-left transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            {[
              { value: "all", label: "All" },
              { value: "PENDING", label: "Pending" },
              { value: "APPROVED", label: "Approved" },
              { value: "COMPLETED", label: "Completed" },
              { value: "REJECTED", label: "Rejected" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === filter.value
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Patient Avatar */}
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      <User className="h-7 w-7 text-white" />
                    </div>

                    {/* Appointment Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {appointment.patient.name || "Unknown Patient"}
                        </h3>
                        {getStatusBadge(appointment.status)}
                        {appointment.isVirtual && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                            <Video className="h-3 w-3" />
                            Virtual
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-blue-600 dark:text-blue-400 font-medium">
                        {appointment.title}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {formatDate(appointment.scheduledDate)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {formatTime(appointment.scheduledDate)}
                        </span>
                        {appointment.patient.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-4 w-4" />
                            {appointment.patient.email}
                          </span>
                        )}
                        {appointment.patient.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-4 w-4" />
                            {appointment.patient.phone}
                          </span>
                        )}
                        {appointment.patient.dateOfBirth && (
                          <span className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            {calculateAge(appointment.patient.dateOfBirth)} years old
                          </span>
                        )}
                      </div>

                      {appointment.description && (
                        <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Patient's note:</span> {appointment.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 xl:flex-shrink-0">
                    {appointment.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => openActionModal(appointment, "approve")}
                          className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors shadow-lg"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => openActionModal(appointment, "reject")}
                          className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </button>
                      </>
                    )}

                    {appointment.status === "APPROVED" && (
                      <>
                        {appointment.isVirtual && appointment.meetingLink && (
                          <a
                            href={appointment.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join
                          </a>
                        )}
                        <button
                          onClick={() => openActionModal(appointment, "complete")}
                          className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark Complete
                        </button>
                      </>
                    )}

                    {appointment.status === "COMPLETED" && appointment.doctorNotes && (
                      <div className="px-4 py-2 rounded-xl text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        <MessageSquare className="h-4 w-4 inline mr-2" />
                        Notes added
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6">
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-6">
              <Calendar className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              No appointments found
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {activeFilter !== "all"
                ? `No ${activeFilter.toLowerCase()} appointments.`
                : "You don't have any appointments yet."}
            </p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setShowActionModal(false);
                resetModal();
              }}
            />
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {actionType === "approve" && "Approve Appointment"}
                  {actionType === "reject" && "Reject Appointment"}
                  {actionType === "complete" && "Complete Appointment"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedAppointment.patient.name} - {selectedAppointment.title}
                </p>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                {/* Appointment Summary */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(selectedAppointment.scheduledDate)} at {formatTime(selectedAppointment.scheduledDate)}
                    </span>
                  </div>
                </div>

                {/* Approve Form */}
                {actionType === "approve" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes for Patient (Optional)
                      </label>
                      <textarea
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                        placeholder="Any instructions or notes for the patient..."
                      />
                    </div>

                    {selectedAppointment.isVirtual && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Meeting Link (for Virtual Appointments)
                        </label>
                        <input
                          type="url"
                          value={meetingLink}
                          onChange={(e) => setMeetingLink(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          placeholder="https://meet.google.com/..."
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Reject Form */}
                {actionType === "reject" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason for Rejection <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                      placeholder="Please provide a reason for rejecting this appointment..."
                    />
                  </div>
                )}

                {/* Complete Form */}
                {actionType === "complete" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Post-Appointment Notes (Optional)
                    </label>
                    <textarea
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      placeholder="Summary of the appointment, follow-up instructions, prescriptions..."
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    resetModal();
                  }}
                  className="px-6 py-3 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={submitting || (actionType === "reject" && !rejectionReason)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-lg inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    actionType === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : actionType === "reject"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {actionType === "approve" && (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          Approve
                        </>
                      )}
                      {actionType === "reject" && (
                        <>
                          <XCircle className="h-5 w-5" />
                          Reject
                        </>
                      )}
                      {actionType === "complete" && (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          Mark Complete
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
