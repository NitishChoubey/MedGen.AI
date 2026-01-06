import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      )
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      )
    }

    // Find user and update status
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Update user status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: "ACTIVE",
        emailVerified: new Date(),
      }
    })

    // Delete used token
    await prisma.verificationToken.delete({
      where: { token }
    })

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "EMAIL_VERIFIED",
        success: true,
      }
    })

    return NextResponse.json(
      { message: "Email verified successfully. You can now sign in." },
      { status: 200 }
    )

  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
