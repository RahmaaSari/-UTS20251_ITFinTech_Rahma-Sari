import { Schema, model, models } from "mongoose";

const PaymentSchema = new Schema({
  external_id: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "PENDING" },
  paid_at: Date,
});

const Payment = models.Payment || model("Payment", PaymentSchema);
export default Payment;