let quick_group_selection_flag = false;
let site_selected = [];
let organization_selected = [];
let temp_tag_flag_container = "";

let message_details = [];
let site_code = 0;
let temp_important_tag = [];

let tag_container = null;

$(document).ready(function() {
	initializeOnClickSendRoutine();
	initializeGetQuickGroupSelection();
	initializeContactSettingsButton();
	initializeOnClickQuickInbox();
	initializeOnClickEventInbox();
	initializeContactCategoryOnSelectDesign();
	initializeSettingsOnSelectDesign();
	initializeContactCategoryOnChange();
	initializeContactSettingsOnChange();
	initializeQuickSelectionGroupFlagOnClick();
	initializeGoLoadOnClick();
	initializeSendMessageOnClick();
	initializeOnAvatarClickForTagging();
	initializeOnClickConfirmTagging();
	initializeOnClickConfirmNarrative();
	initializeAlertStatusOnChange();
	initializeEWITemplateModal();
	initializeConfirmEWITemplateViaChatterbox();
	initializeQuickSearchModal();
	initializeQuickSearchMessages();
	initializeClearQuickSearchInputs();
	initializeLoadSearchedKeyMessage();
	initializeSearchViaOption();
	initializeEmployeeContactGroupSending();
	initializeSemiAutomatedGroundMeasurementReminder();
	initializeGndMeasSettingsCategory();
	initializeGndMeasSaveButton();
	initializeResetSpecialCasesButtonOnCLick();
	loadSiteConvoViaQacess();
	initializeOnClickAddMobileForEmployee();
	initializeOnClickAddMobileForCommunity();
	initializeOnClickUnregistered();
});

function initializeOnClickSendRoutine () {
	
	let offices = [];
	let sites_on_routine = [];

	$('#send-routine-msg').click(() => {
		$("#chatterbox-loader-modal").modal("show");
	    if ($(".btn.btn-primary.active").val() == "Reminder Message") {
	        offices = ["LEWC"];
	    } else {
	        offices = ["LEWC", "MLGU", "BLGU"];
	    }

        $("input[name=\"sites-on-routine\"]:checked").each(function () {
            sites_on_routine.push(this.id);
        });
        getRoutineMobileIDs(offices, sites_on_routine);                
    });
}

function getRoutineMobileIDs(offices, sites_on_routine) {
    const lewc_details_request = {
    	type: "getRoutineMobileIDsForRoutine",
    	sites: sites_on_routine,
    	offices: offices
    }
    wss_connect.send(JSON.stringify(lewc_details_request));	
}

function sendRoutineSMSToLEWC(raw) { // To be refactored to accomodate custom routine message per site
	let message = $("#routine-msg").val();
	let sender = " - " + $("#user_name").html() + " from PHIVOLCS-DYNASLOPE";
	console.log("hereSend");
	raw.data.forEach(function(contact) {
		raw.sites.forEach(function(site) {
			console.log(site);
			if (contact.fk_site_id == site.site_id) {
				let temp = "";
				if (site.purok == null && site.sitio == null) {
					temp = site.barangay+", "+site.municipality+", "+site.province;
				} else if (site.purok == "" && site.sitio == "") {
					temp = site.barangay+", "+site.municipality+", "+site.province; 
				}else if (site.purok == null && site.sitio != null) {
					temp = site.sitio+", "+site.barangay+", "+site.municipality+", "+site.province;
				} else if (site.purok != null && site.sitio == null) {
					temp = site.purok+", "+site.barangay+", "+site.municipality+", "+site.province;
				} else {
					temp =  site.purok+", "+site.sitio+", "+site.barangay+", "+site.municipality+", "+site.province;
				}
				let site_details = temp;
				message = message.replace("(site_location)", site_details);
				message = message.replace("(current_date)", raw.date);
				message = message.replace("(greetings)", "umaga");
				message = message.replace("(gndmeas_time_submission)","bago-mag 11:30 AM");
				// console.log(message);
				try {
					let convo_details = {
						type: 'sendSmsToRecipients',
						recipients: [contact.mobile_id],
						message: message + sender
					};
					wss_connect.send(JSON.stringify(convo_details));   		
				} catch(err) {
					console.log(err);
					// Add PMS here
				}
				message = $("#routine-msg").val();
			}
		});
	});

	$("#chatterbox-loader-modal").modal("hide");
	if (message.indexOf('Magandang tanghali po') > -1) {
		$.notify("Successfully sent routine messages.","success");
	} else {
		$.notify("Successfully sent ground measurement reminder.","success");
	}
}

function initializeGetQuickGroupSelection () {
	$("#btn-advanced-search").on("click",function() {
		getLatestAlert();
		$('#advanced-search').modal("toggle");
	});
}

function initializeContactSettingsButton () {
	$('#btn-contact-settings').click(function(){
		if (connection_status === false){
			console.log("NO CONNECTION");
		} else {
			$('#contact-settings').modal("toggle");
			displayContactSettingsMenu();
			$("#contact-category").val("default").change();
			$("#settings-cmd").prop('disabled', true);
			$(".collapse").collapse("show");
		}
	});
}

function initializeContactCategoryOnSelectDesign () {
	$('#contact-category option').prop('selected', function() {
		$('#contact-category').css("border-color", "#d6d6d6");
		$('#contact-category').css("background-color", "inherit");
		return this.defaultSelected;
	});
}

function initializeSettingsOnSelectDesign () {
	$('#settings-cmd option').prop('selected', function() {
		$('#settings-cmd').prop('disabled',true);
		$('#settings-cmd').css("border-color", "#d6d6d6");
		$('#settings-cmd').css("background-color", "inherit");
		return this.defaultSelected;
	});
}

