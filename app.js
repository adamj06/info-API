//jshint esversion:6
require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require("jsonwebtoken");

const UserModel = require("./model/user");
require("./auth/auth");

const app = express();

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

app.post("/signup", passport.authenticate("signup", { session: false }), async(req, res, next) => {
  res.json({
    message: "Signup Successful.",
    user: req.user
  });
});

app.post("/login", async (req, res, next) => {
  passport.authenticate(
    "login",
    async (err, user, info) => {
      try {
        if (err || !user) {
          const error = new Error("An error has occured.");

          return next(error);
        }

        req.login(
          user,
          { session: false},
          async (error) => {
            if (error) return next(error);

            const body = {_id: user._id, email: user.email};
            const token = jwt.sign({ user: body }, process.env.AUTH_KEY);

            return res.json({ token });
          }
        );
      } catch (err) {
        return next(err);
      }
    }
  )(req, res, next);
});
app.route("/airports")
  .get(passport.authenticate('jwt', { session: false }), function(req, res) {
    Airport.find({}, function(err, airports) {
      if(err) {
        res.send(err);
      } else {
        res.send(airports);
      }
    });
  })
  .post(passport.authenticate('jwt', { session: false }), function(req, res) {
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
  .delete(passport.authenticate('jwt', { session: false }), function(req, res) {
    Airport.deleteMany({}, function(err) {
      if(err) {
        res.send(err);
      } else {
        res.send("Airport documents deleted.");
      }
    })
  });

app.route("/airports/:airportICAO")
  .get(passport.authenticate('jwt', { session: false }), function(req, res) {
    Airport.findOne({icao: req.params.airportICAO}, function(err, airport) {
      if(err) {
        res.send(err);
      } else {
        res.send(airport);
      }
    })
  })
  .put(passport.authenticate('jwt', { session: false }), function(req, res) {
    Airport.update({icao: req.params.airportICAO}, {name: req.body.name, icao: req.body.icao, country: req.body.country}, {overwrite: true}, function(err) {
      if(err) {
        res.send(err);
      } else {
        res.send("Aiport successfully updated.");
      }
    })
  })
  .patch(passport.authenticate('jwt', { session: false }), function(req, res) {
    Airport.update({icao: req.params.airportICAO}, {$set: req.body}, function(err) {
      if(err) {
        res.send(err);
      } else {
        res.send("Aiport successfully updated.");
      }
    })
  })
  .delete(passport.authenticate('jwt', { session: false }), function(req, res) {
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
