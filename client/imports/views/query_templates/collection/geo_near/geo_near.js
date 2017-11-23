import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/geo_near_options/geo_near_options';
import './geo_near.html';

Template.geoNear.onRendered(() => {
  Querying.initOptions(Enums.GEO_NEAR_OPTIONS);
});

Template.geoNear.executeQuery = Querying.Collection.GeoNear.execute;
Template.geoNear.renderQuery = Querying.Collection.GeoNear.render;
