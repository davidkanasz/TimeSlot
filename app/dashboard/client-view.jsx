"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming it exists or I'll use Input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ReservationsList } from "@/components/reservations-list";
import { Building2, Calendar, Plus, Clock, User, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { CompanyAvailabilityCalendar } from "@/components/company-availability-calendar";

// Simple modal/dialog for booking would be nice, but for now I'll inline it or use a separate view logic
// Let's implement Company List and Creation here.

export default function ClientView({ initialMyCompany }) {
  const [myCompany, setMyCompany] = useState(initialMyCompany);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [newCompanyDuration, setNewCompanyDuration] = useState("30");

  // Load companies for marketplace
  useEffect(() => {
    fetch("/api/companies")
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data.companies || []);
        setLoadingCompanies(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingCompanies(false);
      });
  }, []);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      imageUrl: formData.get("imageUrl"),
      workingHoursStart: formData.get("workingHoursStart"),
      workingHoursEnd: formData.get("workingHoursEnd"),
      reservationSlotDuration: parseInt(newCompanyDuration),
    };

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        setMyCompany(result.company);
        toast.success("Firma bola úspešne vytvorená!");
        // Refresh companies list
        setCompanies((prev) => [result.company, ...prev]);
      } else {
        toast.error(result.error || "Chyba pri vytváraní firmy");
      }
    } catch (err) {
      toast.error("Nastala chyba");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="marketplace" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Ponuka služieb
          </TabsTrigger>
          <TabsTrigger value="my-reservations" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Moje rezervácie
          </TabsTrigger>
          <TabsTrigger value="my-company" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Moje podnikanie
          </TabsTrigger>
        </TabsList>

        {/* MARKETPLACE TAB */}
        <TabsContent value="marketplace" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loadingCompanies ? (
              <p>Načítavam ponuky...</p>
            ) : companies.length === 0 ? (
              <p>Zatiaľ žiadne firmy v ponuke.</p>
            ) : (
              companies.map((company) => (
                <CompanyCard key={company._id} company={company} />
              ))
            )}
          </div>
        </TabsContent>

        {/* MY RESERVATIONS TAB */}
        <TabsContent value="my-reservations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Moje rezervácie</CardTitle>
              <CardDescription>Prehľad vašich rezervovaných termínov z rôznych firiem</CardDescription>
            </CardHeader>
            <CardContent>
              <ReservationsList />
            </CardContent>
          </Card>
        </TabsContent>

        {/* MY COMPANY TAB */}
        <TabsContent value="my-company" className="mt-6">
          {!myCompany ? (
            <Card>
              <CardHeader>
                <CardTitle>Vytvoriť firemný profil</CardTitle>
                <CardDescription>
                  Založte si profil svojej prevádzky a začnite prijímať rezervácie.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCompany} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Názov prevádzky</Label>
                    <Input id="name" name="name" required placeholder="Napr. Holičstvo u Jara" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Popis služieb</Label>
                    {/* Fallback to Input if Textarea component missing/issues */}
                    <Input id="description" name="description" required placeholder="Krátky popis firmy..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">URL Obrázka (voliteľné)</Label>
                    <Input id="imageUrl" name="imageUrl" placeholder="https://..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workingHoursStart">Otváracie hodiny od</Label>
                      <Input 
                        id="workingHoursStart" 
                        name="workingHoursStart" 
                        type="time" 
                        defaultValue="08:00"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workingHoursEnd">Otváracie hodiny do</Label>
                      <Input 
                        id="workingHoursEnd" 
                        name="workingHoursEnd" 
                        type="time" 
                        defaultValue="18:00"
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Dĺžka rezervácie</Label>
                    <Select value={newCompanyDuration} onValueChange={setNewCompanyDuration}>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte dĺžku" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minút</SelectItem>
                        <SelectItem value="60">60 minút</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full hover:opacity-90 transition-opacity">Vytvoriť firmu</Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <CompanyDashboard company={myCompany} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CompanyCard({ company }) {
  // Logic to show booking modal would go here.
  // For simplicity, we just link to a booking page or expand inline.
  // I'll make it link to a dynamic page /dashboard/book/[companyId] if I could, 
  // but to keep it simple, I'll redirect to a "New Reservation" page with pre-filled company?
  // Or better, show a "Rezervovať" button that opens a simple booking UI.
  
  // Integrating the "New Reservation" flow is complex without a dedicated page.
  // I will make the button alert "Not implemented" or redirect to a generic new page.
  // The user asked to "postnut" availability. 
  // Let's assume the user just books a time.
  
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{company.name}</CardTitle>
        <CardDescription>{company.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {company.imageUrl && (
            <img src={company.imageUrl} alt={company.name} className="w-full h-32 object-cover rounded-md mb-4" />
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full hover:opacity-90 transition-opacity" 
          onClick={() => window.location.href = `/dashboard/new?companyId=${company._id}`}
        >
            Rezervovať termín
        </Button>
      </CardFooter>
    </Card>
  );
}

function CompanyDashboard({ company }) {
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: company.name,
    description: company.description,
    workingHoursStart: company.workingHoursStart || "08:00",
    workingHoursEnd: company.workingHoursEnd || "18:00",
    reservationSlotDuration: company.reservationSlotDuration?.toString() || "30",
  });
  
  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = () => {
    fetch("/api/company-reservations")
      .then(res => res.json())
      .then(data => setReservations(data.reservations || []));
  };

  const handleDeleteReservation = async (reservationId) => {
    try {
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Rezervácia bola zrušená");
        fetchReservations();
        setSelectedReservation(null);
      } else {
        toast.error("Nepodarilo sa zrušiť rezerváciu");
      }
    } catch (err) {
      toast.error("Nastala chyba");
    }
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/companies/${company._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        toast.success("Firma bola aktualizovaná");
        setIsEditing(false);
        window.location.reload(); // Refresh to show updated data
      } else {
        toast.error("Nepodarilo sa aktualizovať firmu");
      }
    } catch (err) {
      toast.error("Nastala chyba");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{company.name}</CardTitle>
            <CardDescription>Manažment vašej prevádzky</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="hover:bg-accent transition-colors"
          >
            {isEditing ? "Zrušiť" : "Upraviť"}
          </Button>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleUpdateCompany} className="space-y-4">
              <div className="space-y-2">
                <Label>Názov prevádzky</Label>
                <Input 
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Popis</Label>
                <Input 
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Otváracie hodiny od</Label>
                  <Input 
                    type="time"
                    value={editData.workingHoursStart}
                    onChange={(e) => setEditData({...editData, workingHoursStart: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Otváracie hodiny do</Label>
                  <Input 
                    type="time"
                    value={editData.workingHoursEnd}
                    onChange={(e) => setEditData({...editData, workingHoursEnd: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Dĺžka rezervácie</Label>
                <Select 
                  value={editData.reservationSlotDuration} 
                  onValueChange={(val) => setEditData({...editData, reservationSlotDuration: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte dĺžku" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minút</SelectItem>
                    <SelectItem value="60">60 minút</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full hover:opacity-90 transition-opacity">
                Uložiť zmeny
              </Button>
            </form>
          ) : (
            <div>
              <p className="text-muted-foreground">{company.description}</p>
              <div className="mt-4 flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Otvorené: {company.workingHoursStart || "08:00"} - {company.workingHoursEnd || "18:00"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Dĺžka rezervácie: {company.reservationSlotDuration || 30} min</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Prichádzajúce rezervácie</CardTitle>
            <CardDescription>Zoznam rezervácií od zákazníkov</CardDescription>
        </CardHeader>
        <CardContent>
            {reservations.length === 0 ? (
                <p>Zatiaľ žiadne rezervácie.</p>
            ) : (
                <div className="space-y-4">
                    {reservations.map(res => (
                        <div key={res._id} className="border p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold">{res.userName}</p>
                                <p className="text-sm text-gray-500">
                                    {format(new Date(res.date), "dd.MM.yyyy")} {res.startTime} - {res.endTime}
                                </p>
                                <Badge   variant={res.status === "confirmed" ? "default" : "secondary"} className="mt-1">
                                  {res.status === "confirmed" ? "Potvrdené" : res.status}
                                </Badge>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="hover:bg-accent transition-colors"
                                  onClick={() => setSelectedReservation(res)}
                                >
                                  Detail
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedReservation(null)}>
          <Card className="w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Detail rezervácie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Zákazník</Label>
                <p className="font-semibold">{selectedReservation.userName}</p>
                <p className="text-sm text-muted-foreground">{selectedReservation.userEmail}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Dátum a čas</Label>
                <p className="font-semibold">
                  {format(new Date(selectedReservation.date), "EEEE, d. MMMM yyyy", { locale: sk })}
                </p>
                <p className="text-sm">{selectedReservation.startTime} - {selectedReservation.endTime} ({selectedReservation.duration} min)</p>
              </div>
              {selectedReservation.notes && (
                <div>
                  <Label className="text-muted-foreground">Poznámky</Label>
                  <p>{selectedReservation.notes}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 hover:bg-accent transition-colors"
                  onClick={() => setSelectedReservation(null)}
                >
                  Zavrieť
                </Button>
                {selectedReservation.status !== "cancelled" && (
                  <Button 
                    variant="destructive" 
                    className="flex-1 hover:opacity-90 transition-opacity"
                    onClick={() => {
                      if (confirm("Naozaj chcete zrušiť túto rezerváciu?")) {
                        handleDeleteReservation(selectedReservation._id);
                      }
                    }}
                  >
                    Zrušiť rezerváciu
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <CompanyAvailabilityCalendar company={company} />
    </div>
  );
}
