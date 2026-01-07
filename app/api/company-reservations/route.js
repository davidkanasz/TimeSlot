import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "../../../lib/mongodb";
import Reservation from "../../../models/Reservation";
import Company from "../../../models/Company";

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // 1. Find the company owned by the user
    const company = await Company.findOne({ ownerId: userId });
    if (!company) {
       // User has no company, so no reservations to show as admin
       return NextResponse.json({ reservations: [] });
    }

    // 2. Find reservations for this company
    const reservations = await Reservation.find({ companyId: company._id }).sort({
      date: 1,
      startTime: 1,
    });

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("Error fetching company reservations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
