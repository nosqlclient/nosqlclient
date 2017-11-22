import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './drop_index.html';

Template.dropIndex.executeQuery = Querying.Collection.DropIndex.execute;
Template.dropIndex.renderQuery = Querying.Collection.DropIndex.render;
