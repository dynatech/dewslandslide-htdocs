var presenceJSON = 0;
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
		this.cHeight = document.getElementById('presence-map-canvas').offsetHeight *1.4;
		
		this.margin = {top:0, right:this.cWidth * 0.05, bottom:cHeight* 0.65, left: this.cWidth * 0.07};
		this.width = this.cWidth - this.margin.left - this.margin.right;
		this.height = this.cHeight - this.margin.top - this.margin.bottom + 50;
		
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
		.attr("width", this.cWidth + 100)
		.attr("height", this.height + this.margin.bottom- 790)
		.append("g")
		.attr("transform", 
			"translate(" + this.margin.left + "," + this.margin.top + ")");
		
		this.svg.call(this.tip);	
	};

	// Define the axes
	// this.make_x_axis = function () {          
	//     return d3.svg.axis()
	//         .scale(this.x)
	//         .orient("bottom")
	//         .ticks(40);
	// };
	
	// this.make_y_axis = function () {          
	//     return d3.svg.axis()
	//         .scale(this.y)
	//         .orient("left")
	//         .ticks(5);
	// };
	
	this.make_yOrd_axis = function () {           
		return d3.svg.axis()
		.scale(this.yOrd)
		.orient("left")
		.ticks(1);
	};	
	
	// Tip that displays node info
	this.tip = d3.tip()
	.attr('class', 'd3-tip')
	.offset([0, 0])
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


function removeDuplicates(num) {
	var x,
	len=num.length,
	out=[],
	obj={};

	for (x=0; x<len; x++) {
		obj[num[x]]=0;
	}
	for (x in obj) {
		out.push(x);
	}
	return out;
}

function getDataPresence(xOffset,allSitesJSON) {

	var delay = 500;
	var data = presenceJSON;
	
	siteMaxNodes = data;
	
	//add node links to nodes with normal status
	var urlBase = "http://" + window.location.hostname + "/";
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


	var list_time = [];

	for (var i = 0; i < siteMaxNodes.length; i++) {
		list_time.push(siteMaxNodes[i].timestamp)

	}

	var  filtered_time= removeDuplicates(list_time);

	var pattern_nodata=[];
	for (var i = 0; i < allSitesJSON.length; i++) {
		for (var a = 0; a < filtered_time.length; a++) {
			pattern_nodata.push({site:allSitesJSON[i].site,timestamp:filtered_time[a]})
		}
	}

	var nodata_id =[];
	var patter_id = [];
	for (var i = 0; i < pattern_nodata.length; i++) {
		for (var a = 0; a < siteMaxNodes.length; a++) {
			if(pattern_nodata[i].site == siteMaxNodes[a].site && pattern_nodata[i].timestamp == siteMaxNodes[a].timestamp){
				nodata_id.push(i)
			}
		}
		patter_id.push(i)
	}

	var array1 = nodata_id;
	var array2 = patter_id;
	var all_nodata = [];
	var i = 0;
	jQuery.grep(array2, function(el) {

		if (jQuery.inArray(el, array1) == -1) all_nodata.push(el);


		i++;

	});

	var nodata_svgValue =[];
	for (var i = 0; i < all_nodata.length; i++) {
		nodata_svgValue.push(pattern_nodata[all_nodata[i]])
	}
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
	.style("fill", "#222");

	presencePlot.svg.selectAll(".cellNEw")
	.data(nodata_svgValue)
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
	.style("fill", "#eeeeee");
}

var nodeStatuses = [];
var nodeStatusJSON = 0;

var alertdata = [];
function generatePresencePlot(url, title, xOffset, isLegends, graphNum,allSitesJSON) {
	// Get the data
	var jsondata = [];

	//var data = url;
	d3.json(url, function(error, data) {
		presenceJSON = data;
		jsondata = data;
		

		getDataPresence(xOffset,allSitesJSON);
		
		var horOff = xOffset + ((presencePlot.graphDim.gWidth / maxNode) * 0.9)/2;
		
		
		// Graph Label
		presencePlot.svg.append("text")      // text label for the x axis
		.attr("class", "axislabel")
		.attr("x", xOffset + (presencePlot.graphDim.gWidth / 2))
		.attr("y", 0 - (presencePlot.margin.top/2))
		.text(title);	


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
		var urlBase = "http://" + window.location.hostname + "/";
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

		/*
		// Y axis Label
		presencePlot.svg.append("text")		// text label for the y axis
			.attr("class", "axislabel")
			.attr("transform", "rotate(-90)")
			.attr("y", xOffset -5 - (presencePlot.margin.left / 2))
			.attr("x", 0 - (presencePlot.height / 2))
			.text("Column/Site");			
			*/	
		});			
	
	
}

var nodeAlertJSON = 0;
function showDataPres() {
	allSitesJSON = maxNodesJSON;
	var url = "/test/allpres";
	
	generatePresencePlot(url, "Data Presence Map", 0, true, 1,allSitesJSON);
}

function dataPresencePlot() {
	presencePlot.init_dims();
	showDataPres();	
}
















