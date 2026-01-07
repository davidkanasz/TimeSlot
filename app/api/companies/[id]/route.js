import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Company from "@/models/Company";

export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const company = await Company.findById(id);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Check if user owns this company
    if (company.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, workingHoursStart, workingHoursEnd, reservationSlotDuration } = body;

    // Update company
    if (name) company.name = name;
    if (description) company.description = description;
    if (workingHoursStart) company.workingHoursStart = workingHoursStart;
    if (workingHoursEnd) company.workingHoursEnd = workingHoursEnd;
    if (reservationSlotDuration) company.reservationSlotDuration = reservationSlotDuration;

    await company.save();

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
