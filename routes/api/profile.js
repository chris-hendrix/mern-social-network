const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    get current user's profile
// @access  private
router.get('/me', auth, async (req, res) => {
	try {
		profile = await Profile.findOne({ user: req.user.id }).populate('user', [
			'name',
			'avatar',
		]);
		if (!profile) {
			return res.status(400).json({ msg: 'There is no profile for this user' });
		}
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route   POST api/profile
// @desc    create or update a user's profile
// @access  private
router.post(
	'/',
	[
		auth,
		check('status', 'Status is required').notEmpty(),
		check('skills', 'Skills are required').notEmpty(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		// destructure the request
		const {
			website,
			skills,
			youtube,
			twitter,
			instagram,
			linkedin,
			facebook,
			// spread the rest of the fields (need socials)
			...rest
		} = req.body;

		// build profile object (needs to match above)
		const profileFields = {
			user: req.user.id,
			website: website,
			skills: Array.isArray(skills)
				? skills
				: skills.split(',').map((skill) => ' ' + skill.trim()),
			...rest,
		};
		profileFields.social = {
			youtube: youtube ? youtube : null,
			twitter: twitter ? twitter : null,
			instagram: instagram ? instagram : null,
			linkedin: linkedin ? linkedin : null,
			facebook: facebook ? facebook : null,
		};

		try {
			let profile = await Profile.findOne({ user: req.user.id });
			// update if found
			if (profile) {
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);
				return res.json(profile);
			}
			// create if not found
			profile = new Profile(profileFields);
			await profile.save();
			res.json(profile);
		} catch (err) {
			console.log(err.message);
			return res.status(500).send('Server error');
		}

		console.log(profileFields);
		res.json(profileFields);
	}
);

module.exports = router;
