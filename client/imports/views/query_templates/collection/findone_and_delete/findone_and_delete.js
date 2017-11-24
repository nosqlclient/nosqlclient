import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/findone_modify_options/findone_modify_options';
import './findone_and_delete.html';

Template.findOneAndDelete.onRendered(() => {
  Querying.initOptions(Enums.FINDONE_MODIFY_OPTIONS, false, Enums.FINDONE_MODIFY_OPTIONS.UPSERT, Enums.FINDONE_MODIFY_OPTIONS.RETURN_ORIGINAL);
});

Template.findOneAndDelete.executeQuery = Querying.Collection.FindOneAndDelete.execute.bind(Querying.Collection.FindOneAndDelete);
Template.findOneAndDelete.renderQuery = Querying.Collection.FindOneAndDelete.render.bind(Querying.Collection.FindOneAndDelete);
