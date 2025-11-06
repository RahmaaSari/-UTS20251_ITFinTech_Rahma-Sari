import mongoose, { Schema, Document, models, Model } from "mongoose";

export interface IPaymentItem {
  name: string;
  price: number;
  quantity: number;
}

export interface IPayment extends Document {
  external_id: string;
  userId: mongoose.Types.ObjectId;
  items: IPaymentItem[];
  amount: number;
  status: "PENDING" | "PAID" | "LUNAS" | "FAILED" | "EXPIRED";
  paid_at?: Date;
  invoice_url?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PaymentItemSchema = new Schema<IPaymentItem>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const PaymentSchema = new Schema<IPayment>(
  {
    external_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [PaymentItemSchema],
      required: true,
      default: [],
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Jumlah pembayaran tidak boleh negatif"],
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "LUNAS", "FAILED", "EXPIRED"],
      default: "PENDING",
    },
    paid_at: {
      type: Date,
      default: null,
    },
    invoice_url: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> =
  models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
