import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

// GET /api/doctor/availability - Get current doctor's availability
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Access denied. Doctor role required." },
        { status: 403 }
      );
    }

    const availability = await prisma.doctorAvailability.findMany({
      where: { doctorId: session.user.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({
      availability: availability.map((a) => ({
        id: a.id,
        dayOfWeek: a.dayOfWeek,
        dayName: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][a.dayOfWeek],
        startTime: a.startTime,
        endTime: a.endTime,
        slotDuration: a.slotDuration,
        isActive: a.isActive,
      })),
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/doctor/availability - Set doctor's availability
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Access denied. Doctor role required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { dayOfWeek, startTime, endTime, slotDuration } = body;

    // Validate required fields
    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Day of week, start time, and end time are required" },
        { status: 400 }
      );
    }

    // Validate day of week
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { error: "Invalid day of week (must be 0-6)" },
        { status: 400 }
      );
    }

    // Validate time format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "Invalid time format (use HH:MM)" },
        { status: 400 }
      );
    }

    // Check for existing availability on same day/time
    const existing = await prisma.doctorAvailability.findFirst({
      where: {
        doctorId: session.user.id,
        dayOfWeek,
        startTime,
      },
    });

    if (existing) {
      // Update existing
      const updated = await prisma.doctorAvailability.update({
        where: { id: existing.id },
        data: {
          endTime,
          slotDuration: slotDuration || 30,
          isActive: true,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Availability updated successfully",
        availability: updated,
      });
    }

    // Create new availability
    const availability = await prisma.doctorAvailability.create({
      data: {
        doctorId: session.user.id,
        dayOfWeek,
        startTime,
        endTime,
        slotDuration: slotDuration || 30,
        isActive: true,
      },
    });

    return NextResponse.json({
      message: "Availability added successfully",
      availability,
    }, { status: 201 });
  } catch (error) {
    console.error("Error setting availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/doctor/availability - Bulk update availability
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Access denied. Doctor role required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { availabilitySlots } = body;

    if (!Array.isArray(availabilitySlots)) {
      return NextResponse.json(
        { error: "availabilitySlots must be an array" },
        { status: 400 }
      );
    }

    // Delete existing availability
    await prisma.doctorAvailability.deleteMany({
      where: { doctorId: session.user.id },
    });

    // Create new availability slots
    const createdSlots = await Promise.all(
      availabilitySlots.map((slot: any) =>
        prisma.doctorAvailability.create({
          data: {
            doctorId: session.user.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            slotDuration: slot.slotDuration || 30,
            isActive: slot.isActive !== false,
          },
        })
      )
    );

    return NextResponse.json({
      message: "Availability updated successfully",
      availability: createdSlots,
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/doctor/availability - Delete availability slot
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Access denied. Doctor role required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Availability ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.doctorAvailability.findFirst({
      where: {
        id,
        doctorId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Availability slot not found" },
        { status: 404 }
      );
    }

    await prisma.doctorAvailability.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Availability deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
