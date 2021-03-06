require('dotenv').config()

const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const UserModel = require("../model/user");

passport.use(
  "signup",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    async (email, password, done) => {
      try {
        const user = await UserModel.create({ email, password });

        return done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    async (email, password, done) => {
      try {
        const user = await UserModel.findOne({email});

        if(!user) {
          return done(null, false, { message: "User not found."});
        }

        const validate = await user.isValidPassword(password);

        if(!validate) {
          return done(null, false, { message: "Incorrect credentials."});
        }

        return done(null, user, { message: "Login Successful"});
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.AUTH_KEY,
      jwtFromRequest: ExtractJWT.fromUrlQueryParameter('token')
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (err) {
        return done(err);
      }
    }
  )
)
