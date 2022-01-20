const cron = require("node-cron");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/User");
const bodyParser = require("body-parser");

dotenv.config();

mongoose.connect(process.env.MONGO_URI, () => {

    console.log("DATABASE is connected!");
});

cron.schedule("* * * * * ", () => {

    logFile();
});

function logFile() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;

    const data = "Sample data to be logged into the file " + dateTime + "\n";

    fs.appendFile("logs.txt", data, () => {

        console.log("Data is logged into the file every minute!");


    });

}
app.use(bodyParser.json());

const verifyToken = (req, res, next) => { //Middleware to verify JWT Token!

    const token = req.header("authtoken");
    if (!token) return res.status(401).send("No Token Found, Access Denied!");

    try {

        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    }
    catch (err) {

        res.status(400).send("Token is invalid!")
    }
};

app.post("/loginuser", async (req, res) => {

    const user = await User.findOne({ email: req.body.email });
    if (!user)
        return res.status(400).send("No Account was found with this email!");

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);

    res.header("authtoken", token)

    res.send(`${user.name} is successfully logged in!`);
});

app.get("/privateroute", verifyToken, (req, res) => { //applying JWT Middleware before giving acces.

    res.json({

        posts: {

            title: "Private Post!",
            description: "This is a private post which can only be accessed with a valid JWT token!"
        }
    });

});

const port = process.env.PORT;
app.listen(port, () => console.log("SERVER IS UP AND RUNNING!"));
