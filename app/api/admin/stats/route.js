import {  NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "../../../../lib/mongodb";
import Reservation from "../../../../models/Reservation";

// GET admin statistics
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check here

    await dbConnect();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [
      totalReservations,
      confirmedReservations,
      pendingReservations,
      monthlyReservations,
      weeklyReservations,
    ] = await Promise.all([
      Reservation.countDocuments(),
      Reservation.countDocuments({ status: "confirmed" }),
      Reservation.countDocuments({ status: "pending" }),
      Reservation.countDocuments({ date: { $gte: startOfMonth } }),
      Reservation.countDocuments({ date: { $gte: startOfWeek } }),
    ]);

    // Get unique users count
    const uniqueUsers = await Reservation.distinct("userId");

    return NextResponse.json({
      totalReservations,
      confirmedReservations,
      pendingReservations,
      monthlyReservations,
      weeklyReservations,
      uniqueUsers: uniqueUsers.length,
    });
  } catch (error) {
    console.error("[v0] Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
