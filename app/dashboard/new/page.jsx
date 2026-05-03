import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DashboardHeader } from "../../../components/dashboard-header";
import { ADMIN_USER_ID } from "../../../lib/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { NewReservationForm } from "../../../components/new-reservation-form";

export default async function NewReservationPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader isAdmin={userId === ADMIN_USER_ID} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Späť na prehľad
            </Button>
          </Link>
        </div>

        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Nová rezervácia</CardTitle>
              <CardDescription>
                Vyberte dátum a čas pre vašu rezerváciu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Načítavam formulár...</div>}>
                <NewReservationForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
