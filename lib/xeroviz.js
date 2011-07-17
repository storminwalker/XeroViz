var	util = require("util"),
  	fs = require("fs"),
  	config = require("config"),
  	Buffer = require("buffer").Buffer,
  	io = require("socket.io"),
  	querystring = require("querystring"),
	http = require("http"),
	static = require("node-static"),
	geoip = require("geoip"),
	path = require("path");

Ext.ns("XERO", "XERO.viz");

Ext.define("XERO.viz.LocationTracker", {
	extend: "Ext.util.Observable",
    
    locationCache: [],
    
    constructor: function(config) {
    	config = config || {};
		Ext.apply(this, config);
        this.listeners = config.listeners;

    	this.callParent(arguments);

		this.initTrackingGif();
		this.initGeoLookup();
    },
    
    startServer: function() {
    	var me = this;
		var server = http.createServer(
			Ext.bind(this.serveRequest, this)
		);
		
		server.listen(config.tracking.port, config.tracking.hostname);
		
		this.socket = io.listen(server);

		this.socket.configure(config.socketIO.configure(this.socket));
		
		this.socket.sockets.on('connection', function(client){
			//console.log("new client", client);
			client.on('disconnect', function(){ 
				console.log("lost client"); 
			})
		});
		
		console.log('Socket server running at ws://*:' + config.tracking.port);
		console.log('Tracking server running at http://*:' + config.tracking.port + '/tracking.gif');
		
		// allow the test dashboard to be rendered if enabled
		if(config.dashboard.enabled) {
			this.startTestServer();
		}
	
	},
	
	startTestServer: function() {	
		var dashboard = new(static.Server)('./public');
		
		http.createServer(function (request, response) {
			request.addListener('end', function () {
				dashboard.serve(request, response);
			});
		}).listen(config.dashboard.port, config.dashboard.hostname);
	
		console.log('Test dashboard running at http://*:' + config.dashboard.port);
	},
	
    initTrackingGif: function() {
    	var data = fs.readFileSync(__dirname + "/../images/tracking.gif", 'binary');
		this.trackingGif = new Buffer(43);
		this.trackingGif.write(data, 'binary', 0);
    },
    
    initGeoLookup: function() {
		var cityPath = path.normalize(__dirname + '/../geoip/GeoLiteCity.dat');
		try {
			this.cityDb = new geoip.City(cityPath);
		} catch(err) {
			console.log("Cannot init GEOIP database");
		}
	},
	
    serveRequest: function(request, response) {		
		try {
			this.writeTrackingGif(response);
		} catch(err) {
			this.handleError(request, response, err);
		}
				
		var qs = Ext.Object.fromQueryString(request.url);
		qs.ip = qs.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress;
		
		this.broadcastLocation(qs);
	},

	broadcastLocation: function(data) {
    	data.timestamp = new Date();
    	
		var remoteAddress,
      		location;
      		
		if(data.ip === "127.0.0.1") {
			remoteAddress = "8.8.8.8";
		} else {
			remoteAddress = data.ip;
		}
		
		data.location = this.cityDb.lookupSync(remoteAddress);

		if(data.location.latitude) {
			this.socket.sockets.emit("message", JSON.stringify(data));
		}	
	},
	
	writeTrackingGif: function(response) {
		response.writeHead(200, { 
			"Content-Type": "image/gif",
			"Content-Disposition": "inline",
			"Content-Length": "43" 
		});
		response.end(this.trackingGif);
	},

	handleError: function(request, response, err) {
		this.send500(response);
		
		err.stack = err.stack.split("\n");
		err.url = request.url;
		util.log(JSON.stringify(err, null, 2));
	},
	
	send500: function(response) {
		response.writeHead(500, {});
		response.write("Server error");
		response.end();
	}
});

module.exports = XERO.viz.LocationTracker;


