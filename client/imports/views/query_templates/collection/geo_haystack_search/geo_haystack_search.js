import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums } from '/client/imports/modules';
import './geo_haystack_search.html';

Template.geoHaystackSearch.onRendered(() => {
  Querying.initOptions(Enums.GEO_HAYSTACK_SEARCH_OPTIONS);
});

Template.geoHaystackSearch.executeQuery = Querying.Collection.GeoHayStackSearch.execute;
Template.geoHaystackSearch.renderQuery = Querying.Collection.GeoHayStackSearch.render;
