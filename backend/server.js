const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./config/db")
dotenv.config();
connectDB() //use to connect DB 

app.use(express.json());

const uploadRoute = require("./routes/uploadRoute")
const searchRoute = require("./routes/searchRoute")
const authRoutes = require("./routes/authRoutes")

app.use("/api/upload", uploadRoute)
app.use("/api/search", searchRoute)
app.use("/api/auth", authRoutes)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
