"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Calendar } from "../components/ui/calendar";
import toast, { Toaster } from "react-hot-toast";

import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export function NewReservationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");
  
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [notes, setNotes] = useState("");
  
  const [company, setCompany] = useState<{ _id: string; name: string } | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(!!companyId);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (companyId) {
       fetch("/api/companies")
          .then(res => res.json())
          .then(data => {
            const found = data.companies?.find((c: any) => c._id === companyId);
            if (found) {
                setCompany(found);
                // Set duration from company settings or default to 30
                if (found.reservationSlotDuration) {
                    setDuration(found.reservationSlotDuration.toString());
                }
            }
            setLoadingCompany(false);
          })
          .catch(() => setLoadingCompany(false));
    }
  }, [companyId]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (date && company) {
      setLoadingSlots(true);
      setStartTime(""); // Reset selected time
      
      fetch(`/api/available-slots?date=${date.toISOString()}&companyId=${company._id}`)
        .then(res => res.json())
        .then(data => {
          if (data.slots) {
            // Filter only available slots
            const available = data.slots
              .filter((slot: any) => slot.isAvailable)
              .map((slot: any) => slot.startTime);
            setAvailableSlots(available);
          }
          setLoadingSlots(false);
        })
        .catch(() => {
          toast.error("Nepodarilo sa načítať dostupné časy");
          setLoadingSlots(false);
        });
    }
  }, [date, company]);

  const calculateEndTime = (start: string, durationMinutes: number) => {
    const [hours, minutes] = start.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !startTime || !duration) {
      toast.error("Vyplňte všetky povinné polia");
      return;
    }
    
    if (!company) {
        toast.error("Chýba vybraná prevádzka.");
        return;
    }

    setLoading(true);

    try {
      const endTime = calculateEndTime(startTime, Number.parseInt(duration));

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: date.toISOString(),
          startTime,
          endTime,
          duration: Number.parseInt(duration),
          notes,
          companyId: company._id,
          companyName: company.name
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Rezervácia bola vytvorená");
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Nepodarilo sa vytvoriť rezerváciu");
      }
    } catch (error) {
      console.error("[v0] Error creating reservation:", error);
      toast.error("Nepodarilo sa vytvoriť rezerváciu");
    } finally {
      setLoading(false);
    }
  };
  
  // Render loading/error states for company context
  if (!companyId) {
      return <div className="p-4 text-center">Prosím, vyberte si službu z Ponuky služieb v Dashboarde pre vytvorenie rezervácie.</div>;
  }
  
  if (loadingCompany) {
      return <div className="p-4 text-center">Načítavam údaje prevádzky...</div>;
  }
  
  if (!company) {
      return <div className="p-4 text-center text-red-500">Prevádzka nebola nájdená.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="bg-muted p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="text-muted-foreground font-normal">Rezervácia v:</span> 
                {company.name}
            </h3>
        </div>

      <div className="space-y-2">
        <Label htmlFor="date">Dátum *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? (
                format(date, "PPP", { locale: sk })
              ) : (
                <span>Vyberte dátum</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="startTime">Čas začiatku *</Label>
        {!date ? (
          <p className="text-sm text-muted-foreground">Najprv vyberte dátum</p>
        ) : loadingSlots ? (
          <p className="text-sm text-muted-foreground">Načítavam dostupné časy...</p>
        ) : availableSlots.length === 0 ? (
          <p className="text-sm text-destructive">Žiadne voľné termíny pre tento dátum</p>
        ) : (
          <Select value={startTime} onValueChange={setStartTime}>
            <SelectTrigger>
              <SelectValue placeholder="Vyberte čas" />
            </SelectTrigger>
            <SelectContent>
              {availableSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {time}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

  

      {startTime && duration && (
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            Koniec rezervácie:{" "}
            <span className="font-semibold">
              {calculateEndTime(startTime, Number.parseInt(duration))}
            </span>
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Poznámky (voliteľné)</Label>
        <Textarea
          id="notes"
          placeholder="Pridajte poznámky k rezervácii..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 bg-transparent cursor-pointer hover:bg-accent transition-colors"
          onClick={() => router.push("/dashboard")}
        >
          Zrušiť
        </Button>
        <Button 
          type="submit" 
          className="flex-1 cursor-pointer hover:opacity-90 transition-opacity" 
          disabled={loading}
        >
          {loading ? "Vytváram..." : "Vytvoriť rezerváciu"}
        </Button>
      </div>
    </form>
  );
}
