var config = {
	name : "XeroViz",
	tracking: {
		port: 8000,
		hostname: null// "0.0.0.0"
	},
	dashboard: {
		enabled: true,
		port: 8001,
		hostname: null// "0.0.0.0",
	},
	socketIO: {
		configure: function(io) {
			return function() {
				io.enable('browser client minification');
				io.enable('browser client etag');
				io.set('log level', 1);
			};
		}
	}
}

module.exports = config;
