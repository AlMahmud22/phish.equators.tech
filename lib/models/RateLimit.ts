import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRateLimit extends Document {
  userId: string;
  endpoint: string;
  requestsCount: number;
  windowStart: Date;
  lastReset: Date;
  violations: number;
  limit: number;
  createdAt: Date;
  updatedAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    endpoint: {
      type: String,
      required: [true, "Endpoint is required"],
      trim: true,
      maxlength: [200, "Endpoint cannot exceed 200 characters"],
    },
    requestsCount: {
      type: Number,
      default: 0,
      min: [0, "Requests count cannot be negative"],
    },
    windowStart: {
      type: Date,
      default: Date.now,
      required: true,
    },
    lastReset: {
      type: Date,
      default: Date.now,
      required: true,
    },
    violations: {
      type: Number,
      default: 0,
      min: [0, "Violations count cannot be negative"],
    },
    limit: {
      type: Number,
      default: 100,
      min: [1, "Limit must be at least 1"],
    },
  },
  {
    timestamps: true,
  }
);

// indexes for fast lookups
RateLimitSchema.index({ userId: 1, endpoint: 1 }, { unique: true });
RateLimitSchema.index({ windowStart: 1 });
RateLimitSchema.index({ lastReset: 1 });

// auto delete inactive records after 30 days
RateLimitSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 2592000 });

const RateLimit: Model<IRateLimit> =
  mongoose.models.RateLimit ||
  mongoose.model<IRateLimit>("RateLimit", RateLimitSchema);

export default RateLimit;
