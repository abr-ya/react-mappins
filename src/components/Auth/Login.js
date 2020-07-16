import React from "react";
import {GraphQLClient} from 'graphql-request';
import {GoogleLogin} from 'react-google-login';
import {withStyles} from "@material-ui/core/styles";
// import Typography from "@material-ui/core/Typography";

const Login = ({classes}) => {
  const ME_QUERY = `{
    me {
      _id
      name
      email
      picture
    }
  }`;

  const onSuccess = async googleUser => {
    const idToken = googleUser.getAuthResponse().id_token;
    // console.log(idToken);
    const client = new GraphQLClient('http://localhost:4000/graphql', {
      headers: {authorization: idToken}
    });
    const data = await client.request(ME_QUERY); // возвращает промис
    console.log(data);
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
