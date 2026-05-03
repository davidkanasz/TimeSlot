import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { AdminReservationsList } from "../../components/admin-reservations-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { getAdminStats } from "../../lib/stats";
import { DashboardHeader } from "../../components/dashboard-header";
import { ADMIN_USER_ID } from "../../lib/admin";

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (userId !== ADMIN_USER_ID) {
    redirect("/dashboard");
  }

  const stats = await getAdminStats();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader isAdmin={true} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Administrácia</h2>
          <p className="mt-2 text-muted-foreground">
            Spravujte všetky rezervácie a používateľov
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Celkovo rezervácií
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalReservations ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">Všetky rezervácie</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potvrdené</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.confirmedReservations ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Aktívne rezervácie
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Čakajúce</CardTitle>
              <AlertCircle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.pendingReservations ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">Na schválenie</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Používatelia
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.uniqueUsers ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Unikátni používatelia
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reservations Management */}
        <Card>
          <CardHeader>
            <CardTitle>Správa rezervácií</CardTitle>
            <CardDescription>
              Prehľad a správa všetkých rezervácií v systéme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Všetky</TabsTrigger>
                <TabsTrigger value="confirmed">Potvrdené</TabsTrigger>
                <TabsTrigger value="pending">Čakajúce</TabsTrigger>
                <TabsTrigger value="cancelled">Zrušené</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <AdminReservationsList status="all" />
              </TabsContent>
              <TabsContent value="confirmed" className="mt-6">
                <AdminReservationsList status="confirmed" />
              </TabsContent>
              <TabsContent value="pending" className="mt-6">
                <AdminReservationsList status="pending" />
              </TabsContent>
              <TabsContent value="cancelled" className="mt-6">
                <AdminReservationsList status="cancelled" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
