
Ext.ns("XERO", "XERO.viz");

Ext.define("XERO.viz.Socket", {
    extend: 'Ext.util.Observable',
    
    constructor: function(config){
        this.addEvents("message");
        this.state = "stopped";
        XERO.viz.Socket.superclass.constructor.call(this, config)
    },

	onClose: function() {
		var me = this;
		if(this.getState() == "retrying") {
			console.log("still no socket, retrying in 3 seconds");
		  	setTimeout(function() { me.start() }, 3000);
		} else {
			this.setState("retrying");
		  	console.log("socket lost, retrying immediately");
		  	setTimeout(function() { me.start() }, 200);
		}
	},

	onOpen: function() {
		this.setState("started");
		console.log("socket started");
	},
	
	onMessage: function(message) {
		message = Ext.decode(message);  
		console.log(message);
		this.fireEvent("message", this, message);
	},
	
	getState: function() {
		return this.state;
	},
	
	setState: function(state) {
		this.state = state;
	},

	start: function() {
		this.socket = io.connect(document.location.hostname, { 
			port: 8000 
		});

		this.socket.on('message', Ext.bind(this.onMessage, this));
		this.socket.on('disconnect', Ext.bind(this.onClose, this));
		this.socket.on('connect', Ext.bind(this.onOpen, this));
	}
});