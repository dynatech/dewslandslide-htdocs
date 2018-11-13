
var nodeAlertJSON = 0;
var nodeStatusJSON = 0;
var maxNodesJSON = 0;
var alert_legend_active = 0;

// Set the dimensions of the canvas / graph
var cWidth = 0;
var cHeight = 0;

var margin = 0,
width = 0,
height = 0;

var graphDim = 0;

var graphCount = 0;

// Parse the xval / time
var parseDate = d3.time.format("%b %Y").parse;

var x, y, yOrd;

var yvalline;
var svg;

// Tip that displays node info
var tip = d3.tip()
.attr('class', 'd3-tip')
.offset([-10, 0])
.html(function(d) {
	var alert,status,id_ts,comment,node_alert,flagger_name,ts;
	
	if(d.vel_alert == 0) {
		alert = "<strong>Alerts:</strong> <span style='color:#4A6C6F'> 0 axis alert </span><Br/>";
		ts = "<strong>Date Trigger:</strong> <span style='color:red'>" + d.timestamp + "</span><Br/>";
	}else if(d.disp_alert == 1){
		alert = "<strong>Alerts:</strong> <span style='color:#846075'> 1 axis alert </span><Br/>";
		ts = "<strong>Date Trigger:</strong> <span style='color:red'>" + d.timestamp + "</span><Br/>";
	}else if(d.disp_alert == 2){
		alert = "<strong>Alerts:</strong> <span style='color:#AF5D63'> 2 axis alert </span><Br/>";
		ts = "<strong>Date Trigger:</strong> <span style='color:red'>" + d.timestamp + "</span><Br/>";
	}else {
		alert = "";
		ts = "";
	}
	
	
	if(typeof d.status === 'undefined'){
		status = "";
	}
	else {
		status = "<strong>Status:</strong> <span style='color:red'>" + d.status +"</span><Br/>";
	}
	
	if((d.date_of_identification === "0000-00-00") || (typeof d.date_of_identification === 'undefined')) {
		id_ts = "";
	}
	else {
		id_ts = "<strong>Date Discovered:</strong> <span style='color:red'>" + d.date_of_identification + "</span><Br/>";
	}

	if((d.comment == "NULL") || (typeof d.comment === 'undefined') ) {
		comment = "";
	}
	else {
		comment = "<strong>Comment:</strong> <span style='color:red'>" + d.comment + "</span>";
	}  
	if(typeof d.flagger === 'undefined' ) {
		flagger_name = "";
	}
	else {
		flagger_name = "<strong>Flagger:</strong> <span style='color:red'>" + d.flagger + "</span><Br/>";
	} 
	return id_ts +ts+
	"<strong>Site:</strong> <span style='color:#33cc33'>" + d.site + "</span><Br/>" +
	"<strong>Node ID:</strong> <span style='color:#ff9933'>" + d.node + "</span><Br/>" +
	alert + status + flagger_name +comment;
});

//initialize dimensions
function init_dims() {
	cWidth = document.getElementById('alert-canvas').clientWidth - 10 ;
	cHeight = document.getElementById('alert-canvas').offsetHeight -20;
	
	//var margin = {top: 70, right: 20, bottom: 70, left: 90},
	margin = {top: cHeight * 0.001, right: cWidth * 0.01, bottom: cHeight* 0.50- cWidth , left: cWidth * 0.07};
	width = cWidth - margin.left - margin.right;
	height = cHeight - margin.top - margin.bottom;
	
	graphDim = {gWidth: width , gHeight: cHeight};		
	
	// Set the ranges
	x = d3.scale.linear().range([0, graphDim.gWidth]);
	y = d3.scale.linear().range([graphDim.gHeight, 0]);
	yOrd = d3.scale.ordinal()
	.rangeRoundBands([graphDim.gHeight, 0], 0.1);

	// Define the line
	yvalline = d3.svg.line()	
		//.interpolate("monotone")
		.x(function(d) { return x(d.xval); })
		.y(function(d) { return y(d.yval); });

	// Adds the svg canvas
	svg = d3.select("#alert-canvas").append("svg")
	.attr("id", "svg-alert")
	.attr("width", cWidth + 10)
	.attr("height",  margin.left +margin.right +height+margin.bottom+5 )
	.append("g")
	.attr("transform", 
		"translate(" +  margin.left+ "," + margin.top + ")");

	svg.call(tip);	

}

