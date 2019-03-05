import { Template } from 'meteor/templating';
import { ViewPipelineUpdater } from '/client/imports/ui';
import './update_view_pipeline.html';

Template.updateViewPipeline.events({
  'click #btnSaveViewPipeline': function (event) {
    event.preventDefault();
    ViewPipelineUpdater.updateViewPipeline();
  },
});
