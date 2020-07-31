import React, {useState, useContext} from "react";
import {GraphQLClient} from 'graphql-request';
import axios from 'axios';
import {withStyles} from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddAPhotoIcon from "@material-ui/icons/AddAPhotoTwoTone";
import LandscapeIcon from "@material-ui/icons/LandscapeOutlined";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/SaveTwoTone";

import Context from '../../context';
import {CREATE_PIN_MUTATION} from '../../graphql/mutations';

const CreatePin = ({classes}) => {
  const {dispatch, state} = useContext(Context);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSubmitHandler = async e => {
    try {
      e.preventDefault();
      setIsSubmitting(true);
      const idToken = window.gapi.auth2.getAuthInstance()
        .currentUser.get().getAuthResponse().id_token;
      const client = new GraphQLClient(process.env.REACT_APP_API_URL, {
        headers: {authorization: idToken}
      });
      const url = await imageUpload();
      const {latitude, longitude} = state.draft;
      //console.log({title, url, content, image}); // тест до создания
      const variables = {title, image: url, content, latitude, longitude};
      const {createPin} = await client.request(CREATE_PIN_MUTATION, variables);
      console.log("Pin created in DB", createPin);
      deleteDraftHandler();
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error creating Pin", error);
    }
  };

  const deleteDraftHandler = () => {
    console.log('deleteDraftHandler');
    setTitle('');
    setImage('');
    setContent('');
    dispatch({type: "DELETE_DRAFT"})
  };

  const imageUpload = async () => {
    let result = false;
    if (image) {
      const upURL = 'https://api.cloudinary.com/v1_1/abr/image/upload/';
      const data = new FormData();
      data.append('file', image);
      data.append('upload_preset', 'mappins');
      data.append('cloud_name', 'abr');
      const res = await axios.post(upURL, data);
      //console.log(res.data); // сервер отдает много интересного после загрузки
      //хорошо бы ещё обрабатывать возможную ошибку загрузки
      result = res.data.url; // наружу отдаём url
    }
    return result;
  };

  return (
    <form
      className={classes.form}
      onSubmit={(e) => formSubmitHandler(e)}
    >
      <Typography
        className={classes.alignCenter}
        component="h2"
        variant="h4"
        color="secondary"
      >
        <LandscapeIcon className={classes.iconLarge} /> Pin Location
      </Typography>
      <div>
        <TextField
          onChange={e => setTitle(e.target.value)}
          value={title}
          name="title"
          label="title"
          placeholder="Insert Pin Title"
        />
        <input
          accept="image/*"
          id="image"
          type="file"
          className={classes.input}
          onChange={e => setImage(e.target.files[0])}
        />
        <label htmlFor="image">
          <Button
            style={{color: image && 'green'}}
            component="span"
            size="small"
            className={classes.button}
          >
            <AddAPhotoIcon />
          </Button>
        </label>
      </div>
      <div className={classes.contentField}>
        <TextField
          onChange={e => setContent(e.target.value)}
          value={content}
          name="content"
          label="content"
          multiline
          rows="8"
          margin="normal"
          fullWidth
          variant="outlined"
        />      
      </div>
      <div>
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          onClick={deleteDraftHandler}
        >
          <ClearIcon className={classes.leftIcon} />
          Discard
        </Button>
        <Button
          type="submit"
          className={classes.button}
          variant="contained"
          color="secondary"
          disabled={!title.trim() || !content.trim() || isSubmitting} // is image not required?!
        >
          Submit
          <SaveIcon className={classes.rightIcon} />
        </Button>
      </div>
    </form>
  );
};

const styles = theme => ({
  form: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    paddingBottom: theme.spacing.unit
  },
  contentField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "95%"
  },
  input: {
    display: "none"
  },
  alignCenter: {
    display: "flex",
    alignItems: "center"
  },
  iconLarge: {
    fontSize: 40,
    marginRight: theme.spacing.unit
  },
  leftIcon: {
    fontSize: 20,
    marginRight: theme.spacing.unit
  },
  rightIcon: {
    fontSize: 20,
    marginLeft: theme.spacing.unit
  },
  button: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit,
    marginLeft: 0
  }
});

export default withStyles(styles)(CreatePin);
