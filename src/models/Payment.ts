import mongoose, { Schema, models } from "mongoose";

const paymentSchema = new Schema(
  {
    checkoutId: { type: Schema.Types.ObjectId, ref: "Checkout" },
    paymentMethod: String,
    amount: Number,
    status: { type: String, default: "PENDING" }, // PENDING / PAID / FAILED
  },
  { timestamps: true }
);

const Payment = models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;
