const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Constants
const PORT = 8000;
const HOST = '0.0.0.0';

const options = {
    autoIndex: false, // Don't build indexes
    reconnectTries: 30, // Retry up to 30 times
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
}

const connectWithRetry = () => {
    console.log('MongoDB connection with retry')
    mongoose.connect("mongodb://mongodb:27017/ravr", options).then(() => {
        console.log('MongoDB is connected')
    }).catch(err => {
        console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
        setTimeout(connectWithRetry, 5000)
    })
}

connectWithRetry()

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const Schema = new mongoose.Schema({
    search: String,
    url: String,
    date: Date,
    result: Array
});

const searchHistory = mongoose.model("history", Schema);

app.get("/", (req, res) => res.send("Welcome to Ravr App!"));

app.get('/history', cors(), function (req, res) {
    searchHistory.find({
    }, function (err, result) {
        if (err) throw err;
        if (result) {
            res.json(result)
        } else {
            res.send(JSON.stringify({
                error: 'Error'
            }))
        }
    })
})

app.get('/count', cors(), function (req, res) {
    searchHistory.aggregate([
        {
            "$group": {
                "_id": "$search",
                "count": { "$sum": 1 }
            }
        }
    ]).exec(function (err, result) {
        if (err) throw err;
        if (result) {
            res.json(result)
        } else {
            res.send(JSON.stringify({
                error: 'Error'
            }))
        }
    });
})

app.post("/history", function (req, res) {
    console.log(req.body);
    new searchHistory({
        search: req.body.search,
        url: req.body.url,
        date: req.body.date,
        result: req.body.result
    }).save(function (err, doc) {
        if (err) res.json(err);
        else res.send("Successfully inserted!");
    });
});

app.listen(PORT, HOST);
console.log(`Ravr API Running on http://${HOST}:${PORT}`);
