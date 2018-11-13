/**
 * @author PradoArturo
 */

var presenceRawJSON = 0;
var presencePurgedJSON = 0;
var allSitesJSON = 0;

var presencePlot = new function() {
	// Set the dimensions of the canvas / graph
	this.cWidth = 0;
	this.cHeight = 0;
	
	this.margin = 0;
	this.width = 0;
	this.height = 0;
	
	this.graphDim = 0;
	this.labelHeight = 16;
	this.graphCount = 0;
		
	// Parse the xval / time
	this.parseDate = d3.time.format("%b %Y").parse;
	
	this.x, this.y, this.yOrd;
	
	this.yvalline;
	this.svg;	
	
	//initialize dimensions
	this.init_dims = function() {
		this.cWidth = document.getElementById('presence-map-canvas').clientWidth;
		this.cHeight = document.getElementById('presence-map-canvas').clientHeight;
		
		this.margin = {top: 0, right: 0, bottom: 0, left: this.cWidth * 0.05};
		this.width = this.cWidth - this.margin.left - this.margin.right;
		this.height = this.cHeight - this.margin.top - this.margin.bottom;
		
		this.graphDim = {gWidth: this.width, gHeight: this.height};	
		
		// Set the ranges
		this.x = d3.scale.linear().range([0, this.graphDim.gWidth]);
		this.y = d3.scale.linear().range([this.graphDim.gHeight, 0]);
		this.yOrd = d3.scale.ordinal()
						.rangeRoundBands([this.graphDim.gHeight, 0], .1);
						
		// Define the line
		this.yvalline = d3.svg.line()	
			//.interpolate("monotone")
		    .x(function(d) { return this.x(d.xval); })
		    .y(function(d) { return this.y(d.yval); });
		    
		// Adds the svg canvas
		this.svg = d3.select("#presence-map-canvas")
			.append("svg")
            .attr('id', 'svg-presence')
		        .attr("width", this.width + this.margin.left + this.margin.right)
		        .attr("height", this.height + this.margin.top + this.margin.bottom)
		    .append("g")
		        .attr("transform", 
		              "translate(" + this.margin.left + "," + this.margin.top + ")");
		
		this.svg.call(this.tip);	
	};
            
	// Define the axes
	this.make_x_axis = function () {          
	    return d3.svg.axis()
	        .scale(this.x)
	        .orient("bottom")
	        .ticks(40);
	};
	
	this.make_y_axis = function () {          
	    return d3.svg.axis()
	        .scale(this.y)
	        .orient("left")
	        .ticks(5);
	};
	
	this.make_yOrd_axis = function () {           
	    return d3.svg.axis()
	        .scale(this.yOrd)
	        .orient("left")
	        .ticks(1);
	};	
	
	// Tip that displays node info
	this.tip = d3.tip()
	  .attr('class', 'd3-tip')
	  .offset([-10, 0])
	  .html(function(d) {
		var alert,status,id_ts,comment;
		
	    return "<strong>Site:</strong> <span style='color:red'>" + d.site + "</span><Br/>"
			 + "<strong>Timestamp:</strong> <span style='color:red'>" + d.timestamp + "</span><Br/>";
	  });
	  
	this.clearData = function () {
		this.graphCount = 0;
		this.svg.selectAll(".dot").remove();
		this.svg.selectAll(".dot1").remove();
		this.svg.selectAll(".dot2").remove();
		this.svg.selectAll(".line").remove();
		this.svg.selectAll(".legend").remove();
		this.svg.selectAll(".tick").remove();
		this.svg.selectAll(".axislabel").remove();
	};  
};

var siteMaxNodes = [];
var maxNode;
var maxNodesJSON = 0;

function getRawDataPresence(xOffset) {

	var delay = 500;
	var data = presenceRawJSON;
	
	siteMaxNodes = data;
	
	//add node links to nodes with normal status
	var urlBase = "http://www.dewslandslide.com/";
	var urlNodeExt = "test/dpsitemap/";	
	
	var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
	//maxNode = d3.max(siteMaxNodes, function(d) { return parseDate(d.timestamp); });
	maxNode = 48;
	
	var maxRaw = d3.max(presenceRawJSON, function(d) { return parseDate(d.timestamp); });
	var maxPurged = d3.max(presencePurgedJSON, function(d) { return parseDate(d.timestamp); });

	// Scale the range of the data
	if(maxRaw > maxPurged) {
		//x.domain(d3.extent(presenceRawJSON, function(d) { return parseDate(d.timestamp); }));
		presencePlot.x.domain(d3.extent(presenceRawJSON, function(d) { return parseDate(d.timestamp); }));
	} 
	else {
		//x.domain(d3.extent(presencePurgedJSON, function(d) { return parseDate(d.timestamp); }));
		presencePlot.x.domain(d3.extent(presencePurgedJSON, function(d) { return parseDate(d.timestamp); }));
	}

	// Scale the range of the data
	//presencePlot.x.domain(d3.extent(siteMaxNodes, function(d) { return parseDate(d.timestamp); }));
	//yOrd.domain(siteMaxNodes.map(function(d) { return d.site; }));
	presencePlot.yOrd.domain(allSitesJSON.map(function(d) { return d.site; }));
	
	var cellw = (presencePlot.graphDim.gWidth / maxNode) * 0.9;
	var cellh = presencePlot.yOrd.rangeBand(); //9;

	presencePlot.svg.selectAll(".cell")
		.data(siteMaxNodes)
	.enter().append("rect")
		.attr("class", "cell")
		.attr('x', function(d){
			return presencePlot.x(parseDate(d.timestamp)) + xOffset;
		})
		.attr('y', function(d){
			return presencePlot.yOrd(d.site);
		})
		.attr('width', cellw)
		.attr('height', cellh)
		.on('mouseover', presencePlot.tip.show)
		.on('mouseout', presencePlot.tip.hide)
		.style("cursor", "pointer")
		.on("click", function(d){
			window.open(urlBase + urlNodeExt + d.site);
			//document.location.href = urlBase + urlNodeExt + d.site;
	        //document.location.href = urlBase + urlNodeExt + d.site + '/' + d.node;
	        //document.location.href = "www.google.com";
	    });	
}

