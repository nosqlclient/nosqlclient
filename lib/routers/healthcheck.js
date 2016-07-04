/**
 * Created by DrSmirnov on 03.07.2016
 * 
 * This router definition adds a simple health check to the application.
 */
Router.route('/healthcheck', function() {
	this.response.statusCode = 200;
	this.response.end("Server is up and running");
}, { where: "server" });