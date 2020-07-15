import React from "react";
import { GoogleLogin } from 'react-google-login';
import { withStyles } from "@material-ui/core/styles";
// import Typography from "@material-ui/core/Typography";

const Login = ({ classes }) => {
  const onSuccess = googleUser => {
    const idToken = googleUser.getAuthResponse().id_token;
    console.log(idToken);
  };

  return (
    <GoogleLogin
      clientId='604834729114-34ae5d58hnu31gfiej9bb6hjskm0qup7.apps.googleusercontent.com'
      onSuccess={onSuccess}
      isSignedIn={true}
    />
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
