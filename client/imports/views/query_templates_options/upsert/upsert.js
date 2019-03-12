import { Template } from 'meteor/templating';
import './upsert.html';
import { UIComponents } from '../../../modules';

Template.upsert.onRendered(() => {
  UIComponents.Checkbox.init($('#inputUpsert'));
});
