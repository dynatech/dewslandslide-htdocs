$(document).ready(function(e) {

	dateTimepicker()
	validateInput()
	selectCategory()

	// Date time picker configuration
	function dateTimepicker(){
		$('#from-date').datetimepicker({
			format: 'YYYY-MM-DD'
		});

		$('#to-date').datetimepicker({
			format: 'YYYY-MM-DD'
		});

	}
 

	// Validate all inputs in the form
	function validateInput(){
		$('#confirm-filter-btn').click(function(){
			$('#response_tracker-loader-modal').modal({backdrop: 'static', keyboard: false});
			let filter_data = {}
			let data;
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

				let filter_by = 'site_name'

				if (data['category'] == "site"){
					data['site_name'] = $('#filter-key').val()
					filter_by = 'sent_by'

				}else if(data['category'] == "person"){
					let name = $('#filter-key').val().split(",")
					data['lastname'] = name[0]
					data['firstname'] = name[1]
				}

					processgraph(data,filter_by)
				
			}

		});
	}


	// Selection category properties
	function selectCategory(){
		$('#category-selection').change(function() {
			$("#confirm-filter-btn").prop('disabled', false);
			if ($( this ).val() == "allsites"){
				$("#filter-key").val('');
				$("#filter-key").prop('disabled', true);

			}else{
				$("#filter-key").prop('disabled', false);
				$.get( "../responsetracker/get"+$('#category-selection').val(), function( data ) {
					$('#filter-key').val("");
					let dataFetched = {};
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

	}


	// Input prediction on filter-key for persons name
	function datalistPredictionPerson(data) {
		$("#filter-key").typeahead('destroy')
		let recon_data = [];
		for (let counter=0;counter < data.length;counter++){
			let constructedFullname = data[counter].lastname+','+ data[counter].firstname
			+',('+ data[counter].number +')';
			recon_data.push(constructedFullname);
		}
		$("#filter-key").typeahead({ source: recon_data });
	}


	 //Input prediction on filter-key for site name
	function datalistPredictionSite(data) {
		$("#filter-key").typeahead({ source: data });
	}


    // Date checker 
	function dateChecker(){
		let data = {}
		if ($('#from-date').val() != "" && $('#to-date').val() != ""){
			const from_period = $('#from-date').val();
			const to_period = $('#to-date').val();
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


	// Convert minutes to  worded time
	function timeConvert(n) {
		const num = n;
		const hours = (num / 60);
		const rhours = Math.floor(hours);
		const minutes = (hours - rhours) * 60;
		const rminutes = Math.round(minutes);
		return Math.abs(rhours) + " hour(s) and " + Math.abs(rminutes) + " minute(s).";
	}


    // Delete Nan, undefined and Empty value in a array
	function delete_none_array(array) {
		let index = -1,
		arr_length = array ? array.length : 0,
		resIndex = -1,
		result = [];

		while (++index < arr_length) {
			let value = array[index];

			if (value) {
				result[++resIndex] = value;
			}
		}

		return result;
	}


	// Regroup all object to a specific column and compute time difference from timestamp
	function setGrouponJSON(data,group_by,set_time_diff=false){
		let categories = {}
		let reformat_output = []
		let groupBy = group_by
		let response_time;
		for (let i = 0; i < data.length; i++) {
			if (!categories[data[i][groupBy]])
				categories[data[i][groupBy]] = [];
			if (set_time_diff) {
				try{
					if(data[i]['received_by'].length == 3 && data[i]['received_by'] != 'YOU'){
						let date1 = moment(data[i]['timestamp']);
						let date2 = moment(data[i+1]['timestamp']);
						let diff = date1.diff(date2,'minutes');
						response_time= Math.abs(diff);
						let response_time_formated = timeConvert(diff);
					}else{
						 response_time=0
					}
				}catch(err){
					response_time =0
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


	// Object filtering for  resolution and for four hours data
	function filterJsonObj(data,column_name,by_four=false){
		let filter_by_site = setGrouponJSON(data,column_name)
		let resolution = $('#data-resolution').val();
		
		let groupBy_resolution = []
		for (site in filter_by_site){
			let resolution_output = setGrouponJSON(filter_by_site[site],resolution)
			if (by_four){
				resolution = 'every_four'
				resolution_output = setGrouponJSON(filter_by_site[site],resolution,set_time_diff=true)

			}
			groupBy_resolution.push({'site':site,
				'total':filter_by_site[site].length,
				'total_recieved_msg':setGrouponJSON(filter_by_site[site],'received_by'),
				'resolution':resolution_output})
		}
		let by_site_resolution = setGrouponJSON(groupBy_resolution,'site')
		return by_site_resolution
	}


	// Process Series data that is base on the resolutin time
	function getSeriesdata(data,result,obj_filter){
		let series_data = [];
		let total_response_count = 0
		let filtered_by_four = filterJsonObj(result,obj_filter,by_four=true);
		let series_data_average = getSeriesdatainAvg(filtered_by_four,all=true);


		for (site in data) {
			let data_set = []
			let total_data_set = data[site][0]['total']
			for (ts in data[site][0]['resolution']) {
				let last_ts = data[site][0]['resolution'][ts]
				data_set.push([new Date(last_ts[last_ts.length-1]['timestamp']).getTime(),
					Math.round(last_ts.length / total_data_set *100) ])
			}

			if (data[site][0]['total_recieved_msg']['YOU']){
				let total_response_count = data[site][0]['total_recieved_msg']['YOU'].length
			}
			series_data.push({name:site, 
				data:data_set, 
				total: total_data_set,
				total_response: total_response_count,
				avg:series_data_average[site]['avg'],
				max:series_data_average[site]['max'],
				min:series_data_average[site]['min'],
				deviation:series_data_average[site]['deviation'],
			})
		}
		
		return(series_data)
	}

	// Computes the standar deviation of avgera data
	function standardDeviation(values,avg){
		const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
		var squareDiffs = values.map(function(value){
			var diff = value - avg;
			var sqrDiff = diff * diff;
			return sqrDiff;
		});

		var avgSquareDiff = average(squareDiffs);

		var stdDev = Math.sqrt(avgSquareDiff);

		return Math.round(stdDev);

	}


	// Series data process for average,min and max of the array data
	function getSeriesdatainAvg(data,all=false){
		let series_data = [];
		let name = []
		let series_data_all = {}; 
		const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
		for (site in data) {
			let data_set = []

			let total_data_set = data[site][0]['total']
			for (ts in data[site][0]['resolution']) {
				let last_ts = data[site][0]['resolution'][ts]
				
    			const result = average( last_ts )
    		    data_set.push(Math.round(result))

			}
			if (all){
			series_data_all[site]=({avg:Math.round(average(data_set)), 
				min:Math.round(Math.min(delete_none_array(data_set))),
				max:Math.round(Math.max(delete_none_array(data_set))),
				deviation:(standardDeviation(data_set, 
					Math.round(average(data_set))))})
			}else{
				series_data.push([Math.round(average(data_set))])
			name.push(site)
			}
			
			
		}
		if (all){
			return(series_data_all)
		}else{
			return([name,[{name:'Minutes',colorByPoint: true,data:series_data}]])
		}

		
	}


	// Process all inputs and creates the highchart graphs
	function processgraph(data,obj_filter){
		try{	
			$.post( "../responsetracker/analytics", {input: JSON.stringify(data)})
			.done(function(response) {
				try{
					let result = JSON.parse(response);
					
					let filtered_by_resolution = filterJsonObj(result,obj_filter);
					let series_data_reliability = getSeriesdata(filtered_by_resolution,result,obj_filter);
					highChartbuilderReliability(data, series_data_reliability)

					let filtered_by_four = filterJsonObj(result,obj_filter,by_four=true);
					let series_data_average = getSeriesdatainAvg(filtered_by_four);
					highChartbuilderAverage(data, series_data_average)
					
				}catch(err){

					alert('Error loading the data')
					$("#response_tracker-loader-modal").modal("hide");
					
				}

			});
		}catch(err){

			alert('Error loading the data')
			$("#response_tracker-loader-modal").modal("hide");
			
			}
	}


	// Highchart Builder for reliability graph
	function highChartbuilderReliability(data, series_data){
		let title;
		if ( data['category'] == 'allsites'){
			title = 'All Sites'
		}else if (data['category'] == 'site'){
			 title = data['site_name']
		}else{
			title = $('#filter-key').val()
		}

		let chart = $('#reliability-chart-container').highcharts({
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
					'<br>Fastest response delay: </td><b> {point.series.options.max}</b>'+
					'<br>Average response delay: </td><b> {point.series.options.avg}</b>'+
					'<br>Slowest response delay: </td><b> {point.series.options.min}</b>'+
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

		setTimeout(() => {
			$("#response_tracker-loader-modal").modal("hide");
		}, 2000)

	}


	// Highchart Builder for Average Delay time graph
	function highChartbuilderAverage(data, series_data){
		let title;
		if ( data['category'] == 'allsites'){
			title = 'All Sites'
		}else if (data['category'] == 'site'){
			title = data['site_name']
		}else{
			title = $('#filter-key').val()
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
	

});