function make_yOrd_axis() {        
	return d3.svg.axis()
	.scale(yOrd)
	.orient("left")
	.ticks(1);
}		  

function clearData() {
	graphCount = 0;
	svg.selectAll(".dot").remove();
	svg.selectAll(".dot1").remove();
	svg.selectAll(".dot2").remove();
	svg.selectAll(".line").remove();
	svg2.selectAll(".legend").remove(); 
	svg.selectAll(".tick").remove();
	svg.selectAll(".axislabel").remove();
}

var siteMaxNodes = [];
var maxNode;

var tester = [];

function getSiteMaxNodes(xOffset) {
	var data = maxNodesJSON.slice();

	siteMaxNodes = data;

	//add node links to nodes with normal status
	var urlBase = "http://" + window.location.hostname + "/";
	var urlNodeExt = "data_analysis/node/";	
	var start = moment().subtract(7, 'days').format('YYYY-MM-DD'); 
	var end = moment().add(1, 'days').format('YYYY-MM-DD');
	
	maxNode = d3.max(siteMaxNodes, function(d) { return parseFloat(d.nodes); });
	
	// Scale the range of the data
	x.domain([1, d3.max(siteMaxNodes, function(d) { return parseFloat(d.nodes) + 1; })]);
	yOrd.domain(siteMaxNodes.map(function(d) { return d.site; }));
	
	var cellw = (graphDim.gWidth / maxNode) * 0.9;
	var cellh = yOrd.rangeBand(); //9;
	
	for (var i = 0; i < siteMaxNodes.length; i++) {
		for (var j = 1; j <= siteMaxNodes[i].nodes; j++) {
			tester.push(
				{site: siteMaxNodes[i].site, node: j }
				);
		}
	}
	
	svg.selectAll(".cell_default")
	.data(tester)
	.enter().append("rect")
	.attr("class", "cell_default")
	.attr('x', function(d){
		return x(d.node) + xOffset;
	})
	.attr('y', function(d){
		return yOrd(d.site);
	})
	.attr('width', cellw)
	.attr('height', cellh)
	.style("cursor", "pointer")
	.on('mouseover', tip.show)
	.on('mouseout', tip.hide)
	.on("click", function(d){
		document.location.href =urlBase+urlNodeExt+d.site+'/'+d.node+'/'+start+'/'+end;
	});	
	
}

var nodeStatuses = [];
function getNodeStatus(xOffset) {
	var data = nodeStatusJSON.slice();
	var nodeStatuses = [];
	for (var i = 0; i < siteMaxNodes.length; i++) {
		for (var a = 0; a < data.length; a++) {
			if(siteMaxNodes[i].site == data[a].site){
				nodeStatuses.push(data[a])
			}
		}	
	}

		// nodeStatuses = data;
		var cellw = (graphDim.gWidth / maxNode) * 0.4;
		var cellh = yOrd.rangeBand()-4;

		svg.selectAll(".triangle")
		.data(nodeStatuses)
		.enter().append("polygon")
		.attr("class", "triangle")
				.style("stroke", "none")  // colour the line
				.style("fill", function(d){
					if(d.status == "Not OK") {
						return "#EA0037";	//Red
					}
					else if(d.status == "Special Case") {
						return "#0A64A4";
					}
					else if(d.status == "Use with Caution") {
						return "#FFF500";
					}
				})     // remove any fill colour		
				.attr("points", function(d){
					var xStart = x(d.node) + xOffset +1;
					var yStart = yOrd(d.site);
					var xWidth = xStart + cellw * 1;
					var yHeight = yStart + cellh * 1;
					if(yStart == undefined){
						yStart = 0;
					}else{
						yStart = yOrd(d.site);
					}

					if(yHeight== NaN){
						yHeight = 0;
					}else{
						yHeight = yStart + cellh * 1;
					}
					var points = xStart + "," + yStart + "," +
					xWidth + "," + yStart + "," +
					xStart + "," + yHeight + "";
					return points;
				})  // x,y points 
				.on('mouseover', tip.show)
				.on('mouseout', tip.hide);	
	//});
}

