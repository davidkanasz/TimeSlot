import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dbConnect from "../../lib/mongodb";
import Company from "../../models/Company";
import ClientView from "./client-view";
import { DashboardHeader } from "../../components/dashboard-header";
import { ADMIN_USER_ID } from "../../lib/admin";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const userName = user?.fullName || user?.firstName || user?.username || "";

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
      <DashboardHeader userName={userName} isAdmin={userId === ADMIN_USER_ID} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <ClientView initialMyCompany={localizedMyCompany} />
      </main>
    </div>
  );
}
