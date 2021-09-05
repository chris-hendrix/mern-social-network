const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route   POST api/auth
// @desc    authenticate user and get token
// @access  public
router.post(
	'/',
	[
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Password is required').exists(),
	],
	async (req, res) => {
		// check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// 400 == bad request
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			// check if user doesnt exist
			let user = await User.findOne({ email });
			if (!user) {
				// 400 == bad request
				return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
			}

			// check for matching password
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
			}

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
			console.log(err.message);
			return res.status(500).send('Server error');
		}
	}
);

module.exports = router;
