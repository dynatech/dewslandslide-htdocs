let TAGS = [];
let TEMP = "";
let disable_flag;
let BUTTON_TYPE = "insert";
$(document).ready(function(e){

	getGintags(); // Initialize gintag autocomplete
	gintagTable();
	$.get("../gintags_manager/getGintagTable", function( data ) {
		TAGS = JSON.parse(data);
	});
    initializeAddTagForm();

  //   $("#btn-confirm").on("click",function(){
		// if ($("#sms_tag").val().charAt(0) != "#") {
		// 	$("#sms_tag").val("#"+$("#sms_tag").val());
		// }

  //   	if ($("#btn-confirm").text() == "UPDATE") {
  //   		if ($("#sms_tag").val().trim() != "" && $("#description").val().trim() != "" &&
	 //    		$("#narrative_input").val().trim() != "" && $("#tag_id").val().trim() != "") {

  //   			var data = {
	 //    			"tag_id": $("#tag_id").val().trim(),
	 //    			"tag": $("#sms_tag").val().trim(),
	 //    			"tag_description": $("#description").val().trim(),
	 //    			"narrative_input": $("#narrative_input").val().trim(),
	 //    			"user": first_name
	 //    		}

	 //    		console.log(data);

	 //    		$.post( "../gintags_manager/updateGintagNarrative/", {gintags: data})
		// 		.done(function(response) {

		// 			console.log(response);
					
		// 			if (response == "true") {
		// 				$.notify("Tag successfully updated.", {
		// 	    			position: "top center",
		// 	    			className: "success"

		// 	    		});

		// 	    		$.get("../gintags_manager/getGintagTable", function( data ) {
		// 					TAGS = JSON.parse(data);
		// 				});

		// 				clearFields();

		// 	    		// reloadGintagsTable();
		// 			} else {
		// 	    		$.notify("Error occured, duplicate entry.", {
		// 	    			position: "top center",
		// 	    			className: "error"
		// 	    		});
		// 			}
		// 		});

  //   		} else {
	 //    		$.notify("All fields are required.", {
	 //    			position: "top center",
	 //    			className:"error"
	 //    		});
  //   		}
  //   	} else {
	 //    	if ($("#sms_tag").val().trim() != "" && $("#description").val().trim() != "" &&
	 //    		$("#narrative_input").val().trim() != "") {

	 //    		var data = {
		//     		"tag": $("#sms_tag").val().trim(),
		//     		"tag_description": $("#description").val().trim(),
		//     		"narrative_input": $("#narrative_input").val().trim(),
		//     		"user": first_name
		//     	}

		// 		$.post( "../gintags_manager/insertGintagNarratives/", {gintags: data})
		// 		.done(function(response) {
		// 			if (response == "true") {
		// 				$.notify("Tag successfully added.", {
		// 	    			position: "top center",
		// 	    			className: "success"

		// 	    		});

		// 	    		$.get("../gintags_manager/getGintagTable", function( data ) {
		// 					TAGS = JSON.parse(data);
		// 				});

		// 				clearFields();

		// 	    		// reloadGintagsTable();
		// 			} else {
		// 	    		$.notify("Error occured, duplicate entry.", {
		// 	    			position: "top center",
		// 	    			className: "error"
		// 	    		});
		// 			}
		// 		});
	 //    	} else {
	 //    		$.notify("All fields are required.", {
	 //    			position: "top center",
	 //    			className:"error"
	 //    		});
	 //    	}
  //   	}
  //   });

	clearFields();
    initializeOnUpdateClickTag();
    initializeOnDeleteClickTag()
    initializeOnTagChange();

});

