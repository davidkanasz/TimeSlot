import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICompany extends Document {
  ownerId: string;
  name: string;
  description: string;
  imageUrl?: string;
  workingHoursStart: string; // e.g. "08:00"
  workingHoursEnd: string;   // e.g. "18:00"
  reservationSlotDuration: number; // e.g. 30 or 60
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    ownerId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
        type: String,
    },
    workingHoursStart: {
      type: String,
      default: "08:00",
    },
    workingHoursEnd: {
      type: String,
      default: "18:00",
    },
    reservationSlotDuration: {
      type: Number,
      default: 30, // in minutes
    },
  },
  {
    timestamps: true,
  }
);

const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema);

export default Company;
