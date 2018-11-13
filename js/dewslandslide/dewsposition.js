/**
 * @author PradoArturo
 */

var prevIntvl = -1;
var prevSite = -1;
var curSite = -1;
var dayIntvl = 1;
var pos_legend_active = 0;
var pos_color = [];
var pos_key = [];

var positionPlot = new function() {
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
	
	this.x, this.y;
	
	this.yvalline;
	this.svg;
	
	this.init_dims = function() {
		// Set the dimensions of the canvas / graph
		this.cWidth = document.getElementById('position-canvas').clientWidth;
		this.cHeight = document.getElementById('position-canvas').clientHeight;
		
		this.margin = {top: this.cHeight * 0.1, right: this.cWidth * 0.05, bottom: this.cHeight * 0.25, left: this.cWidth * 0.1},
		this.width = this.cWidth - this.margin.left - this.margin.right,
		this.height = this.cHeight - this.margin.top - this.margin.bottom;
		
		this.graphDim = {gWidth: this.width * 0.4, gHeight: this.height};	
		
		// Set the ranges
		this.x = d3.scale.linear().range([0, this.graphDim.gWidth]);
		this.y = d3.scale.linear().range([this.graphDim.gHeight, 0]);
		
		// Define the line
		this.yvalline = d3.svg.line()	
			//.interpolate("monotone")
		    .x(function(d) { return this.x(d.xval); })
		    .y(function(d) { return this.y(d.yval); });
		    
		// Adds the svg canvas
		this.svg = d3.select("#position-canvas")
			.append("svg")
			.attr("id", "svg-position")
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
	        .ticks(5);
	};
	
	this.make_y_axis = function () {        
	    return d3.svg.axis()
	        .scale(this.y)
	        .orient("left")
	        .ticks(5);
	};

	// Tip that displays node info
	this.tip = d3.tip()
	  .attr('class', 'd3-tip')
	  .offset([-10, 0])
	  .html(function(d) {
	    return "<strong>Date:</strong> <span style='color:red'>" + d.date + "</span><Br/>"
			+ "<strong>Node ID:</strong> <span style='color:red'>" + d.node + "</span><Br/>"
			+ "<strong>X:</strong> <span style='color:red'>" + d.xval + " m</span>"
			+ "<strong>Y:</strong> <span style='color:red'>" + d.yval + " m</span>";
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
	
	// Get the data
	this.jsondata = [];
	
};

// Get the data
jsondata = [];
function generatePlotData (url, title, xOffset, isLegends, graphNum) {		
	d3.json(url, function(error, data) {
		positionPlot.jsondata = data;

		data.forEach(function(d) {
			d.xval = parseFloat(d.xval);
			d.yval = parseFloat(d.yval);
		});
		
		// Scale the range of the data
		positionPlot.x.domain(d3.extent(data, function(d) { return parseFloat(d.xval); }));
		positionPlot.y.domain(d3.extent(data, function(d) { return parseFloat(d.yval); }));

		// Nest the entries by date
		var dataNest = d3.nest()
			.key(function(d) {return d.date;})
			.entries(data);

		var color = d3.scale.category10();   // set the colour scale

		positionPlot.legendSpace = positionPlot.width/dataNest.length; // spacing for the legend

		// Add the X Axis
		positionPlot.svg.append("g")
			.attr("class", "x axis")
			//.attr("transform", "translate(0," + height + ")")
			.attr("transform", "translate(" + xOffset + "," + positionPlot.height + ")")
			.call(positionPlot.make_x_axis());

		// Graph Label
		positionPlot.svg.append("text")      // text label for the x axis
			.attr("class", "axislabel")
			.attr("x", xOffset + (positionPlot.graphDim.gWidth / 2))
			.attr("y", 0 -(positionPlot.margin.top/2))
			.text(title);
			
		// X axis Label
		positionPlot.svg.append("text")      // text label for the x axis
			.attr("class", "axislabel")
			.attr("x", xOffset + (positionPlot.graphDim.gWidth / 2))
			.attr("y", positionPlot.height + (positionPlot.margin.bottom/2) + 5)
			.text("Horizontal Displacement (meters)");
			
		// Add the Y Axis
		positionPlot.svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + xOffset + ",0)")
			.call(positionPlot.make_y_axis());
		
		// Y axis Label
		positionPlot.svg.append("text")		// text label for the y axis
			.attr("class", "axislabel")
			.attr("transform", "rotate(-90)")
			.attr("y", xOffset -5 - (positionPlot.margin.left / 2))
			.attr("x", 0 - (positionPlot.height / 2))
			.text("Vertical Displacement (meters)");
		
		// Add the Grids
		positionPlot.svg.append("g")
			.attr("class", "grid")
			.attr("transform", "translate(" + xOffset + "," + positionPlot.height + ")")
			.call(positionPlot.make_x_axis()
				.tickSize(-positionPlot.height, 0, 0)
				.tickFormat("")
			);

		positionPlot.svg.append("g")
			.attr("class", "grid")
			.attr("transform", "translate(" + xOffset + ",0)")
			.call(positionPlot.make_y_axis()
				.tickSize(-positionPlot.graphDim.gWidth, 0, 0)
				.tickFormat("")
			);		
		
		// Add hyperlinks to the Node Circles
		var urlBase = "http://www.dewslandslide.com/";
		var urlNodeExt = "gold/node/";	
		
		// Loop through each date / key
		var x = 0;
		dataNest.forEach(function(d,i) { 
			
			positionPlot.svg.selectAll(".dot" + graphNum + "")
					.data(data)
				.enter().append("circle")
					.attr("class", "dot" + graphNum + "")
					//.attr("transform", "translate(" + xOffset + ",0)")
					.attr("r", 5)
					.attr("cx", function(d) { return positionPlot.x(d.xval) + xOffset; })
					.attr("cy", function(d) { return positionPlot.y(d.yval); })
					.style("cursor", "pointer")
					.on('mouseover', positionPlot.tip.show)
					.on('mouseout', positionPlot.tip.hide)
					.on("click", function(d){
				        document.location.href = urlBase + urlNodeExt + curSite + '/' + d.node;
				    });	
		
			positionPlot.svg.append("path")
				.attr("class", "line")
				.attr("transform", "translate(" + xOffset + ",0)")
				.style("stroke", function() { // Add the colours dynamically
					return d.color = color(d.key); })
				.attr("id", 'tag'+d.key.replace(/\s+/g, '')) // assign ID
				.attr("d", positionPlot.yvalline(d.values));
			
			pos_color[x] = color(d.key);
			pos_key[x] = d.key;
			x++;
		});
	});
};	

function showPositionPlotGeneral() {
	
	d3.select("#svg-position").remove();
	pos_target = document.getElementById('posLegend');
	pos_target2 = document.getElementById('position-legends');
	pos_legend_active = 0;
	pos_target.value = "Show Legends";
	pos_target2.style.display = "none";
	pos_target2.style.visibility = "hidden";
	dayIntvl = document.getElementById("formPosition").interval.value;
	
	// Clear the canvas area first
	positionPlot.clearData();
	positionPlot.init_dims();
	// Generate the XY Graph
	//urlXY = "temp/getPosPlot.php?site=" + frm.sitegeneral.value + "&interval=6";
	//urlXY = "/d3graph/getPosPlot.php?site=" + frm.sitegeneral.value + "&interval=" + dayIntvl;
	urlXY = "/test/position/" + curSite + "/" + dayIntvl;
	titleXY = curSite + " XY Column Position";
	generatePlotData(urlXY, titleXY, 0, true, 1);
	
	// Generate the XZ Graph
	//urlXZ = "temp/getPosPlot.php?xz&site=" + frm.sitegeneral.value + "&interval=6";
	//urlXZ = "/d3graph/getPosPlot.php?xz&site=" + frm.sitegeneral.value + "&interval=" + dayIntvl;
	urlXZ = "/test/position/" + curSite + "/" + dayIntvl + "/1";
	titleXZ = curSite + " XZ Column Position";
	generatePlotData(urlXZ, titleXZ, positionPlot.width * 0.6, false, 2);
	
};

function posLegends(frm) {

	pos_target = document.getElementById('posLegend');
	pos_target2 = document.getElementById('position-legends');
	pos_legends = "";
	
	if(pos_legend_active == 0)
	{
		pos_legend_active = 1;
		pos_target.value = "Hide Legends";
		pos_target2.style.display = "block";
		pos_target2.style.visibility = "visible";
		pos_target2.style.position = "absolute";
		pos_target2.style.zIndex = 1;
		pos_target2.style.backgroundColor = "black";
		pos_target2.style.borderStyle = "solid";
		pos_target2.style.borderWidth = "thin";
		pos_target2.style.paddingLeft = "5px";
		pos_target2.style.paddingTop = "5px";
		pos_target2.style.paddingRight = "5px";
		pos_target2.style.left = (pos_target.offsetLeft - pos_target.scrollLeft + pos_target.clientLeft + 120) + 'px';
		pos_target2.style.top = (pos_target.offsetTop - pos_target.scrollTop + pos_target.clientTop - 80) + 'px';
		for(z = 0; z < 5; z++)
		{
		pos_legends += "<strong><span style='color:" + pos_color[z] + ";'>" + pos_key[z] + "</span></strong><br/>";
		}
		pos_target2.innerHTML = pos_legends;
	}
	else
	{
		pos_legend_active = 0;
		pos_target.value = "Show Legends";
		pos_target2.style.display = "none";
		pos_target2.style.visibility = "hidden";
	}
};