function getPurgedDataPresence(xOffset) {

	var delay = 500;
	var data = presencePurgedJSON;
	
	siteMaxNodes = data;
	
	//add node links to nodes with normal status
	var urlBase = "http://www.dewslandslide.com/";
	var urlNodeExt = "test/dpsitemap/";	
	
	var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
	//maxNode = d3.max(siteMaxNodes, function(d) { return parseDate(d.timestamp); });
	maxNode = 48;
	
	// Scale the range of the data
	presencePlot.x.domain(d3.extent(siteMaxNodes, function(d) { return parseDate(d.timestamp); }));
	//yOrd.domain(siteMaxNodes.map(function(d) { return d.site; }));
	presencePlot.yOrd.domain(allSitesJSON.map(function(d) { return d.site; }));
	
	var cellw = (presencePlot.graphDim.gWidth / maxNode) * 0.9;
	var cellh = presencePlot.yOrd.rangeBand(); //9;

	presencePlot.svg.selectAll(".cell")
		.data(siteMaxNodes)
	.enter().append("rect")
		.attr("class", "cell")
		.attr('x', function(d){
			return presencePlot.x(parseDate(d.timestamp)) + xOffset;
		})
		.attr('y', function(d){
			return presencePlot.yOrd(d.site);
		})
		.attr('width', cellw)
		.attr('height', cellh)
		.on('mouseover', presencePlot.tip.show)
		.on('mouseout', presencePlot.tip.hide)
		.style("cursor", "pointer")
		.on("click", function(d){
			window.open(urlBase + urlNodeExt + d.site);
			//document.location.href = urlBase + urlNodeExt + d.site;
	        //document.location.href = urlBase + urlNodeExt + d.site + '/' + d.node;
	        //document.location.href = "www.google.com";
	    });	
}

var nodeStatuses = [];
var nodeStatusJSON = 0;

var alertdata = [];
function generatePresencePlot(urlRaw, urlPurged, title, xOffset, isLegends, graphNum) {
	// Get the data
	var jsondata = [];

	d3.json(urlPurged, function(error, data) {
		presencePurgedJSON = data;
		jsondata = data;		  
	});	

	//var data = urlRaw;
	d3.json(urlRaw, function(error, data) {
		presenceRawJSON = data;
		jsondata = data;
		
		getRawDataPresence(xOffset);
		var horOff = xOffset + ((presencePlot.graphDim.gWidth / maxNode) * 0.9)/2;	
			
		// Add the Y Axis
		presencePlot.svg.append("g")
			.attr("class", "yAxisDataPresence")
			.attr("transform", "translate(" + xOffset + ",0)")
			.call(presencePlot.make_yOrd_axis());
	
		var textMOver = function() {
			var text = d3.select(this);
			//text.attr("color", "steelblue" );
			text.attr("text-transform", "uppercase" );
		};

		var textMOut = function() {
			var text = d3.select(this);
			//text.attr("color", "black" );
			text.attr("text-transform", "lowercase" );
		};

		// Add hyperlinks to Y Axis ticks
		var urlBase = "http://www.dewslandslide.com/";
		var urlExt = "test/dpsitemap/";
		
		d3.selectAll(".yAxisDataPresence").selectAll("text")
		    .filter(function(d){ return typeof(d) == "string"; })
		    .style("cursor", "pointer")
		    .on('mouseover', textMOver)
			.on('mouseout', textMOut)
		    .on("click", function(d){
		        //document.location.href = urlBase + urlExt + d;
		        window.open(urlBase + urlExt + d);
		    });		
	});			

	//getPurgedDataPresence(xOffset);  
}

	
var nodeAlertJSON = 0;
function showDataPres() {
	allSitesJSON = maxNodesJSON;
	//var urlRaw = "/test/allpres/24";
	var urlRaw = "/test/allpres";
	var urlPurged = "/test/allpres/purged";
	
	generatePresencePlot(urlRaw, urlPurged, "Data Presence Map", 0, true, 1);
}

function dataPresencePlot() {
	presencePlot.init_dims();
	showDataPres();	
}

window.onload = function() {
	//dataPresencePlot();
};















