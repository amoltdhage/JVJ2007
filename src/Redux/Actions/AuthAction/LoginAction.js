import { LOGIN, LOGIN_FAILURE, LOGOUT } from "../../ReduxKeys";

export const loginAction = (user) => ({
  type: LOGIN,
  payload: { user },
});

export const logoutAction = () => ({
  type: LOGOUT,
});

export const loginFailAction = () => ({
  type: LOGIN_FAILURE,
});
