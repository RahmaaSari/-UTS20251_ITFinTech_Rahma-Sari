import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  sold: number;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    image: { type: String, required: true },
    sold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);


// import { Schema, model, models } from "mongoose";

// const productSchema = new Schema({
//   name: { type: String, required: true },
//   description: String,
//   price: { type: Number, required: true },
//   image: String,
// });

// const Product = models.Product || model("Product", productSchema);
// export default Product;
