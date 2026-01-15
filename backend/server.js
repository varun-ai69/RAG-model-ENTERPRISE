const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db")
dotenv.config();
connectDB() //use to connect DB 

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));

app.use(express.json());

const uploadRoute = require("./routes/uploadRoute")
const searchRoute = require("./routes/searchRoute")
const authRoutes = require("./routes/authRoutes")
const chatRoutes = require("./routes/chatRoutes")
const analyticsRoutes = require("./routes/analyticsRoutes")
const documentRoutes = require("./routes/documentRoutes")
const userRoutes = require("./routes/userRoutes")

app.use("/api/upload", uploadRoute)
app.use("/api/search", searchRoute)
app.use("/api/auth", authRoutes)
app.use("/api/question", chatRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api", documentRoutes);
app.use("/api", userRoutes);



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
