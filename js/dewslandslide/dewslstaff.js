$(document).ready(function(e) {
	loadAllStaff();
});


function loadAllStaff() {

		$.get( "../staff/get_all_staff", function( data ) {
			var staff_data = JSON.parse(data);
			var panel_counter = 0;
			var temp = "";
			var temp_array = [];
			var teams = [];
			var flag = 0;

			for (var counter = 0; counter < staff_data.length; counter++) {
				if (temp == "") {
					temp = staff_data[counter].team_name;
					if (temp == staff_data[counter].team_name) {
						temp_array.push(staff_data[counter]);
					}
				} else if (counter == staff_data.length-1) {
					if (temp == staff_data[counter].team_name) {
						temp_array.push(staff_data[counter]);
					}
					teams.push(temp_array);
					temp = staff_data[counter].team_name;
					temp_array = [];
				} else {
					if (temp == staff_data[counter].team_name) {
						temp_array.push(staff_data[counter]);
					} else {
						teams.push(temp_array);
						temp = staff_data[counter].team_name;
						temp_array = [];
						if (temp == staff_data[counter].team_name) {
							temp_array.push(staff_data[counter]);
						}
					}
				}
			}

			console.log(teams);
			for (var counter = 0; counter < teams.length; counter++) {
				$('.staff-wrapper').append('<div class="panel panel-primary">'+
				'<div class="panel-heading text-center panel-relative"><h3>'+teams[counter][0].team_name+'</h3></div><br>'+
				'<div class="row staff-container">'+
				'<div class="col-sm-12 '+teams[counter][0].team_name.replace(/\s/g,'')+'-team">'+
				'</div>'+
				'</div>'+
				'</div>');
			}

			for (var counter = 0; counter < teams.length; counter++) {
				for (var sub_counter = 0; sub_counter < teams[counter].length; sub_counter++) {
					$('.'+teams[counter][0].team_name.replace(/\s/g,'')+'-team').append('<div class="col-sm-4 staff-profile">'+
						'<img src="../../images/staff_photos/'+teams[counter][sub_counter].fk_mid+'.jpg" class="img-thumbnail img-responsive" alt="'+teams[counter][sub_counter].full_name+'">'+
						'<div class="staff-name">'+teams[counter][sub_counter].full_name+'</div>'+
						'<div class="staff-attainment">'+teams[counter][sub_counter].education_attainment+'</div>'+
						'<div class="staff-position">'+teams[counter][sub_counter].position+'</div></div>');
					flag++;
					if (flag == 4) {
						$('.row-'+counter+'-'+teams[counter][0].team_name+'-team flag-'+flag).append('<div class="col-sm-12">'+
					'</div>');
						flag = 0;
					}
				}
			}
		});
}