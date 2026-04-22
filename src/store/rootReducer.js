import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import commonReducer from './slices/commonSlice';
import userDetailsReducer from './slices/userDetailsSlice';
import homeMarketsReducer from './slices/homeMarketsSlice';
import exchBetSlipReducer from './slices/exchBetSlipSlice';
// import eventReducer from './slices/eventSlice';
// import betPlacingReducer from './slices/betPlacingSlice';
// import modalsReducer from './slices/modalSlice';
// import availableEventTypesReducer from './slices/availableEventTypesSlice';
// import uiReducer from './slices/uiSlice';
// import virtualCricketReducer from './slices/virtualCricketSlice';
// import ballByBallReducer from './slices/ballByBallSlice';
// import racingEventsReducer from './slices/racingEventsSlice';
// import baseApi from './api/baseApi';


const authPersistConfig = {
  key: 'auth',
  storage,
};



export const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  common: commonReducer,
  userDetails: userDetailsReducer,
  homeMarkets: homeMarketsReducer,
  exchBetSlip: exchBetSlipReducer,
  // event: eventReducer,
  // betPlacing: betPlacingReducer,
  // modals: modalsReducer,
  // availableEventTypes: availableEventTypesReducer,
  // ui: uiReducer,
  // virtaulCricket: virtualCricketReducer,
  // ballByBall: ballByBallReducer,
  // racingEvents: racingEventsReducer,
  // [baseApi.reducerPath]: baseApi.reducer,
});