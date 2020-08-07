import React, {useContext} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Paper} from '@material-ui/core';
import {unstable_useMediaQuery as useMediaQuery} from '@material-ui/core/useMediaQuery';

import Context from '../context';
import NoContent from './Pin/NoContent';
import CreatePin from './Pin/CreatePin';
import PinContent from './Pin/PinContent';

const Blog = ({classes}) => {
  const isMobile = useMediaQuery('(max-width:650px)');
  const {state} = useContext(Context);
  const {draft, currentPin} = state; // !! оптимизировать

  let BlogContent;
  if (draft) {
    // create pin component
    BlogContent = CreatePin;
  } else if (currentPin) {
    // show currentPin
    BlogContent = PinContent;
  } else {
    // no content
    BlogContent = NoContent;
  }

  return (
    <Paper className={isMobile ? classes.rootMobile : classes.root}>
      <BlogContent />
    </Paper>
  );
};

const styles = {
  root: {
    minWidth: 350,
    maxWidth: 400,
    maxHeight: "calc(100vh - 64px)",
    overflowY: "scroll",
    display: "flex",
    justifyContent: "center"
  },
  rootMobile: {
    maxWidth: "100%",
    maxHeight: 300,
    overflowX: "hidden",
    overflowY: "scroll"
  }
};

export default withStyles(styles)(Blog);
