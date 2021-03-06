const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const { populate } = require('../../models/Post');

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

// @route   PUT api/posts/like/:id
// @desc    like a posts
// @access  private

router.put('/like/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// check if post is liked by user
		const userLikes = post.likes.filter(
			(like) => like.user.toString() === req.user.id
		);
		if (userLikes.length > 0) {
			return res.status(400).json({ msg: 'Post already liked' });
		}

		post.likes.unshift({ user: req.user.id });

		await post.save();

		return res.json(post.likes);
	} catch (err) {
		console.log(err.message);
		return res.status(500).send('Server error');
	}
});

// @route   PUT api/posts/unlike/:id
// @desc    unlike a posts
// @access  private
router.put('/unlike/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// check if post is liked by user
		const userLikes = post.likes.filter(
			(like) => like.user.toString() === req.user.id
		);
		if (userLikes.length == 0) {
			return res.status(400).json({ msg: 'Post has not been liked' });
		}

		// get remove index
		removeIndex = post.likes
			.map((like) => like.user.toString())
			.indexOf(req.user.id);
		post.likes.splice(removeIndex, 1);

		await post.save();

		return res.json(post.likes);
	} catch (err) {
		console.log(err.message);
		return res.status(500).send('Server error');
	}
});

// @route   POST api/posts/comment/:id
// @desc    comment on a post
// @access  private
router.post(
	'/comment/:id',
	[auth, [check('text', 'Text is required').notEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id).select('-password');
			const post = await Post.findById(req.params.id);

			const newComment = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			};

			post.comments.unshift(newComment);

			await post.save();

			return res.json(post.comments);
		} catch (err) {
			console.log(err.message);
			res.status(500).send('Server error');
		}
	}
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    delete a comment on a post
// @access  private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// pull out comment
		const comment = post.comments.find(
			(comment) => comment.id === req.params.comment_id
		);

		// make sure comment exists
		if (!comment)
			return res.status(404).json({ msg: 'Comment does not exist' });

		// check user
		if (comment.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authoried' });
		}

		// get remove index
		removeIndex = post.comments
			.map((comment) => comment.user.toString())
			.indexOf(req.user.id);
		post.comments.splice(removeIndex, 1);

		await post.save();

		return res.json(post.comments);
	} catch (err) {
		console.log(err.message);
		res.status(500).send('Server error');
	}
});

module.exports = router;