function initializeAddTagForm(){
	if(BUTTON_TYPE == "delete"){
		let data = {
    		"tag": $("#sms_tag").val(),
	    	"tag_description": $("#description").val(),
	    	"narrative_input": $("#narrative_input").val(),
	    	"user": $("#first_name").val()
        }
        saveChangesTag(data);
	}else{
		$("#add-new-tag-form").validate({
	        debug: true,
	        rules: {
	            sms_tag: "required",
				description: "required",
				narrative_input: "required"
	        },
	        messages: { comments: "" },
	        errorPlacement (error, element) {
	            const placement = $(element).closest(".form-group");
	            if ($(element).hasClass("cbox_trigger_switch")) {
	                $("#errorLabel").append(error).show();
	            } else if (placement) {
	                $(placement).append(error);
	            } else {
	                error.insertAfter(placement);
	            } // remove on success

	            element.parents(".form-group").addClass("has-feedback");

	            // Add the span element, if doesn't exists, and apply the icon classes to it.
	            const $next_span = element.next("span");
	            if (!$next_span[0]) {
	                if (element.is("select") || element.is("textarea")) $next_span.css({ top: "25px", right: "25px" });
	            }
	        },
	        success (label, element) {
	            // Add the span element, if doesn't exists, and apply the icon classes to it.
	            if (!$(element).next("span")) {
	                $("<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
	            }

	            $(element).closest(".form-group").children("label.error").remove();
	        },
	        highlight (element, errorClass, validClass) {
	            $(element).parents(".form-group").addClass("has-error").removeClass("has-success");
	            if ($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
	                $(element).nextAll("span.glyphicon").remove();
	                $("<span class='glyphicon glyphicon-remove form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
	            } else $(element).next("span").addClass("glyphicon-remove").removeClass("glyphicon-ok");
	        },
	        unhighlight (element, errorClass, validClass) {
	            $(element).parents(".form-group").addClass("has-success").removeClass("has-error");
	            if ($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
	                $(element).nextAll("span.glyphicon").remove();
	                $("<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
	            } else $(element).next("span").addClass("glyphicon-ok").removeClass("glyphicon-remove");
	        },
	        submitHandler (form) {
	        	let data = {
	        		"tag": $("#sms_tag").val(),
			    	"tag_description": $("#description").val(),
			    	"narrative_input": $("#narrative_input").val(),
			    	"user": $("#first_name").val()
	        	}
	            saveChangesTag(data);
	        }
	    });
	}
	
}

function saveChangesTag(data){
	let url = null;
	let success_message = null;
	if(BUTTON_TYPE == "insert"){
		url = "../gintags_manager/insertGintagNarratives";
		success_message = "Successfully added new tag.";
	}else if(BUTTON_TYPE == "update"){
		data.tag_id = $("#tag_id").val();
		url = "../gintags_manager/updateGintagNarrative";
		success_message = "Successfully updated tag.";
	}else {
		data.id = $("#tag_id").val();
		url = "../gintags_manager/deleteGintagNarrative";
		success_message = "Successfully deleted tag.";
	}

	$.post(url, {gintags: data})
    .done((result, textStatus, jqXHR) => {
        if(result == "true"){
        	$.notify(success_message, "success");
	        $("#add-new-tag-form").trigger('reset');
	        $("#add-tag-modal").modal("hide");
	        gintagTable();
	        initializeOnUpdateClickTag();
	        initializeOnDeleteClickTag();
        }else {
        	$.notify("Something went wrong, Please try again.", "error");
        }
    })
    .catch((x) => {
    	// insert pms here
    })
    .always(() => {
    	//for closing loader modal
    });
}

function initializeOnDeleteClickTag(){
	$("#gintags-datatable tbody").on("click","tr:has(td) .delete",function(){
    	$("#add-tag-modal").modal("show");
		let table = $("#gintags-datatable").DataTable();
		let data = table.row($(this).closest("tr")).data();
		$("#tag_id").val(data.id);
		$("#sms_tag").val(data.tag_name);
		$("#description").val(data.description);
		$("#narrative_input").val(data.narrative_input);
		BUTTON_TYPE = "delete";
		$("#btn-save-tag").removeClass("btn-primary").addClass("btn-danger");
		$("#btn-save-tag").text("DELETE");
		$("#add-tag-title").text("CONFIRMATION");
    });
}

function initializeOnUpdateClickTag(){
	$("#gintags-datatable tbody").on("click",".update",function(){
		$("#add-tag-modal").modal("show");
		let table = $("#gintags-datatable").DataTable();
		let data = table.row($(this).closest("tr")).data();

		// TEMP = data.tag_name;

		console.log(data);
		$("#tag_id").val(data.id);
		$("#sms_tag").val(data.tag_name);
		$("#description").val(data.description);
		$("#narrative_input").val(data.narrative_input);

		BUTTON_TYPE = "update";
		$("#btn-save-tag").removeClass("btn-danger").addClass("btn-primary");
		$("#btn-save-tag").text("Save changes");
		$("#add-tag-title").text("Update Tag");

	});
}

function initializeOnTagChange(){
	$("#sms_tag").on("change",function(){
    	if (TEMP == "") {
	    	for (var counter = 0; counter < TAGS.data.length; counter++) {
	    		if (TAGS.data[counter].tag_name.toLowerCase() == $(this).val().toLowerCase()) {
		    		$.notify("Tag exist, edit it using the 'PEN' icon", {
		    			position: "top center",
		    			className: "info",
		    			autoHideDelay: 5000,
		    		});
		    		clearFields();
		    		$("#btn-confirm").prop("disabled",true);
		    		$("#sms_tag").focus();
		    		break;
	    		} else {
	    			$("#btn-confirm").prop("disabled",false);
	    		}
	    	}
    	} else {
			for (var counter = 0; counter < TAGS.data.length; counter++) {
	    		if (TAGS.data[counter].tag_name.toLowerCase() == $(this).val().toLowerCase() && TEMP.toLowerCase() != $(this).val().toLowerCase()) {
		    		$.notify('Tag exist, edit it using the PEN icon', {
		    			position: "top center",
		    			className: "error",
		    			autoHideDelay: 5000,
		    		});
		    		$("#btn-confirm").prop("disabled",true);
		    		$("#sms_tag").focus();
		    		break;
	    		} else {
	    			$("#btn-confirm").prop("disabled",false);
	    		}
	    	}
    	}
    });
}

function getGintags() {
	$.get( "../gintags_manager/getTagsForAutocomplete", function( data ) {
		var tag_list = JSON.parse(data);
		var input = document.getElementById("sms_tag");
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


function gintagTable(data) {
	$("#gintags-datatable").empty();
    $("#gintags-datatable").DataTable( {
        "destroy": true,
        "serverSide": false,
        "ajax": "../gintags_manager/getGintagTable",
        columns: [
        	{"data" : "id", title:"ID"},
            {"data" : "tag_name", title:"Tag"},
            {"data" : "description", title:"Description"},
            {"data" : "narrative_input", title:"Narrative Input"},
            {"data" : "last_update", title: "Last Update"},
            {"data" : "functions", title: "Actions"}
        ]
    });
    $("#gintags-datatable_length").prepend('<button type="button" class="btn btn-primary btn-sm" id="btn-add-new-tag-modal"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add new tag</button>&nbsp;&nbsp;');
	initializeAddNewTagButton();
}

function initializeAddNewTagButton () {
	$("#btn-add-new-tag-modal").on("click",function(){
		clearFields();
		$("#add-tag-modal").modal("show");
		BUTTON_TYPE = "insert";
		$("#btn-save-tag").removeClass("btn-danger").addClass("btn-primary");
		$("#btn-save-tag").text("Save");
		$("#add-tag-title").text("Add new tag");
	});
}

// function reloadGintagsTable() {
// 	var gintags_table = $("#gintags-datatable").DataTable();
// 	$("#gintags-datatable").DataTable().clear();
// 	$("#gintags-datatable").DataTable().destroy();
//     var gintags_table = $("#gintags-datatable").DataTable( {
//         "processing": true,
//         "serverSide": false,
//         "ajax": "../gintags_manager/getGintagTable",
//         columns: [
//         	{"data" : "id", title:"ID"},
//             {"data" : "tag_name", title:"TAG"},
//             {"data" : "description", title:"DESCRIPTION"},
//             {"data" : "narrative_input", title:"NARRATIVE INPUT"},
//             {"data" : "last_update", title: "LAST UPDATE"},
//             {"data" : "functions", title: "*"}
//         ]
//     });
// }

function clearFields() {
	$("#sms_tag").val("");
	$("#narrative_input").val("");
	$("#description").val("");
	$("#tag_id").val();
}