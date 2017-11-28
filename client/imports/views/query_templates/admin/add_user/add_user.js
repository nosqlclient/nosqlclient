import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/add_user_options/add_user_options';
import '/client/imports/views/query_templates_options/username/username.html';
import './add_user.html';

Template.addUser.onRendered(() => {
  Querying.initOptions(Enums.ADD_USER_OPTIONS, true);
});

Template.addUser.executeQuery = Querying.Admin.executeAddUserQuery.bind(Querying.Admin);
