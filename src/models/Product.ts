import mongoose, { Schema, models } from "mongoose";

const productSchema = new Schema(
  {
    name: String,
    description: String,
    price: Number,
    category: String,
    image: String,
  },
  { timestamps: true }
);

const Product = models.Product || mongoose.model("Product", productSchema);
export default Product;
