//jshint esversion:6
require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// Setup MongoDB connection
const uri = process.env.DB_HOST;
mongoose.connect(uri, {useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("MongoDB database connected!");
});

// Database Schemas
const airportSchema = new mongoose.Schema({
  name: String,
  icao: String,
  country: String,
});

// Database Models
const Airport = mongoose.model('Airport', airportSchema);

app.route("/airports")
  .get(function(req, res) {
    Airport.find({}, function(err, airports) {
      if(err) {
        res.send(err);
      } else {
        res.send(airports);
      }
    });
  })
  .post(function(req, res) {
    console.log(req.body.name);
    const airport = new Airport({
      name: req.body.name,
      icao: req.body.icao,
      country: req.body.country
    });

    airport.save(function(err) {
      if(err) {
        res.send(err);
      } else {
        res.send("New airport document successfully added.");
      }
    });
  })

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
