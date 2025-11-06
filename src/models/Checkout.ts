import mongoose, { Schema, Document, models, Model } from "mongoose";

export interface IProductItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ICheckout extends Document {
  userId: string;
  products: IProductItem[];
  total: number;
  status: "draft" | "waiting payment" | "lunas";
  external_id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductItemSchema = new Schema<IProductItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const CheckoutSchema = new Schema<ICheckout>(
  {
    userId: { type: String, required: true },
    products: { type: [ProductItemSchema], default: [] },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "waiting payment", "lunas"],
      default: "draft",
    },
    external_id: { type: String },
  },
  { timestamps: true }
);

const Checkout: Model<ICheckout> =
  models.Checkout || mongoose.model<ICheckout>("Checkout", CheckoutSchema);

export default Checkout;
