"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { Search, ArrowUpDown } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";


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

interface TableViewProps {
  isAdmin?: boolean;
}

export function TableView({ isAdmin = false }: TableViewProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<
    Reservation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"date" | "startTime" | "status">(
    "date"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchReservations();
  }, [isAdmin]);

  useEffect(() => {
    filterAndSortReservations();
  }, [reservations, searchTerm, sortField, sortDirection]);

  const fetchReservations = async () => {
    try {
      const url = isAdmin ? "/api/admin/reservations" : "/api/reservations";
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

  const filterAndSortReservations = () => {
    let filtered = [...reservations];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (res) =>
          res.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          res.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          res.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "startTime":
          comparison = a.startTime.localeCompare(b.startTime);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    setFilteredReservations(filtered);
  };

  const toggleSort = (field: "date" | "startTime" | "status") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Hľadať podľa mena, emailu alebo stavu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort("date")}
                  className="flex items-center gap-1"
                >
                  Dátum
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort("startTime")}
                  className="flex items-center gap-1"
                >
                  Čas
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Trvanie</TableHead>
              {isAdmin && (
                <>
                  <TableHead>Používateľ</TableHead>
                  <TableHead>Email</TableHead>
                </>
              )}
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort("status")}
                  className="flex items-center gap-1"
                >
                  Stav
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReservations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 6 : 4}
                  className="text-center text-muted-foreground"
                >
                  Žiadne rezervácie
                </TableCell>
              </TableRow>
            ) : (
              filteredReservations.map((reservation) => (
                <TableRow key={reservation._id}>
                  <TableCell className="font-medium">
                    {format(new Date(reservation.date), "d. MMM yyyy", {
                      locale: sk,
                    })}
                  </TableCell>
                  <TableCell>
                    {reservation.startTime} - {reservation.endTime}
                  </TableCell>
                  <TableCell>{reservation.duration} min</TableCell>
                  {isAdmin && (
                    <>
                      <TableCell>{reservation.userName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {reservation.userEmail}
                      </TableCell>
                    </>
                  )}
                  <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Zobrazených {filteredReservations.length} z {reservations.length}{" "}
        rezervácií
      </div>
    </div>
  );
}
