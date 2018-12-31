import { createStore } from 'redux';
import reducers from './reducers';
import * as LayoutActions from './actions/LayoutActions';

class StateManager {
  constructor() {
    this.store = createStore(reducers);
  }

  layoutActions = LayoutActions;
}

export default new StateManager();
