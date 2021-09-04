const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   POST api/posts
// @desc    create a post
// @access  private
router.post(
	'/',
	[auth, [check('text', 'Text is required').notEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id).select('-password');

			const newPost = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			});

			const post = await newPost.save();

			return res.json(post);
		} catch (err) {
			console.log(err.message);
			res.status(500).send('Server error');
		}
	}
);

// @route   GET api/posts
// @desc    get all posts
// @access  public
router.get('/', auth, async (req, res) => {
	try {
		const posts = await Post.find().sort({ date: -1 });
		return res.json(posts);
	} catch (err) {
		console.log(err.message);
		return res.status(500).send('Server error');
	}
});

// @route   GET api/posts/:id
// @desc    get post by id
// @access  public
router.get('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) return res.status(404).json({ msg: 'Post not found' });

		return res.json(post);
	} catch (err) {
		console.log(err.message);
		if (err.kind == 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		return res.status(500).send('Server error');
	}
});

// @route   DELETE api/posts/:id
// @desc    delete a posts
// @access  private
router.delete('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// check user (req comes in as string)
		if (post.user.toString() !== req.user.id) {
			// 401 == not authorized
			return res.status(401).json({ msg: 'User not authorized' });
		}

		if (!post) return res.status(404).json({ msg: 'Post not found' });

		await post.remove();

		return res.json({ msg: 'Post removed' });
	} catch (err) {
		console.log(err.message);
		if (err.kind == 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		return res.status(500).send('Server error');
	}
});

module.exports = router;
