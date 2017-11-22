import { Template } from 'meteor/templating';
import { CollectionValidationRules } from '/client/imports/ui';
import './validation_rules.html';

Template.validationRules.events({
  'click #btnSaveValidationRules': function () {
    CollectionValidationRules.save();
  },
});
