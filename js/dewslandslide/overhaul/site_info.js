let button_type = null;
$(document).ready(function(e) {
	initializeValidateSiteInformationForm();
	// intializeSaveSiteButton();
	getAllSites();
	initializeOpenAddNewSiteModal();
	initializeOnClickSiteAction();
	initializeDeleteSiteButton();
	// $( '#modal_button').hide();
	// $( window ).resize(function() {
	//   site_info_page_widht = $(window ).width();
	//   site_info_page_height = $(window).height();
	//   console.log(site_info_page_widht,site_info_page_height)

	//  	if (site_info_page_widht <= 992 || site_info_page_height <= 624) {

	// 		$( '#site_form').hide();
	// 		$( '#modal_button').show();
	// 	} else{
	// 		$( '#modal_button').hide();
	// 		$( '#site_form').show();
	// 	}
	// });



	var $nav = $('#navigation'),        // GET NAVIGATION ID
    posTop = $nav.position().top;       // NAVIGATION POSITION FROM TOP OF WINDOW
	$(window).resize(function() {
	    posTop = $nav.position().top;
    });

      
    $(window).scroll(function () {      // MAKE SURE .position().top IS OUTSIDE WINDOW SCROLL
        var y = $(this).scrollTop();
		  
        if (y > posTop) {               // WHEN scrollTop() REACHES TOP OF NAVIGATION ADD .fixed
            $nav.addClass('sticky');
            $(".logosmall").removeClass('hidels');
        }
		  
        else {                          // IF scrollTop() IS ABOVE NAVIGATION REMOVE .fixed
            $nav.removeClass('sticky'); 
            $(".logosmall").addClass('hidels');
        }
    });


	$(".navResponsive").click(function(){
		$("nav ul.navHold").toggle();
	});
		
	$("nav ul li.subNav").click(function(){
		$(this).children("ul").toggle();
	});      


	
});

function initializeValidateSiteInformationForm () {
	$("#site-information-form").validate({
        debug: true,
        rules: {
            site_name: "required",
			site_code: "required",
			barangay: "required",
			municipality: "required",
			province: "required",
			region: "required",
			psgc: "required",
			households: "required",
			season: "required",
			is_active: "required"
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
            saveSite();
        }
    });
}

function saveSite(){
    const data = {
    	site_code: $("#site_code").val(),
    	purok: $("#purok").val(),
    	sitio: $("#sitio").val(),
    	barangay: $("#barangay").val(),
    	municipality: $("#municipality").val(),
    	province: $("#province").val(),
    	region: $("#region").val(),
    	psgc: $("#psgc").val(),
    	households: $("#households").val(),
    	season: $("#season").val(),
    	is_active: $("#is_active").val()
    };
    saveSiteChanges(data);
}

function saveSiteChanges  (data) {
	let url = null;
	let success_message = null;
	let modal_name = "#site-info-modal";
	if(button_type == "insert"){
		url = "../site_info/insertNewSite";
		success_message = "Successfully added new site.";
	}else if(button_type == "update"){
		data.site_id = $("#site_id").val();
		url = "../site_info/updateSite";
		success_message = "Successfully updated site.";
	}else {
		data.site_id = $("#delete_site_id").val();
		url = "../site_info/deleteSite";
		success_message = "Successfully deleted site.";
		modal_name = "#delete-site-modal";
	}

	$.post(url, data)
    .done((result, textStatus, jqXHR) => {
        if(result == "true"){
        	$.notify(success_message, "success");
	        $("#site-information-form").trigger('reset');
	        $(modal_name).modal("hide");
	        getAllSites();
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


function deleteSite () {

}

function getAllSites(){
	$.getJSON("../site_info/getAllSites")
    .done((data) => {
        displayAllSites(data);
    });
}

function displayAllSites(data){
    console.log(data);
	$("#sites-table").empty();
	$("#sites-table").DataTable({
		destroy: true,
		data: data,
		columns: [
		{ "data": "site_code", "title": "Site Code"},
		{ "data": "purok", "title": "Purok" },
		{ "data": "sitio", "title": "Sitio"},
		{ "data": "barangay", "title": "Barangay"},
		{ "data": "municipality", "title": "Municipality"},
		{ "data": "province", "title": "Province"},
		{ "data": "region", "title": "Region" },
		{ "data": "psgc", "title": "PSGC"},
		{ "data": "households", "title": "Households"},
		{ "data": "season", "title": "Season"},
		{ "data": "active", "title": "Is Active"},
		{ "data": "actions", "title": "Actions"}
		]
	});
	$("#sites-table_length").prepend('<button type="button" class="btn btn-primary btn-sm" id="open-site-modal"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add new site</button>&nbsp;&nbsp;');
	initializeOpenAddNewSiteModal();
}

function initializeOpenAddNewSiteModal(){
	$("#open-site-modal").click(({ currentTarget }) => {
    	button_type = "insert";
    	$("#btn-save-site").text("Save");
    	$("#site-info-title").text("Add new site");
    	$("#site_id").val(0);
    	$('#site-information-form').trigger("reset");
		$("#site-info-modal").modal("show");
    });
}

function initializeOnClickSiteAction () {
	$('#sites-table').on('click','.update',function(){
    	let table = $('#sites-table').DataTable();
		let data = table.row($(this).closest('tr')).data();
    	$("#site_id").val(data.site_id);
		$("#site_code").val(data.site_code);
    	$("#purok").val(data.purok);
    	$("#sitio").val(data.sitio);
    	$("#barangay").val(data.barangay);
    	$("#municipality").val(data.municipality);
    	$("#province").val(data.province);
    	$("#region").val(data.region);
    	$("#psgc").val(data.psgc);
    	$("#households").val(data.households);
    	$("#season").val(data.season);
    	$("#is_active").val(data.active);
		button_type = "update";
		$("#btn-save-site").text("Save Changes");
		$("#site-info-title").text("Update - " + data.site_code.toUpperCase());
		$("#site-info-modal").modal("show");
    });

    $('#sites-table').on('click','.delete',function(){
    	let table = $('#sites-table').DataTable();
		let data = table.row($(this).closest('tr')).data();
		button_type = "delete";
		$("#delete_site_id").val(data.site_id);
		$("#delete-message").text("Are you sure you want to delete " + data.site_code.toUpperCase() + "?");
		$("#delete-site-modal").modal("show");
    });
}

function initializeDeleteSiteButton () {
	$('#btn-delete-site').on('click',function(){
		const data = {};
		saveSiteChanges(data);
	});
}