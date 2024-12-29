import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb+srv://dreamritikrs551:tUlymm5zQ8SqsLoJ@cluster0.1spin.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
console.log(MONGODB_URI);

let cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) throw new Error("MONGODB_URI is missing");

  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URI, {
      dbName: "infinite-craft",
      bufferCommands: false,
    });

  cached.conn = await cached.promise;

  return cached.conn;
};