function initializeContactCategoryOnChange () {
	$('#contact-category').on('change',function(){
		$('#contact-result').remove();
		if ($('#contact-category').val() != 'default') {
			$('#contact-category').css("border-color", "#3c763d");
			$('#contact-category').css("background-color", "#dff0d8");
		}
		$('#settings-cmd').prop('disabled', false);
		$('#settings-cmd option').prop('selected', function() {
			$('#settings-cmd').css("border-color", "#d6d6d6");
			$('#settings-cmd').css("background-color", "inherit");
			return this.defaultSelected;
		});

		$('#update-contact-container').prop('hidden',true);
		$('#comm-response-contact-container_wrapper').prop('hidden',true);
		$('#emp-response-contact-container_wrapper').prop('hidden',true);
		$('#employee-contact-wrapper').prop('hidden', true);
		$('#community-contact-wrapper').prop('hidden', true);
	});
}

function initializeContactSettingsOnChange () {
	$('#settings-cmd').on('change',function(){
		$("#mobile-div").empty();
		$("#landline-div").empty();
		$("#mobile-div-cc").empty();
		$("#landline-div-cc").empty();
		if ($('#settings-cmd').val() != 'default') {
			$('#settings-cmd').css("border-color", "#3c763d");
			$('#settings-cmd').css("background-color", "#dff0d8");
		}else {
			$("#employee-add-number").empty();
			$("#community-add-number").empty();
		}

		if ($('#contact-category').val() == "econtacts") {
			$("#settings-cmd").prop('disabled', false);
			if ($('#settings-cmd').val() == "addcontact") {
				$('#emp-response-contact-container_wrapper').prop('hidden',true);
				$('#comm-response-contact-container_wrapper').prop('hidden',true);
				$('#community-contact-wrapper').hide();
				$('#employee-contact-wrapper').show();
				emptyEmployeeContactForm();
				$("#emp-settings-cmd").show();
				$('#employee-contact-wrapper').show();
				$("#update-contact-container").hide();
				employee_input_count = 1;
				employee_input_count_landline = 1;
			} else if ($('#settings-cmd').val() == "updatecontact") {
				$('#community-contact-wrapper').hide();
				$('#employee-contact-wrapper').hide();
				$('#email_ec').tagsinput('removeAll');
				$('#team_ec').tagsinput('removeAll');
				employee_input_count = 1;
				employee_input_count_landline = 1;
				getEmployeeContact();
			} else {
				console.log('Invalid Request');
			}
		} else if ($('#contact-category').val() == "ccontacts") {
			$("#settings-cmd").prop('disabled', false);
			if ($('#settings-cmd').val() == "addcontact") {
				$('#emp-response-contact-container_wrapper').prop('hidden',true);
				$('#comm-response-contact-container_wrapper').prop('hidden',true);
				$('#employee-contact-wrapper').hide();
				$('#community-contact-wrapper').show();
				$('#comm-settings-cmd').show();
				$('#update-comm-contact-container').hide();
				emptyCommunityContactForm();
				$('#employee-contact-wrapper').hide();
				$(".organization-checkbox").prop("checked", false);
				community_input_count = 1;
				community_input_count_landline = 1;
				$(".site-checkbox").prop("checked", false);
			} else if ($('#settings-cmd').val() == "updatecontact") {
				$('#comm-response-contact-container_wrapper').hide();
				$('#employee-contact-wrapper').hide();
				$('#community-contact-wrapper').hide();
				$('#comm-settings-cmd').hide();
				$('#update-comm-contact-container').show();
				getCommunityContact();
				community_input_count = 1;
				community_input_count_landline = 1;
			} else {
				console.log('Invalid Request');
			}
		} else {
			console.log('Invalid Request');
		}
	});

	$('#contact-category').on('change',function(){
		$('#community-contact-wrapper').hide();
		$('#employee-contact-wrapper').hide();
	});
}

function initializeQuickSelectionGroupFlagOnClick () {
	$('#emp-grp-flag').on('click',function(){
		quick_group_selection_flag = true;
	});

	$('#comm-grp-flag').on('click',function(){
		quick_group_selection_flag = false;
	});
}


function initializeOnClickQuickInbox () {
	$("body").on("click","#quick-inbox-display li",function(){
		let raw_name = $(this).closest('li').find("input[type='text']").val().split(",");
		let firstname = raw_name[1].trim();
		let lastname = raw_name[0].split("-")[1].trim();
		let office = raw_name[0].split(" ")[1].trim();
		let site = raw_name[0].split(" ")[0].trim();
		let conversation_details = {
			full_name: $(this).closest('li').find("input[type='text']").val(),
			firstname: firstname,
			lastname: lastname,
			office: office,
			site: site,
			number: "N/A"
		}

		conversation_details_label = site+" "+office+" - "+firstname+" "+lastname;
		startConversation(conversation_details);
	});
}

function initializeOnClickEventInbox () {
	$("body").on("click","#quick-event-inbox-display li",function(){
		let raw_name = $(this).closest('li').find("input[type='text']").val().split(",");
		let firstname = raw_name[1].trim();
		let lastname = raw_name[0].split("-")[1].trim();
		let office = raw_name[0].split(" ")[1].trim();
		let site = raw_name[0].split(" ")[0].trim();
		let conversation_details = {
			full_name: $(this).closest('li').find("input[type='text']").val(),
			firstname: firstname,
			lastname: lastname,
			office: office,
			site: site,
			number: "N/A"
		}

		conversation_details_label = site+" "+office+" - "+firstname+" "+lastname;
		startConversation(conversation_details);
	});
}

