import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import dbConnect from "../../../../lib/mongodb"
import Reservation from "../../../../models/Reservation"

// GET user statistics
export async function GET(request) {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get user's reservations statistics
    const [activeReservations, pendingReservations, monthlyReservations] = await Promise.all([
      Reservation.countDocuments({ userId, status: "confirmed" }),
      Reservation.countDocuments({ userId, status: "pending" }),
      Reservation.countDocuments({
        userId,
        date: { $gte: startOfMonth },
      }),
    ])

    return NextResponse.json({
      activeReservations,
      pendingReservations,
      monthlyReservations,
    })
  } catch (error) {
    console.error("[v0] Error fetching user stats:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
