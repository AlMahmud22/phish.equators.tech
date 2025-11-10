import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "user" | "tester" | "admin";
export type AuthProvider = "credentials" | "google" | "github";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  provider: AuthProvider;
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    passwordHash: {
      type: String,
      required: function (this: IUser) {
        return this.provider === "credentials";
      },
    },
    role: {
      type: String,
      enum: ["user", "tester", "admin"],
      default: "user",
    },
    provider: {
      type: String,
      enum: ["credentials", "google", "github"],
      default: "credentials",
    },
    providerId: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// indexes for lookups
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ provider: 1, providerId: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
