const mongoose = require('mongoose');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const {Schema} = mongoose;
// Strategy method built into the oauth npm package
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// require findOrCreate
const findOrCreate = require('mongoose-findorcreate');

const userSchema = new Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
  },
  googleId: {
    type: String,
  }
});

// include passportLocalMongoose (as a plugin) to add functionality to simplify how Passports builds username and passwords
// plugin method connects the schema to mongoose before going in the database collection
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);

// creates an instance of one of the passport strategies (passport-local) of this model
passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.displayName });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

// OLD WAY:
// information about the user is stored after login is successful (connects specialized id to user to track user's interactions as user navigates the site)
// passport.serializeUser(User.serializeUser());

// reveals user's information so it can be used in a request
// passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "https://carols-book-store.herokuapp.com/auth/google/admin"
},
function(accessToken, refreshToken, email, cb) {
  User.findOrCreate({ googleId: email.id }, function (err, user) {
    return cb(err, user);
  });
}
));

// all files are individual until something gets exposed via module exports or by requiring it
module.exports = User;