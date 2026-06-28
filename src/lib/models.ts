import mongoose, { Schema, Document, Model } from "mongoose";

// --- USER INTERFACE & SCHEMA ---
export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    password_hash: { type: String, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// --- CUSTOMER INTERFACE & SCHEMA ---
export interface ICustomer extends Document {
  user_id: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  address: string | null;
  image_url: string | null;
  bags_count: number;
  payment_status: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  address_deleted_at: Date | null;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    address: { type: String, default: null },
    image_url: { type: String, default: null },
    bags_count: { type: Number, required: true, default: 0 },
    payment_status: { type: String, required: true, enum: ["PAID", "PENDING"], default: "PENDING" },
    notes: { type: String, default: null },
    address_deleted_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// --- ORDER INTERFACE & SCHEMA ---
export interface IOrder extends Document {
  user_id: mongoose.Types.ObjectId;
  customer_id: mongoose.Types.ObjectId;
  product_type: string;
  quantity: number;
  bags_count: number;
  price: number;
  payment_status: string;
  order_date: Date;
  created_at: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customer_id: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    product_type: { type: String, required: true, enum: ["COCONUT", "COCONUT_OIL", "COPRA"] },
    quantity: { type: Number, required: true },
    bags_count: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true },
    payment_status: { type: String, required: true, enum: ["PAID", "PENDING"], default: "PENDING" },
    order_date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

// --- MODELS EXPORTS ---
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const Customer: Model<ICustomer> = mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);
export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

// --- APP SETTINGS INTERFACE & SCHEMA ---
export interface IAppSettings extends Document {
  appName: string;
  shortName: string;
  companyName: string;
  companyAddress: string;
  supportPhone: string;
  supportEmail: string;
  website: string;
  logo: string | null;
  icon192: string | null;
  icon512: string | null;
  appleTouchIcon: string | null;
  favicon: string | null;
  splashImage: string | null;
  themeColor: string;
  backgroundColor: string;
  statusBarStyle: string;
  displayMode: string;
  installPromptEnabled: boolean;
  offlineEnabled: boolean;
  pushNotificationEnabled: boolean;
  backgroundSyncEnabled: boolean;
  updatedAt: Date;
}

const AppSettingsSchema = new Schema<IAppSettings>(
  {
    appName: { type: String, required: true, default: "JADEED Coconut Oil" },
    shortName: { type: String, required: true, default: "JADEED" },
    companyName: { type: String, required: true, default: "JADEED Coconut Oil Ltd" },
    companyAddress: { type: String, required: true, default: "123 Mill Road, Pollachi, TN" },
    supportPhone: { type: String, required: true, default: "9876543210" },
    supportEmail: { type: String, required: true, default: "support@jadeed.com" },
    website: { type: String, required: true, default: "https://jadeed.com" },
    logo: { type: String, default: null },
    icon192: { type: String, default: null },
    icon512: { type: String, default: null },
    appleTouchIcon: { type: String, default: null },
    favicon: { type: String, default: null },
    splashImage: { type: String, default: null },
    themeColor: { type: String, required: true, default: "#166534" },
    backgroundColor: { type: String, required: true, default: "#ffffff" },
    statusBarStyle: { type: String, required: true, enum: ["default", "black", "black-translucent"], default: "default" },
    displayMode: { type: String, required: true, enum: ["standalone", "fullscreen", "minimal-ui", "browser"], default: "standalone" },
    installPromptEnabled: { type: Boolean, required: true, default: true },
    offlineEnabled: { type: Boolean, required: true, default: true },
    pushNotificationEnabled: { type: Boolean, required: true, default: false },
    backgroundSyncEnabled: { type: Boolean, required: true, default: false },
  },
  { timestamps: { createdAt: false, updatedAt: "updatedAt" } }
);

export const AppSettings: Model<IAppSettings> = mongoose.models.AppSettings || mongoose.model<IAppSettings>("AppSettings", AppSettingsSchema);
