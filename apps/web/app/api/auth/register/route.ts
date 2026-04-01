import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      email, 
      password, 
      name, 
      role, 
      // Doctor fields
      hospital, 
      specialty, 
      licenseNumber,
      phone,
      // Patient fields
      dateOfBirth,
      gender,
      bloodType,
      allergies,
      medicalHistory,
      emergencyContact
    } = body

    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Role validation
    if (!['DOCTOR', 'PATIENT'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be DOCTOR or PATIENT" },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { 
          error: "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number" 
        },
        { status: 400 }
      )
    }

    // Role-specific validation
    if (role === 'DOCTOR' && !specialty) {
      return NextResponse.json(
        { error: "Specialty is required for doctors" },
        { status: 400 }
      )
    }

    if (role === 'PATIENT' && !dateOfBirth) {
      return NextResponse.json(
        { error: "Date of birth is required for patients" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Prepare user data based on role
    const userData: any = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
      status: "ACTIVE",
      emailVerified: new Date(),
    }

    // Add role-specific fields
    if (role === 'DOCTOR') {
      userData.hospital = hospital
      userData.specialty = specialty
      userData.licenseNumber = licenseNumber
      userData.phone = phone
    } else if (role === 'PATIENT') {
      userData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null
      userData.gender = gender
      userData.bloodType = bloodType
      userData.allergies = allergies ? JSON.stringify(allergies) : null
      userData.medicalHistory = medicalHistory ? JSON.stringify(medicalHistory) : null
      userData.emergencyContact = emergencyContact ? JSON.stringify(emergencyContact) : null
    }

    // Create user
    const user = await prisma.user.create({
      data: userData
    })

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "REGISTER",
        success: true,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      }
    })

    return NextResponse.json(
      { 
        message: "User registered successfully.",
        userId: user.id,
        role: user.role
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
