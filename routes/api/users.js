const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const config = require('config');
const { check, validationResult } = require('express-validator');

const jwt = require('jsonwebtoken');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('../../models/User');

// @route   GET api/users
// @desc    test route
// @access  public
router.post('/test', async (req, res) => {
	return res.json({ msg: 'Successfully accessed POST api/users/test' });
});
// @route   POST api/users
// @desc    register user
// @access  public
router.post(
	'/',
	[
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
	],
	async (req, res) => {
		// check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// 400 == bad request
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;

		try {
			// see if user exists
			let user = await User.findOne({ email });
			if (user) {
				// 400 == bad request
				return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
			}
			// get user's gravatar
			const avatar = gravatar.url(email, {
				s: '200', // size
				r: 'pg', // rating
				d: 'mm', // user icon
			});

			// init user object
			user = new User({
				name,
				email,
				avatar,
				password,
			});

			// encrypt password
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);
			await user.save();

			// get the payload
			const payload = {
				user: {
					id: user.id,
				},
			};

			// sign payload into a jw token
			jwt.sign(
				payload,
				process.env.JWT_SECRET,
				{ expiresIn: 360000 }, // TODO change back to 3600
				(err, token) => {
					if (err) throw err;
					return res.json({ token });
				}
			);
		} catch (err) {
			console.error(err.message);
			return res.status(500).send('Server error');
		}
	}
);

// @route   GET api/auth/googleRedirect
// @desc    Oauth user data comes to these redirectURLs
// @access  Public
router.get('/googleRedirect', passport.authenticate('google'), async (req, res) => {
	console.log('redirected', req.user);
	/*
	let user = {
		name: req.user.name.givenName,
		email: req.user._json.email,
		provider: req.user.provider,
	};
	console.log(user);
	// find or create user
	try {
		await User.findOneAndUpdate(
			filter, // find a document with that filter
			{ $setOnInsert: user }, // document to insert when nothing was found
			{ upsert: true, new: true, runValidators: true }
		);
	} catch (err) {
		console.error(err.message);
		return res.status(500).send('Server error');
	}

	// FindOrCreate(user);
	let token = jwt.sign(
		{
			data: user,
		},
		'secret',
		{ expiresIn: 60 }
	); // expiry in seconds
	res.cookie('jwt', token);
	res.redirect('/');
	*/
});

module.exports = router;
