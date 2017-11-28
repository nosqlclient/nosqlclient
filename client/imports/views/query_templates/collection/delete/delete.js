import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './delete.html';

Template.delete.executeQuery = Querying.Collection.Delete.execute.bind(Querying.Collection.Delete);
Template.delete.renderQuery = Querying.Collection.Delete.render.bind(Querying.Collection.Delete);
