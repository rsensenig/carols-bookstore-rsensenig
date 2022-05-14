const User = require('../models/userModel');
const siteData = require('../data/siteData');
// OLD WAY:
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const passport = require('passport');
const { request } = require('express');

module.exports = {
  index: (request, response) => {
    response.render('pages/index', {
        name: siteData.userName,
        copyrightYear: siteData.year,
        signedIn: siteData.signedIn
    });
  },
  register_get:(request, response) => {
    response.render('pages/register', {
      copyrightYear: siteData.year
    });
  },
  register_post:(request, response) => {
    // the register method salts and hashes, creates a new user, and stores it in the user collection
    // 3 arguments:
    // 1.) username - the username of the request.body
    // 2.) password - the password of the request.body
    // 3.) an arrow function with parameters error and user
    const {username, password} = request.body;
    User.register({username: username}, password, (error, user) => {
      // if there is an error
      if(error) {
        // console log the error
        console.log(error);
        // and redirect to the register page
        response.redirect('/register');
      } else {
        // passport authenticate --> tell passport local which strategy we're using
        // 3 arguments:
        // 1.) request object
        // 2.) response object
        // 3.) arrow function that takes in no parameters
        passport.authenticate('local')(request, response, () => {
          // redirect the user to the login page if successful
          response.redirect('/login');
        });
      }
    })

    // OLD WAY:
    // const {username, password} = request.body;
    // bcrypt.hash(password, saltRounds, (error, hash) => {
    //   const newUser = new User({
    //     username: username,
    //     password: hash
    //   });
    //   newUser.save();
    //   console.log(`The hash value being saved where the password string was saved previously is: ${hash}.`);
    //   response.redirect('/admin');
    // }); 
  },
  login_get: (request, response) => {
    response.render('pages/login',{
      copyrightYear: siteData.year
    });
  },
  login_post: (request, response) => {
    // login method establishes a login session
    const {username, password} = request.body;
    console.log(`password entered is: ${password}`);
    User.findOne({username: username}, (error, foundUser) => {
      if (error) {
        console.log(`The error at login is: ${error}`);
      } else {
        passport.authenticate('local')(request, response, () => {
          // redirect the user to the admin page if successful
          response.redirect('/admin');
        });
      };
   });

  // OLD WAY:
  //   const {username, password} = request.body;
  //   console.log(`password entered is: ${password}`);
  //   User.findOne({username: username}, (error, foundUser) => {
  //     if (error) {
  //       console.log(`The error at login is: ${error}`);
  //     } else {
  //       if(foundUser) {
  //         console.log(`username was matched: ${foundUser.username}`);
  //         console.log(`their password is: ${foundUser.password}`);
  //         bcrypt.compare(password, foundUser.password, (error, result) => {
  //           if (result === true) {
  //             console.log(`user ${foundUser.username} successfully logged in`);
  //             response.redirect('/admin');
  //           };
  //         });
  //       };
  //     };
  //  });
  },
  logout: (request, response) => {
    // logout method given by passport --> terminate the session
    request.logout();
    
    // redirect the user to the homepage
    response.redirect('/');
  },
  google_get: passport.authenticate('google', { scope: ['openid', 'profile', 'email']}),
  google_redirect_get: [
    passport.authenticate('google', {failureRedirect: '/login'}),
    function(request, response) {
      response.redirect('/admin');
    }
  ]
}