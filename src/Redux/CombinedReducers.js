import { combineReducers } from "redux";
import AuthReducer from "./Reducers/AuthReducer/AuthReducer";

const rootReducer = combineReducers({ auth: AuthReducer });

export default rootReducer;