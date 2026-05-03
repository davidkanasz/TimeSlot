import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "../components/ui/button";
import { Clock, Settings, LayoutDashboard } from "lucide-react";

interface DashboardHeaderProps {
  userName?: string;
  isAdmin: boolean;
}

export function DashboardHeader({ userName, isAdmin }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Clock className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-foreground">TimeSlot</h1>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {userName}
          </span>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-10 w-10",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
