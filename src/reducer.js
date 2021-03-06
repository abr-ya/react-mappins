export default function reducer(state, {type, payload}) {
	switch(type) {
		case "LOGIN_USER":
			return {
				...state,
				currentUser: payload,
			}
		case "SIGNOUT_USER":
			return {
				...state,
				isAuth: false,
				currentUser: null,
			}
		case "IS_LOGGED_IN":
			return {
				...state,
				isAuth: payload,
			}
		case "CREATE_DRAFT":
			return {
				...state,
				currentPin: null,
				draft: {
					latitude: 0,
					longitude: 0,
				}
			}
		case "UPDATE_DRAFT_LOCATION":
			return {
				...state,
				draft: payload,
			}
		case "DELETE_DRAFT":
			return {
				...state,
				draft: null,
			}
		case "GET_PINS":
			return {
				...state,
				pins: payload,
			}
		case "CREATE_PIN":
			const newPin = payload;
			const prevPins = state.pins
				.filter(pin => pin._id !== newPin._id);
			return {
				...state,
				pins: [...prevPins, newPin],
			}
		case "SET_PIN":
			return {
				...state,
				currentPin: payload,
				draft: null,
			}
		case "DELETE_PIN":
			const deletedPin = payload;
			const prevPins2 = state.pins
				.filter(pin => pin._id !== deletedPin._id);
			let newCurrentPin = state.currentPin;
			// сбрасываем, если он существует и мы его удалили только что
			if (newCurrentPin && deletedPin._id === newCurrentPin._id) {
				console.log('id совпали');
				newCurrentPin = null;
			}
			return {
				...state,
				pins: prevPins2,
				currentPin: newCurrentPin,
			}
			case "CREATE_COMMENT":
				const updatedPin = payload;
				const newPins = state.pins
					.map(pin => pin._id === updatedPin._id ? updatedPin : pin);
				return {
					...state,
					pins: newPins,
					currentPin: updatedPin,
				}			
		default:
			return state;
	}
};
