import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export async function getUserStats() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return null;
    }

    await dbConnect();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get user's reservations statistics
    const [activeReservations, pendingReservations, monthlyReservations] =
      await Promise.all([
        Reservation.countDocuments({ userId, status: "confirmed" }),
        Reservation.countDocuments({ userId, status: "pending" }),
        Reservation.countDocuments({
          userId,
          date: { $gte: startOfMonth },
        }),
      ]);

    return {
      activeReservations,
      pendingReservations,
      monthlyReservations,
    };
  } catch (error) {
    console.error("[v0] Error fetching user stats:", error);
    return null;
  }
}

export async function getAdminStats() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
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

    return {
      totalReservations,
      confirmedReservations,
      pendingReservations,
      monthlyReservations,
      weeklyReservations,
      uniqueUsers: uniqueUsers.length,
    };
  } catch (error) {
    console.error("[v0] Error fetching admin stats:", error);
    return null;
  }
}
