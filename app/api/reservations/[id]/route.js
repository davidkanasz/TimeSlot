import {  NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "../../../../lib/mongodb";
import Reservation from "../../../../models/Reservation";
import Company from "../../../..//models/Company";

// GET a specific reservation
export async function GET(
  request,
  { params }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Check if user owns this reservation OR company owner
    // We strictly should check company owner too for READ access, but User ownership is minimum.
    // Let's add company check for GET too.
    const company = await Company.findById(reservation.companyId);
    const isOwner = company && company.ownerId === userId;

    if (reservation.userId !== userId && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error("[v0] Error fetching reservation:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservation" },
      { status: 500 }
    );
  }
}

// PATCH update a reservation
export async function PATCH(
  request,
  { params }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, notes } = body;

    await dbConnect();

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Check if user owns this reservation or is company owner
    const company = await Company.findById(reservation.companyId);
    const isOwner = company && company.ownerId === userId;

    if (reservation.userId !== userId && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update reservation
    if (status) reservation.status = status;
    if (notes !== undefined) reservation.notes = notes;

    await reservation.save();

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error("[v0] Error updating reservation:", error);
    return NextResponse.json(
      { error: "Failed to update reservation" },
      { status: 500 }
    );
  }
}

// DELETE cancel a reservation
export async function DELETE(
  request,
  { params }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Check if user owns this reservation or is company owner
    const company = await Company.findById(reservation.companyId);
    const isOwner = company && company.ownerId === userId;

    if (reservation.userId !== userId && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mark as cancelled instead of deleting
    reservation.status = "cancelled";
    await reservation.save();

    return NextResponse.json({ message: "Reservation cancelled successfully" });
  } catch (error) {
    console.error("[v0] Error cancelling reservation:", error);
    return NextResponse.json(
      { error: "Failed to cancel reservation" },
      { status: 500 }
    );
  }
}
