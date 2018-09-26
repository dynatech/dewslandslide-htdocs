$(document).ready(function(e){

	var initTableContent = [];
	var temp = "";
	var disable_flag;

	getGintags(); // Initialize gintag autocomplete
	$.get('../gintags_manager/getGintagTable', function( data ) {
		initTableContent = JSON.parse(data);
	});
    
	initGintagsTable();

    $('#btn-confirm').on('click',function(){
		if ($('#gintag-ipt').val().charAt(0) != "#") {
			$('#gintag-ipt').val("#"+$('#gintag-ipt').val());
		}

    	if ($('#btn-confirm').text() == "UPDATE") {
    		if ($('#gintag-ipt').val().trim() != "" && $('#gintag-description-ipt').val().trim() != "" &&
	    		$('#narrative-ipt').val().trim() != "" && $('#tag-id').val().trim() != "") {

    			var data = {
	    			'tag_id': $('#tag-id').val().trim(),
	    			'tag': $('#gintag-ipt').val().trim(),
	    			'tag_description': $('#gintag-description-ipt').val().trim(),
	    			'narrative_input': $('#narrative-ipt').val().trim(),
	    			'user': first_name
	    		}

	    		console.log(data);

	    		$.post( "../gintags_manager/updateGintagNarrative/", {gintags: data})
				.done(function(response) {

					console.log(response);
					
					if (response == "true") {
						$.notify("Tag successfully updated.", {
			    			position: "top center",
			    			className: "success"

			    		});

			    		$.get('../gintags_manager/getGintagTable', function( data ) {
							initTableContent = JSON.parse(data);
						});

						clearFields();

			    		reloadGintagsTable();
					} else {
			    		$.notify("Error occured, duplicate entry.", {
			    			position: "top center",
			    			className: "error"
			    		});
					}
				});

    		} else {
	    		$.notify("All fields are required.", {
	    			position: "top center",
	    			className:"error"
	    		});
    		}
    	} else {
	    	if ($('#gintag-ipt').val().trim() != "" && $('#gintag-description-ipt').val().trim() != "" &&
	    		$('#narrative-ipt').val().trim() != "") {

	    		var data = {
		    		'tag': $('#gintag-ipt').val().trim(),
		    		'tag_description': $('#gintag-description-ipt').val().trim(),
		    		'narrative_input': $('#narrative-ipt').val().trim(),
		    		'user': first_name
		    	}

				$.post( "../gintags_manager/insertGintagNarratives/", {gintags: data})
				.done(function(response) {
					if (response == "true") {
						$.notify("Tag successfully added.", {
			    			position: "top center",
			    			className: "success"

			    		});

			    		$.get('../gintags_manager/getGintagTable', function( data ) {
							initTableContent = JSON.parse(data);
						});

						clearFields();

			    		reloadGintagsTable();
					} else {
			    		$.notify("Error occured, duplicate entry.", {
			    			position: "top center",
			    			className: "error"
			    		});
					}
				});
	    	} else {
	    		$.notify("All fields are required.", {
	    			position: "top center",
	    			className:"error"
	    		});
	    	}
    	}
    });

	$('#btn-reset').click(function(){
		clearFields();
	});  

    $('#gintags-datatable tbody').on('click','tr:has(td) .delete',function(){
    	var table = $('#gintags-datatable').DataTable();
		var data = table.row($(this).closest('tr')).data();
		temp = data;
		var delete_data = {
			'id': data.id
		}

		$.post( "../gintags_manager/deleteGintagNarrative/", {gintags: delete_data})
			.done(function(response) {
				if (response == "true") {
		    		$.get('../gintags_manager/getGintagTable', function( data ) {
						initTableContent = JSON.parse(data);
					});

					$.notify("Tag successfully removed.", {
		    			position: "top center",
		    			className: "success"

		    		});

					clearFields();

		    		reloadGintagsTable();
				} else {
					$.notify("Error occured, please contact SWAT John.", {
		    			position: "top center",
		    			className: "error"
		    		});
				}
		});

    });

    $('#gintags-datatable tbody').on('click','.update',function(){
		var table = $('#gintags-datatable').DataTable();
		var data = table.row($(this).closest('tr')).data();

		temp = data.tag_name;

		console.log(data);
		$('#tag-id').val(data.id);
		$('#gintag-ipt').val(data.tag_name);
		$('#gintag-description-ipt').val(data.description);
		$('#narrative-ipt').val(data.narrative_input);

		$('#btn-confirm').text('UPDATE');
		$('#btn-reset').text('CANCEL');
		$("#btn-confirm").attr('class', 'btn btn-success');
		$("#btn-reset").attr('class', 'btn btn-danger');
	});

    $('#gintag-ipt').on('change',function(){
    	if (temp == "") {
	    	for (var counter = 0; counter < initTableContent.data.length; counter++) {
	    		if (initTableContent.data[counter].tag_name.toLowerCase() == $(this).val().toLowerCase()) {
		    		$.notify("Tag exist, edit it using the 'PEN' icon", {
		    			position: "top center",
		    			className: "info",
		    			autoHideDelay: 5000,
		    		});
		    		clearFields();
		    		$('#btn-confirm').prop('disabled',true);
		    		$('#gintag-ipt').focus();
		    		break;
	    		} else {
	    			$('#btn-confirm').prop('disabled',false);
	    		}
	    	}
    	} else {
			for (var counter = 0; counter < initTableContent.data.length; counter++) {
	    		if (initTableContent.data[counter].tag_name.toLowerCase() == $(this).val().toLowerCase() && temp.toLowerCase() != $(this).val().toLowerCase()) {
		    		$.notify("Tag exist, edit it using the 'PEN' icon", {
		    			position: "top center",
		    			className: "error",
		    			autoHideDelay: 5000,
		    		});
		    		$('#btn-confirm').prop('disabled',true);
		    		$('#gintag-ipt').focus();
		    		break;
	    		} else {
	    			$('#btn-confirm').prop('disabled',false);
	    		}
	    	}
    	}
    });


});

