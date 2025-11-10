import mongoose from "mongoose";

// cache mongodb connection for serverless
interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// reuse connection across hot reloads
let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

// connect to mongodb with pooling and auto reconnect
async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log("✅ Using cached MongoDB connection");
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error(
      "❌ MONGODB_URI is not defined in environment variables. " +
      "Please add it to your .env.local file."
    );
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      family: 4,
    };

    console.log("🔄 Connecting to MongoDB...");
    
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB connected successfully");
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection error:", error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }

  return cached.conn;
}

// graceful shutdown in production
if (process.env.NODE_ENV === "production") {
  process.on("SIGINT", async () => {
    if (cached.conn) {
      await cached.conn.connection.close();
      console.log("🔌 MongoDB connection closed due to app termination");
      process.exit(0);
    }
  });
}

export default connectToDatabase;

// check if connected
export function isConnected(): boolean {
  return cached.conn !== null && mongoose.connection.readyState === 1;
}

// disconnect from mongodb
export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await cached.conn.connection.close();
    cached.conn = null;
    cached.promise = null;
    console.log("🔌 MongoDB connection closed");
  }
}
