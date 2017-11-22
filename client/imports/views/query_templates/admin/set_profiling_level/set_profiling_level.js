import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums } from '/client/imports/modules';
import './set_profiling_level.html';

Template.setProfilingLevel.onRendered(() => {
  Querying.initOptions(Enums.PROFILING_LEVELS);
});

Template.setProfilingLevel.executeQuery = Querying.Admin.executeSetProfilingLevelQuery;
