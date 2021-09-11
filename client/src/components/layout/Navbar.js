import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { logout } from '../../actions/auth';

export const Navbar = ({ auth: { isAuthenticated, loading }, logout }) => {
	const authLinks = (
		<Fragment>
			<li>
				<Link to='/dashboard'>
					<i className='fas fa-user'></i> <span>Dashboard</span>
				</Link>
			</li>
			<li>
				<Link onClick={logout} to='#!'>
					<i className='fas fa-sign-out-alt'></i> <span className='hide-sm'>Logout</span>
				</Link>
			</li>
		</Fragment>
	);
	const guestLinks = (
		<Fragment>
			<li>
				<Link to='/register'>Register</Link>
			</li>
			<li>
				<Link to='/login'>Login</Link>
			</li>
		</Fragment>
	);
	return (
		<nav className='navbar bg-dark'>
			<h1>
				<Link to='/'>
					<i className='fas fa-code'></i> BeeSocial
				</Link>
			</h1>
			<ul>
				<li>
					<Link to='/profiles'>Profiles</Link>
				</li>
				{!loading && <Fragment>{isAuthenticated ? authLinks : guestLinks}</Fragment>}
			</ul>
		</nav>
	);
};

Navbar.propTypes = {
	logout: PropTypes.func.isRequired,
	auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
	auth: state.auth,
});

export default connect(mapStateToProps, { logout })(Navbar);
