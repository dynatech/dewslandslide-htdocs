var nodeAlertJSON = 0;
var nodeStatusJSON = 0;
var maxNodesJSON = 0;
var alert_legend_active = 0;

var gReportData = 0;
gReportData.site = 0;
gReportData.node = 0;

function callModal() {
	$('#exampleModal').modal('show'); 
}

$(function () { $('#exampleModal').on('show.bs.modal', function () {
	var modal = $(this);

	modal.find('.modal-title').text('Node Status Report for ' + gReportData.site + ' ' + gReportData.node);
	modal.find('#site-column-name').val(gReportData.site);
	modal.find('#node-id').val(gReportData.node);
	modal.find('.input-group.date').datepicker({
		clearBtn: true,
		autoclose: true,
		todayHighlight: true
	});  
	modal.find('#comment-text').val('Testing this wonderful function called modals');
});
});


var cWidth = 0;
var cHeight = 0;

var margin = 0,
width = 0,
height = 0;

var graphDim = 0;

var labelHeight = 16;
var labelWidth = 130;

var graphCount = 0;

// Parse the xval / time
var parseDate = d3.time.format("%b %Y").parse;

var x, y, yOrd;

var yvalline;
var svg;

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




function init_dims() {
	cWidth = document.getElementById('page-header').clientWidth;
	cHeight = document.getElementById('alert-canvas').clientHeight;
	
	margin = {top: cHeight * 0.01 - 5, right: cWidth * 0, bottom: cHeight * 0.01 - 10, left: cWidth * 0.065};
	width = cWidth - margin.left - margin.right - 500;
	height = cHeight - margin.top - margin.bottom + 650;
	
	graphDim = {gWidth: width * 0.95, gHeight: height* 0.85};	

	x = d3.scale.linear().range([0, graphDim.gWidth*2]);
	y = d3.scale.linear().range([graphDim.gHeight, 0]);
	yOrd = d3.scale.ordinal()
	.rangeRoundBands([graphDim.gHeight*1.5, 3], .1);


	yvalline = d3.svg.line()	

	.x(function(d) { return x(d.xval); })
	.y(function(d) { return y(d.yval); });


	svg = d3.select("#alert-canvas").append("svg")
	.attr("id", "svg-alert")
	.attr("width", cWidth )
	.attr("height", height + margin.top + margin.bottom +500)
	.append("g")
	.attr("transform", 
		"translate(" + margin.left + "," + margin.top + ")");

	svg.call(tip);	


}

function make_yOrd_axis() {        
	return d3.svg.axis()
	.scale(yOrd)
	.orient("left")
	.ticks(1);
}		  


var siteMaxNodes = [];
var maxNode;

var tester = [];

function getSiteMaxNodes(xOffset) {
	var data = maxNodesJSON.slice();
	
	siteMaxNodes = data;
	
	var urlBase = "http://www.dewslandslide.com/";
	var urlNodeExt = "gold/node/";	
	
	maxNode = d3.max(siteMaxNodes, function(d) { return parseFloat(d.nodes); });
	
	x.domain([1, d3.max(siteMaxNodes, function(d) { return parseFloat(d.nodes) + 1; })]);
	yOrd.domain(siteMaxNodes.map(function(d) { return d.site; }));
	
	var cellw = (graphDim.gWidth / maxNode) * 1.5;
	var cellh = yOrd.rangeBand(); 
	
	for (i = 0; i < siteMaxNodes.length; i++) {
		
		for (j = 1; j <= siteMaxNodes[i].nodes; j++) {
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
		return x(d.node) ;
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
		gReportData = d;
		callModal();
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
	var cellw = (graphDim.gWidth / maxNode) * 1;
	var cellh = yOrd.rangeBand()-5;
	svg.selectAll(".triangle")
	.data(nodeStatuses)
	.enter().append("polygon")
	.attr("class", "triangle")
	.style("stroke", "none")  
	.style("fill", function(d){
		if(d.status == "Not OK") {
			return "#EA0037";
		}
		else if(d.status == "Special Case") {
			return "#0A64A4";
		}
		else if(d.status == "Use with Caution") {
			return "#FFF500";
		}
	})     	
	.attr("points", function(d){
		var xStart = x(d.node) + xOffset;
		var yStart = yOrd(d.site);
		var xWidth = xStart + cellw * 0.6;
		var yHeight = yStart + cellh * 0.6;
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
	})
	.on('mouseover', tip.show)
	.on('mouseout', tip.hide);	
}

var alertdata = [];
function generateAlertPlot(url, title, xOffset, isLegends, graphNum) {
	$.getJSON( "../../temp/data/node_alert_json.json").done(function(json) {
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

		var urlBase = "http://www.dewslandslide.com/";
		var urlExt = "gold/site/";	
		var urlNodeExt = "gold/node/";		

		d3.selectAll("text")
		.filter(function(d){ return typeof(d) == "string"; })
		.style("cursor", "pointer")
		.on('mouseover', textMOver)
		.on('mouseout', textMOut)
		.on("click", function(d){
			document.location.href = urlBase + urlExt + d;
		});

		var cellw = (graphDim.gWidth / maxNode) * 1.5;
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

			gReportData = d;
			callModal();
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

	alert_target = document.getElementById('alertLegend');
	alert_target2 = document.getElementById('alertcanvaslegend');

	if(alert_legend_active == 0)
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
		alert_target2.style.paddingTop = "10px";
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
};

