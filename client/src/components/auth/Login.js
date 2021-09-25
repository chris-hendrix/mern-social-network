import React, { Fragment, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { login, loginGoogle } from '../../actions/auth';
import GoogleButton from 'react-google-button';

export const Login = ({ login, loginGoogle, isAuthenticated }) => {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});

	const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

	const onSubmit = async (e) => {
		e.preventDefault();
		login(email, password);
	};

	// redirect if logged in
	if (isAuthenticated) {
		return <Redirect to='/dashboard' />;
	}

	const { email, password } = formData;
	return (
		<Fragment>
			<h1 className='large text-primary'>Sign In</h1>
			<p className='lead'>
				<i className='fas fa-user'></i> Sign Into Your Account
			</p>
			<form className='form' onSubmit={(e) => onSubmit(e)}>
				<div className='form-group'>
					<input
						type='email'
						placeholder='Email Address'
						name='email'
						value={email}
						onChange={(e) => onChange(e)}
						required
					/>
				</div>
				<div className='form-group'>
					<input
						type='password'
						placeholder='Password'
						name='password'
						value={password}
						onChange={(e) => onChange(e)}
						minLength='6'
					/>
				</div>
				<input type='submit' className='btn btn-primary' value='Login' />
			</form>
			<br />
			<div>
				<GoogleButton
					onClick={() => {
						console.log('Google button clicked');
						loginGoogle();
					}}
				/>
			</div>
			<p className='my-1'>
				Don't have an account? <Link to='/register'>Sign Up</Link>
			</p>
		</Fragment>
	);
};

login.PropTypes = {
	login: PropTypes.func.isRequired,
	loginGoogle: PropTypes.func.isRequired,
	isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
	isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { login, loginGoogle })(Login);
