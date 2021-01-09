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
  .delete(function(req, res) {
    Airport.deleteMany({}, function(err) {
      if(err) {
        res.send(err);
      } else {
        res.send("Airport documents deleted.");
      }
    })
  });

app.route("/airports/:airportICAO")
  .get(function(req, res) {
    Airport.findOne({icao: req.params.airportICAO}, function(err, airport) {
      if(err) {
        res.send(err);
      } else {
        res.send(airport);
      }
    })
  })
  .put(function(req, res) {
    Airport.update({icao: req.params.airportICAO}, {name: req.body.name, icao: req.body.icao, country: req.body.country}, {overwrite: true}, function(err) {
      if(err) {
        res.send(err);
      } else {
        res.send("Aiport successfully updated.");
      }
    })
  })
  .patch(function(req, res) {
    Airport.update({icao: req.params.airportICAO}, {$set: req.body}, function(err) {
      if(err) {
        res.send(err);
      } else {
        res.send("Aiport successfully updated.");
      }
    })
  })
  .delete(function(req, res) {
    Airport.deleteOne({icao: req.params.airportICAO}, function(err) {
      if(err) {
        res.send(err);
      } else {
        res.send("Airport successfully deleted.");
      }
    })
  });


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
