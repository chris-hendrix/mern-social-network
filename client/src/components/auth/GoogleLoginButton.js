import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import GoogleButton from 'react-google-button';
import { loginGoogle } from '../../actions/auth';

const GoogleLoginButton = () => {
	const onClick = async (e) => {
		e.preventDefault();
		console.log('loginGoogle');
		loginGoogle();
	};
	return (
		<div>
			<GoogleButton
				onClick={(e) => {
					console.log('Google button clicked');
					onClick(e);
				}}
			/>
		</div>
	);
};

GoogleLoginButton.propTypes = {
	loginGoogle: PropTypes.func.isRequired,
};

export default connect()(GoogleLoginButton);
