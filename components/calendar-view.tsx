"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import toast from "react-hot-toast";

interface Reservation {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: "pending" | "confirmed" | "cancelled";
  notes?: string;
}

interface CalendarViewProps {
  isAdmin?: boolean;
}

export function CalendarView({ isAdmin = false }: CalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (date) {
      fetchReservationsForDate(date);
    }
  }, [date, isAdmin]);

  const fetchReservationsForDate = async (selectedDate: Date) => {
    setLoading(true);
    try {
      const url = isAdmin ? "/api/admin/reservations" : "/api/reservations";
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        // Filter reservations for selected date
        const filtered = data.reservations.filter((res: Reservation) => {
          const resDate = new Date(res.date);
          return (
            resDate.getDate() === selectedDate.getDate() &&
            resDate.getMonth() === selectedDate.getMonth() &&
            resDate.getFullYear() === selectedDate.getFullYear()
          );
        });
        setReservations(filtered);
      } else {
        toast.error("Nepodarilo sa načítať rezervácie");
      }
    } catch (error) {
      console.error("[v0] Error fetching reservations:", error);
      toast.error("Nepodarilo sa načítať rezervácie");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-success text-success-foreground">
            Potvrdené
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-warning text-warning-foreground">Čaká</Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">Zrušené</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Kalendár</CardTitle>
          <CardDescription>
            Vyberte dátum pre zobrazenie rezervácií
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            locale={sk}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {date
              ? format(date, "EEEE, d. MMMM yyyy", { locale: sk })
              : "Vyberte dátum"}
          </CardTitle>
          <CardDescription>
            {reservations.length === 0
              ? "Žiadne rezervácie pre tento deň"
              : `${reservations.length} ${
                  reservations.length === 1 ? "rezervácia" : "rezervácií"
                }`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Načítavam...</div>
            </div>
          ) : reservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                Pre tento deň nie sú žiadne rezervácie
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((reservation) => (
                  <div
                    key={reservation._id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Clock className="h-5 w-5 text-text " />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {reservation.startTime} - {reservation.endTime}
                          </span>
                          {getStatusBadge(reservation.status)}
                        </div>
                        {isAdmin && (
                          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{reservation.userName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {reservation.duration} min
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