function initializeOnClickUnregistered() {
	$("body").on("click","#quick-unregistered-inbox-display li",function(){
		let raw_name = $(this).closest('li').find("input[type='text']").val().split(",");
		let firstname = raw_name[1].trim();
		let lastname = raw_name[0].trim();
		let conversation_details = {
			full_name: $(this).closest('li').find("input[type='text']").val(),
			firstname: firstname,
			lastname: lastname,
			number: "N/A"
		}

		conversation_details_label = firstname+" "+lastname;
		startConversation(conversation_details);
	});
}

function initializeGoLoadOnClick () {
	$("#go-load-groups").click(function() {
		const offices_selected = [];
		const sites_selected = [];
		$("#modal-select-sitenames input:checked").each(function() {
		    sites_selected.push($(this).closest('label').text());
		});
		$("#modal-select-offices input:checked").each(function() {
		    offices_selected.push($(this).attr('value'));
		});

		// Validate if there is incomplete checkbox input from user
		if((sites_selected.length === 0) && (offices_selected.length === 0)) {
			$.notify("You need to specify at least an OFFICE and a SITE to search.", "warn");
		}
		else if(offices_selected.length === 0) {
			$.notify("No OFFICE selected! Please choose at least 1 office.", "warn");		
		} else if (sites_selected.length === 0) {
			$.notify("No SITE selected! Please choose at least 1 site.", "warn");
		} else { 
			const sites = sites_selected.join(", ");
			const offices = offices_selected.join(", ");
			conversation_details_label = "Site(s): "+sites.toUpperCase()+" | Office(s): "+offices.toUpperCase();
			loadSiteConversation();			
		}
	});
}

function initializeSendMessageOnClick () {
	$("#send-msg").click(function() {
		console.log(recipient_container);
		sendSms(recipient_container,$("#msg").val());
	});
}

function initializeOnClickAddMobileForEmployee () {
	$("#employee-add-number").click(function(){
		if (employee_input_count <= 4) {
			$("#mobile-div").append(
			"<div class='row'>"+
		    "<div class='col-md-4'>"+
		    "<div class='form-group hideable'>"+
			"<label class='control-label' for='employee_mobile_number_"+employee_input_count+"'>Mobile #</label>"+
			"<input type='number' class='form-control employee_mobile_number' id='employee_mobile_number_"+employee_input_count+"' name='employee_mobile_number_"+employee_input_count+"' value='' required/>"+
			"</div>"+
			"</div>"+
			"<div class='col-md-4' hidden>"+
			"<label>Mobile ID #:</label>"+
			"<input type='text' id='employee_mobile_id_"+employee_input_count+"' class='form-control employee_mobile_id' disabled>"+
			"</div>"+
			"<div class='col-md-4'>"+
			"<div class='form-group hideable'>"+
			"<label class='control-label' for='employee_mobile_status_"+employee_input_count+"'>Mobile # Status</label>"+
			"<select class='form-control' id='employee_mobile_status_"+employee_input_count+"' name='employee_mobile_status_"+employee_input_count+"' class='form-control employee_mobile_status' value='' required>"+
			"<option value='1'>Active</option>"+
			"<option value='0'>Inactive</option>"+
			"</select>"+
			"</div>"+
			"</div>"+
			"<div class='col-md-4'>"+
		    "<div class='form-group hideable'>"+
			"<label class='control-label' for='employee_mobile_priority_"+employee_input_count+"'>Mobile # Priority</label>"+
			"<select id='employee_mobile_priority_"+employee_input_count+"'' name='employee_mobile_priority_"+employee_input_count+"' class='form-control employee_mobile_priority' value='' required>"+
			"<option value=''>--------</option>"+
			"<option value='1'>1</option>"+
			"<option value='2'>2</option>"+
			"<option value='3'>3</option>"+
			"<option value='4'>4</option>"+
			"<option value='5'>5</option>"+
			"</select>"+
			"</div>"+
			"</div>"+
			"</div>");
			employee_input_count +=1;
		} else {
			$.notify("Reach the maximum entry for mobile number", "warn");
		}
		
	});

	$("#employee-add-landline").click(function(){
		if (employee_input_count_landline <= 4) {
			$("#landline-div").append(
			"<div class='row'>"+
		    "<div class='col-md-6'>"+
			"<div class='form-group hideable'>"+
	        "<label class='control-label' for='employee_landline_number_"+employee_input_count_landline+"'>Landline #</label>"+
			"<input type='number' class='form-control' id='employee_landline_number_"+employee_input_count_landline+"' name='employee_landline_number_"+employee_input_count_landline+"' required/>"+
			"</div>"+
			"</div>"+
			"<div class='col-md-4' hidden>"+
			"<label>Landline ID #:</label>"+
			"<input type='text' id='employee_landline_id_"+employee_input_count_landline+"' class='form-control' value='' disabled>"+
			"</div>"+
			"<div class='col-md-6'>"+
			"<div class='form-group hideable'>"+
			"<label class='control-label' for='employee_landline_remarks_"+employee_input_count_landline+"'>Remarks</label>"+
			"<input type='text' class='form-control' id='employee_landline_remarks_"+employee_input_count_landline+"' name='employee_landline_remarks_"+employee_input_count_landline+"' required/>"+
			"</div>"+
			"</div>"+
			"</div>");
			employee_input_count_landline +=1;
		} else {
			$.notify("Reach the maximum entry for landile number", "warn");
		}
		
	});

} 

