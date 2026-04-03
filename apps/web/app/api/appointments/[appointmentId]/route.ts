import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

// GET /api/appointments/[appointmentId] - Get single appointment
export async function GET(
  request: Request,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.appointmentId },
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
            bloodType: true,
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
            phone: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check access - only patient or doctor involved can view
    if (
      appointment.patientId !== session.user.id &&
      appointment.doctorId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/appointments/[appointmentId] - Update appointment status
export async function PUT(
  request: Request,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.appointmentId },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, doctorNotes, rejectionReason, meetingLink } = body;

    // Validate permissions based on action
    const updateData: any = { updatedAt: new Date() };

    if (status) {
      // Doctor can approve, reject, complete, or mark no-show
      if (session.user.role === "DOCTOR" && appointment.doctorId === session.user.id) {
        if (["APPROVED", "REJECTED", "COMPLETED", "NO_SHOW"].includes(status)) {
          updateData.status = status;

          if (status === "APPROVED") {
            updateData.approvedAt = new Date();
          } else if (status === "COMPLETED") {
            updateData.completedAt = new Date();
          } else if (status === "REJECTED" && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
          }
        } else {
          return NextResponse.json(
            { error: "Invalid status for doctor" },
            { status: 400 }
          );
        }
      }
      // Patient can only cancel their own appointments
      else if (
        session.user.role === "PATIENT" &&
        appointment.patientId === session.user.id
      ) {
        if (status === "CANCELLED") {
          updateData.status = status;
          updateData.cancelledAt = new Date();
        } else {
          return NextResponse.json(
            { error: "Patients can only cancel appointments" },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }
    }

    if (doctorNotes && session.user.role === "DOCTOR") {
      updateData.doctorNotes = doctorNotes;
    }

    if (meetingLink && session.user.role === "DOCTOR") {
      updateData.meetingLink = meetingLink;
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.appointmentId },
      data: updateData,
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
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: `UPDATE_APPOINTMENT_${status || "INFO"}`,
        resourceId: params.appointmentId,
        resourceType: "APPOINTMENT",
        success: true,
      },
    });

    return NextResponse.json({
      message: "Appointment updated successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/appointments/[appointmentId] - Cancel/Delete appointment
export async function DELETE(
  request: Request,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.appointmentId },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Only the patient who booked or the assigned doctor can cancel
    if (
      appointment.patientId !== session.user.id &&
      appointment.doctorId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Update to cancelled instead of deleting (for audit trail)
    await prisma.appointment.update({
      where: { id: params.appointmentId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CANCEL_APPOINTMENT",
        resourceId: params.appointmentId,
        resourceType: "APPOINTMENT",
        success: true,
      },
    });

    return NextResponse.json({
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
