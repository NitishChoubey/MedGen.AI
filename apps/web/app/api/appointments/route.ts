import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

// GET /api/appointments - List appointments based on user role
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause based on role
    const whereClause: any = {};

    if (session.user.role === "PATIENT") {
      whereClause.patientId = session.user.id;
    } else if (session.user.role === "DOCTOR") {
      whereClause.doctorId = session.user.id;
    }

    if (status) {
      whereClause.status = status;
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: whereClause,
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              phone: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              specialty: true,
              hospital: true,
              department: true,
            },
          },
        },
        orderBy: { scheduledDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      appointments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Book a new appointment (Patient only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "PATIENT") {
      return NextResponse.json(
        { error: "Only patients can book appointments" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      doctorId,
      title,
      description,
      appointmentType,
      scheduledDate,
      duration,
      isVirtual,
    } = body;

    // Validate required fields
    if (!doctorId || !title || !scheduledDate) {
      return NextResponse.json(
        { error: "Doctor, title, and scheduled date are required" },
        { status: 400 }
      );
    }

    // Verify doctor exists and is active
    const doctor = await prisma.user.findFirst({
      where: {
        id: doctorId,
        role: "DOCTOR",
        status: "ACTIVE",
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found or not available" },
        { status: 404 }
      );
    }

    // Check for conflicting appointments
    const appointmentDate = new Date(scheduledDate);
    const appointmentDuration = duration || 30;
    const endTime = new Date(appointmentDate.getTime() + appointmentDuration * 60000);

    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId,
        status: { in: ["PENDING", "APPROVED"] },
        OR: [
          {
            scheduledDate: {
              gte: appointmentDate,
              lt: endTime,
            },
          },
          {
            AND: [
              { scheduledDate: { lt: appointmentDate } },
              {
                scheduledDate: {
                  gt: new Date(appointmentDate.getTime() - appointmentDuration * 60000),
                },
              },
            ],
          },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 }
      );
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: session.user.id,
        doctorId,
        title,
        description: description || null,
        appointmentType: appointmentType || "general",
        scheduledDate: appointmentDate,
        duration: appointmentDuration,
        isVirtual: isVirtual || false,
        status: "PENDING",
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            specialty: true,
            hospital: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_APPOINTMENT",
        resourceId: appointment.id,
        resourceType: "APPOINTMENT",
        success: true,
      },
    });

    return NextResponse.json({
      message: "Appointment booked successfully. Awaiting doctor approval.",
      appointment,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
