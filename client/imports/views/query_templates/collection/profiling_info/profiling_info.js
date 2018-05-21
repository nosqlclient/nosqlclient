import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import './profiling_info.html';

Template.profilingInfo.executeQuery = Querying.Collection.ProfilingInfo.execute.bind(Querying.Collection.ProfilingInfo);
Template.profilingInfo.renderQuery = Querying.Collection.ProfilingInfo.render.bind(Querying.Collection.ProfilingInfo);
