import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './drop_index.html';

Template.dropIndex.executeQuery = Querying.Collection.DropIndex.execute.bind(Querying.Collection.DropIndex);
Template.dropIndex.renderQuery = Querying.Collection.DropIndex.render.bind(Querying.Collection.DropIndex);
