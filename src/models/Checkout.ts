// models/Checkout.ts
import mongoose, { Schema, models } from "mongoose";

const productItemSchema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const checkoutSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [productItemSchema],
    total: { type: Number, default: 0 },
    status: { type: String, default: "draft" }, // draft, completed
  },
  { timestamps: true }
);

const Checkout = models.Checkout || mongoose.model("Checkout", checkoutSchema);
export default Checkout;


// import mongoose, { Schema, models } from "mongoose";

// const checkoutSchema = new Schema(
//   {
//     productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
//     quantity: Number,
//   },
//   { timestamps: true }
// );

// const Checkout = models.Checkout || mongoose.model("Checkout", checkoutSchema);
// export default Checkout;
