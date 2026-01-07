import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "../../../lib/mongodb";
import Reservation from "../../../models/Reservation";
import Company from "../../../models/Company";

// GET available time slots for a specific date
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const companyId = searchParams.get("companyId");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    if (!companyId) {
      return NextResponse.json(
        { error: "CompanyId parameter is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const date = new Date(dateParam);
    const existingReservations = await Reservation.find({
      companyId,
      date,
      status: { $ne: "cancelled" },
    }).select("startTime endTime");

    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const startHourStr = company.workingHoursStart || "08:00";
    const endHourStr = company.workingHoursEnd || "18:00";
    const slotDuration = company.reservationSlotDuration || 30;

    // Parse start/end times to minutes
    const [startH, startM] = startHourStr.split(':').map(Number);
    const [endH, endM] = endHourStr.split(':').map(Number);

    const startTotalMinutes = startH * 60 + startM;
    const endTotalMinutes = endH * 60 + endM;

    // Generate time slots 
    const slots = [];
    for (let current = startTotalMinutes; current < endTotalMinutes; current += slotDuration) {
      // Don't create a slot that exceeds closing time
      if (current + slotDuration > endTotalMinutes) break;

      const startSlotH = Math.floor(current / 60);
      const startSlotM = current % 60;
      
      const endSlotTotal = current + slotDuration;
      const endSlotH = Math.floor(endSlotTotal / 60);
      const endSlotM = endSlotTotal % 60;

      const startTime = `${startSlotH.toString().padStart(2, "0")}:${startSlotM
        .toString()
        .padStart(2, "0")}`;
      
      const endTime = `${endSlotH.toString().padStart(2, "0")}:${endSlotM
        .toString()
        .padStart(2, "0")}`;

      // Check if slot is available
      const isBooked = existingReservations.some((reservation) => {
        return (
          reservation.startTime < endTime && reservation.endTime > startTime
        );
      });

      slots.push({
        startTime,
        endTime,
        isAvailable: !isBooked,
      });
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("[v0] Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch available slots" },
      { status: 500 }
    );
  }
}
