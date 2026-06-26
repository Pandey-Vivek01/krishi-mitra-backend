const express = require("express");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");

const userRoutes = require("./routes/User");
const cropRoutes = require("./routes/Crop");
const weatherRoutes = require("./routes/weatherRoutes");
const recommendRoutes = require("./routes/recommendRoutes");
const postRoutes = require("./routes/postRoutes");
const qaRoutes = require("./routes/qaRoutes");
const profileRoutes = require("./routes/profileRoutes");

const database = require("./config/database");
const cookieParser = require("cookie-parser");

const dotenv = require("dotenv");

const { cloudinaryConnect } = require("./config/cloudinary");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const chatRoutes = require("./routes/chatRoutes");

const paymentRoutes = require("./routes/paymentRoutes");

dotenv.config();
const PORT = process.env.PORT || 4000;

//database connect
database.connect();
cloudinaryConnect();
// Models register
require("./models/User");
require("./models/Profile");
require("./models/Crop");
require("./models/Post");
require("./models/Comment");
require("./models/QA");
require("./models/recommendCropModel");
require("./models/weatherModel");
require("./models/Product");
require("./models/Order");
require("./models/Conversation");
require("./models/Message");

//middlewares

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
}));

app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,  // cookies ke liye zaruri hai
}));

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/crop", cropRoutes);
app.use("/api/v1/weather", weatherRoutes);
app.use("/api/v1/auto-recommend", recommendRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/qa", qaRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/payment", paymentRoutes);
 

app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});


const http = require("http");
const initSocket = require("./socket/index");

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});

