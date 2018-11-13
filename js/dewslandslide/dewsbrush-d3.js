var brush_from = "", brush_to = "", test="";
	
	function showBrush(frm) {

<!-- Declaration of Slider Variables -->
				
		d3.selectAll("#svg-slider").remove();	
		
	var	slider_margin = {top: 5, right: 0, bottom: 15, left: 0};		
		slider_width = document.getElementById('div_slider').clientWidth;
		slider_width = slider_width - slider_margin.left - slider_margin.right;
		slider_height = document.getElementById('div_slider').clientHeight;
		slider_height = slider_height - slider_margin.top - slider_margin.bottom;
	
	var slider_parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
	
		slider_x = d3.time.scale().range([0, slider_width]),
		slider_y = d3.scale.linear().range([slider_height, 0]);
	
	var slider_area = d3.svg.area()
		.interpolate("basis")
		.x(function(d) { return slider_x(d.date); })
		.y0(slider_height)
		.y1(0);
		
	var slider_xAxis = d3.svg.axis().scale(slider_x).orient("bottom").ticks(2);
		
	var brush = d3.svg.brush()
		.x(slider_x)
		.on("brush", onBrush);	
		
	var slider_svg = d3.select("#div_slider").append("svg")
		.attr("id", "svg-slider")
		.attr("width", slider_width + slider_margin.left + slider_margin.right)
		.attr("height", slider_height + slider_margin.top + slider_margin.bottom);
		
	var slider_context = slider_svg.append("g")
		.attr("class", "context")
		.attr("transform", "translate(0,0)");
	
	var slider_url = "/test/senttotal/" + curSite + "/" + fromDate + "/" + toDate + "/" + dataBase;

<!--Getting the Time Range for Slider -->
	
		d3.json(slider_url, function(error, data) {

			data.forEach(function(d) {
			  d.date = slider_parseDate(d.timestamp);
			  d.nodes = +d.count;
			});

			slider_x.domain(d3.extent(data.map(function(d) { return d.date; })));
			slider_y.domain([0, d3.max(data.map(function(d) { return d.nodes; }))]);

			slider_context.append("path")
				.datum(data)
				.attr("fill", "blue")
				.attr("d", slider_area);
			
			slider_context.append("g")
			  .attr("class", "x axis top")
			  .attr("transform", "translate(0," + slider_height + ")")
			  .style("font-size", "11px")
			  .call(slider_xAxis);
			  
			slider_context.append("g")
			  .attr("class", "x brush")
			  .call(brush)
			  .selectAll("rect")
			  .attr("y", -6)
			  .attr("height", slider_height + 7);
			  
			brush_from = d3.min(slider_x.domain()).toLocaleDateString() + " " + d3.min(slider_x.domain()).toLocaleTimeString();
			brush_to = d3.max(slider_x.domain()).toLocaleDateString() + " " + d3.max(slider_x.domain()).toLocaleTimeString();
			brush_target = document.getElementById("div_slider_timestamp");
			brush_target.innerHTML = "<b>From: " + brush_from + "</b><br/><b>To: " + brush_to + "</b>";
				  
		});
	
	function onBrush(){
	
		sentnode_x.domain(brush.empty() ?  slider_x.domain() : brush.extent());
		sentnode_focusGraph.attr("x", function(d, i) { return sentnode_x(d.date); });
		sentnode_focusGraph.attr("width", 10);
		sentnode_focus.select(".x.axis").call(sentnode_xAxis);
		
		rainfall_x1.domain(brush.empty() ? slider_x.domain() : brush.extent());
		rainfall_x2.domain(brush.empty() ? slider_x.domain() : brush.extent());
		rainfall_svg1.select(".area").attr("d", rainfall_area1);
		rainfall_svg1.select(".x.axis").call(rainfall_xAxis1);
		rainfall_svg2.select(".area2").attr("d", rainfall_area2);
		rainfall_svg2.select(".x.axis").call(rainfall_xAxis2);
		
		if(brush.empty())
		{
		brush_from = d3.min(slider_x.domain()).toLocaleDateString() + " " + d3.min(slider_x.domain()).toLocaleTimeString();
		brush_to = d3.max(slider_x.domain()).toLocaleDateString() + " " + d3.max(slider_x.domain()).toLocaleTimeString();
		brush_target = document.getElementById("div_slider_timestamp");
		brush_target.innerHTML = "<b>From: " + brush_from + "</b><br/><b>To: " + brush_to + "</b>";
		}
		else
		{
		brush_from = d3.min(brush.extent()).toLocaleDateString() + " " + d3.min(brush.extent()).toLocaleTimeString();
		brush_to = d3.max(brush.extent()).toLocaleDateString() + " " + d3.max(brush.extent()).toLocaleTimeString();
		brush_target = document.getElementById("div_slider_timestamp");
		brush_target.innerHTML = "<b>From: " + brush_from + "</b><br/><b>To: " + brush_to + "</b>";
		}
	}
	
}
	

	
	