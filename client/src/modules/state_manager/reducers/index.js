import { combineReducers } from 'redux';
import { connectModal, aboutModal } from './LayoutReducers';

export default combineReducers({
  connectModal,
  aboutModal
});
