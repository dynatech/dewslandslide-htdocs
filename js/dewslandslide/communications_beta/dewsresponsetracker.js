

$(document).ready(function(e) {

	$('#from-date').datetimepicker({
		format: 'YYYY-MM-DD'
	});

	$('#to-date').datetimepicker({
		format: 'YYYY-MM-DD'
	});

	$('#confirm-filter-btn').click(function(){
		var filter_data = {}

		filter_data['category'] = $('#category-selection').val()

		if ($("#category-selection").val() != "allsites" && $("#filter-key").val()){
			filter_data['filterKey'] = $('#filter-key').val();

		}else if ($("#category-selection").val() == "allsites"){
			filter_data['filterKey'] = "";

		}else{
			alert('Invalid Request, Please recheck inputs');
		}
		
		if (dateChecker()) {
			data = dateChecker() 
		}


		data = $.extend(data, filter_data);

		if (Object.keys(data).length != 3){

			var filter_by = 'site_name'
			
			if (data['category'] == "site"){
				data['site_name'] = $('#filter-key').val()
				filter_by = 'sent_by'

			}else if(data['category'] == "person"){
				var name = $('#filter-key').val().split(",")
				data['lastname'] = name[0]
				data['firstname'] = name[1]
			}

			processgraph(data,filter_by)
		}
		
	});

	$('#category-selection').change(function() {
		$("#confirm-filter-btn").prop('disabled', false);
		if ($( this ).val() == "allsites"){
			$("#filter-key").prop('disabled', true);
		}else{
			$("#filter-key").prop('disabled', false);
			$.get( "../responsetracker/get"+$('#category-selection').val(), function( data ) {
				var dataFetched = {};
				dataFetched = JSON.parse(data);
				if (dataFetched.type == "person") {
					datalistPredictionPerson(dataFetched.data);
				} else if (dataFetched.type == "site") {
					datalistPredictionSite(dataFetched.data);
				} else {
					console.log('Invalid Request');
				}
			});
		}
	});


	function datalistPredictionPerson(data) {
		var recon_data = [];
		$('#filter-key').val("");
		for (var counter=0;counter < data.length;counter++){
			var constructedFullname = data[counter].lastname+','+ data[counter].firstname
			+','+ data[counter].number;
			recon_data.push(constructedFullname);
		}

		$("#filter-key").autocomplete({
			source: recon_data
		});
	}


	function datalistPredictionSite(data) {
		$('#filter-key').val("");
		$("#filter-key").autocomplete({
			source: data
		});
	}

	function dateChecker(){
		var data = {}
		if ($('#from-date').val() != "" && $('#to-date').val() != ""){
			var from_period = $('#from-date').val();
			var to_period = $('#to-date').val();
			if (from_period < to_period){
				data['period'] = from_period+" 23:59:59";
				data['current_date'] = to_period+" 23:59:59";	
				return data	
			} else {
				alert('Invalid Request, From-date date must be less than to To-date');
				return;
			}
		} else {
			alert('Invalid Request, Please recheck inputs');
			return;
		}
	}

	function timeConvert(n) {
		var num = n;
		var hours = (num / 60);
		var rhours = Math.floor(hours);
		var minutes = (hours - rhours) * 60;
		var rminutes = Math.round(minutes);
		return Math.abs(rhours) + " hour(s) and " + Math.abs(rminutes) + " minute(s).";
	}

	function delete_none_array(array) {
		var index = -1,
		arr_length = array ? array.length : 0,
		resIndex = -1,
		result = [];

		while (++index < arr_length) {
			var value = array[index];

			if (value) {
				result[++resIndex] = value;
			}
		}

		return result;
	}

	function setGrouponJSON(data,group_by,set_time_diff=false){
		var categories = {}
		var reformat_output = []
		var groupBy = group_by

		for (var i = 0; i < data.length; i++) {
			if (!categories[data[i][groupBy]])
				categories[data[i][groupBy]] = [];
			if (set_time_diff) {
				try{
					if(data[i]['received_by'].length == 3 && data[i]['received_by'] != 'YOU'){
						var date1 = moment(data[i]['timestamp']);
						var date2 = moment(data[i+1]['timestamp']);
						var diff = date1.diff(date2,'minutes');
						var response_time= Math.abs(diff);
						var response_time_formated = timeConvert(diff);
					}else{
						var response_time=0
					}
				}catch(err){
					var response_time =0
				}
			categories[data[i][groupBy]].push(response_time);
				
				
			}else{
				categories[data[i][groupBy]].push(data[i]);
			}
		};
		const ordered = {};
		Object.keys(categories).sort().forEach(function(key) {
			ordered[key] = categories[key];
		});

		return ordered
	}

	function filterJsonObj(data,column_name,by_four=false){
		var filter_by_site = setGrouponJSON(data,column_name)
		var resolution = $('#data-resolution').val();
		
		var groupBy_resolution = []
		for (site in filter_by_site){
			var resolution_output = setGrouponJSON(filter_by_site[site],resolution)
			if (by_four){
				resolution = 'every_four'
				resolution_output = setGrouponJSON(filter_by_site[site],resolution,set_time_diff=true)

			}
			groupBy_resolution.push({'site':site,
				'total':filter_by_site[site].length,
				'total_recieved_msg':setGrouponJSON(filter_by_site[site],'received_by'),
				'resolution':resolution_output})
		}
		var by_site_resolution = setGrouponJSON(groupBy_resolution,'site')
		return by_site_resolution
	}

	function getSeriesdata(data,result,obj_filter){
		var series_data = [];
		var total_response_count = 0
		var filtered_by_four = filterJsonObj(result,obj_filter,by_four=true);
		var series_data_average = getSeriesdatainAvg(filtered_by_four,all=true);
		console.log(series_data_average)

		for (site in data) {
			var data_set = []
			var total_data_set = data[site][0]['total']
			for (ts in data[site][0]['resolution']) {
				var last_ts = data[site][0]['resolution'][ts]
				data_set.push([new Date(last_ts[last_ts.length-1]['timestamp']).getTime(),
					Math.round(last_ts.length / total_data_set *100) ])
			}

			if (data[site][0]['total_recieved_msg']['YOU']){
				var total_response_count = data[site][0]['total_recieved_msg']['YOU'].length
			}
			series_data.push({name:site, 
				data:data_set, 
				total: total_data_set,
				total_response: total_response_count,
				avg:series_data_average[site]['avg'],
				max:series_data_average[site]['max'],
				min:series_data_average[site]['min']
			})
		}
		
		return(series_data)
	}

	function getSeriesdatainAvg(data,all=false){
		var series_data = [];
		var name = []
		var series_data_all = {}; 
		const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
		for (site in data) {
			var data_set = []

			var total_data_set = data[site][0]['total']
			for (ts in data[site][0]['resolution']) {
				var last_ts = data[site][0]['resolution'][ts]
				
    			const result = average( last_ts )
    		    data_set.push(Math.round(result))

			}
			if (all){
			series_data_all[site]=({avg:Math.round(average(data_set)), 
				min:Math.round(Math.min(delete_none_array(data_set))),
				max:Math.round(Math.max(delete_none_array(data_set)))})
			}else{
				series_data.push([Math.round(average(data_set))])
			name.push(site)
			}
			
			
		}
		if (all){
			return(series_data_all)
		}else{
			return([name,[{name:'Minutes',data:series_data}]])
		}

		
	}



	function processgraph(data,obj_filter){
		$.post( "../responsetracker/analytics", {input: JSON.stringify(data)})
		.done(function(response) {
			var result = JSON.parse(response);
			var filtered_by_resolution = filterJsonObj(result,obj_filter);
			var series_data_reliability = getSeriesdata(filtered_by_resolution,result,obj_filter);
			highChartbuilderReliability(data, series_data_reliability)

			var filtered_by_four = filterJsonObj(result,obj_filter,by_four=true);
			var series_data_average = getSeriesdatainAvg(filtered_by_four);
			highChartbuilderAverage(data, series_data_average)
		});

	}

	function highChartbuilderReliability(data, series_data){
		if ( data['category'] == 'allsites'){
			var title = 'All Sites'
		}else if (data['category'] == 'site'){
			var title = data['site_name']
		}else{
			var title = $('#filter-key').val()
		}
		$('#reliability-chart-container').highcharts({
			chart: {
				zoomType: 'x',
				type: 'column'
			},
			title: {
				text: 'Percent of Reply for '+ title,
				x: -20
			},
			subtitle: {
				text: ('Percent of Replay from <b>' + moment(data['period']).format('LL') +
					'</b> To <b>' + moment(data['current_date']).format('LL')) +'</b>',
				x: -20
			},
			xAxis: {
				type: 'datetime'
			},
			yAxis: {
				title: {
					text: '% of Replies'
				},
				plotLines: [{
					value: 0,
					width: 1,
					color: '#808080'
				}]
			},
			tooltip: {
				headerFormat: '<span style="font-size:10px">{point.key}</span><table>',

				pointFormat: ( '<br><b>{point.series.name}</b> Statistics: <b>{point.y}%</b>' +
					'<br>Fastest response delay: </td><b> {point.series.options.max} min</b>'+
					'<br>Average response delay: </td><b> {point.series.options.avg} min</b>'+
					'<br>Slowest response delay: </td><b> {point.series.options.min} min</b>'+
					'<br>Standard deviation: </td><b> {point.series.options.deviation}</b>'+
					'<br>Total response count: </td><b> {point.series.options.total_response}</b>'+
					'<br>Total DYNASLOPE message count: <b>{point.series.options.total}</b>'),
				footerFormat: '</table>',
				useHTML: true
			},
			plotOptions: {
				column: {
					pointPadding: 0.2,
					borderWidth: 0
				},


			    },
			    legend: {
			    	layout: 'vertical',
			    	align: 'right',
			    	verticalAlign: 'middle',
			    	borderWidth: 0
			    },
			    series: series_data
			});

	}

	function highChartbuilderAverage(data, series_data){
		if ( data['category'] == 'allsites'){
			var title = 'All Sites'
		}else if (data['category'] == 'site'){
			var title = data['site_name']
		}else{
			var title = $('#filter-key').val()
		}
		$('#average-delay-container').highcharts({
			chart: {
				zoomType: 'x',
				type: 'column'
			},
			title: {
				text: 'Percent of Reply for '+ title,
				x: -20
			},
			subtitle: {
				text: ('Percent of Replay from <b>' + moment(data['period']).format('LL') +
					'</b> To <b>' + moment(data['current_date']).format('LL')) +'</b>',
				x: -20
			},
			
			yAxis: {
				title: {
					text: 'Minutes'
				},

			},
			tooltip: {
				formatter: function() {
					return 'Time<br> <b>' +  timeConvert(this.y) ;
				}
			},
			plotOptions: {
				column: {
					pointPadding: 0.2,
					borderWidth: 0
				},
				series: {
					dataLabels: {
						enabled: true,
						format: '{point.y} Minutes'
					}
		        }

			},
			xAxis: {
			    	categories: series_data[0] 
			    },
			    legend: {
			    	layout: 'vertical',
			    	align: 'right',
			    	verticalAlign: 'middle',
			    	borderWidth: 0
			    },
			    series: series_data[1]
			});

	}

	

	function analyzeAverageDelayReply(data){;
		if (groupedSiteFlagger == false){
			column_value = [];
		}
		for (var i=0;i<data.length;i++){
			var chatterbox_date = "";
			var sender_date = "";
			var date_arr = [];
			var average_delay = "";
			data_validator_replies = 0;
			data_validator_dyna_msg = 0;
			for (var x = 0;x<data[i].values.length;x++){

				if ($('#data-validator').val() == "on") { // Lagay validation kung 4 hours ang validity
					if (chatterbox_date == "" || sender_date == "") {
						if (data[i].values[x].user == "You") {
							data_validator_dyna_msg++;
							chatterbox_date = data[i].values[x].timestamp;
						} else {
							if (chatterbox_date != "") {
								sender_date = data[i].values[x].timestamp;
								data_validator_replies++;
							}
						}
					}  else {

						if (moment(chatterbox_date).add(4, 'hours').valueOf() <= moment(sender_date).valueOf()) {
							sender_date = ""; // Sets the sender_date to empty/Invalid
							chatterbox_date = ""; // Sets the chatterbox_date ('YOU') to empty/Invalid
						} else {
							//Computes the delay and push it to an array.
							if (chatterbox_date != "" && sender_date != ""){
								if (moment(chatterbox_date) > moment(sender_date)) {
									var date1 = moment(chatterbox_date);
									var date2 = moment(sender_date);
									var diff = date1.diff(date2,'minutes');
									date_arr.push(diff);
									chatterbox_date = "";
									sender_date = "";
								} else {
									var date1 = moment(chatterbox_date);
									var date2 = moment(sender_date);
									var diff = date2.diff(date1,'minutes');
									date_arr.push(diff);
									chatterbox_date = "";
									sender_date = "";
								}
							}
						}
					}
				} else {
					if (chatterbox_date == "" || sender_date == "") {
						if (data[i].values[x].user == "You") {
							chatterbox_date = data[i].values[x].timestamp;
							data_validator_dyna_msg++;
						} else {
							sender_date = data[i].values[x].timestamp;
							data_validator_replies++;
						}
					} else {
						//Computes the delay and push it to an array.
						if (chatterbox_date != "" && sender_date != ""){
							if (moment(chatterbox_date) > moment(sender_date)) {
								var date1 = moment(chatterbox_date);
								var date2 = moment(sender_date);
								var diff = date1.diff(date2,'minutes');
								date_arr.push(diff);
								chatterbox_date = "";
								sender_date = "";
							} else {
								var date1 = moment(chatterbox_date);
								var date2 = moment(sender_date);
								var diff = date2.diff(date1,'minutes');
								date_arr.push(diff);
								chatterbox_date = "";
								sender_date = "";
							}
						}
					}
				}
			}


			//Get's the shortest reply time. 
			var minimum = Math.min.apply(Math, date_arr);
			var uniqueArray = [];
			if (minimum == 0) {
				var intArray = date_arr.map(Number);
				// sorts the array
				var second = intArray.sort(function(a,b){return b-a});
				uniqueArray = second.filter(function(item, pos) {
					return second.indexOf(item) == pos;
				})
				minimum = uniqueArray[uniqueArray.length-2];
			} else if (minimum == Infinity) {
				minimum = "NaN";
			}

			//Get's the average reply time. 
			var tot = 0;
			for (var y = 0;y < date_arr.length;y++) {
				tot = tot + date_arr[y];
			}
			tot = tot/date_arr.length-1;
			//Get's the Maximum / Longest reply delay
			var maximum = Math.max.apply(Math, date_arr);
			if (maximum == -Infinity || maximum == Infinity) {
				maximum = "NaN";
			}
			//Get's the standard deviation
			var mean = tot;
			var steptwo = 0;
			var toDeviation = [];
			for (var q = 0; q < date_arr.length;q++){
				steptwo = Math.pow((date_arr[q] - mean),2);
				toDeviation.push(steptwo);
			}

			var tot_todeviation = 0;
			for (var l = 0; l < toDeviation.length;l++){
				tot_todeviation = tot_todeviation + toDeviation[l];
			}

			var toBeSquared = tot_todeviation/toDeviation.length;
			var standard_deviation = Math.sqrt(toBeSquared);

			column_value.push({
				name: data[i].number,
				y: tot,
				summary: getTimeFromMins(tot)
			});


			detailedInformation.push({
				min: minimum,
				ave: tot,
				max: maximum,
				deviation: standard_deviation
			});
			tot = 0;
			date_arr = [];
			chatterbox_date = "";
			sender_date = "";

			mes_res = {
				total_response: data_validator_replies,
				total_message: data_validator_dyna_msg
			}

			total_message_and_response.push(mes_res);

		}
	}

});