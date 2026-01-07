"use client";

import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Calendar, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import toast, {Toaster} from "react-hot-toast";

interface Reservation {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: "pending" | "confirmed" | "cancelled";
  notes?: string;
  createdAt: string;
  companyName: string;
}

export function ReservationsList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch("/api/reservations");
      const data = await response.json();

      if (response.ok) {
        setReservations(data.reservations);
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

  const cancelReservation = async (id: string) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Rezervácia bola zrušená");
        fetchReservations();
      } else {
        toast.error("Nepodarilo sa zrušiť rezerváciu");
      }
    } catch (error) {
      console.error("[v0] Error cancelling reservation:", error);
      toast.error("Nepodarilo sa zrušiť rezerváciu");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Načítavam...</div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          Žiadne rezervácie
        </h3>
        <p className="text-muted-foreground">
          Zatiaľ nemáte žiadne rezervované termíny
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <div
          key={reservation._id}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-card-foreground">
                  {format(new Date(reservation.date), "EEEE, d. MMMM yyyy", {
                    locale: sk,
                  })}
                </h4>
                {getStatusBadge(reservation.status)}
                <Badge variant="outline" className="text-xs">
                  {reservation.companyName}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {reservation.startTime} - {reservation.endTime}
                  </span>
                </div>
                <span>({reservation.duration} min)</span>
              </div>
              {reservation.notes && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {reservation.notes}
                </p>
              )}
            </div>
          </div>

          {reservation.status !== "cancelled" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Zrušiť rezerváciu?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Naozaj chcete zrušiť túto rezerváciu? Táto akcia sa nedá
                    vrátiť späť.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="hover:bg-accent transition-colors">Zrušiť</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => cancelReservation(reservation._id)}
                    className="hover:opacity-90 transition-opacity"
                  >
                    Potvrdiť
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      ))}
    </div>
  );
}
