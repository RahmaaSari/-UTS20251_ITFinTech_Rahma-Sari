import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  role: "admin" | "pembeli";
  otp?: string;
  otpExpires?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    role: { type: String, enum: ["admin", "pembeli"], default: "pembeli" },
    otp: String,
    otpExpires: Date,
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema);
