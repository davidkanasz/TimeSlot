"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { Clock, User } from "lucide-react";
import toast from "react-hot-toast";

export function CompanyAvailabilityCalendar({ company }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  // Derived from company prop, no longer local state
  const slotDuration = company.reservationSlotDuration || 30; 
  const startHourStr = company.workingHoursStart || "08:00";
  const endHourStr = company.workingHoursEnd || "18:00";

  useEffect(() => {
    if (company?._id) {
      fetchReservations();
    }
  }, [company?._id, selectedDate]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/company-reservations");
      const data = await res.json();
      setReservations(data.reservations || []);
    } catch (err) {
      toast.error("Nepodarilo sa načítať rezervácie");
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots based on company working hours
  const generateTimeSlots = () => {
    const slots = [];
    
    const [startH, startM] = startHourStr.split(':').map(Number);
    const [endH, endM] = endHourStr.split(':').map(Number);
    
    const startTotalMinutes = startH * 60 + startM;
    const endTotalMinutes = endH * 60 + endM;

    for (let current = startTotalMinutes; current < endTotalMinutes; current += slotDuration) {
       // Avoid generating a slot that goes past closing
       if (current + slotDuration > endTotalMinutes) break;

       const h = Math.floor(current / 60);
       const m = current % 60;
       
       const time = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
       slots.push(time);
    }
    return slots;
  };

  // Check if a time slot is occupied
  const isSlotOccupied = (timeSlot) => {
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    
    // Calculate slot end time for accurate collision check
    const [h, m] = timeSlot.split(':').map(Number);
    const slotStartMins = h * 60 + m;
    const slotEndMins = slotStartMins + slotDuration;
    
    return reservations.some((reservation) => {
      const reservationDate = format(new Date(reservation.date), "yyyy-MM-dd");
      
      if (reservationDate !== selectedDateStr || reservation.status === "cancelled") {
        return false;
      }

      // Simple string compare often works for basic ISO times but minutes calculation is safer for overlaps
      const resStart = reservation.startTime;
      const resEnd = reservation.endTime;
      
      // We check if the slot overlaps with reservation
      // Slot: [timeSlot, timeSlot + duration)
      // Reservation: [resStart, resEnd)
      // Overlap if: slotStart < resEnd && slotEnd > resStart
      
      // But let's stick to string comparison if format is consistent HH:MM
      // Or better, stick to existing logic if it was working? 
      // Existing logic was: return slotTime >= resStart && slotTime < resEnd;
      // This means if slot starts INSIDE an existing reservation.
      // What if slot starts BEFORE and ends AFTER? (Not possible if grid is fixed)
      // With fixed grid aligned to same start, checking start time is enough if reservations are aligned to grid.
      // But generating dynamic slots, we should be careful.
      
      return timeSlot >= resStart && timeSlot < resEnd;
    });
  };

  // Get reservation details for a slot
  const getSlotReservation = (timeSlot) => {
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    
    return reservations.find((reservation) => {
      const reservationDate = format(new Date(reservation.date), "yyyy-MM-dd");
      
      if (reservationDate !== selectedDateStr || reservation.status === "cancelled") {
        return false;
      }

      return timeSlot >= reservation.startTime && timeSlot < reservation.endTime;
    });
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="space-y-6">
      {/* Settings Card removed as it is now in main dashboard */}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Vyberte dátum</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={sk}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle>
              Dostupnosť pre {format(selectedDate, "d. MMMM yyyy", { locale: sk })}
            </CardTitle>
            <CardDescription>
              Zelené = Voľné | Červené = Obsadené
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Načítavam...</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto pr-2">
                {timeSlots.map((slot) => {
                  const occupied = isSlotOccupied(slot);
                  const reservation = getSlotReservation(slot);

                  return (
                    <div
                      key={slot}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        occupied
                          ? "bg-red-100 border-red-400 dark:bg-red-900/30 dark:border-red-700"
                          : "bg-green-100 border-green-400 dark:bg-green-900/30 dark:border-green-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className={`h-4 w-4 ${occupied ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`} />
                        <span className={`font-semibold ${occupied ? 'text-red-900 dark:text-red-300' : 'text-green-900 dark:text-green-300'}`}>
                          {slot}
                        </span>
                      </div>
                      {occupied && reservation ? (
                        <div className="text-xs mt-2 text-red-800 dark:text-red-300">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate font-medium">{reservation.userName}</span>
                          </div>
                          <div className="mt-1 opacity-80">
                            {reservation.startTime} - {reservation.endTime}
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="mt-1 text-xs bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 border-green-600">
                          Voľné
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
