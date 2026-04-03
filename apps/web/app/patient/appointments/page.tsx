"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  Plus, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  Filter,
  Video,
  Stethoscope,
  Building2,
  CalendarDays,
  Loader2
} from "lucide-react";

type Doctor = {
  id: string;
  name: string;
  email: string;
  specialty: string | null;
  hospital: string | null;
  department: string | null;
  image: string | null;
  doctorAvailability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDuration: number;
  }[];
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
  doctor: {
    id: string;
    name: string;
    email: string;
    specialty: string | null;
    hospital: string | null;
    department: string | null;
    image: string | null;
  };
  createdAt: string;
  approvedAt: string | null;
};

type TimeSlot = {
  time: string;
  available: boolean;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "all">("upcoming");
  
  // Booking flow state
  const [bookingStep, setBookingStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Booking form
  const [appointmentTitle, setAppointmentTitle] = useState("General Checkup");
  const [appointmentDescription, setAppointmentDescription] = useState("");
  const [appointmentType, setAppointmentType] = useState("general");
  const [isVirtual, setIsVirtual] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments");
      const data = await response.json();
      if (data.appointments) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (specialtyFilter) params.set("specialty", specialtyFilter);
      
      const response = await fetch(`/api/doctors?${params}`);
      const data = await response.json();
      if (data.doctors) {
        setDoctors(data.doctors);
        setSpecialties(data.specialties || []);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchAvailableSlots = async (doctorId: string, date: Date) => {
    setLoadingSlots(true);
    try {
      const dateStr = date.toISOString().split("T")[0];
      const response = await fetch(`/api/doctors/${doctorId}/availability?date=${dateStr}`);
      const data = await response.json();
      setAvailableSlots(data.availableSlots || []);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;
    
    setSubmitting(true);
    try {
      const [hours, minutes] = selectedSlot.split(":").map(Number);
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(hours, minutes, 0, 0);

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          title: appointmentTitle,
          description: appointmentDescription,
          appointmentType,
          scheduledDate: scheduledDate.toISOString(),
          duration: 30,
          isVirtual,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setShowBookingModal(false);
        resetBookingForm();
        fetchAppointments();
        alert("Appointment booked successfully! Waiting for doctor approval.");
      } else {
        alert(data.error || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (response.ok) {
        fetchAppointments();
      } else {
        alert("Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  const resetBookingForm = () => {
    setBookingStep(1);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
    setAppointmentTitle("General Checkup");
    setAppointmentDescription("");
    setAppointmentType("general");
    setIsVirtual(false);
  };

  const openBookingModal = () => {
    resetBookingForm();
    setShowBookingModal(true);
    fetchDoctors();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
      PENDING: { 
        bg: "bg-amber-100 dark:bg-amber-900/30", 
        text: "text-amber-700 dark:text-amber-400",
        icon: <AlertCircle className="h-4 w-4" />
      },
      APPROVED: { 
        bg: "bg-green-100 dark:bg-green-900/30", 
        text: "text-green-700 dark:text-green-400",
        icon: <CheckCircle2 className="h-4 w-4" />
      },
      REJECTED: { 
        bg: "bg-red-100 dark:bg-red-900/30", 
        text: "text-red-700 dark:text-red-400",
        icon: <XCircle className="h-4 w-4" />
      },
      COMPLETED: { 
        bg: "bg-blue-100 dark:bg-blue-900/30", 
        text: "text-blue-700 dark:text-blue-400",
        icon: <CheckCircle2 className="h-4 w-4" />
      },
      CANCELLED: { 
        bg: "bg-gray-100 dark:bg-gray-900/30", 
        text: "text-gray-700 dark:text-gray-400",
        icon: <XCircle className="h-4 w-4" />
      },
    };
    
    const style = styles[status] || styles.PENDING;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.icon}
        {status.charAt(0) + status.slice(1).toLowerCase()}
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

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.scheduledDate);
    const now = new Date();
    
    if (activeTab === "upcoming") {
      return aptDate >= now && !["COMPLETED", "CANCELLED", "REJECTED"].includes(apt.status);
    } else if (activeTab === "past") {
      return aptDate < now || ["COMPLETED", "CANCELLED", "REJECTED"].includes(apt.status);
    }
    return true;
  });

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isDateAvailable = (date: Date | null) => {
    if (!date || !selectedDoctor) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    
    // If doctor hasn't set up availability, allow all future dates
    if (!selectedDoctor.doctorAvailability || selectedDoctor.doctorAvailability.length === 0) {
      return true;
    }
    
    const dayOfWeek = date.getDay();
    return selectedDoctor.doctorAvailability.some(
      (a) => a.dayOfWeek === dayOfWeek
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointments</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your medical appointments and book new ones
          </p>
        </div>
        <button 
          onClick={openBookingModal}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          Book Appointment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Upcoming", 
            count: appointments.filter(a => new Date(a.scheduledDate) >= new Date() && !["COMPLETED", "CANCELLED", "REJECTED"].includes(a.status)).length,
            color: "from-blue-500 to-blue-600",
            icon: CalendarDays
          },
          { 
            label: "Pending Approval", 
            count: appointments.filter(a => a.status === "PENDING").length,
            color: "from-amber-500 to-orange-600",
            icon: Clock
          },
          { 
            label: "Approved", 
            count: appointments.filter(a => a.status === "APPROVED").length,
            color: "from-green-500 to-emerald-600",
            icon: CheckCircle2
          },
          { 
            label: "Completed", 
            count: appointments.filter(a => a.status === "COMPLETED").length,
            color: "from-purple-500 to-indigo-600",
            icon: Stethoscope
          },
        ].map((stat, idx) => (
          <div key={idx} className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-gray-100 dark:border-gray-800">
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
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-2">
        <div className="flex items-center gap-2">
          {[
            { key: "upcoming", label: "Upcoming" },
            { key: "past", label: "Past" },
            { key: "all", label: "All Appointments" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
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
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      <User className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {appointment.title}
                        </h3>
                        {getStatusBadge(appointment.status)}
                        {appointment.isVirtual && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                            <Video className="h-3 w-3" />
                            Virtual
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Dr. {appointment.doctor.name} • {appointment.doctor.specialty || "General"}
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
                        {appointment.doctor.hospital && (
                          <span className="flex items-center gap-1.5">
                            <Building2 className="h-4 w-4" />
                            {appointment.doctor.hospital}
                          </span>
                        )}
                      </div>
                      {appointment.status === "REJECTED" && appointment.rejectionReason && (
                        <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <p className="text-sm text-red-700 dark:text-red-400">
                            <span className="font-medium">Rejection reason:</span> {appointment.rejectionReason}
                          </p>
                        </div>
                      )}
                      {appointment.status === "APPROVED" && appointment.doctorNotes && (
                        <div className="mt-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <p className="text-sm text-green-700 dark:text-green-400">
                            <span className="font-medium">Doctor's note:</span> {appointment.doctorNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 lg:flex-shrink-0">
                    {appointment.isVirtual && appointment.meetingLink && appointment.status === "APPROVED" && (
                      <a
                        href={appointment.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Meeting
                      </a>
                    )}
                    {["PENDING", "APPROVED"].includes(appointment.status) && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Cancel
                      </button>
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
              {activeTab === "upcoming" 
                ? "You don't have any upcoming appointments. Book one now!"
                : "No appointments in this category."}
            </p>
            {activeTab === "upcoming" && (
              <button 
                onClick={openBookingModal}
                className="mt-6 inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Book Your First Appointment
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Book Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            type: "general", 
            title: "General Checkup", 
            desc: "Schedule a routine health examination",
            gradient: "from-blue-500 to-cyan-500",
            bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50"
          },
          { 
            type: "specialist", 
            title: "Specialist Visit", 
            desc: "Consult with a medical specialist",
            gradient: "from-green-500 to-emerald-500",
            bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50"
          },
          { 
            type: "follow_up", 
            title: "Follow-up Visit", 
            desc: "Continue your ongoing treatment",
            gradient: "from-purple-500 to-pink-500",
            bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50"
          },
        ].map((card) => (
          <button
            key={card.type}
            onClick={() => {
              setAppointmentType(card.type);
              setAppointmentTitle(card.title);
              openBookingModal();
            }}
            className={`group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${card.bgGradient} border border-gray-200 dark:border-gray-700 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
          >
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 shadow-lg`}>
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {card.title}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {card.desc}
            </p>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
              Book now
              <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
        ))}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowBookingModal(false)}
            />
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Book Appointment
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Step {bookingStep} of 3 - {bookingStep === 1 ? "Select Doctor" : bookingStep === 2 ? "Choose Time" : "Confirm Details"}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-6 w-6 text-gray-500" />
                  </button>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4 flex gap-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        step <= bookingStep
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* Step 1: Select Doctor */}
                {bookingStep === 1 && (
                  <div className="space-y-6">
                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search doctors by name, specialty..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            fetchDoctors();
                          }}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <select
                        value={specialtyFilter}
                        onChange={(e) => {
                          setSpecialtyFilter(e.target.value);
                          fetchDoctors();
                        }}
                        className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="">All Specialties</option>
                        {specialties.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Doctors List */}
                    <div className="grid gap-4">
                      {doctors.length > 0 ? (
                        doctors.map((doctor) => (
                          <button
                            key={doctor.id}
                            onClick={() => {
                              setSelectedDoctor(doctor);
                              setBookingStep(2);
                            }}
                            className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-lg ${
                              selectedDoctor?.id === doctor.id
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                <User className="h-8 w-8 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  Dr. {doctor.name}
                                </h3>
                                <p className="text-blue-600 dark:text-blue-400 font-medium">
                                  {doctor.specialty || "General Practitioner"}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                                  {doctor.hospital && (
                                    <span className="flex items-center gap-1">
                                      <Building2 className="h-4 w-4" />
                                      {doctor.hospital}
                                    </span>
                                  )}
                                  {doctor.department && (
                                    <span className="flex items-center gap-1">
                                      <Stethoscope className="h-4 w-4" />
                                      {doctor.department}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="h-6 w-6 text-gray-400 flex-shrink-0" />
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <User className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-4 text-gray-500 dark:text-gray-400">
                            No doctors found. Try adjusting your search.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Select Date & Time */}
                {bookingStep === 2 && selectedDoctor && (
                  <div className="space-y-6">
                    {/* Selected Doctor Info */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Dr. {selectedDoctor.name}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {selectedDoctor.specialty || "General Practitioner"}
                        </p>
                      </div>
                      <button
                        onClick={() => setBookingStep(1)}
                        className="ml-auto text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Change
                      </button>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Calendar */}
                      <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                          </h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                              {day}
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {getDaysInMonth(currentMonth).map((date, idx) => {
                            const isAvailable = isDateAvailable(date);
                            const isSelected = selectedDate && date && 
                              selectedDate.toDateString() === date.toDateString();
                            
                            return (
                              <button
                                key={idx}
                                disabled={!isAvailable}
                                onClick={() => {
                                  if (date && isAvailable) {
                                    setSelectedDate(date);
                                    setSelectedSlot(null);
                                    fetchAvailableSlots(selectedDoctor.id, date);
                                  }
                                }}
                                className={`aspect-square rounded-xl text-sm font-medium transition-all ${
                                  !date
                                    ? ""
                                    : isSelected
                                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg"
                                    : isAvailable
                                    ? "hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-900 dark:text-white"
                                    : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                }`}
                              >
                                {date?.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time Slots */}
                      <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                          {selectedDate 
                            ? `Available times for ${selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`
                            : "Select a date to see available times"}
                        </h3>
                        
                        {loadingSlots ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          </div>
                        ) : selectedDate ? (
                          availableSlots.filter(s => s.available).length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                              {availableSlots
                                .filter((slot) => slot.available)
                                .map((slot) => (
                                  <button
                                    key={slot.time}
                                    onClick={() => setSelectedSlot(slot.time)}
                                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                      selectedSlot === slot.time
                                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg"
                                        : "bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-600"
                                    }`}
                                  >
                                    {slot.time}
                                  </button>
                                ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              No available slots for this date
                            </div>
                          )
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Calendar className="mx-auto h-12 w-12 mb-3 opacity-50" />
                            Please select a date from the calendar
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Continue Button */}
                    <div className="flex justify-between">
                      <button
                        onClick={() => setBookingStep(1)}
                        className="px-6 py-3 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setBookingStep(3)}
                        disabled={!selectedDate || !selectedSlot}
                        className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirm Details */}
                {bookingStep === 3 && selectedDoctor && selectedDate && selectedSlot && (
                  <div className="space-y-6">
                    {/* Appointment Summary */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Appointment Summary
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Doctor</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Dr. {selectedDoctor.name} • {selectedDoctor.specialty || "General"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} at {selectedSlot}
                            </p>
                          </div>
                        </div>
                        {selectedDoctor.hospital && (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {selectedDoctor.hospital}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Appointment Details Form */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Appointment Title
                        </label>
                        <input
                          type="text"
                          value={appointmentTitle}
                          onChange={(e) => setAppointmentTitle(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="e.g., General Checkup, Follow-up Visit"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Appointment Type
                        </label>
                        <select
                          value={appointmentType}
                          onChange={(e) => setAppointmentType(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                          <option value="general">General Checkup</option>
                          <option value="specialist">Specialist Consultation</option>
                          <option value="follow_up">Follow-up Visit</option>
                          <option value="emergency">Emergency</option>
                          <option value="lab_test">Lab Test</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Additional Notes (Optional)
                        </label>
                        <textarea
                          value={appointmentDescription}
                          onChange={(e) => setAppointmentDescription(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                          placeholder="Describe your symptoms or reason for visit..."
                        />
                      </div>

                      <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                        <input
                          type="checkbox"
                          id="isVirtual"
                          checked={isVirtual}
                          onChange={(e) => setIsVirtual(e.target.checked)}
                          className="h-5 w-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isVirtual" className="flex items-center gap-2 cursor-pointer">
                          <Video className="h-5 w-5 text-purple-600" />
                          <span className="text-gray-900 dark:text-white font-medium">Virtual Appointment (Telemedicine)</span>
                        </label>
                      </div>
                    </div>

                    {/* Notice */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Your appointment will be pending until the doctor approves it. You'll receive a notification once it's confirmed.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between">
                      <button
                        onClick={() => setBookingStep(2)}
                        className="px-6 py-3 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleBookAppointment}
                        disabled={submitting || !appointmentTitle}
                        className="px-8 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg inline-flex items-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5" />
                            Confirm Booking
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
