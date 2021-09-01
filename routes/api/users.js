const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route   POST api/users
// @desc    register user
// @access  public
router.post(
	'/',
	[
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Please include a valid email').isEmail(),
		check(
			'password',
			'Please enter a password with 6 or more characters'
		).isLength({ min: 6 }),
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
				return res
					.status(400)
					.json({ errors: [{ msg: 'User already exists' }] });
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
				config.get('jwtSecret'),
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

module.exports = router;
