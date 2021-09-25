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
			callbackURL: 'http://localhost:5000/googleRedirect', // TODO url
		},
		function (accessToken, refreshToken, profile, done) {
			//console.log(accessToken, refreshToken, profile)
			console.log('GOOGLE BASED OAUTH VALIDATION GETTING CALLED');
			return done(null, profile);
		}
	)
);

// These functions are required for getting data To/from JSON returned from Providers
passport.serializeUser(function (user, done) {
	console.log('I should have jack ');
	done(null, user);
});
passport.deserializeUser(function (obj, done) {
	console.log('I wont have jack shit');
	done(null, obj);
});
