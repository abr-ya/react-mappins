import React, {useContext} from 'react';
import {GraphQLClient} from 'graphql-request';
import {GoogleLogin} from 'react-google-login';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Context from '../../context';
import {ME_QUERY} from '../../graphql/queries';

const Login = ({classes}) => {
	const {dispatch} = useContext(Context);

	const onSuccess = async googleUser => {
		try {
			const idToken = googleUser.getAuthResponse().id_token;
			// console.log(idToken);
			const client = new GraphQLClient('http://localhost:4000/graphql', {
				headers: {authorization: idToken}
			});
			const userData = await client.request(ME_QUERY); // возвращает промис
			//console.log(userData);
			dispatch({
				type: "LOGIN_USER",
				payload: userData.me,
			});
		} catch (err) {
			onFailure(err);
		}
	};

	const onFailure = err => {
		console.error("Error login:", err);
	};

	return (
		<div className={classes.root}>
			<Typography
				component="h1"
				variant="h3"
				gutterBottom
				noWrap
				style = {{color: "rgb(66, 133, 244)"}}
			>
				Welcome
			</Typography>
			<GoogleLogin
				clientId='604834729114-34ae5d58hnu31gfiej9bb6hjskm0qup7.apps.googleusercontent.com'
				onSuccess={onSuccess}
				onFailure={onFailure}
				isSignedIn={true}
				theme="dark"
			/>			
		</div>
	);
}

const styles = {
	root: {
		height: "100vh",
		display: "flex",
		justifyContent: "center",
		flexDirection: "column",
		alignItems: "center"
	}
};

export default withStyles(styles)(Login);