function initializeOnClickAddMobileForCommunity () {
	$("#community-add-number").click(function(){
		console.log(community_input_count);
		if (community_input_count <= 4) {
			$("#mobile-div-cc").append(
			"<div class='row'>"+
		    "<div class='col-md-4'>"+
		    "<div class='form-group hideable'>"+
			"<label class='control-label' for='community_mobile_number_"+community_input_count+"'>Mobile #:</label>"+
			"<input type='number' class='form-control community_mobile_number' id='community_mobile_number_"+community_input_count+"' name='community_mobile_number_"+community_input_count+"' value='' required/>"+
			"</div>"+
			"</div>"+
			"<div class='col-md-4' hidden>"+
			"<label>Mobile ID #:</label>"+
			"<input type='text' id='community_mobile_id_"+community_input_count+"' class='form-control community_mobile_id' value='' disabled>"+
			"</div>"+
			"<div class='col-md-4'>"+
			"<div class='form-group hideable'>"+
			"<label class='control-label' for='community_mobile_status_"+community_input_count+"'>Mobile # Status:</label>"+
			"<select id='community_mobile_status_"+community_input_count+"'' name='community_mobile_status_"+community_input_count+"' class='form-control community_mobile_status' value='' required>"+
			"<option value='1'>Active</option>"+
			"<option value='0'>Inactive</option>"+
			"</select>"+
			"</div>"+
			"</div>"+
			"<div class='col-md-4'>"+
			"<div class='form-group hideable'>"+
			"<label class='control-label' for='community_mobile_priority_"+community_input_count+"'>Mobile # Priority:</label>"+
			"<select id='community_mobile_priority_"+community_input_count+"'' name='community_mobile_priority_"+community_input_count+"' class='form-control community_mobile_priority' value='' required>"+
			"<option value=''>--------</option>"+
			"<option value='1'>1</option>"+
			"<option value='2'>2</option>"+
			"<option value='3'>3</option>"+
			"<option value='4'>4</option>"+
			"<option value='5'>5</option>"+
			"</select>"+
			"</div>"+
			"</div>"+
			"</div>");
			community_input_count +=1;
		} else {
			$.notify("Reach the maximum entry for mobile number", "warn");
		}
		
	});

	$("#community-add-landline").click(function(){
		if (community_input_count_landline <= 4) {
			$("#landline-div-cc").append(
			"<div class='row'>"+
		    "<div class='col-md-6'>"+
			"<div class='form-group hideable'>"+
	        "<label class='control-label' for='community_landline_number_"+community_input_count_landline+"'>Landline #</label>"+
			"<input type='number' class='form-control' id='community_landline_number_"+community_input_count_landline+"' name='community_landline_number_"+community_input_count+"' required/>"+
			"</div>"+
			"</div>"+
			"<div class='col-md-4' hidden>"+
			"<label>Landline ID #:</label>"+
			"<input type='text' id='community_landline_id_"+community_input_count_landline+"' class='form-control' value='' disabled>"+
			"</div>"+
			"<div class='col-md-6'>"+
			"<div class='form-group hideable'>"+
			"<label class='control-label' for='community_landline_remarks_"+community_input_count_landline+"'>Remarks</label>"+
			"<input type='text' class='form-control' id='community_landline_remarks_"+community_input_count_landline+"' name='community_landline_remarks_"+community_input_count_landline+"' required/>"+
			"</div>"+
			"</div>"+
			"</div>");
			community_input_count_landline +=1;
		} else {
			$.notify("Reach the maximum entry for landline number", "warn");
		}
		
	});
}

function submitEmployeeInformation () {
	const save_type = $("#settings-cmd").val();
	let message_type = null;
	let team_inputted = $("#team_ec").val();
	let email_inputted = $("#email_ec").val();
	let mobile_numbers = [];
	let landline_numbers = [];

	//for mobile number
	const employee_mobile = $("#mobile-div :input").length / 4;
	for (let counter = 1; counter < employee_input_count; counter +=1) {
		const mobile_number_raw = {
			"user_id": $("#user_id_ec").val(),
			"mobile_id": $("#employee_mobile_id_"+counter).val(),
			"mobile_number": $("#employee_mobile_number_"+counter).val(),
			"mobile_status": $("#employee_mobile_status_"+counter).val(),
			"mobile_priority": $("#employee_mobile_priority_"+counter).val()
		};
		mobile_numbers.push(mobile_number_raw);
	}
	
	//for landline number
	for (let counter = 1; counter < employee_input_count_landline; counter +=1) {
		const landline_number_raw = {
			"user_id": $("#user_id_ec").val(),
			"id": $("#employee_landline_id_"+counter).val(),
			"landline_number": $("#employee_landline_number_"+counter).val(),
			"landline_remarks": $("#employee_landline_remarks_"+counter).val()
		};
		landline_numbers.push(landline_number_raw);
	}

	contact_data = {
		"id": $("#user_id_ec").val(),
		"salutation": $("#salutation_ec").val(),
		"firstname": $("#firstname_ec").val(),
		"middlename": $("#middlename_ec").val(),
		"lastname": $("#lastname_ec").val(),
		"nickname": $("#nickname_ec").val(),
		"birthdate": $("#birthdate_ec").val(),
		"gender": $("#gender_ec").val(),
		"contact_active_status": $("#active_status_ec").val(),
		"teams": team_inputted,
		"email_address": email_inputted,
		"numbers": mobile_numbers,
		"landline": landline_numbers
	}

	console.log(contact_data);
	
	if (save_type === "updatecontact") {
		message_type = "updateDewslContact";
	}else {
		message_type = "newDewslContact";
	}

	message = {
		type: message_type,
		data: contact_data
	}
	$('#emp-response-contact-container_wrapper').show();
	$('#employee-contact-wrapper').hide();
	
	// console.log(mobile_numbers);
	wss_connect.send(JSON.stringify(message));
}

