import { TOGGLE_ABOUT_MODAL, TOGGLE_CONNECT_MODAL } from './types';

/**
 * All redux actions related with views/layout.
 */
export const toggleConnectModal = () => ({ type: TOGGLE_CONNECT_MODAL });
export const toggleAboutModal = () => ({ type: TOGGLE_ABOUT_MODAL });
