function createCORSRequest(method, url) {
		var xhr = new XMLHttpRequest();
		if ("withCredentials" in xhr) {
			// XHR for Chrome/Firefox/Opera/Safari.
			xhr.open(method, url, true);
		} else if (typeof XDomainRequest != "undefined") {
			// XDomainRequest for IE.
			xhr = new XDomainRequest();
			xhr.open(method, url);
		} else {
			// CORS not supported.
			xhr = null;
		}
		return xhr;
	}

	// Helper method to parse the title tag from the response.
	function getTitle(text) {
		return text.match('<title>(.*)?</title>')[1];
	}

	// Make the actual CORS request.
	function makeCorsRequest() {
		// All HTML5 Rocks properties support CORS.
		//var url = 'http://updates.html5rocks.com';
		//var url = 'http://noah.dost.gov.ph/';
		var url = 'http://senslopetest.comlu.com/';

		var xhr = createCORSRequest('GET', url);
		if (!xhr) {
			alert('CORS not supported');
			return;
		}

		// Response handlers.
		xhr.onload = function() {
			var text = xhr.responseText;
			var title = getTitle(text);
			alert('Response from CORS request to ' + url + ': ' + title);
		};

		xhr.onerror = function() {
			alert('Woops, there was an error making the request.');
		};

		xhr.send();
	}
	

    var xmlhttp;
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else { // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }





var comm_opacity1 = 0,
	comm_opacity2 = 0,
	comm_opacity3 = 0,
	comm_opacity1_s,
	comm_opacity2_s,
	comm_opacity3_s,
	comm_legendactive = 0,
	comm_active = 0,
	comm_left = 0,
	comm_top = 0;

function showLegends(frm) 
{
	if (comm_legendactive == 1) 
	{
		comm_target3 = document.getElementById('show');
		comm_target4 = document.getElementById('legends');
		
		if (comm_active == 0)
		{
			comm_target3.value = "Hide Legends";
			comm_target4.style.visibility = "visible";
			comm_target4.style.display = "block";
			comm_target4.style.position = "absolute";
			comm_target4.style.width = comm_target4.clientWidth;
			comm_target4.style.zIndex = 1;
			comm_target4.style.backgroundColor = "black";
			comm_target4.style.borderStyle = "solid";
			comm_target4.style.borderWidth = "thin";
			comm_target4.style.left = (comm_target3.offsetLeft - comm_target3.scrollLeft + comm_target3.clientLeft + 115) + 'px';
			comm_target4.style.top = (comm_target3.offsetTop - comm_target3.scrollTop + comm_target3.clientTop - 25) + 'px';
			comm_active = 1;
		} else {

			comm_target3.value = "Show Legends";
			comm_target4.style.visibility = "hidden";
			comm_target4.style.display = "none";
			comm_active = 0;
		}
	} else {

		alert("Create a bar chart first!");
	}
}

	var g = 0;
	var isVisible = [true, true, true, true];
	var opts = {
		lines: 11, // The number of lines to draw
		length: 6, // The length of each line
		width: 3, // The line thickness
		radius: 8, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		color: '#000', // #rgb or #rrggbb or array of colors
		speed: 1.1, // Rounds per second
		trail: 58, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: '50%', // Top position relative to parent
		left: '50%' // Left position relative to parent
	};
    
var comm_opts = {
	lines: 11, // The number of lines to draw
	length: 6, // The length of each line
	width: 3, // The line thickness
	radius: 8, // The radius of the inner circle
	corners: 1, // Corner roundness (0..1)
	rotate: 0, // The rotation offset
	direction: 1, // 1: clockwise, -1: counterclockwise
	color: '#000', // #rgb or #rrggbb or array of colors
	speed: 1.1, // Rounds per second
	trail: 58, // Afterglow percentage
	shadow: false, // Whether to render a shadow
	hwaccel: false, // Whether to use hardware commeration
	className: 'spinner', // The CSS class to assign to the spinner
	zIndex: 2e9, // The z-index (defaults to 2000000000)
	top: '50%', // Top position relative to parent
	left: '50%' // Left position relative to parent
};
	
var comm_tip = d3.tip()
  .attr('id', 'commtip')
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .direction('n')
  .html( function(d)
  	{
  		var comm_tooltip = "<strong>Node Number:</strong><span style='color:red'>" + d.node + "</span><br/>";

		if (d.y == d.week) {
			comm_tooltip += "<strong>Last 7 Days:</strong><span style='color:red'>" + d.week + "</span>"; 
		}	
		else if (d.y == d.month) {
			comm_tooltip += "<strong>Last 30 Days:</strong><span style='color:red'>" + d.month + "</span>"; 
		}
		else if (d.y == d.bimonth) {
			comm_tooltip += "<strong>Last 60 Days:</strong><span style='color:red'>" + d.bimonth + "</span>"; 
		}
		
		return comm_tooltip;
	}
);
	
function showCommHealthPlotGeneral(curSite,div_ID)
{
	comm_opacity1 = 0,
	comm_opacity2 = 0,
	comm_opacity3 = 0;
	comm_target3 = document.getElementById('show');
	comm_target3.value = "Show Legends";
	comm_legendactive = 0;
	comm_active = 0;
	comm_target5 = document.getElementById('legends');
	comm_target5.style.visibility = "hidden";
	
	d3.selectAll("#svg-commhealth").remove();
		 
	var comm_bars = 3;
		
	var comm_url = "/test/commhealth/" + curSite ;
		//console.log(comm_url);
	
		comm_cWidth = document.getElementById(div_ID).clientWidth-50;
		comm_cHeight = document.getElementById(div_ID).clientHeight-50;

	var comm_margin = {top: comm_cHeight * 0.001, right: comm_cWidth * 0.005, bottom: comm_cWidth * 0.05, left: comm_cHeight * 0.125},
		comm_width = comm_cWidth - comm_margin.left - comm_margin.right,
		comm_height = comm_cHeight - comm_margin.top - comm_margin.bottom;

	var comm_svg = d3.select("#"+div_ID).append("svg")
			.attr("id", "svg-commhealth")
			.attr("width", comm_width + comm_margin.left + comm_margin.right)
			.attr("height", comm_height + comm_margin.top + comm_margin.bottom)
			.append("g")
			.attr("transform", "translate(" + comm_margin.left + "," + comm_margin.top + ")");
				
		comm_svg.call(comm_tip);
		
	d3.json(comm_url, function (error, data){
	
	<!-- Bar Chart Formation -->			
		
		var comm_headers = ["week", "month", "bimonth"];
		var comm_headers2 = ["Last 7 days", "Last 30 days", "Last 60 days"];
		
		var comm_layers = d3.layout.stack()(comm_headers.map(function(days) {
			return data.map(function(d) {
			  return {x: d.node, bimonth: d.bimonth, month: d.month, week: d.week, node: d.node, y: +d[days] };
			});
		}));
		//console.log(comm_layers);
					
		var comm_yGroupMax = d3.max(comm_layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); });

		var comm_xScale = d3.scale.ordinal()
			.domain(comm_layers[0].map(function(d) { return d.x; }))
			.rangeRoundBands([25, comm_width], .08);

		var comm_y = d3.scale.linear()
			.domain([0, comm_yGroupMax])
			.range([comm_height, 0]);
			
		var comm_color = d3.scale.ordinal()
			.range(["red", "blue", "green"]);
	  
		var comm_xAxis = d3.svg.axis()
			.scale(comm_xScale)
			.tickSize(0)
			.tickPadding(6)
			.orient("bottom");

		var comm_yAxis = d3.svg.axis()
			.scale(comm_y)
			.orient("left")
			.ticks(Math.max(comm_height/100, 2));

		var comm_layer = comm_svg.selectAll(".layer")
			.data(comm_layers)
			.enter().append("g")
			.attr("class", "layer")
			.attr("fill", function(d, i) { return comm_color(i); });

		var comm_rect = comm_layer.selectAll("rect")
			.data(function(d) { return d; })
			.enter().append("rect")
			.attr("x", function(d, i, j) { return comm_xScale(d.x) + comm_xScale.rangeBand() / comm_bars * j; })
			.attr("width", comm_xScale.rangeBand() / comm_bars)
			.attr("y", function(d) { return comm_y(d.y); })
			.attr("height", function(d) { return comm_height - comm_y(d.y); })
			.attr("id", function(d){
				if (d.y == d.week) return "week";
				else if (d.y == d.month) return "month"; 
				else if (d.y == d.bimonth) return "bimonth"; 
			})
			.attr("fill", function(d){
				if (d.y == d.week) return "red";
				else if (d.y == d.month) return "green"; 
				else if (d.y == d.bimonth) return "blue"; 
			})
			// .on('mouseover', comm_tip.show)
			// .on('mouseout', comm_tip.hide)
			.on("mouseover", function (d) {
				comm_tip.show(d)
				d3.select(this)
					.style("opacity", 0.5)
					.attr("fill", "orange");
			})
			.on("mouseout", function(d) {
				comm_tip.hide(d)
			   	d3.select(this)
			   		.transition()
			   		.duration(250)
			   		.style("opacity", 1)
					.attr("fill", function (d) {
						if (d.y == d.week) return "red";
						else if (d.y == d.month) return "green"; 
						else if (d.y == d.bimonth) return "blue"; 
					});
		   	});


<!-- Axes -->
		
			comm_svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + comm_height + ")")
				.style("font-size", "12px")
				.call(comm_xAxis)
				.selectAll("text").style("text-anchor", "end")
				.attr("dx", "-.8em")
				.attr("dy", ".15em")
				.attr("transform", function(d) {
					  return "rotate(-45)"});
	
			comm_svg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(20,0)")
				.style("font-size", "14px")
				.call(comm_yAxis)
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr({"x": -150, "y": -70})
				.attr("dy", ".75em")
				.style("text-anchor", "middle")
				.style("font-size", "16px")
				.text("Communication Health Ratio");

			comm_svg.append("text")      // text label for the x axis
				.attr("transform", "translate(" + (comm_width / 2) + " ," + (comm_height + comm_margin.bottom) + ")")
				.style("text-anchor", "middle")
				.style("font-size", "11px")
				.text("Node Number");
			
				  	
					comm_legendactive = 1;
		
	});
	//comm_spinner.stop();
}

	function barTransition(color){
		
		if (color == "red" && comm_opacity2 == 0){
			d3.selectAll("#week").transition().style("opacity", comm_opacity2);
			d3.selectAll("#week").on("mouseover", comm_tip.hide);
			comm_opacity2s = comm_opacity2;
			comm_opacity2 = comm_opacity2s ? 0 : 1;
		}
		
		else if (color == "red" && comm_opacity2 == 1){
			d3.selectAll("#week").transition().duration(500).style("opacity", comm_opacity2);
			d3.selectAll("#week").on("mouseover", comm_tip.show);
			comm_opacity2s = comm_opacity2;
			comm_opacity2 = comm_opacity2s ? 0 : 1;
		}
		
		if (color == "blue" && comm_opacity3 == 0){
			d3.selectAll("#month").transition().duration(500).style("opacity", comm_opacity3);
			d3.selectAll("#month").on("mouseover", comm_tip.hide);
			comm_opacity3s = comm_opacity3;
			comm_opacity3 = comm_opacity3s ? 0 : 1;
		}
		
		else if (color == "blue" && comm_opacity3 == 1){
			d3.selectAll("#month").transition().duration(500).style("opacity", comm_opacity3);
			d3.selectAll("#month").on("mouseover", comm_tip.show);
			comm_opacity3s = comm_opacity3;
			comm_opacity3 = comm_opacity3s ? 0 : 1;
		}

		if (color == "green" && comm_opacity1 == 0){
			d3.selectAll("#bimonth").transition().duration(500).style("opacity", comm_opacity1);
			d3.selectAll("#bimonth").on("mouseover", comm_tip.hide);
			comm_opacity1s = comm_opacity1;
			comm_opacity1 = comm_opacity1s ? 0 : 1;
		}
		
		else if (color == "green" && comm_opacity1 == 1){
			d3.selectAll("#bimonth").transition().duration(500).style("opacity", comm_opacity1);
			d3.selectAll("#bimonth").on("mouseover", comm_tip.show);
			comm_opacity1s = comm_opacity1;
			comm_opacity1 = comm_opacity1s ? 0 : 1;
		}
}


