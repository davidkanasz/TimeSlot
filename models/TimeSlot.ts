import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface ITimeSlot extends Document {
  date: Date
  startTime: string
  endTime: string
  isAvailable: boolean
  maxCapacity: number
  currentBookings: number
  createdAt: Date
  updatedAt: Date
}

const TimeSlotSchema = new Schema<ITimeSlot>(
  {
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
    isAvailable: {
      type: Boolean,
      default: true,
    },
    maxCapacity: {
      type: Number,
      default: 1,
    },
    currentBookings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Create compound index for efficient queries
TimeSlotSchema.index({ date: 1, startTime: 1 }, { unique: true })

const TimeSlot: Model<ITimeSlot> = mongoose.models.TimeSlot || mongoose.model<ITimeSlot>("TimeSlot", TimeSlotSchema)

export default TimeSlot
