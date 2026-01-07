import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "../components/ui/button";
import { Calendar, Clock, Users, Shield } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
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
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="cursor-pointer">
                Prihlásiť sa
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="cursor-pointer">Registrovať sa</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-balance text-5xl font-bold leading-tight text-foreground">
            Jednoduchá a efektívna rezervácia termínov
          </h2>
          <p className="mt-6 text-pretty text-xl leading-relaxed text-muted-foreground">
            TimeSlot je moderný rezervačný systém, ktorý vám umožní rýchlo
            spravovať vaše rezervácie a termíny. Bez zbytočných komplikácií.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-center text-3xl font-bold text-foreground">
            Prečo TimeSlot?
          </h3>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-card p-6 shadow-sm">
              <Calendar className="mb-4 h-12 w-12 text-primary" />
              <h4 className="mb-2 text-xl font-semibold text-card-foreground">
                Prehľadný kalendár
              </h4>
              <p className="leading-relaxed text-muted-foreground">
                Zobrazenie všetkých rezervácií v intuitívnom kalendári
              </p>
            </div>

            <div className="rounded-lg bg-card p-6 shadow-sm">
              <Clock className="mb-4 h-12 w-12 text-accent" />
              <h4 className="mb-2 text-xl font-semibold text-card-foreground">
                Prevencia konfliktov
              </h4>
              <p className="leading-relaxed text-muted-foreground">
                Automatická kontrola dostupnosti termínov
              </p>
            </div>

            <div className="rounded-lg bg-card p-6 shadow-sm">
              <Users className="mb-4 h-12 w-12 text-success" />
              <h4 className="mb-2 text-xl font-semibold text-card-foreground">
                Správa používateľov
              </h4>
              <p className="leading-relaxed text-muted-foreground">
                Kompletná správa klientov a ich rezervácií
              </p>
            </div>

            <div className="rounded-lg bg-card p-6 shadow-sm">
              <Shield className="mb-4 h-12 w-12 text-warning" />
              <h4 className="mb-2 text-xl font-semibold text-card-foreground">
                Admin panel
              </h4>
              <p className="leading-relaxed text-muted-foreground">
                Pokročilé nástroje pre administrátorov
              </p>
            </div>
          </div>
        </div>
      </section>

      <br />
      <br />

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 TimeSlot. Všetky práva vyhradené.</p>
        </div>
      </footer>
    </div>
  );
}
