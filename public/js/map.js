
Ext.ns("XERO", "XERO.viz");

Ext.require([
    'Ext.panel.*'
]);

Ext.define("XERO.viz.Map", {

	extend: "Ext.Panel",
	alias: "xero-viz-map",
	socket: null,
	loadingText: "Loading...",
	
	initComponent: function() {
		this.socket.on({
			message: function(cmp, msg) {
				if(msg && msg.location) {
					this.addMarker(msg.location);
				}
			},
			scope: this
		});
		this.callParent(arguments);
	},
	
	onRender: function() {
		this.callParent(arguments);
		
		this.po = org.polymaps;
		this.map = this.po.map()
			.container(this.getEl().down("div.x-panel-body", true).appendChild(this.po.svg("svg")))
			.center({lat: 39, lon: 10})
			.zoom(1)
			.zoomRange([2, 9])
			.add(this.po.interact());

		this.map.add(this.po.image()
        	.url(this.po.url("http://{S}tile.cloudmade.com"
                      + "/e5db7ff94b054de799146f983c9c4a70"
                      + "/2861/256/{Z}/{X}/{Y}.png")
            .hosts(["a.", "b.", "c.", ""])));

 		this.map.add(this.po.fullscreen());

  		this.map.add(this.po.compass()
          .pan("none"));
	},
	
	addMarker: function(location) {
    	var id = ("mark_" + location.longitude + "_" + location.latitude).replace(/[^0-9a-z_]/g, '');

		var geometry = {
			coordinates: [
				location.longitude, 
				location.latitude
			],
			type: "Marker",
			id: id,
			radius: 10,
			text: location.city || location.country_name
		};
		
		this.map.add(this.po.geoJson().features([{ geometry: geometry }]));
		
		Ext.defer(function() {
			Ext.fly(id).remove();
		}, 500);
	}
});