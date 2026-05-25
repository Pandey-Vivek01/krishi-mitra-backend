// This file is used to stablish connection between application and database

const mongoose = require("mongoose");

require("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
    .then(() => console.log("DB connected successfully"))
    .catch((error) => {
        console.log("Issue in DB connection");
        console.error(error.message);
        process.exit(1);
    })
}