function submitCommunityContactForm (sites, organizations) {
	const save_type = $("#settings-cmd").val();
	let message_type = null;
	let mobile_numbers = [];
	let landline_numbers = [];

	//for mobile number
	for (let counter = 1; counter < community_input_count; counter +=1) {
		const mobile_number_raw = {
			"user_id": $("#user_id_cc").val(),
			"mobile_id": $("#community_mobile_id_"+counter).val(),
			"mobile_number": $("#community_mobile_number_"+counter).val(),
			"mobile_status": $("#community_mobile_status_"+counter).val(),
			"mobile_priority": $("#community_mobile_priority_"+counter).val()
		};
		mobile_numbers.push(mobile_number_raw);
	}

	//for landline number
	for (let counter = 1; counter < community_input_count_landline; counter +=1) {
		const landline_number_raw = {
			"user_id": $("#user_id_cc").val(),
			"landline_id": $("#community_landline_id_"+counter).val(), 
			"landline_number": $("#community_landline_number_"+counter).val(),
			"landline_remarks": $("#community_landline_remarks_"+counter).val()
		};
		landline_numbers.push(landline_number_raw);
	}

	contact_data = {
		"user_id": $("#user_id_cc").val(),
		"salutation": $("#salutation_cc").val(),
		"firstname": $("#firstname_cc").val(),
		"middlename": $("#middlename_cc").val(),
		"lastname": $("#lastname_cc").val(),
		"nickname": $("#nickname_cc").val(),
		"birthdate": $("#birthdate_cc").val(),
		"gender": $("#gender_cc").val(),
		"contact_active_status": $("#active_status_cc").val(),
		"ewi_recipient": $("#ewirecipient_cc").val(),
		"numbers": mobile_numbers,
		"landline": landline_numbers,
		"sites": site_selected,
		"organizations": organization_selected
	}

	// console.log(contact_data);

	if (save_type === "updatecontact") {
		message_type = "updateCommunityContact";
	}else {
		message_type = "newCommunityContact";
	}

	const message = {
		type: message_type,
		data: contact_data
	}

	$('#comm-response-contact-container_wrapper').show();
	$('#community-contact-wrapper').hide();

	wss_connect.send(JSON.stringify(message));
}

function emptyEmployeeContactForm () {
	$("#user_id_ec").val(0);
	$("#salutation_ec").val("");
	$("#firstname_ec").val("");
	$("#middlename_ec").val("");
	$("#lastname_ec").val("");
	$("#nickname_ec").val("");
	$("#birthdate_ec").val("");
	$("#gender_ec").val("");
	$("#active_status_ec").val(1);
	$("#mobile-div").empty();
	$('#email_ec').tagsinput('removeAll');
	$('#team_ec').tagsinput('removeAll');
	employee_input_count = 1;
}

function emptyCommunityContactForm () {
	$("#user_id_cc").val(0);
	$("#salutation_cc").val("");
	$("#firstname_cc").val("");
	$("#middlename_cc").val("");
	$("#lastname_cc").val("");
	$("#nickname_cc").val("");
	$("#birthdate_cc").val("");
	$("#gender_cc").val("");
	$("#active_status_cc").val("");
	$("#ewirecipient_cc").val("");
	$("#mobile-div-cc").val("");
	$("#landline-div-cc").val("");
	community_input_count = 1;
}

function contactSettingsFeedback (status) {
	if (status.status == true) {
		$.notify(status.return_msg,'success');
	} else {
		$.notify(status.return_msg,'warn');
	}
}

function initializeOnAvatarClickForTagging() {
	$(".chat-message").on("click","#messages .user-avatar",function(){
		$("#gintag_selected").tagsinput('removeAll');
		$("#gintag-modal").modal({backdrop: 'static', keyboard: false});
		message_details = null;
		tag_container = $(this).closest("li.clearfix");
		message_details = $(this).closest("li.clearfix").find("input[class='msg_details']").val().split('<split>');
		console.log(message_details);
		const gintag_selected = $("#gintag_selected").tagsinput("items");
		user = message_details[2].split(" ");
		getSmsTags(message_details[0],message_details[1]);
	});
}

function getSmsTags (sms_id, mobile_id) {
	const message = {
		type: "getSmsTags",
		data: sms_id,
		mobile_id: mobile_id
	}

	wss_connect.send(JSON.stringify(message));
}

function initializeEWITemplateModal() {
	$("#btn-ewi").click(function() {
		$("#alert-lvl").empty();
        $("#sites").empty();
        $("#alert_status").empty();
        $("#alert_lvl").empty();
        $("#internal_alert").empty();

        $("#alert_status").append($("<option>", {
            value: "------------",
            text: "------------"
        }));

        const alert_status = {
        	type: "getAlertStatus"
        };
        wss_connect.send(JSON.stringify(alert_status));
	});
}