function getGintags() {
	$.get( "../gintags_manager/getTagsForAutocomplete", function( data ) {
		var tag_list = JSON.parse(data);
		var input = document.getElementById("gintag-ipt");
		new Awesomplete(input, {
			list: tag_list,
			minChars: 3,
			maxItems: 10
		});
	});
}

function updateGintags() {

}

function deleteToNarraitves() {
	
}

function initGintagsTable() {
    var gintags_table = $('#gintags-datatable').DataTable( {
        "processing": true,
        "serverSide": false,
        "ajax": '../gintags_manager/getGintagTable',
        columns: [
        	{"data" : "id", title:"ID"},
            {"data" : "tag_name", title:"TAG"},
            {"data" : "description", title:"DESCRIPTION"},
            {"data" : "narrative_input", title:"NARRATIVE INPUT"},
            {"data" : "last_update", title: "LAST UPDATE"},
            {"data" : "functions", title: "*"}
        ]
    });
}

function reloadGintagsTable() {
	var gintags_table = $('#gintags-datatable').DataTable();
	$('#gintags-datatable').DataTable().clear();
	$('#gintags-datatable').DataTable().destroy();
    var gintags_table = $('#gintags-datatable').DataTable( {
        "processing": true,
        "serverSide": false,
        "ajax": '../gintags_manager/getGintagTable',
        columns: [
        	{"data" : "id", title:"ID"},
            {"data" : "tag_name", title:"TAG"},
            {"data" : "description", title:"DESCRIPTION"},
            {"data" : "narrative_input", title:"NARRATIVE INPUT"},
            {"data" : "last_update", title: "LAST UPDATE"},
            {"data" : "functions", title: "*"}
        ]
    });
}

function clearFields() {
	$('#gintag-ipt').val('');
	$('#narrative-ipt').val('');
	$('#gintag-description-ipt').val('');
	$('#tag-id').val();
	$('#btn-confirm').text('Confirm');
	$('#btn-reset').text('Reset');
	$("#btn-confirm").attr('class', 'btn btn-primary');
	$("#btn-reset").attr('class', 'btn btn-warning');
}