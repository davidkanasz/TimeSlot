import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IReservation extends Document {
  userId: string
  userName: string
  userEmail: string
  date: Date
  startTime: string
  endTime: string
  duration: number
  status: "pending" | "confirmed" | "cancelled"
  notes?: string
  companyId: string
  companyName: string
  createdAt: Date
  updatedAt: Date
}

const ReservationSchema = new Schema<IReservation>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    companyId: {
      type: String,
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Create compound index for efficient date and time queries
ReservationSchema.index({ date: 1, startTime: 1 })

const Reservation: Model<IReservation> =
  mongoose.models.Reservation || mongoose.model<IReservation>("Reservation", ReservationSchema)

export default Reservation
