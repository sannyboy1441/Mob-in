// =====================================================================
// MOB'IN PLATFORM: EXPRESS SERVER APP ENTRY
// =====================================================================

import express from "express";
import cors from "cors";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Mount API routes under /api/v1
app.use("/api/v1", subscriptionRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "mobin-subscription-backend" });
});

export default app;
