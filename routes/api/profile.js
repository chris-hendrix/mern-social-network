const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route   GET api/profile/me
// @desc    get current user's profile
// @access  private
router.get('/me', auth, async (req, res) => {
	try {
		profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
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
			skills: Array.isArray(skills) ? skills : skills.split(',').map((skill) => ' ' + skill.trim()),
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

// @route   GET api/profile
// @desc    get all profiles
// @access  public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar']);
		res.json(profiles);
	} catch (err) {
		console.log(err.message);
		return res.status(500).send('Server error');
	}
});

// @route   GET api/profile/user/:user_id
// @desc    get profile by user id
// @access  public
router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id,
		}).populate('user', ['name', 'avatar']);

		if (!profile) return res.status(400).json({ msg: 'Profile not found' });

		res.json(profile);
	} catch (err) {
		console.log(err.message);
		if (err.kind == 'ObjectId') {
			return res.status(400).json({ msg: 'Profile not found' });
		}
		return res.status(500).send('Server error');
	}
});

// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private
router.delete('/', auth, async (req, res) => {
	try {
		// Remove user posts
		await Post.deleteMany({ user: req.user.id });
		// Remove profile
		await Profile.findOneAndRemove({ user: req.user.id });
		// Remove user
		await User.findOneAndRemove({ _id: req.user.id });

		res.json({ msg: 'User deleted' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   PUT api/profile/experience
// @desc    add profile experience
// @access  private
router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Title is required').notEmpty(),
			check('company', 'Company is required').notEmpty(),
			check('from', 'From date is required').notEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { title, company, from, ...rest } = req.body;

		const newExp = { title, company, from, ...rest };

		try {
			const profile = await Profile.findOne({ user: req.user.id });
			profile.experience.unshift(newExp);
			await profile.save();
			return res.json({ profile });
		} catch (err) {
			console.log(err.message);
			return res.status(500).send('Server error');
		}
	}
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    delete profile experience
// @access  private
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		// remove profile experience at index
		const removeIndex = profile.experience.map((item) => item.id).indexOf(req.params.exp_id);
		profile.experience.splice(removeIndex, 1);
		await profile.save();

		res.send(profile);
	} catch (err) {
		console.log(err.message);
		return res.status(500).send('Server error');
	}
});

// @route   PUT api/profile/education
// @desc    add profile education
// @access  private
router.put(
	'/education',
	[
		auth,
		[
			check('school', 'School is required').notEmpty(),
			check('degree', 'Degree is required').notEmpty(),
			check('fieldofstudy', 'Field of Study is required').notEmpty(),
			check('from', 'From Date is required').notEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { school, degree, fieldofstudy, from, ...rest } = req.body;

		const newEdu = { school, degree, fieldofstudy, from, ...rest };

		try {
			const profile = await Profile.findOne({ user: req.user.id });
			profile.education.unshift(newEdu);
			await profile.save();
			return res.json({ profile });
		} catch (err) {
			console.log(err.message);
			return res.status(500).send('Server error');
		}
	}
);

// @route   DELETE api/profile/education/:edu_id
// @desc    delete profile education
// @access  private
router.delete('/education/:exp_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		// remove profile education at index
		const removeIndex = profile.experience.map((item) => item.id).indexOf(req.params.edu_id);
		profile.education.splice(removeIndex, 1);
		await profile.save();

		res.send(profile);
	} catch (err) {
		console.log(err.message);
		return res.status(500).send('Server error');
	}
});

// @route   GET api/profile/github/:username
// @desc    Get user repos from GitHub
// @access  public
router.get('/github/:username', (req, res) => {
	try {
		const githubSecret = process.env.GITHUB_SECRET;
		const githubClientId = process.env.GITHUB_CLIENT_ID;
		const options = {
			uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${githubClientId}&client_secret=${githubSecret}`,
			method: 'GET',
			headers: { 'user-agent': 'node-js' },
		};
		request(options, (error, response, body) => {
			if (error) console.error(error);

			if (response.statusCode != 200) {
				return res.status(404).json({ msg: 'No GitHub profile found' });
			}
			res.json(JSON.parse(body));
		});
	} catch (err) {
		console.log(err.message);
		return res.status(500).send('Server error');
	}
});

module.exports = router;
