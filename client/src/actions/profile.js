import axios from 'axios';
import { setAlert } from './alert';

import { GET_PROFILE, PROFILE_ERROR, UPDATE_PROFILE } from './types';

// get current user's profile
export const getCurrentProfile = () => async (dispatch) => {
	try {
		const res = await axios.get('api/profile/me');

		dispatch({
			type: GET_PROFILE,
			payload: res.data,
		});
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status },
		});
	}
};

// create or update profile
export const createProfile =
	(formData, history, edit = false) =>
	async (dispatch) => {
		try {
			//TODO setting default is workaround
			axios.defaults.headers.post['Content-Type'] = 'application/json';

			const res = await axios.post('/api/profile', formData);

			dispatch({
				type: GET_PROFILE,
				payload: res.data,
			});

			dispatch(setAlert(edit ? 'Profile updated' : 'Profile created', 'success'));

			if (!edit) {
				history.push('/dashboard');
			}
		} catch (err) {
			const errors = err.response.data.errors;
			if (errors) {
				errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
			}

			dispatch({
				type: PROFILE_ERROR,
				payload: { msg: err.response.statusText, status: err.response.status },
			});
		}
	};

// add experience
export const addExperience = (formData, history) => async (dispatch) => {
	try {
		//TODO setting default is workaround
		axios.defaults.headers.post['Content-Type'] = 'application/json';

		const res = await axios.put('/api/profile/experience', formData);

		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data,
		});

		dispatch(setAlert('Experience added', 'success'));
	} catch (err) {
		const errors = err.response.data.errors;
		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
		}

		dispatch({
			type: PROFILE_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status },
		});
	}
};

// add education
export const addEducation = (formData, history) => async (dispatch) => {
	try {
		//TODO setting default is workaround
		axios.defaults.headers.post['Content-Type'] = 'application/json';

		const res = await axios.put('/api/profile/education', formData);

		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data,
		});

		dispatch(setAlert('Education added', 'success'));
	} catch (err) {
		const errors = err.response.data.errors;
		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
		}

		dispatch({
			type: PROFILE_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status },
		});
	}
};
