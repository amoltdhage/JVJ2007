import { LOGIN, LOGIN_FAILURE, LOGOUT } from "../../ReduxKeys";

const initialState = {
  isAuthenticated: false,
  user: null,
};

/**
 * Store user data oon login and remove user data on logout
 * @param {*} state
 * @param {*} action
 * @returns {*}
 */
const AuthReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case LOGOUT:
      return initialState;
    case LOGIN_FAILURE:
      return initialState;
    default:
      return state;
  }
};

export default AuthReducer;
