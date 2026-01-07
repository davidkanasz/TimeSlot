"use client";

import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Calendar, Clock, Trash2, User, Mail } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
  createdAt: string;
}

interface AdminReservationsListProps {
  status: string;
}

export function AdminReservationsList({ status }: AdminReservationsListProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, [status]);

  const fetchReservations = async () => {
    try {
      const url =
        status === "all"
          ? "/api/admin/reservations"
          : `/api/admin/reservations?status=${status}`;

      const response = await fetch(url);
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

  const updateReservationStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Stav rezervácie bol aktualizovaný");
        fetchReservations();
      } else {
        toast.error("Nepodarilo sa aktualizovať rezerváciu");
      }
    } catch (error) {
      console.error("[v0] Error updating reservation:", error);
      toast.error("Nepodarilo sa aktualizovať rezerváciu");
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/reservations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Rezervácia bola odstránená");
        fetchReservations();
      } else {
        toast.error("Nepodarilo sa odstrániť rezerváciu");
      }
    } catch (error) {
      console.error("[v0] Error deleting reservation:", error);
      toast.error("Nepodarilo sa odstrániť rezerváciu");
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
          V tejto kategórii nie sú žiadne rezervácie
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
          <div className="flex flex-1 items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h4 className="font-semibold text-card-foreground">
                  {format(new Date(reservation.date), "EEEE, d. MMMM yyyy", {
                    locale: sk,
                  })}
                </h4>
                {getStatusBadge(reservation.status)}
              </div>
              <div className="mb-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {reservation.startTime} - {reservation.endTime}
                  </span>
                </div>
                <span>({reservation.duration} min)</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{reservation.userName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{reservation.userEmail}</span>
                </div>
              </div>
              {reservation.notes && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {reservation.notes}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={reservation.status}
              onValueChange={(value) =>
                updateReservationStatus(reservation._id, value)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Čakajúce</SelectItem>
                <SelectItem value="confirmed">Potvrdené</SelectItem>
                <SelectItem value="cancelled">Zrušené</SelectItem>
              </SelectContent>
            </Select>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Odstrániť rezerváciu?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Naozaj chcete natrvalo odstrániť túto rezerváciu? Táto akcia
                    sa nedá vrátiť späť.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Zrušiť</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteReservation(reservation._id)}
                  >
                    Potvrdiť
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}
