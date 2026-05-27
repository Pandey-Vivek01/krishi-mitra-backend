const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const cropRoutes = require("./routes/Crop");
const weatherRoutes = require("./routes/weatherRoutes");
const recommendRoutes = require("./routes/recommendRoutes");
const postRoutes = require("./routes/postRoutes");
const qaRoutes = require("./routes/qaRoutes");

const database = require("./config/database");
const cookieParser = require("cookie-parser");

const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;

//database connect
database.connect();
//middlewares
app.use(express.json());  // app.use() is used to add middleware
app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,  // cookies ke liye zaruri hai
}));

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/crop", cropRoutes);
app.use("/api/v1/weather", weatherRoutes);
app.use("/api/v1/auto-recommend", recommendRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/qa", qaRoutes);

 

app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});

app.listen(PORT, () => {
	console.log(`App is running at ${PORT}`)
})