function initializeOnClickConfirmTagging () {
	$("#confirm-tagging").on("click", ({ currentTarget }) => {
		const gintag_selected = $("#gintag_selected").tagsinput("items");
		temp_important_tag = [];
		const important = [];
		const new_tag = [];
		if (gintag_selected.length === 0 ) {
			$("#gintag_warning_message").show(300).effect("shake");
		} else {
			$("#gintag_warning_message").hide(300);
			gintag_selected.forEach(function(selected) {
				const [result] = important_tags.filter(tags => tags === selected);
				if(typeof result === "undefined") {
					new_tag.push(selected);
				}else {
					important.push(result);
				}
			});

			if (new_tag.length > 0){
				addNewTags(message_details, new_tag, false, recipient_container, site_code);
			}

			if(important.length > 0){
				console.log("tag and open narrative modal");
				$("#narrative-modal").modal({backdrop: 'static', keyboard: false});
				$("#gintag-modal").modal("hide");
				temp_important_tag = important;
				$("#narrative_message").empty();
				$("#narrative_message").append(
					"Contact(s) to be tagged: " + "&#013;&#010;"+ 
					"Timestamp: " + message_details[3] + "&#013;&#010;&#013;&#010;&#013;&#010;" +
					message_details[4] + "&#013;&#010;"
				);
			}
		}
	});
}

function addNewTags (message_details, new_tag, is_important, site_code, recipient_container = []) {
	console.log("success tagging new tag");
	$("#gintag-modal").modal("hide");
	let details_data = {};
	if (recipient_container.length == 0) {
		details_data = {
			"user_id": message_details[1],
			"sms_id": message_details[0],
			"tag": new_tag,
			"full_name": message_details[2],
			"ts": message_details[3],
			"time_sent": moment(message_details[3]).format("h:00"),
			"msg": message_details[4],
			"account_id": current_user_id,
			"tag_important": is_important,
			"site_code" : site_code
		};
	} else {
		details_data = {
			"recipients": recipient_container,
			"tag": new_tag,
			"sms_id": message_details[0],
			"full_name": message_details[2],
			"ts": message_details[3],
			"time_sent": moment(message_details[3]).format("h:00"),
			"msg": message_details[4],
			"account_id": current_user_id,
			"tag_important": is_important,
			"site_code" : site_code
		};
	}

	console.log(details_data);
	const message = {
		type: "gintaggedMessage",
		data: details_data
	}
	wss_connect.send(JSON.stringify(message));
}

function initializeOnClickConfirmNarrative () {

	$("#save-narrative").click(function(event){

		let sites_selected = [];
		$(".sites-to-tag input:checked").each(function() {
		    sites_selected.push($(this).closest('label').text());
		});

		if (message_details[2] != "You") {
			addNewTags(message_details, temp_important_tag, true, sites_selected);
		} else {
			addNewTags(message_details, temp_important_tag, true, sites_selected, recipient_container);
		}
	});
}

function displayConversationTaggingStatus (status) {
	if (status == true) {
		$.notify("Successfully tagged message", "success");
		$("#gintag-modal").modal("hide");
		$("#narrative-modal").modal("hide");
		tag_container.addClass("tagged");
	} else {
		$.notify("Failed to tag message", "error");
	}

}

function displayConversationTags (conversation_tags) {
	if(conversation_tags.length > 0){
		$("#gintag_selected").tagsinput('removeAll');
		conversation_tags.forEach(function(tag) {
			$("#gintag_selected").tagsinput("add", tag);
		});
	}else {
		$("#gintag_selected").tagsinput('removeAll');
		conversation_tags.forEach(function(tag) {
			$("#gintag_selected").tagsinput("add", tag);
		});
	}
}

function displaySitesToTag(sites) {
	console.log(sites);
	$("#tag_sites").empty();
	for (var i = 0; i < sites.length; i++) {
		sitename = sites[i].site_code;
		site_id = sites[i].site_id;
		if (i == 0) {
			$("#tag_sites").append('<div class="checkbox col-xs-2"><label class="sites-to-tag"><input name="sitenames" type="checkbox" value="'+site_id+'" checked>'+sitename.toUpperCase()+'</label></div>');
		} else {
			$("#tag_sites").append('<div class="checkbox col-xs-2" style="margin-top: 10px;"><label class="sites-to-tag"><input name="sitenames" type="checkbox" value="'+site_id+'" checked>'+sitename.toUpperCase()+'</label></div>');
		}
	}
}

function initializeAlertStatusOnChange() {
	$("#alert_status").on("change", function () {
        const alert_request = {
        	type: "getEWITemplateSettings",
        	data: $(this).val()
        }
        wss_connect.send(JSON.stringify(alert_request));
    });
}
function initializeQuickSearchModal () {
	$('#btn-gbl-search').click(function(){
		$("search-global-result").empty();
		$("#quick-search-modal").modal({backdrop: 'static', keyboard: false});
	});
}


function initializeSearchViaOption() {
	$("#search-via").on("change",function() {
		let search_via = $(this).val();
		switch(search_via) {
			case "messages":
				$("#search-keyword").attr("placeholder", "E.g Magandang Umaga");
				break;
			case "gintags":
				$("#search-keyword").attr("placeholder", "E.g #EwiResponse");
				break;
			case "unknown":
				$("#search-keyword").attr("placeholder", "E.g 09999999999");
				break;
			default:
				$("#search-keyword").attr("placeholder", "Select search type.");
				break;
		}
	});
}
function initializeQuickSearchMessages () {
	$('#submit-search').click(function(){
		$('#chatterbox-loader-modal').modal({backdrop: 'static', keyboard: false});
		const search_via = $("#search-via").val();
		const search_key = $("#search-keyword").val();
		const search_limit = $("#search-limit").val();
		let request = null;
		switch(search_via) {
			case "messages":
				request = {
					type: "searchMessageGlobal",
					searchKey: search_key,
					searchLimit: search_limit
				}
				break;
			case "gintags":
				request = {
					type: "searchGintagMessages",
					searchKey: search_key,
					searchLimit: search_limit
				}
				break;
			case "ts_sent":
				request = {
					type: "searchViaTsSent",
					searchKey: search_key,
					searchLimit: search_limit
				}
				break;
			case "ts_written":
				request = {
					type: "searchViaTsWritten",
					searchKey: search_key,
					searchLimit: search_limit
				}
				break;
			case "unknown":
				request = {
					type: "searchViaUnknownNumber",
					searchKey: search_key,
					searchLimit: search_limit
				}
				break;
		}
		wss_connect.send(JSON.stringify(request));
	});
}

