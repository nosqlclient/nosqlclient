Package.describe({
  name: 'ephemer:reactive-datatables-modified',
  summary: "Fast and reactive jQuery DataTables using standard Cursors / DataTables API. Supports Bootstrap 3.",
  version: "1.1.0",
  git: "https://github.com/ephemer/meteor-reactive-datatables.git"
});

Package.onUse(function(api) {
  api.versionsFrom('0.9.0');
  api.use(['templating'], 'client');
  api.addFiles([
  	'jquery.dataTables.min.js',
  	'reactive-datatables.js',
  	'reactive-datatable-template.html',
  	'reactive-datatable-template.js'
  ], 'client');
});
