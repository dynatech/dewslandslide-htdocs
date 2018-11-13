$(document).ready(function(e) {
			//JSON Variable
			var nodeAlertJSON = 0;
			var nodeStatusJSON = 0;
			var maxNodesJSON = 0;

			// Set the dimensions of the canvas / graph
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

			// Tip that displays node info
			var tip = d3.tip()
			  .attr('class', 'd3-tip')
			  .offset([-0, 5])
			  .html(function(d) {
				var alert,status,id_ts,comment;
				
				if((parseFloat(d.xalert) > 0) || (parseFloat(d.yalert) > 0) || (parseFloat(d.zalert) > 0)) {
					alert = "<strong>Alerts:</strong> <span style='color:red'>" + Number((d.xalert).toFixed(3)) 
							+ ", " + Number((d.yalert).toFixed(3)) 
							+ ", " + Number((d.zalert).toFixed(3)) +"</span><Br/>";
				}
				else {
					alert = "";
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
			  
				if((d.comment == "NULL") || (typeof d.comment === 'undefined')) {
					comment = "";
				}
				else {
					comment = "<strong>Comment:</strong> <span style='color:red'>" + dAlert + "</span>";
				}  
			  
			    return id_ts 
					+ "<strong>Site:</strong> <span style='color:red'>" + d.site + "</span><Br/>"
					+ "<strong>Node ID:</strong> <span style='color:red'>" + d.node + "</span><Br/>"
					+ alert + status + comment
					;
			  });

			//initialize dimensions
			function init_dims() {
				cWidth = document.getElementById('mini-alert-canvas').clientWidth * .95;
				//cHeight = document.getElementById('minialertcanvas').offsetHeight;
				cHeight = document.getElementById('mini-alert-canvas').clientHeight * 1.5;
				
				//margin = {top: cHeight * 0.10, right: cWidth * 0.015, bottom: cHeight * 0.10, left: cWidth * 0.065};
				margin = {top: 0, right: 0, bottom: 0, left: 0};
				width = cWidth - margin.left - margin.right;
				height = cHeight - margin.top - margin.bottom;
				
				graphDim = {gWidth: width, gHeight: height};	
				
				// Set the ranges
				x = d3.scale.linear().range([0, graphDim.gWidth]);
				y = d3.scale.linear().range([graphDim.gHeight, 0]);
				yOrd = d3.scale.ordinal()
								.rangeRoundBands([graphDim.gHeight, 0], .1);
								
				// Define the line
				yvalline = d3.svg.line()	
					//.interpolate("monotone")
				    .x(function(d) { return x(d.xval); })
				    .y(function(d) { return y(d.yval); });
				    
				// Adds the svg canvas
				svg = d3.select("#mini-alert-canvas")
					.append("svg")
			        .attr("id", "svg-alertmini") 	
				        .attr("width", width + margin.left + margin.right)
				        .attr("height", height + margin.top + margin.bottom)
				    .append("g")
				        .attr("transform", 
				              "translate(" + margin.left + "," + margin.top + ")");
				
				svg.call(tip);	
			}
			            
			// Define the axes
			function make_x_axis() {        
			    return d3.svg.axis()
			        .scale(x)
			        .orient("bottom")
			        .ticks(40);
			}

			function make_x_axis2(tick) {        
			    return d3.svg.axis()
			        .scale(x)
			        .orient("bottom")
			        .ticks(tick);
			}

			function make_y_axis() {        
			    return d3.svg.axis()
			        .scale(y)
			        .orient("right")
			        .ticks(5);
			}

			function make_yOrd_axis() {        
			    return d3.svg.axis()
			        .scale(yOrd)
			        .orient("right")
			        .ticks(1);
			}		  
						
			function clearData() {
				graphCount = 0;
				svg.selectAll(".dot").remove();
				svg.selectAll(".dot1").remove();
				svg.selectAll(".dot2").remove();
				svg.selectAll(".line").remove();
				svg.selectAll(".legend").remove();
				svg.selectAll(".tick").remove();
				svg.selectAll(".axislabel").remove();
			}

			var siteMaxNodes = [];
			var maxNode;
			var tester = [];

			function getSiteMaxNodes(xOffset) {
				//url = "../temp/getSiteMaxNodes.php";
				//maxNodesJSON = <?php echo $siteMaxNodes; ?>;
				
				var delay = 500;
				var data = maxNodesJSON;
				
				siteMaxNodes = data;
				
				//add node links to nodes with normal status
				var urlBase = "http://" + window.location.hostname + "/";
				var urlNodeExt = "gold/node/";		
				
				maxNode = d3.max(data, function(d) { return parseFloat(d.maxall); });
				
				// Scale the range of the data
				x.domain([1, d3.max(data, function(d) { return maxNode + 1; })]);
				yOrd.domain(data.map(function(d) { return d.site; }));
				
				var cellw = (graphDim.gWidth / maxNode) * 0.9;
				var cellh = yOrd.rangeBand(); //9;
				
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
				        document.location.href = urlBase + urlNodeExt + d.site + '/' + d.node;
				    });	
			}

			var nodeStatuses = [];
			function getNodeStatus(xOffset) {
				//nodeStatusJSON = <?php echo $nodeStatus; ?>;
				
					var data = nodeStatusJSON;
					
					nodeStatuses = data;

					var cellw = (graphDim.gWidth / maxNode) * 0.9;
					var cellh = yOrd.rangeBand();
						
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
								var xStart = x(d.node) + xOffset;
								var yStart = yOrd(d.site);
								var xWidth = xStart + cellw * 0.6;
								var yHeight = yStart + cellh * 0.6;
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
				// Get the data
				var jsondata = [];
				getSiteMaxNodes(xOffset);
				
				var delay1 = 1000;//1 second

						var data = url;
						
						jsondata = data;
				
						data.forEach(function(d) {
							d.node = parseInt(d.node);
							d.xalert = parseFloat(d.xalert);
							d.yalert = parseFloat(d.yalert);
							d.zalert = parseFloat(d.zalert);
						});
						
						alertdata = data;
						
						var horOff = xOffset + ((graphDim.gWidth / maxNode) * 0.9)/2;
				
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
							
						var cellw = (graphDim.gWidth / maxNode) * 0.9;
						var cellh = yOrd.rangeBand(); //9;
				
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
									var xdata, ydata, zdata;
								
									if((d.xalert > 0) || (d.yalert > 0) || (d.zalert > 0)) {
										if(d.xalert > 0)
											xdata = 1;
										else
											xdata = 0;
											
										if(d.yalert > 0)
											ydata = 1;
										else
											ydata = 0;
											
										if(d.zalert > 0)
											zdata = 1;
										else
											zdata = 0;
									
										var r = 85 * (xdata + ydata + zdata);
										var b = 255 - (xdata + ydata + zdata) * 80;					
										return color = d3.rgb(r, 174, b);
									}
									else {
										return color = d3.rgb(3, 137, 156);
									}
								})
								.attr('width', cellw)
								.attr('height', cellh)
								.style("cursor", "pointer")
								.on('mouseover', tip.show)
								.on('mouseout', tip.hide)
								.on("click", function(d){
							        document.location.href = urlBase + urlNodeExt + d.site + '/' + d.node;
							    });	
				
						// Add the Legend
						if(isLegends){
							for (i = 0; i <= 3; i++) { 
								var desc;
								
								if (i <= 1) {
									desc = i + " axis alert";
								}
								else {
									desc = i + " axes alerts";
								}
					
								svg.append("rect")
									.attr("class", "cell")
									.attr("x", i*(labelWidth))
									.attr("y", graphDim.gHeight + cellh * 0.50)
									.attr("transform", "translate(" + xOffset + ",0)")
									.attr('width', cellw)
									.attr('height', cellh)
									.style("fill", function() { // Add the colours dynamically
										if(i > 0) {
											var r = 85 * i;
											var b = 255 - i * 80;							
											return color = d3.rgb(r, 174, b);
										}
										else {
											return color = d3.rgb(3, 137, 156);
										}
									});
					
								svg.append("text")
									.attr("class", "legend")    // style the legend
									.attr("x", i*(labelWidth) + cellw * 1.5)
									.attr("y", graphDim.gHeight + cellh * 1.25)
									.attr("transform", "translate(" + xOffset + ",0)")
									.style("fill", function() { // Add the colours dynamically
										if(i > 0) {
											var r = 85 * i;
											var b = 255 - i * 80;							
											return color = d3.rgb(r, 174, b);
										}
										else {
											return color = d3.rgb(3, 137, 156);
										}
									})
									.text(desc); 
							}
							
							//Status Triangles
							var jctr = 0;
							for (i = jctr; i <= jctr + 2; i++) { 
								var desc, color;
								
								if (i == jctr) {
									desc = "Use with Caution";	//Yellow
									color = "#FFF500";
								}
								else if (i == jctr + 1) {
									desc = "Not OK";	//Red
									color = "#EA0037";
								}
								else if (i == jctr + 2) {
									desc = "Special Case";	//Blue
									color = "#0A64A4";
								}
								
								svg.append("polygon")
									.attr("class", "triangle")
									.style("stroke", "none")  // colour the line
									.style("fill", color)
									.attr("transform", "translate(" + xOffset + ",0)")
									.attr("points", function() {
										var xStart = i*(labelWidth)*1.5;
										var yStart = graphDim.gHeight + cellh * 1.5;
										var xWidth = xStart + cellw * 0.6;
										var yHeight = yStart + cellh * 0.6;
										var points = xStart + "," + yStart + "," +
													xWidth + "," + yStart + "," +
													xStart + "," + yHeight + "";
										return points;
									});
									
								svg.append("text")
									.attr("class", "legend")    // style the legend
									.attr("x", i*(labelWidth)*1.5 + cellw * 1.5)  // space legend
									.attr("y", graphDim.gHeight + cellh * 2.5)
									.attr("transform", "translate(" + xOffset + ",0)")
									.style("fill", color)
									.text(desc); 					
							}
						}				
				
				//Draw the node status symbol
				getNodeStatus(xOffset);	

			}
					
			function showData() {
				$.get("../sensor_overview_page/getAlertNode").done(function(data){
		var nodeAlertJSON = JSON.parse(data);
generateAlertPlot(nodeAlertJSON, "Accelerometer Movement Alert Map", 0, false, 1);
	})
				
				
			}

			function initAlertPlot() {
				init_dims();
				showData();
			}

			//window.onload = initPosPlot();

});