function initializeClearQuickSearchInputs () {
	$('#clear-search').click(function(){
		$("#search-limit").val("");
		$("#search-keyword").val("");
	});
}

function initializeConfirmEWITemplateViaChatterbox() {
	$("#confirm-ewi").click(() => {
        let samar_sites = ["jor", "bar", "ime", "lpa", "hin", "lte", "par", "lay"];
        if ($("#rainfall-sites").val() !== "#") {
            let rain_info_template = "";
            if ($("#rainfall-cummulative").val() == "1d") {
                rain_info_template = `1 day cumulative rainfall as of ${$("#rfi-date-picker input").val()}: `;
            } else {
                rain_info_template = `3 day cumulative rainfall as of ${$("#rfi-date-picker input").val()}: `;
            }
            $.ajax({
                url: "../rainfall_scanner/getRainfallPercentages",
                dataType: "json",
                success (result) {
		    	let data = JSON.parse(result);
		    	for (let counter = 0; counter < samar_sites.length; counter++) {
		    	 	for (let sub_counter = 0; sub_counter < data.length; sub_counter++) {
		    	 		if (data[sub_counter].site_code == samar_sites[counter]) {
		    	 			if ($("#rainfall-cummulative").val() == "1d") {
	    		 				rainfall_percent = parseInt((data[sub_counter]["1D cml"] / data[sub_counter]["half of 2yr max"]) * 100);
		    	 			} else {
		    	 				rainfall_percent = parseInt((data[sub_counter]["3D cml"] / data[sub_counter]["2yr max"]) * 100);
		    	 			}
		    	 			rain_info_template = `${rain_info_template} ${data[sub_counter].site_code} = ${rainfall_percent}%,\n`;
		    	 		}
		    	 	}
		    	 }
		        
			for (let counter = 0; counter < samar_sites_details.length; counter++ ) {
                		let sbmp = `${samar_sites_details[counter].sitio}, ${samar_sites_details[counter].barangay}, ${samar_sites_details[counter].municipality}`;
                		let formatSbmp = sbmp.replace("null", "");
                		if (formatSbmp.charAt(0) == ",") {
                	    		formatSbmp = formatSbmp.substr(1);
                		}
                		rain_info_template = rain_info_template.replace(samar_sites_details[counter].site_code, formatSbmp);
            		}
			$("#msg").val(rain_info_template);
		}
		});
	} else if ($("#ewi-date-picker input").val() == "" || $("#sites").val() == "") {
            alert("Invalid input, All fields must be filled");
        } else {
        	let template_container = {
				site_name: $("#sites").val(),
                internal_alert: $("#internal-alert").val() == "------------" ? "N/A" : $("#internal-alert").val(),
                alert_level: $("#alert-lvl").val() == "------------" ? "N/A" : $("#alert-lvl").val(),
                alert_status: $("#alert_status").val() == "------------" ? "N/A" : $("#alert_status").val(),
                formatted_data_timestamp: moment($("#ewi-date-picker input").val()).format('MMMM D, YYYY h:MM A'),
                data_timestamp: $("#ewi-date-picker input").val()
        	};
        	
            let template_request = {
            	type: "fetchTemplateViaLoadTemplateCbx",
                data: template_container
            };
            wss_connect.send(JSON.stringify(template_request));
        }
    });
}

function initializeLoadSearchedKeyMessage() {
	$(document).on("click", "#search-global-result li", function () {
        let data = ($(this).closest("li")).find("input[id='msg_details']").val().split("<split>");
        let msg_data = {
        	sms_id: data[0],
        	sms_msg: data[1],
        	ts: data[2],
        	mobile_id: data[4],
        	table_source: data[3]
        };
        console.log(msg_data);
        const search_request = {
        	type: "loadSearchedMessageKey",
        	data: msg_data
        };
        wss_connect.send(JSON.stringify(search_request));
        $(".recent_activities").hide();
        $("#quick-search-modal").modal("hide");
    });
}

function initializeEmployeeContactGroupSending() {
	$("#emp-grp-flag").click(function() {
        const employee_teams = {
        	type: "fetchTeams"
        };
    	wss_connect.send(JSON.stringify(employee_teams));
	});
}

function initializeSemiAutomatedGroundMeasurementReminder() {
    $("#btn-automation-settings").on("click",function() {
    	$("#gnd-meas-category").val("event");
        let special_case_length = $(".special-case-template").length;
        special_case_num = 0;
        for (let counter = special_case_length-1; counter >=0; counter--) {
            $("#clone-special-case-"+counter).remove();
        }
        var data = {
            type: "getGroundMeasDefaultSettings"
        };
        wss_connect.send(JSON.stringify(data));
    });
}

function initializeGndMeasSettingsCategory() {
	   $("#gnd-meas-category").on("change",function() {
        changeSemiAutomationSettings($(this).val(), ground_meas_reminder_data);
    });
}


