const dotenv = require('dotenv');
var passport = require('passport');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

var opts = {};
opts.jwtFromRequest = function (req) {
	// tell passport to read JWT from cookies
	var token = null;
	if (req && req.cookies) {
		token = req.cookies['jwt'];
	}
	return token;
};
opts.secretOrKey = process.env.JWT_SECRET;

// main authentication, our app will rely on it
passport.use(
	new JwtStrategy(opts, function (jwt_payload, done) {
		console.log('JWT BASED AUTH GETTING CALLED'); // called everytime a protected URL is being served
		if (CheckUser(jwt_payload.data)) {
			return done(null, jwt_payload.data);
		} else {
			// user account doesnt exists in the DATA
			return done(null, false);
		}
	})
);

// google authentication
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: 'http://localhost:5000/authgoogle/callback',
		},
		function (accessToken, refreshToken, profile, done) {
			console.log(profile);
			var userData = {
				email: profile.emails[0].value,
				name: profile.displayName,
				token: accessToken,
			};
			done(null, userData);
		}
	)
);

// These functions are required for getting data To/from JSON returned from Providers
passport.serializeUser(function (user, done) {
	console.log('user serialized');
	done(null, user);
});
passport.deserializeUser(function (obj, done) {
	console.log('user deserialized');
	done(null, obj);
});
