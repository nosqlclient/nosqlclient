import { TOGGLE_ABOUT_MODAL, TOGGLE_CONNECT_MODAL } from '../actions/types';

export const connectModal = (state = { connectModal: { show: false } }, action) => {
  switch (action.type) {
    case TOGGLE_CONNECT_MODAL:
      return Object.assign({}, state, { connectionModal: { show: !state.connectionModal.show } });

    default:
      return state;
  }
};

export const aboutModal = (state = { aboutModal: { show: false } }, action) => {
  switch (action.type) {
    case TOGGLE_ABOUT_MODAL:
      return Object.assign({}, state, { aboutModal: { show: !state.aboutModal.show } });

    default:
      return state;
  }
};
