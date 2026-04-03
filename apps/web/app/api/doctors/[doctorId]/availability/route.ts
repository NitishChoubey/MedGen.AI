import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

// GET /api/doctors/[doctorId]/availability - Get doctor's available slots
export async function GET(
  request: Request,
  { params }: { params: { doctorId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { doctorId } = params;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date"); // YYYY-MM-DD format

    // Verify doctor exists and is active
    const doctor = await prisma.user.findFirst({
      where: {
        id: doctorId,
        role: "DOCTOR",
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        specialty: true,
        hospital: true,
        doctorAvailability: {
          where: { isActive: true },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    // If specific date provided, calculate available slots
    if (dateStr) {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();

      // Get doctor's availability for this day
      const dayAvailability = doctor.doctorAvailability.filter(
        (a) => a.dayOfWeek === dayOfWeek
      );

      // If doctor hasn't set availability, provide default business hours (9 AM - 5 PM)
      if (dayAvailability.length === 0) {
        const defaultSlots: { time: string; available: boolean }[] = [];
        const now = new Date();
        
        // Generate slots from 9 AM to 5 PM (30-minute intervals)
        for (let hour = 9; hour < 17; hour++) {
          for (let min of [0, 30]) {
            const slotDateTime = new Date(date);
            slotDateTime.setHours(hour, min, 0, 0);
            
            // Only show future slots
            if (slotDateTime > now) {
              const timeStr = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
              defaultSlots.push({
                time: timeStr,
                available: true,
              });
            }
          }
        }
        
        return NextResponse.json({
          doctor: {
            id: doctor.id,
            name: doctor.name,
            specialty: doctor.specialty,
            hospital: doctor.hospital,
          },
          date: dateStr,
          availableSlots: defaultSlots,
          message: defaultSlots.length > 0 ? "Default availability (9 AM - 5 PM)" : "No slots available for today",
        });
      }

      // Get existing appointments for this date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAppointments = await prisma.appointment.findMany({
        where: {
          doctorId,
          scheduledDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            in: ["PENDING", "APPROVED"],
          },
        },
        select: {
          scheduledDate: true,
          duration: true,
        },
      });

      // Generate available time slots
      const availableSlots: { time: string; available: boolean }[] = [];

      for (const availability of dayAvailability) {
        const [startHour, startMin] = availability.startTime.split(":").map(Number);
        const [endHour, endMin] = availability.endTime.split(":").map(Number);
        const slotDuration = availability.slotDuration;

        let currentHour = startHour;
        let currentMin = startMin;

        while (
          currentHour < endHour ||
          (currentHour === endHour && currentMin < endMin)
        ) {
          const timeStr = `${currentHour.toString().padStart(2, "0")}:${currentMin
            .toString()
            .padStart(2, "0")}`;

          // Check if slot is already booked
          const slotDateTime = new Date(date);
          slotDateTime.setHours(currentHour, currentMin, 0, 0);

          const isBooked = existingAppointments.some((apt) => {
            const aptTime = new Date(apt.scheduledDate);
            return (
              aptTime.getTime() === slotDateTime.getTime() ||
              (aptTime.getTime() < slotDateTime.getTime() &&
                aptTime.getTime() + apt.duration * 60000 > slotDateTime.getTime())
            );
          });

          // Only include future slots
          const now = new Date();
          const isFuture = slotDateTime > now;

          availableSlots.push({
            time: timeStr,
            available: !isBooked && isFuture,
          });

          // Move to next slot
          currentMin += slotDuration;
          if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
          }
        }
      }

      return NextResponse.json({
        doctor: {
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.specialty,
          hospital: doctor.hospital,
        },
        date: dateStr,
        availableSlots,
      });
    }

    // Return general availability schedule
    return NextResponse.json({
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        hospital: doctor.hospital,
      },
      availability: doctor.doctorAvailability.map((a) => ({
        dayOfWeek: a.dayOfWeek,
        dayName: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][a.dayOfWeek],
        startTime: a.startTime,
        endTime: a.endTime,
        slotDuration: a.slotDuration,
      })),
    });
  } catch (error) {
    console.error("Error fetching doctor availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
