import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "../../../lib/mongodb";
import Company from "../../../models/Company";

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const company = await Company.findOne({ ownerId: userId });
    
    // It's okay if null, frontend handles it
    return NextResponse.json({ company });
  } catch (error) {
    console.error("Error fetching my company:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
