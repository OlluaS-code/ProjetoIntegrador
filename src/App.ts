import express from "express";
import userRoutes from "./adapters/routes/UserRoutes";
import serviceRoutes from "./adapters/routes/ServiceRoutes";
import contractRoutes from "./adapters/routes/ContractRoutes";
import clientRoutes from "./adapters/routes/ClientRoutes";
import cors from "cors";

const app = express();

app.use(express.json());

app.use("/users", userRoutes);
app.use("/clients", clientRoutes);
app.use("/services", serviceRoutes);
app.use("/contracts", contractRoutes);
app.use(cors());

app.get("/", (req, res) => {
    console.log("API is running 🚀");
    res.status(200).json({ message: "API is running 🚀" });
});

export default app;