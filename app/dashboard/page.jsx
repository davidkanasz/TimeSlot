import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Clock, CalendarDays, Plus } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { getUserStats } from "../../lib/stats";
import dbConnect from "../../lib/mongodb";
import Company from "../../models/Company";
import ClientView from "./client-view";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  await dbConnect();
  
  // Fetch user's company if exists
  const myCompany = await Company.findOne({ ownerId: userId }).lean();
  
  // Serialize ObjectId and Date to allow passing to client component
  const localizedMyCompany = myCompany ? {
      ...myCompany,
      _id: myCompany._id.toString(),
      createdAt: myCompany.createdAt?.toISOString(),
      updatedAt: myCompany.updatedAt?.toISOString()
  } : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Clock className="h-8 w-8 text-white" />
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-foreground">
                TimeSlot
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <ClientView initialMyCompany={localizedMyCompany} />
      </main>
    </div>
  );
}
