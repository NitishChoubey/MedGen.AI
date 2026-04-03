import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

// GET /api/doctors - List all active doctors (for patients to book appointments)
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
    const specialty = searchParams.get("specialty");
    const search = searchParams.get("search");

    // Build where clause
    const whereClause: any = {
      role: "DOCTOR",
      status: "ACTIVE",
    };

    if (specialty) {
      whereClause.specialty = specialty;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { specialty: { contains: search, mode: "insensitive" } },
        { hospital: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }

    const doctors = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        hospital: true,
        department: true,
        image: true,
        doctorAvailability: {
          where: { isActive: true },
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            slotDuration: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Get unique specialties for filter dropdown
    const specialties = await prisma.user.findMany({
      where: {
        role: "DOCTOR",
        status: "ACTIVE",
        specialty: { not: null },
      },
      select: { specialty: true },
      distinct: ["specialty"],
    });

    return NextResponse.json({
      doctors,
      specialties: specialties.map((s) => s.specialty).filter(Boolean),
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
