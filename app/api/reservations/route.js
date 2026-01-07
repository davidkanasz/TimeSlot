import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

// GET all reservations for the current user
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const reservations = await Reservation.find({ userId }).sort({
      date: 1,
      startTime: 1,
    });

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("[v0] Error fetching reservations:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

// POST create a new reservation
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { date, startTime, endTime, duration, notes, companyId, companyName } = body;

    if (!date || !startTime || !endTime || !duration || !companyId || !companyName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if time slot is available for THIS company
    const reservationDate = new Date(date);
    const existingReservations = await Reservation.find({
      companyId, 
      date: reservationDate,
      status: { $ne: "cancelled" },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlapping time check
      ],
    });

    if (existingReservations.length > 0) {
      return NextResponse.json(
        { error: "Time slot is not available" },
        { status: 409 }
      );
    }

    const userEmail =
      user.emailAddresses?.[0]?.emailAddress ||
      user.primaryEmailAddress?.emailAddress ||
      "no-email@example.com";
    const userName =
      user.fullName || user.firstName || user.username || "Unknown User";

    // Create reservation
    const reservation = await Reservation.create({
      userId,
      userName,
      userEmail,
      date: reservationDate,
      startTime,
      endTime,
      duration,
      status: "confirmed",
      notes,
      companyId,
      companyName,
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    console.error("[v0] Error creating reservation:", error);
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}
