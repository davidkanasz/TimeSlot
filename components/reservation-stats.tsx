import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react"

export function ReservationStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Celkové rezervácie</p>
            <p className="mt-2 text-3xl font-bold text-card-foreground">0</p>
          </div>
          <Calendar className="h-12 w-12 text-primary opacity-20" />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nadchádzajúce</p>
            <p className="mt-2 text-3xl font-bold text-card-foreground">0</p>
          </div>
          <Clock className="h-12 w-12 text-accent opacity-20" />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Dokončené</p>
            <p className="mt-2 text-3xl font-bold text-card-foreground">0</p>
          </div>
          <CheckCircle className="h-12 w-12 text-success opacity-20" />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Zrušené</p>
            <p className="mt-2 text-3xl font-bold text-card-foreground">0</p>
          </div>
          <XCircle className="h-12 w-12 text-destructive opacity-20" />
        </div>
      </div>
    </div>
  )
}
