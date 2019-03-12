import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './index_information.html';
import { UIComponents } from '../../../../modules';

Template.indexInformation.onRendered(() => {
  UIComponents.Checkbox.init($('#inputFullInformation'));
});

Template.indexInformation.executeQuery = Querying.Collection.IndexInformation.execute.bind(Querying.Collection.IndexInformation);
Template.indexInformation.renderQuery = Querying.Collection.IndexInformation.render.bind(Querying.Collection.IndexInformation);
