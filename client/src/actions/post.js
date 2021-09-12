import axios from 'axios';
import { setAlert } from './alert';
import {
	ADD_COMMENT,
	ADD_POST,
	DELETE_POST,
	GET_POST,
	GET_POSTS,
	POST_ERROR,
	REMOVE_COMMENT,
	UPDATE_LIKES,
} from './types';

// get posts
export const getPosts = () => async (dispatch) => {
	try {
		const res = await axios.get('/api/posts');
		dispatch({ type: GET_POSTS, payload: res.data });
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status },
		});
	}
};

// add like
export const addLike = (postId) => async (dispatch) => {
	try {
		const res = await axios.put(`/api/posts/like/${postId}`);
		dispatch({ type: UPDATE_LIKES, payload: { id: postId, likes: res.data } });
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status },
		});
	}
};

// remove like
export const removeLike = (postId) => async (dispatch) => {
	try {
		const res = await axios.put(`/api/posts/unlike/${postId}`);
		dispatch({ type: UPDATE_LIKES, payload: { id: postId, likes: res.data } });
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status },
		});
	}
};

// delete post
export const deletePost = (postId) => async (dispatch) => {
	try {
		await axios.delete(`/api/posts/${postId}`);
		dispatch({ type: DELETE_POST, payload: { id: postId } });
		dispatch(setAlert('Post removed.', 'success'));
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status },
		});
	}
};

// add post
export const addPost = (formData) => async (dispatch) => {
	//TODO setting default is workaround
	axios.defaults.headers.post['Content-Type'] = 'application/json';
	try {
		const res = await axios.post('/api/posts/', formData);
		dispatch({ type: ADD_POST, payload: res.data });
		dispatch(setAlert('Post created.', 'success'));
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status },
		});
	}
};

// get post
export const getPost = (postId) => async (dispatch) => {
	try {
		const res = await axios.get(`/api/posts/${postId}`);
		dispatch({ type: GET_POST, payload: res.data });
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status },
		});
	}
};

// add comment
export const addComment = (postId, formData) => async (dispatch) => {
	//TODO setting default is workaround
	axios.defaults.headers.post['Content-Type'] = 'application/json';
	try {
		const res = await axios.post(`/api/posts/comment/${postId}`, formData);
		dispatch({ type: ADD_COMMENT, payload: res.data });
		dispatch(setAlert('Comment added.', 'success'));
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status },
		});
	}
};

// delete comment
export const deleteComment = (postId, commentId) => async (dispatch) => {
	try {
		await axios.delete(`/api/posts/comment/${postId}/${commentId}`);
		dispatch({ type: REMOVE_COMMENT, payload: commentId });
		dispatch(setAlert('Comment removed.', 'success'));
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status },
		});
	}
};
