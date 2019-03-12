import { Template } from 'meteor/templating';
import './return_original.html';
import { UIComponents } from '../../../modules';

Template.returnOriginal.onRendered(() => {
  UIComponents.Checkbox.init($('#inputReturnOriginal'));
});