var alertdata = [];
function generateAlertPlot(url, title, xOffset, isLegends, graphNum) {
	$.getJSON( "../../temp/data/node_alert_json.json").done(function(json) {
		var start = moment().subtract(7, 'days').format('YYYY-MM-DD'); 
		var end = moment().add(1, 'days').format('YYYY-MM-DD');
		var sample_value =JSON.parse(json);
		var jsondata = [];
		getSiteMaxNodes(xOffset);
		var data =[];
		var delay1 = 1000;
		for (var i = 0; i < sample_value.length; i++) {
			data.push({node:sample_value[i].id,site:sample_value[i].site,timestamp:sample_value[i].timestamp,
				disp_alert:sample_value[i].disp_alert,vel_alert:sample_value[i].vel_alert,col_alert:sample_value[i].col_alert})
		}
		jsondata = data;

		data.forEach(function(d) {
			d.node = parseInt(d.node);
			d.xalert = parseFloat(d.xalert);
			d.yalert = parseFloat(d.yalert);
			d.zalert = parseFloat(d.zalert);
		});

		alertdata = data;

		var horOff = xOffset + ((graphDim.gWidth / maxNode) * 0.9)/2;


		svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + xOffset + ",0)")
		.call(make_yOrd_axis());

		var textMOver = function() {
			var text = d3.select(this);
			text.attr("text-transform", "uppercase" );
		};

		var textMOut = function() {
			var text = d3.select(this);

			text.attr("text-transform", "lowercase" );
		};


		var urlBase = "http://" + window.location.hostname + "/";
		var urlExt = "data_analysis/column/";	
		var urlNodeExt = "data_analysis/node/";		
		var start = moment().subtract(7, 'days').format('YYYY-MM-DD'); 
		var end = moment().add(1, 'days').format('YYYY-MM-DD');

		d3.selectAll("text")
		.filter(function(d){ return typeof(d) == "string"; })
		.style("cursor", "pointer")
		.on('mouseover', textMOver)
		.on('mouseout', textMOut)
		.on("click", function(d){
			document.location.href = urlBase + urlExt + d;
		});


		var cellw = (graphDim.gWidth / maxNode) * 0.9;
		var cellh = yOrd.rangeBand(); 
		svg.selectAll(".cell")
		.data(data)
		.enter().append("rect")
		.attr("class", "cell")
		.attr('x', function(d){
			return x(d.node) + xOffset;
		})
		.attr('y', function(d){
			return yOrd(d.site);
		})
		.attr('fill', function(d){
			var xdata, ydata, zdata, color;
			if(d.vel_alert == 0){
				xdata = 1;
				color = d3.rgb(74, 108, 111);
				return color;
			}else if(d.vel_alert == 1){
				color = d3.rgb(132, 96, 117);
				return color;

			}else if(d.vel_alert == 2){
				color = d3.rgb(175, 93, 99);
				return color;
			}
		})
		.attr('width', cellw)
		.attr('height', cellh)
		.style("cursor", "pointer")
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide)
		.on("click", function(d){
			document.location.href = urlBase+urlNodeExt+d.site+'/'+d.node+'/'+start+'/'+end;
		});	
		getNodeStatus(xOffset);	

	})

}


function showData() {
	generateAlertPlot(nodeAlertJSON, "Accelerometer Movement Alert Map", 0, true, 1);
}

function initAlertPlot() {
	init_dims();
	showData();
}

function alertLegends(frm) {

	var alert_target = document.getElementById('alertLegend');
	var alert_target2 = document.getElementById('alertcanvaslegend');
	
	if(alert_legend_active === 0)
	{
		alert_legend_active = 1;
		alert_target.value = "Hide Legends";
		alert_target2.style.display = "block";
		alert_target2.style.visibility = "visible";
		alert_target2.style.position = "absolute";
		alert_target2.style.zIndex = 1;
		alert_target2.style.backgroundColor = "black";
		alert_target2.style.borderStyle = "solid";
		alert_target2.style.borderWidth = "thin";
		alert_target2.style.paddingLeft = "5px";
		alert_target2.style.paddingTop = "5px";
		alert_target2.style.paddingRight = "5px";
		alert_target2.style.left = (alert_target.offsetLeft - alert_target.scrollLeft + alert_target.clientLeft) + 'px';
		alert_target2.style.top = (alert_target.offsetTop - alert_target.scrollTop + alert_target.clientTop - 110) + 'px';
	}
	else
	{
		alert_legend_active = 0;
		alert_target.value = "Show Legends";
		alert_target2.style.display = "none";
		alert_target2.style.visibility = "hidden";
	}
}










