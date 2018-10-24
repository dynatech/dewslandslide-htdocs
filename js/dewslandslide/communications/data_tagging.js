$(document).ready(function(e){
	getAllGeneralDataTag();
	initializeDataTagFormValidation();
	initializeOnClickDataTagDelete();
	initializeOnClickDataTagUpdate();
});

function initializeDataTagFormValidation () {
	if(BUTTON_TYPE == "delete"){
		let data = {
    		"tag_name": $("#data_tag").val(),
	    	"tag_description": $("#data_description").val(),
	    	"user": $("#first_name").val()
        }
        saveChangesOnDataTags(data);
	}else{
		$("#add-data-tag-form").validate({
	        debug: true,
	        rules: {
	            data_tag: "required",
				data_description: "required",
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
		    		"tag_name": $("#data_tag").val(),
			    	"tag_description": $("#data_description").val(),
			    	"user": $("#first_name").val()
		        }
	            saveChangesOnDataTags(data);
	        }
	    });
	}
}


function saveChangesOnDataTags(data){
	let url = null;
	let success_message = null;
	if(BUTTON_TYPE == "insert"){
		url = "../general_data_tagging/add_gen_tag";
		success_message = "Successfully added new tag.";
	}else if(BUTTON_TYPE == "update"){
		data.tag_id = $("#data_tag_id").val();
		url = "../general_data_tagging/update_gen_tag";
		success_message = "Successfully updated tag.";
	}else {
		data.tag_id = $("#data_tag_id").val();
		url = "../general_data_tagging/delete_gen_tag";
		success_message = "Successfully deleted tag.";
	}

	$.post(url, {data_tags: data})
    .done((result, textStatus, jqXHR) => {
    	console.log(result);
        if(result == "true"){
        	$.notify(success_message, "success");
	        $("#add-data-tag-form").trigger('reset');
	        $("#add-data-tag-modal").modal("hide");
	        getAllGeneralDataTag();
			initializeOnClickDataTagDelete();
			initializeOnClickDataTagUpdate();
        }else {
        	$.notify("Something went wrong, Please try again.", "error");
        }
    })
    .catch((x) => {
    	console.log(x.responseText.indexOf("Duplicate entry"));
    	if (x.responseText.indexOf("Duplicate entry")) {
    		$.notify("Duplicate entry, Please try again.", "error");
    	} else {
    		// insert pms here
    		$.notify("Something went wrong, Please try again.", "error");
    	}
    })
    .always(() => {
    	//for closing loader modal
    });
}

function initializeOnClickDataTagUpdate(){
	$("#data-tags-datatable tbody").on("click","tr:has(td) .update",function(){
    	$("#add-data-tag-modal").modal("show");
		let table = $("#data-tags-datatable").DataTable();
		let data = table.row($(this).closest("tr")).data();
		$("#data_tag_id").val(data.tag_id);
		$("#data_tag").val(data.tag_name);
		$("#data_description").val(data.tag_desc);
		BUTTON_TYPE = "update";
		$("#btn-save-data-tag").removeClass("btn-danger").addClass("btn-primary");
		$("#btn-save-data-tag").text("Save changes");
		$("#add-data-tag-title").text("Update Data Tag");
    });
}

function initializeOnClickDataTagDelete(){
	$("#data-tags-datatable tbody").on("click","tr:has(td) .delete",function(){
    	$("#add-data-tag-modal").modal("show");
		let table = $("#data-tags-datatable").DataTable();
		let data = table.row($(this).closest("tr")).data();
		$("#data_tag_id").val(data.tag_id);
		$("#data_tag").val(data.tag_name);
		$("#data_description").val(data.tag_desc);
		BUTTON_TYPE = "delete";
		$("#btn-save-data-tag").removeClass("btn-primary").addClass("btn-danger");
		$("#btn-save-data-tag").text("DELETE");
		$("#add-data-tag-title").text("CONFIRMATION");
    });
}

function getAllGeneralDataTag(){
	$("#data-tags-datatable").empty();
    $("#data-tags-datatable").DataTable( {
        "destroy": true,
        "serverSide": false,
        "ajax": "../general_tagging/getAllGeneralDataTag",
        columns: [
        	{"data" : "tag_id", title:"ID"},
            {"data" : "tag_name", title:"Tag"},
            {"data" : "tag_desc", title:"Description"},
            {"data" : "actions", title:"Actions"}
        ]
    });
    $("#data-tags-datatable_length").prepend('<button type="button" class="btn btn-primary btn-sm" id="btn-add-new-data-tag-modal"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add new tag</button>&nbsp;&nbsp;');
    initializeAddNewDataTagButton();
}

function initializeAddNewDataTagButton () {
	$("#btn-add-new-data-tag-modal").on("click",function(){
		$("#add-data-tag-form").trigger('reset');
		$("#add-data-tag-modal").modal("show");
		BUTTON_TYPE = "insert";
		$("#btn-save-data-tag").removeClass("btn-danger").addClass("btn-primary");
		$("#btn-save-data-tag").text("Save");
		$("#add-data-tag-title").text("Add new tag");
	});
}