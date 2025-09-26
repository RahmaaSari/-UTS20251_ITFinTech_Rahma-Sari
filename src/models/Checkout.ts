import mongoose, { Schema, models } from "mongoose";

const checkoutSchema = new Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: Number,
  },
  { timestamps: true }
);

const Checkout = models.Checkout || mongoose.model("Checkout", checkoutSchema);
export default Checkout;
