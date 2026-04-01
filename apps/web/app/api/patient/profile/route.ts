import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
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
        { error: "Access denied. Patient role required." },
        { status: 403 }
      );
    }

    const profile = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
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
        updatedAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Parse JSON fields
    let allergiesList = [];
    let medicalHistoryList = [];
    let emergencyContactData = {};

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

    return NextResponse.json({
      ...profile,
      allergies: allergiesList,
      medicalHistory: medicalHistoryList,
      emergencyContact: emergencyContactData,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
        { error: "Access denied. Patient role required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      phone,
      dateOfBirth,
      gender,
      bloodType,
      allergies,
      medicalHistory,
      emergencyContact,
    } = body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender !== undefined) updateData.gender = gender;
    if (bloodType !== undefined) updateData.bloodType = bloodType;
    
    if (allergies !== undefined) {
      updateData.allergies = Array.isArray(allergies)
        ? JSON.stringify(allergies)
        : allergies;
    }
    
    if (medicalHistory !== undefined) {
      updateData.medicalHistory = Array.isArray(medicalHistory)
        ? JSON.stringify(medicalHistory)
        : medicalHistory;
    }
    
    if (emergencyContact !== undefined) {
      updateData.emergencyContact = typeof emergencyContact === "object"
        ? JSON.stringify(emergencyContact)
        : emergencyContact;
    }

    const updatedProfile = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        dateOfBirth: true,
        gender: true,
        bloodType: true,
        allergies: true,
        medicalHistory: true,
        emergencyContact: true,
        phone: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
