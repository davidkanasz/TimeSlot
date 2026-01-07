import {  NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

// GET all reservations (admin only)
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check here
    // For now, we'll allow any authenticated user to access admin features
    // In production, you should check if the user has admin role from Clerk

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const reservations = await Reservation.find(query).sort({
      date: 1,
      startTime: 1,
    });

    // Get statistics
    const stats = {
      total: await Reservation.countDocuments(),
      confirmed: await Reservation.countDocuments({ status: "confirmed" }),
      pending: await Reservation.countDocuments({ status: "pending" }),
      cancelled: await Reservation.countDocuments({ status: "cancelled" }),
    };

    return NextResponse.json({ reservations, stats });
  } catch (error) {
    console.error("[v0] Error fetching admin reservations:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}
