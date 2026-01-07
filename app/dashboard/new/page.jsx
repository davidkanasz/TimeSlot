import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Clock, ArrowLeft, CalendarDays } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
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
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Clock className="h-8 w-8  text-white" />
            <Link href="/dashboard">
              {" "}
              <h1 className="text-2xl font-bold text-foreground">
                TimeSlot
              </h1>{" "}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="cursor-pointer">
                Moje rezervácie
              </Button>
            </Link>
            <Link href="/dashboard/calendar">
              <Button variant="ghost" className="gap-2 cursor-pointer">
                <CalendarDays className="h-4 w-4" />
                Kalendár
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost" className="cursor-pointer">
                Admin
              </Button>
            </Link>
            <UserButton />
          </div>
        </div>
      </header>

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