function initializeGndMeasSaveButton() {
	    $("#save-gnd-meas-settings-button").on("click",function() {
        let special_case_length = $(".special-case-template").length-1;
        let gnd_sitenames = [];
        let special_case_sites = [];
        let time_of_sending = ground_meas_reminder_data.time_of_sending;
        if (gnd_meas_overwrite == "new") {
            $("input[name=\"gnd-sitenames\"]:checked").each(function () {
                gnd_sitenames.push(this.value);
            });
            if (gnd_sitenames.length == 0) {
            	$.notify('Please check at least one site','error');
            } else if(gnd_sitenames.length > 0){
        		
            	gnd_sitenames = [];
            	if (special_case_length > 0) {
            		for (let counter = 0; counter < special_case_length; counter++) {
	                    special_case_sites = [];
	                    $("input[name=\"gnd-meas-"+counter+"\"]:checked").each(function () {
	                        special_case_sites.push(this.value);
	                        $(".gndmeas-reminder-site-container .gndmeas-reminder-site .checkbox label").find("input[value="+this.value+"]").prop("checked", false);
	                    });

			            let special_case_settings = {
	                        type: "setGndMeasReminderSettings",
	                        send_time: time_of_sending,
	                        sites: special_case_sites,
	                        category: $("#gnd-meas-category").val(),
	                        altered: 1,
	                        template: $("#special-case-message-"+counter).val(),
	                        overwrite: false,
	                        modified: first_name
	                    };
                    	wss_connect.send(JSON.stringify(special_case_settings));
		            }
	            	$.notify('Ground measurement settings saved for special case!','success');
            	}
            	$("input[name=\"gnd-sitenames\"]:checked").each(function () {
	                gnd_sitenames.push(this.value);
	            });

            	let gnd_meas_settings = {
	                type: "setGndMeasReminderSettings",
	                send_time: time_of_sending,
	                sites: gnd_sitenames,
	                altered: 0,
	                category: $("#gnd-meas-category").val(),
	                template: $("#reminder-message").val(),
	                overwrite: false,
	                modified: first_name
	            };
	            wss_connect.send(JSON.stringify(gnd_meas_settings));
            	$.notify('Ground measurement settings saved!','success');
          
            }
            $(".special-case-site-container .gndmeas-reminder-site .checkbox label").closest("input").text();
        } else {
        	let all_settings = ground_meas_reminder_data.settings
                $("input[name=\"gnd-sitenames\"]:checked").each(function () {
                    gnd_sitenames.push(this.value);
                });
                if (gnd_sitenames == 0) {
	            	$.notify('Please check at least one site','error');
	            } else {

	                let gnd_meas_settings = {
	                    type: "setGndMeasReminderSettings",
	                    send_time: time_of_sending,
	                    sites: gnd_sitenames,
	                    altered: 0,
	                    category: $("#gnd-meas-category").val(),
	                    template: $("#reminder-message").text(),
	                    overwrite: true,
	                    modified: first_name
	                };

	                // wss_connect.send(JSON.stringify(gnd_meas_settings));

	                if (special_case_length > 0) {
	                    for (let counter = 0; counter < special_case_length.length; counter++) {
	                        gnd_sitenames = [];
	                        $("input[name=\"gnd-sitenames-"+counter+"\"]:checked").each(function () {
	                            gnd_sitenames.push(this.value);
	                        });

	                        let gnd_meas_settings = {
	                            type: "setGndMeasReminderSettings",
	                            send_time: time_of_sending,
	                            sites: gnd_sitenames,
	                            altered: 1,
	                            category: $("#gnd-meas-category").val(),
	                            template: $("#special-case-message-"+counter).text(),
	                            overwrite: true,
	                            modified: first_name
	                        };
	                        // wss_connect.send(JSON.stringify(gnd_meas_settings));              
	                    }
	                	$.notify('Ground measurement settings saved!','success');
		            } else {
		            	// $.notify('Please check at least on site on special cases','error');
		            }
	            }
            }  
    });
}

function displayGndMeasSavingStatus(status) {
	if(status == true){
		$("#ground-meas-reminder-modal").modal("hide");
	}else {
		$.notify('Something went wrong. Please try again','error');
	}
}

function initializeResetSpecialCasesButtonOnCLick () {
    $("#reset-button").on("click",() => {
        resetSpecialCases();
    });    
}

function resetSpecialCases() {
    // Clear special cases
    $("#gnd-meas-category").val('event');
    let special_case_length = $(".special-case-template").length;
    special_case_num = 0;
    for (let counter = special_case_length-1; counter >=0; counter--) {
        $("#clone-special-case-"+counter).remove();
    }
    resetCaseDiv();
    var data = {
        type: "getGroundMeasDefaultSettings"
    };
    wss_connect.send(JSON.stringify(data));
}

function loadSiteConvoViaQacess() {
    $(document).on("click", "#quick-release-display li", function () {
    	$("#chatterbox-loader-modal").modal("show");
    	let site_names = [$(this).closest("li").find("#site_id").val()];
    	let site_code = [$(this).closest("li").find("#site_code").val().toUpperCase()];
    	conversation_details_label = $(this).closest("li").find(".friend-name").text().toUpperCase();
    	$("#conversation-details").append(conversation_details_label);
    	let convo_request = {
			'type': 'loadSmsForSites',
			'organizations': ['LEWC','BLGU','MLGU','PLGU'],
			'sitenames': site_names,
			'site_code': site_code
		};
		wss_connect.send(JSON.stringify(convo_request));
    });

}
