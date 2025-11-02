import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  external_id: string;
  userId: mongoose.Types.ObjectId;
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
  amount: number;
  status: string;
  paid_at?: Date;
  invoice_url?: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    external_id: { type: String, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    amount: { type: Number, required: true },
    status: { type: String, default: "PENDING" },
    paid_at: Date,
    invoice_url: String,
  },
  { timestamps: true }
);

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);


// import { Schema, model, models } from "mongoose";

// const PaymentSchema = new Schema(
//   {
//     external_id: { type: String, required: true, unique: true },
//     email: { type: String, required: true }, // ✅ tambahkan field email
//     amount: { type: Number, required: true },
//     status: { type: String, default: "PENDING" },
//     paid_at: { type: Date },
//   },
//   { timestamps: true } // ✅ otomatis buat createdAt & updatedAt
// );

// const Payment = models.Payment || model("Payment", PaymentSchema);
// export default Payment;