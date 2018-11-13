	var sentnode_current;

	var sentnode_opts = {
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
		
	function showSentNodeTotalGeneral() {
		
		sentnode_current = document.getElementById("sentnode_timestamp");
		sentnode_current.innerHTML = "<b>Data Sent: </b>";
				
		d3.selectAll("#svg-sitehealth").remove();
		
	var sentnode_target = document.getElementById('sent-node-canvas');
	var sentnode_spinner = new Spinner(sentnode_opts).spin();
        sentnode_target.appendChild(sentnode_spinner.el);
			 
	var sentnode_cWidth = document.getElementById('sent-node-canvas').clientWidth;
		sentnode_cHeight = document.getElementById('sent-node-canvas').clientHeight;
	var sentnode_margin = {top: sentnode_cHeight * 0.01, right: sentnode_cWidth * 0.005, bottom: sentnode_cHeight * 0.06, left: sentnode_cWidth * 0.095};
		sentnode_width = sentnode_cWidth - sentnode_margin.left - sentnode_margin.right;
		sentnode_height = sentnode_cHeight - sentnode_margin.top - sentnode_margin.bottom;

	var sentnode_parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
	var sentnode_formatDate = d3.time.format("%Y-%m-%d %H:%M:%S");
	var sentnode_bisectDate = d3.bisector(function(d) { return d.date; }).left;
	
		sentnode_x = d3.time.scale().range([0, sentnode_width]);
		sentnode_y = d3.scale.linear().range([sentnode_height, 0]);
	
		sentnode_xAxis = d3.svg.axis().scale(sentnode_x).orient("bottom").ticks(4);
	var	sentnode_yAxis = d3.svg.axis().scale(sentnode_y).orient("left").ticks(4);
		
	var sentnode_svg = d3.select("#sent-node-canvas").append("svg")
			.attr("id", "svg-sitehealth")
			.attr("width", sentnode_width + sentnode_margin.left + sentnode_margin.right)
			.attr("height", sentnode_height + sentnode_margin.top + sentnode_margin.bottom);
		
		sentnode_svg.append("defs").append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("width", sentnode_width)
			.attr("height", sentnode_height);
	
		sentnode_focus = sentnode_svg.append("g")
			.attr("class", "focus")
			.attr("transform", "translate(" + sentnode_margin.left + "," + sentnode_margin.top + ")");
		
	var sentnode_barsGroup = sentnode_focus.append("g")
			.attr('clip-path', 'url(#clip)');
	
	var sentnode_tool = sentnode_svg.append("g")                                
			.style("display", "none");   
		
	var sentnode_url = "/test/senttotal/" + curSite + "/" + fromDate + "/" + toDate + "/" + dataBase;
	
		d3.json(sentnode_url, function(error, data) {

			//++PANB: Don't draw anything if there is no data
			if(!data) {
				sentnode_spinner.stop();
				return;
			}	

			data.forEach(function(d) {
				d.date = sentnode_parseDate(d.timestamp);
				d.nodes = +d.count;
			});
		
			sentnode_x.domain(d3.extent(data.map(function(d) { return d.date; })));
			sentnode_y.domain([0, d3.max(data.map(function(d) { return d.nodes; }))]);

			sentnode_tool.append("circle")                                 
				.attr("class", "y")                              
				.style("fill", "red")                          
				.style("stroke", "red")                         
				.attr("r", 3);    
		
			sentnode_focus.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + sentnode_height + ")")
				.style("font-size", "14px")
				.call(sentnode_xAxis);

			sentnode_focus.append("g")
				.attr("class", "y axis")
				.style("font-size", "14px")
				.call(sentnode_yAxis);
		
			sentnode_focusGraph = sentnode_barsGroup.selectAll("rect")
				.data(data)
				.enter().append("rect")
				.attr("fill", "steelblue")
				.attr("x", function(d, i) { return sentnode_x(d.date); })
				.attr("y", function(d) { return sentnode_y(d.nodes); })
				.attr("width", 10)
				.attr("height", function(d) { return sentnode_y(0) - sentnode_y(d.nodes); });

			sentnode_focus.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", -40)
				.attr("x",0 - (sentnode_height / 2))
				.attr("dy", "1em")
				.style("text-anchor", "middle")
				.style("font-size", "15px")
				.text("No. of Node Data Sent");											
		
			sentnode_focus.append("rect")
				.attr("width", sentnode_width)                              
				.attr("height", sentnode_height)                           
				.style("fill", "none")                             
				.style("pointer-events", "all") 
				.on("mouseover", function() { sentnode_tool.style("display", null); })
				.on("mouseout", sentnode_mouseout)
				.on("mousemove", sentnode_mousemove); 
			  
			function sentnode_mousemove() {      						                           
				var x0 = sentnode_x.invert(d3.mouse(this)[0]);              
					i = sentnode_bisectDate(data, x0, 1),                   
					d0 = data[i - 1],                              
					d1 = data[i],                                  
					d = x0 - d0.date > d1.date - x0 ? d1 : d0;     

					sentnode_tool.select("circle.y")                         
						.attr("transform",                           
							  "translate(" + (sentnode_x(d.date) + sentnode_margin.left + sentnode_margin.right)  + "," +         
											 sentnode_y((d.nodes) - 0.25) + ")");      
										 
					sentnode_current = document.getElementById("sentnode_timestamp");
					sentnode_current.innerHTML = "<b>Data Sent: </b>" + d.nodes + "<b> Timestamp: </b>" + sentnode_formatDate(d.date);
			}

			function sentnode_mouseout() {
					sentnode_tool.style("display", "none");
					sentnode_current = document.getElementById("sentnode_timestamp");
					sentnode_current.innerHTML = "<b>Data Sent: </b>";
			}
			  
	});

	sentnode_spinner.stop();
	
}
	
	function change(el) {
			if(g != 0)
				g.setVisibility(parseInt(el.id), el.checked);
			
			isVisible[parseInt(el.id)] = el.checked;
		}