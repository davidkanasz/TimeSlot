import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "../../../lib/mongodb";
import Company from "../../../models/Company";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { name, description, imageUrl, workingHoursStart, workingHoursEnd, reservationSlotDuration } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    // Check if user already has a company (one per user for now)
    const existingCompany = await Company.findOne({ ownerId: userId });
    if (existingCompany) {
        return NextResponse.json(
            { error: "User already has a company" },
            { status: 400 }
        );
    }

    const company = await Company.create({
      ownerId: userId,
      name,
      description,
      imageUrl,
      workingHoursStart: workingHoursStart || "08:00",
      workingHoursEnd: workingHoursEnd || "18:00",
      reservationSlotDuration: reservationSlotDuration || 30,
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
    try {
        await dbConnect();
        const companies = await Company.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ companies });
    } catch (error) {
        console.error("Error fetching companies:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
