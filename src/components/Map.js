import React, {useState, useEffect, useContext} from "react";
import ReactMapGL, {NavigationControl, Marker, Popup} from 'react-map-gl';
import {withStyles} from "@material-ui/core/styles";
import differenceInMinutes from 'date-fns/difference_in_minutes';
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/DeleteTwoTone";
import {unstable_useMediaQuery as useMediaQuery} from '@material-ui/core/useMediaQuery';
import {Subscription} from 'react-apollo';

import {useClient} from '../client';
import {GET_PINS_QUERY} from '../graphql/queries';
import {DELETE_PIN_MUTATION} from '../graphql/mutations';
import {
  PIN_ADDED_SUBSCRIPTION,
  PIN_UPDATED_SUBSCRIPTION,
  PIN_DELETED_SUBSCRIPTION
} from '../graphql/subscriptions';
import PinIcon from './PinIcon';
import Blog from './Blog';
import Context from '../context';

const Map = ({classes}) => {
  const client = useClient();
  const isMobile = useMediaQuery('(max-width:650px)');
  const {state, dispatch} = useContext(Context);
  
  useEffect(() => {
    getPins();
  }, []);

  const [viewport, setViewport] = useState({
    latitude: 47.222078,
    longitude: 39.720349,
    zoom: 13,
  });
  const [userPosition, setUserPosition] = useState(null);
  const [popup, setPopup] = useState(null);
  
  useEffect(() => {
    getUserPosition();
  }, []);

  const getPins = async () => {
    const {getPins} = await client.request(GET_PINS_QUERY);
    //console.log({getPins});
    dispatch({type: "GET_PINS", payload: getPins});
  };

  const getUserPosition = () => {
    //console.log(navigator);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        console.log(position);
        const {latitude, longitude} = position.coords;
        setViewport({...viewport, latitude, longitude});
        setUserPosition({latitude, longitude});
      })
    }
  };

  // клик по карте - создаём черновик, закрываем попап, если есть
  const hadleMapClick = ({lngLat, leftButton}) => {
    console.log(lngLat);
    if (!leftButton) return false; // обрабатыаем только левую кнопку
    setPopup(null); // добавил, чтобы закрывать попап если открыт
    if (!state.draft) {
      dispatch({type: "CREATE_DRAFT"})
    };
    const [longitude, latitude] = lngLat;
    dispatch({
      type: "UPDATE_DRAFT_LOCATION",
      payload: {longitude, latitude},
    });
  }

  const highlightNewPin = pin => {
    const pinAge = differenceInMinutes(Date.now(), Number(pin.createdAt));
    // console.log(pinAge); // выводим возраст метки
    const isNewPin = pinAge < 60;
    return isNewPin ? 'limegreen' : 'darkblue';
  };

  // пока не пойму, зачем мы сразу в 2 места отправляем пин...
  const handleSelectPin = pin => {
    console.log(pin);
    setPopup(pin);
    dispatch({type: "SET_PIN", payload: pin});
  };

  const isAuthUser = () => state.currentUser._id === popup.author._id;

  const deleteButtonHandler = async pin => {
    const variables = {pinId: pin._id};
    const {deletePin} = await client.request(DELETE_PIN_MUTATION, variables);
    console.log('метка удалена (null - что-то пошло не так!):', deletePin);
    //if (deletePin) dispatch({type: "DELETE_PIN", payload: deletePin});
  };

  return (
    <div className={isMobile ? classes.rootMobile : classes.root}>
      <ReactMapGL
        width="100vw"
        height="calc(100vh - 64px)"
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        scrollZoom={!isMobile}
        onViewportChange={newViewport => setViewport(newViewport)}
        onClick={hadleMapClick}
        {...viewport}
      >
        {/* NavControl */}
        <div className={classes.navigationControl}>
          <NavigationControl
            onViewportChange={newViewport => setViewport(newViewport)}
          />
        </div>

        {/* Pin for the user's current position */}
        {userPosition && (
          <Marker
            latitude={userPosition.latitude}
            longitude={userPosition.longitude}
            offsetLeft={-19}
            offsetTop={-37}
          >
            <PinIcon size={40} color="red" />
          </Marker>
        )}

        {/* Draft Pin */}
        {state.draft && (
          <Marker
            latitude={state.draft.latitude}
            longitude={state.draft.longitude}
            offsetLeft={-19}
            offsetTop={-37}
          >
            <PinIcon size={40} color="blue" />
          </Marker>
        )}

        {/* Created Pins */}
        {state.pins.map(pin => (
          <Marker
            key={pin._id}
            latitude={pin.latitude}
            longitude={pin.longitude}
            offsetLeft={-19}
            offsetTop={-37}
          >
            <PinIcon
              size={40}
              color={highlightNewPin(pin)}
              onClick={() => handleSelectPin(pin)}
            />
          </Marker>          
        ))}

        {/* Popup Dialog for Created Pins */}
        {popup && (
          <Popup
            anchor='top'
            latitude={popup.latitude}
            longitude={popup.longitude}
            closeOnClick={false}
            onClose={() => setPopup(null)}
          >
            <img
              className={classes.popupImage}
              src={popup.image}
              alt={popup.title}
            />
            <div className={classes.popupTab}>
              <Typography>
                {popup.latitude.toFixed(6)},
                {popup.longitude.toFixed(6)},
              </Typography>
              {isAuthUser() && (
                <Button onClick={() => deleteButtonHandler(popup)}>
                  <DeleteIcon className={classes.deleteIcon} />
                </Button>
              )}
            </div>
          </Popup>
        )}
      </ReactMapGL>

      {/* Subscriptions for Creating / Updating / Deleting Pin */}
      <Subscription
        subscription={PIN_ADDED_SUBSCRIPTION}
        onSubscriptionData={({subscriptionData}) => {
          const {pinAdded} = subscriptionData.data;
          console.log('Subs! - pinAdded', pinAdded);
          dispatch({type: "CREATE_PIN", payload: pinAdded});
        }}
      />
      <Subscription
        subscription={PIN_UPDATED_SUBSCRIPTION}
        onSubscriptionData={({subscriptionData}) => {
          const {pinUpdated} = subscriptionData.data;
          console.log('Subs! - pinUpdated', pinUpdated);
          dispatch({type: "CREATE_COMMENT", payload: pinUpdated});
        }}
      />
      <Subscription
        subscription={PIN_DELETED_SUBSCRIPTION}
        onSubscriptionData={({subscriptionData}) => {
          const {pinDeleted} = subscriptionData.data;
          console.log('Subs! - pinDeleted', pinDeleted);
          setPopup(null);
          dispatch({type: "DELETE_PIN", payload: pinDeleted});
        }}
      />

      {/* Blog area for add data to pin */}
      <Blog />
    </div>
  );
};

const styles = {
  root: {
    display: "flex"
  },
  rootMobile: {
    display: "flex",
    flexDirection: "column-reverse"
  },
  navigationControl: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: "1em"
  },
  deleteIcon: {
    color: "red"
  },
  popupImage: {
    padding: "0.4em",
    height: 200,
    width: 200,
    objectFit: "cover"
  },
  popupTab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  }
};

export default withStyles(styles)(Map);
