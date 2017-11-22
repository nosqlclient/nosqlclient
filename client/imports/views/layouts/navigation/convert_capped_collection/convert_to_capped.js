import { Template } from 'meteor/templating';
import { CollectionConversion } from '/client/imports/ui';
import './convert_to_capped.html';


Template.convertToCapped.events({
  'click #btnConvertToCapped': function () {
    CollectionConversion.convertToCapped();
  },
});
