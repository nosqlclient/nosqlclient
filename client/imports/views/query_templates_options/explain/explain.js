import { Template } from 'meteor/templating';

import './explain.html';
import { UIComponents } from '../../../modules';

Template.explain.onRendered(() => {
  UIComponents.Checkbox.init($('#inputExplain'), 'uncheck');
});
