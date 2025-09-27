import { Schema, model, models } from "mongoose";

const PaymentSchema = new Schema(
  {
    external_id: { type: String, required: true, unique: true },
    email: { type: String, required: true }, // ✅ tambahkan field email
    amount: { type: Number, required: true },
    status: { type: String, default: "PENDING" },
    paid_at: { type: Date },
  },
  { timestamps: true } // ✅ otomatis buat createdAt & updatedAt
);

const Payment = models.Payment || model("Payment", PaymentSchema);
export default Payment;

// import { Schema, model, models } from "mongoose";

// const PaymentSchema = new Schema({
//   external_id: { type: String, required: true, unique: true },
//   amount: { type: Number, required: true },
//   status: { 
//     type: String, 
//     default: "PENDING",
//     enum: ["PENDING", "PAID", "EXPIRED", "FAILED"] // tambahkan enum untuk validasi
//   },
//   paid_at: Date,
//   payment_method: String,
//   payer_email: String,
//   description: String,
//   xendit_id: String,
//   expiration_date: Date,
//   invoice_url: String
// }, {
//   timestamps: true 
// });

// const Payment = models.Payment || model("Payment", PaymentSchema);
// export default Payment;