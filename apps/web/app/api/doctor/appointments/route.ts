import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

// GET /api/doctor/appointments - Get doctor's appointments with stats
export async function GET(request: Request) {
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
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      doctorId: session.user.id,
    };

    if (status) {
      whereClause.status = status;
    }

    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.scheduledDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // Get appointments
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
              dateOfBirth: true,
              gender: true,
            },
          },
        },
        orderBy: { scheduledDate: "asc" },
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where: whereClause }),
    ]);

    // Get stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [pendingCount, todayCount, approvedCount, completedCount] = await Promise.all([
      prisma.appointment.count({
        where: {
          doctorId: session.user.id,
          status: "PENDING",
        },
      }),
      prisma.appointment.count({
        where: {
          doctorId: session.user.id,
          scheduledDate: {
            gte: today,
            lt: tomorrow,
          },
          status: { in: ["PENDING", "APPROVED"] },
        },
      }),
      prisma.appointment.count({
        where: {
          doctorId: session.user.id,
          status: "APPROVED",
        },
      }),
      prisma.appointment.count({
        where: {
          doctorId: session.user.id,
          status: "COMPLETED",
        },
      }),
    ]);

    return NextResponse.json({
      appointments,
      stats: {
        pending: pendingCount,
        today: todayCount,
        approved: approvedCount,
        completed: completedCount,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
