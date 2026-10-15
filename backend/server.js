import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import itemRoutes from "./routes/itemRoutes.js";
import Item from "./models/Item.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

let isConnected = false;

export async function connectDB() {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGO_URI;
  const isPlaceholder = !uri || uri.includes("<username>") || uri.includes("<password>");

  if (!isPlaceholder) {
    try {
      await mongoose.connect(uri);
      isConnected = true;
      console.log("Connected to MongoDB via MONGO_URI");
      await seedIfEmpty();
      return;
    } catch (err) {
      console.warn("Could not connect to external MongoDB URI:", err.message);
      console.log("Falling back to in-memory MongoDB...");
    }
  }

  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    isConnected = true;
    console.log("Connected to in-memory MongoDB at", memoryUri);
    await seedIfEmpty();
  } catch (e) {
    console.error("In-memory MongoDB failed:", e.message);
  }
}

async function seedIfEmpty() {
  try {
    const count = await Item.countDocuments();
    if (count === 0) {
      await Item.create([
        {
          name: "Wireless Mechanical Keyboard",
          category: "Electronics",
          price: 89.99,
          discountPercentage: 15,
          description: "Custom mechanical keyboard with RGB backlighting and Bluetooth 5.0.",
          imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
        },
        {
          name: "Ergonomic Office Chair",
          category: "Furniture",
          price: 199.5,
          discountPercentage: 10,
          description: "Breathable mesh back with adjustable lumbar support and 3D armrests.",
          imageUrl: "https://images.unsplash.com/photo-1580481077195-c54d5b2c7e09?w=500",
        },
        {
          name: "Noise-Cancelling Headphones",
          category: "Audio",
          price: 149.0,
          discountPercentage: 20,
          description: "Over-ear wireless headphones with active noise cancellation and 40h battery.",
          imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        },
      ]);
      console.log("Sample items seeded successfully.");
    }
  } catch (err) {
    console.warn("Seeding skipped:", err.message);
  }
}

// Middleware to ensure DB connection is ready for incoming requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Item Manager API is running..." });
});

app.use("/api/items", itemRoutes);

const PORT = process.env.PORT || 5001;

if (process.env.VERCEL !== "1") {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch((error) => {
    console.error("Database connection error:", error.message);
    process.exit(1);
  });
}

export default app;