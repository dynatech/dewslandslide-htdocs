let quick_inbox_registered = [];
let quick_inbox_unregistered = [];
let quick_inbox_event = [];
let quick_inbox_data_logger = [];
let quick_release = [];
let chatterbox_user = "You";
let message_container = [];
let conversation_recipients = [];
let current_user_id = $("#current_user_id").val();
let current_user_name = first_name;
let chatterbox_sms_signature = ` - ${current_user_name} from PHIVOLCS-DYNASLOPE`;

let employee_input_count = 1;
let employee_input_count_landline = 1;
let community_input_count = 1;
let community_input_count_landline = 1;
let latest_conversation_timestamp = "";
let psgc_scope_filter = [0,0,6,4,2];
let important_tags = null;
let conversation_details_label = null;

let quick_inbox_template = Handlebars.compile($('#quick-inbox-template').html());
let quick_unregistered_template = Handlebars.compile($('#quick-unregistered-inbox-template').html());
let event_inbox_template = Handlebars.compile($('#event-inbox-template').html());
let messages_template_both = Handlebars.compile($('#messages-template-both').html());
let selected_contact_template = Handlebars.compile($('#selected-contact-template').html());
let quick_release_template = Handlebars.compile($('#quick-release-template').html());
let search_key_template = Handlebars.compile($('#search-message-key-template').html());

let special_case_num = 0;
let special_case_id = 0;
let site_count = 0;

Handlebars.registerHelper('breaklines', function(text) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Handlebars.SafeString(text);
});


function getQuickGroupSelection () {
	getQuickCommunitySelection();
	// getQuickEmployeeSelection();
}

function getQuickCommunitySelection () {
	try {
		let list_of_sites = {
			'type': "qgrSites"
		}

		let list_of_orgs = {
			'type': "qgrOrgs"
		}

		wss_connect.send(JSON.stringify(list_of_sites));
		wss_connect.send(JSON.stringify(list_of_orgs));
	} catch(err) {
		console.log(err);
		// Add PMS here
	}

}

function getEmployeeContact(){
	try {
		let employee_details = {
			'type': 'loadAllDewslContacts'
		};
		wss_connect.send(JSON.stringify(employee_details));
	} catch(err) {
		console.log(err);
		// Add PMS here
	}
}

function getCommunityContact(){
	try {
		let community_details = {
			'type': 'loadAllCommunityContacts'
		};
		wss_connect.send(JSON.stringify(community_details));
	} catch(err) {
		console.log(err);
		// Add PMS here
	}
}

function displaySitesSelection(data) {
	let sitenames = data;
	let sitename, site_id, psgc;
	
	for (var i = 0; i < sitenames.length; i++) {
		var modIndex = i % 6;
		$("#sitenames-"+i).empty();

		sitename = sitenames[i].site_code;
		site_id = sitenames[i].site_id;
		psgc = sitenames[i].psgc_source;
		$("#sitenames-"+modIndex).append('<div class="checkbox"><label class="site_code"><input name="sitenames" id="id_'+psgc+'" type="checkbox" value="'+site_id+'">'+sitename.toUpperCase()+'</label></div>');
	}
}

function startConversation(details) {
	$('#chatterbox-loader-modal').modal({backdrop: 'static', keyboard: false});
	try {
		let convo_details = {
			type: 'loadSmsConversation',
			data: details
		};
		wss_connect.send(JSON.stringify(convo_details));
	} catch(err) {
		console.log(err);
		// Add PMS here
	}	
}

function displayQuickInboxMain(msg_data) {
	try {
		try {
			for (let counter = 0; counter < msg_data.length; counter++) {
				if(msg_data[counter].isunknown == 1){
					console.log("has unknown");
				}
				msg_data[counter].isunknown = 0;
				quick_inbox_registered.unshift(msg_data[counter]);
			}
			
		} catch(err) {
			console.log(err);
		}

		quick_inbox_html = quick_inbox_template({'quick_inbox_messages': quick_inbox_registered});

		$("#quick-inbox-display").html(quick_inbox_html);
		$("#quick-inbox-display").scrollTop(0);
	} catch (err) {
		console.log(err);
		//Add PMS here
	}
}

function displayUnregisteredInboxMain(msg_data) {
	console.log(msg_data);
	try {
		try {
			for (let counter = 0; counter < msg_data.length; counter++) {
				quick_inbox_unregistered.push(msg_data[counter]);
			}
			
		} catch(err) {
			console.log(err);
		}

		quick_inbox_html = quick_unregistered_template({'quick_unregistered_inbox_messages': quick_inbox_unregistered});

		$("#quick-unregistered-inbox-display").html(quick_inbox_html);
		$("#quick-unregistered-inbox-display").scrollTop(0);
	} catch (err) {
		console.log(err);
	}
}

function updateLatestPublicRelease (msg) {
    try {
    	quick_release.unshift(msg);
        var quick_release_html = quick_release_template({ quick_release });
        $("#quick-release-display").html(quick_release_html);
        $("#quick-release-display").scrollTop(0);

    } catch (err) {
        console.log(err.message)
    }
}

function displayNewSmsQuickInbox(msg_data) {
	let new_inbox = [];

	for (let counter = 0; counter < msg_data.length; counter++) {
		for (let sub_counter = 0; sub_counter < inbox_container.length; sub_counter++) {
			if (inbox_container[sub_counter].full_name != msg_data[counter].full_name) {
				new_inbox.push(inbox_container[sub_counter]);
			}
		}
		new_inbox.push(msg_data[counter]);
	}

	try {
		try {
			for (let counter = 0; counter < new_inbox.length; counter++) {
				new_inbox[counter].isunknown = 0;
				quick_inbox_registered.unshift(new_inbox[counter]);
			}
			
		} catch(err) {
			console.log(err);
		}

		quick_inbox_html = quick_inbox_template({'quick_inbox_messages': quick_inbox_registered});
		$("#quick-inbox-display").html(quick_inbox_html);
		$("#quick-inbox-display").scrollTop(0);
	} catch (err) {
		console.log(err);
		//Add PMS here
	}
}

function displayOrgSelection(data){
	let offices = data;
	let office, office_id;

	for (var i = 0; i < offices.length; i++) {
		var modIndex = i % 5;
		$("#offices-"+i).empty();
		office = offices[i].org_name;
		office_id = offices[i].org_id;
		$("#offices-"+modIndex).append('<div class="checkbox"><label><input type="checkbox" id="id_'+office+'" name="orgs" class="form-group" value="'+office+'">'+office.toUpperCase()+'</label></div>');
	}
}

function displayContactSettingsMenu() {
	$('#employee-contact-wrapper').prop('hidden', true);
	$('#community-contact-wrapper').prop('hidden', true);
	$('#comm-response-contact-container_wrapper').prop('hidden',true);
	$('#emp-response-contact-container_wrapper').prop('hidden',true);
	$('#update-contact-container').prop('hidden',true);
	$('#contact-result').remove();
	// fetchSiteAndOffice();
}

function displayDataTableCommunityContacts(cmmty_contact_data){
	// console.log(cmmty_contact_data);
	$('#comm-response-contact-container').empty();
	$('#comm-response-contact-container').DataTable({
		destroy: true,
		data: cmmty_contact_data,
		columns: [
		{ "data": "user_id", "title": "User ID"},
		{ "data": "salutation", "title": "Salutation" },
		{ "data": "firstname", "title": "Firstname"},
		{ "data": "lastname", "title": "Lastname"},
		{ "data": "middlename", "title": "Middlename"},
		{ "data": "active_status", "title": "Active Status"}
		]
	});
	$('#comm-response-contact-container').prop('hidden',false);
}

function displayDataTableEmployeeContacts(dwsl_contact_data) {
	$('#emp-response-contact-container').empty();
	$('#emp-response-contact-container').DataTable({
		destroy: true,
		data: dwsl_contact_data,
		columns: [
		{ "data": "user_id", "title": "User ID"},
		{ "data": "firstname", "title": "Firstname"},
		{ "data": "lastname", "title": "Lastname"},
		{ "data": "team", "title": "Team"},
		{ "data": "active_status", "title": "Active Status"}
		]
	});
	$('#emp-response-contact-container').prop('hidden',false);
}

function displayDataTableUnregisteredContacts (unregistered_data){
	$('#unregistered-contact-container').empty();
	$('#unregistered-contact-container').DataTable({
		destroy: true,
		data: unregistered_data,
		columns: [
		{ "data": "mobile_id", "title": "Mobile ID"},
		{ "data": "sms_id", "title": "SMS ID"},
		{ "data": "full_name", "title": "Label"},
		{ "data": "network", "title": "Network"},
		{ "data": "user_number", "title": "Mobile Number"},
		{ "data": "ts_received", "title": "Timestamp Received"}
		]
	});
	$('#unregistered-contact-container').prop('hidden',false);
}

function displaySiteSelection (sites,psgc_source = []) {
	var column_count = 6; // 6 rows 
	$('#new-site').remove();
	for (var counter = 0; counter < column_count; counter++) {
		$('#sitenames-cc-'+counter).empty();
	}
	// console.log(psgc_source[1].psgc);
	for (var i = 0; i < sites.length; i++) {
		var modIndex = i % 6;
		var site = sites[i];
		$("#sitenames-cc-"+modIndex).append('<div class="checkbox"><label><input type="checkbox" id="id_'+site.psgc_source+'" name="sites" class="form-group site-checkbox" value="'+site.site_code+'">'+site.site_code.toUpperCase()+'</label></div>');

		for (var counter = 0; counter < psgc_source.length; counter++) {
			// TODO : OPTIMIZE BETTER LOGIC FOR THIS.
			if (psgc_source[counter].org_psgc_source.length < 9) {
				psgc_source[counter].org_psgc_source = "0"+psgc_source[counter].org_psgc_source;
				psgc_source[counter].org_psgc_source = psgc_source[counter].org_psgc_source.substring(0,psgc_source[counter].org_psgc_source.length - psgc_scope_filter[parseInt(psgc_source[counter].org_scope)]);
				psgc_source[counter].org_psgc_source = psgc_source[counter].org_psgc_source.substring(1);
				var flagger = parseInt(8 - psgc_source[counter].org_psgc_source.length);
				for (var psgc_filter_counter = 0; psgc_filter_counter < flagger;psgc_filter_counter++) {
					psgc_source[counter].org_psgc_source = psgc_source[counter].org_psgc_source+"0";
				}
			} else {
				var flagger = parseInt(8 - psgc_source[counter].org_psgc_source.length);
				psgc_source[counter].org_psgc_source = psgc_source[counter].org_psgc_source.substring(0,psgc_source[counter].org_psgc_source.length - psgc_scope_filter[parseInt(psgc_source[counter].org_scope)]);
				for (var psgc_filter_counter = 0; psgc_filter_counter < flagger;psgc_filter_counter++) {
					psgc_source[counter].org_psgc_source = psgc_source[counter].org_psgc_source+"0";
				}
			}

			if (psgc_source[counter].site_code.toLowerCase() == site.site_code) {
				console.log(psgc_source[counter].site_code +"|"+ site.site_code);
				$("#sitenames-cc-"+modIndex).find(".checkbox").find("[value="+site.site_code+"]").prop('checked',true);
			}
		}
	}
	$('<div id="new-site" class="col-md-12"><a href="#" id="add-site"><span class="glyphicon glyphicon-info-sign"></span>&nbsp;Site not on the list?</a></div>').appendTo('#site-accord .panel-body');
}

function displayOrganizationSelection (orgs,user_orgs = []) {
	var column_count = 7;
	$('#new-org').remove();
	for (var counter = 0; counter < column_count; counter++) {
		$('#orgs-cc-'+counter).empty();
	}

	for (var i = 0; i < orgs.length; i++) {
		let modIndex = i % 7;
		let org = orgs[i];
		let formatted_office_id = org.org_name.replace(": ", "_");
		$("#orgs-cc-"+modIndex).append('<div class="checkbox"><label><input type="checkbox" id="id_'+formatted_office_id+'" name="orgs" class="form-group organization-checkbox" value="'+org.org_name+'">'+org.org_name.toUpperCase()+'</label></div>');
		for (var counter = 0; counter < user_orgs.length; counter++) {
			if (user_orgs[counter].org_name.toUpperCase() == org.org_name.toUpperCase()) {
				let formatted_office_value = org.org_name.replace(": ", "_");
				$("#orgs-cc-"+modIndex).find(".checkbox").find("#id_"+formatted_office_value).prop('checked',true);
			}
		}
	}
	$('<div id="new-org" class="col-md-12"><a href="#" id="add-org"><span class="glyphicon glyphicon-info-sign"></span>&nbsp;Organization not on the list?</a></div>').appendTo('#organization-selection-div');
}

function displayConversationPanel(msg_data, full_data, recipients, titles, isOld = false) {
	conversation_recipients = [];
	last_outbox_ts = null;
	last_inbox_ts = null;

	recipients.forEach(function(user){
		conversation_recipients.push(user.user_id);
	});

	if (isOld == false) {
		$("#messages").empty();
		$("#conversation-details").empty();
		if(full_data === undefined){
			$("#conversation-details").append(conversation_details_label);
		}else {
			$("#conversation-details").append(full_data);
		}

		$(".recent_activities").addClass("hidden");
		$("#main-container").removeClass("hidden");
		message_container = [];
		recipient_container = [];
		msg_data.reverse();
	}	
    $("#messages").empty();
    $("#conversation-details").empty();
    $("#recent-activity-panel").hide(400);
    $("#conversation-panel").show(400);
	if(full_data === undefined){
		$("#conversation-details").append(conversation_details_label);
	}else {
		$("#conversation-details").append(full_data);
	}

	recipients.forEach(function(mobile_data){
		if (recipient_container.includes(mobile_data.mobile_id) != true) {recipient_container.push(mobile_data.mobile_id);}
	});
	
	let counter = 0;
	msg_data.forEach(function(data) {
		if (titles != null) {
			let title_container = titles[counter].split("<split>");
			let title_holder = "";
			for (let sub_counter = 0; sub_counter < title_container.length; sub_counter++) {
				title_holder = title_holder+title_container[sub_counter]+"\n";
			}
			data.title = title_holder;		
		}
		if (data.network == "GLOBE") {
			data.isGlobe = true;
		} else {
			data.isGlobe = false;
		}
		displayUpdatedMessages(data, isOld);
		counter++;
	});
}

function displayUpdatedMessages(data, isOld = false) {
	latest_conversation_timestamp = data.ts_written;
	data.ts_received == null ? data.isYou = 1 : data.isYou = 0;
	setLastTs(isOld, data);
	data.sms_msg = data.sms_msg.replace(/\n/g, "<br />");
	message_container.unshift(data);
	messages_html = messages_template_both({'messages': message_container});
	let html_string = $('#messages').html();
	if (isOld == false) {
		$('#messages').html(html_string+messages_html);
		$('.chat-message').scrollTop($('#messages').height());
	} else {
		console.log($('#messages').height());
		$('.chat-message').scrollTop($('#messages').height()/2);
		$('#messages').html(messages_html+html_string);
	}
	message_container = [];
}

function setLastTs(isOld, data) {
	if (isOld == true) {
		if (data.isYou == 1) {
			last_outbox_ts = data.ts_written;
		}

		if (data.isYou == 0) {
			last_inbox_ts = data.ts_received;
		}
	} else {
		if (last_outbox_ts == null) {
			if (data.isYou == 1) {
				last_outbox_ts = data.ts_written;
			}
		}

		if (last_inbox_ts == null) {
			if (data.isYou == 0) {
				last_inbox_ts = data.ts_received;
			}
		}
	}
}

function displayAddEmployeeContactMessage (msg_data) {
	if(msg_data.status === true) {
		$.notify(msg_data.return_msg, "success");
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
		$("#landline-div").empty();
		employee_input_count = 1;
		employee_input_count_landline = 1;
	}else {
		$.notify(msg_data, "warn");
	}
}

function displayAddCommunityContactMessage (msg_data) { // LOUIE - new code
	if(msg_data.status === true) {
		$.notify(msg_data.return_msg, "success");
		$("#user_id_cc").val(0);
		$("#salutation_cc").val("");
		$("#firstname_cc").val("");
		$("#middlename_cc").val("");
		$("#lastname_cc").val("");
		$("#nickname_cc").val("");
		$("#birthdate_cc").val("");
		$("#gender_cc").val("");
		$("#active_status_cc").val(1);
		$("#ewi_status").val(0);
		$("#mobile-div-cc").empty();
		$("#landline-div").empty();
		$("#settings-cmd").val('updatecontact').change();
		community_input_count = 1;
		community_input_count_landline = 1;
	}else {
		$.notify(msg_data, "warn");
	}
}

function displayUpdateEmployeeDetails (employee_data) {
	console.log(employee_data);
	$("#user_id_ec").val(employee_data.contact_info.id);
	$("#salutation_ec").val(employee_data.contact_info.salutation);
	$("#firstname_ec").val(employee_data.contact_info.firstname);
	$("#middlename_ec").val(employee_data.contact_info.middlename);
	$("#lastname_ec").val(employee_data.contact_info.lastname);
	$("#nickname_ec").val(employee_data.contact_info.nickname);
	$("#birthdate_ec").val(employee_data.contact_info.birthday);
	$("#gender_ec").val(employee_data.contact_info.gender);
	$("#active_status_ec").val(employee_data.contact_info.contact_active_status);
	$("#email_ec").tagsinput('removeAll');
	$("#team_ec").tagsinput('removeAll');
	for (let counter = 0; counter < employee_data.email_data.length; counter++) {
		$('#email_ec').tagsinput('add',employee_data.email_data[counter].email);
	}

	for (let counter = 0; counter < employee_data.team_data.length; counter+=1) {
		$('#team_ec').tagsinput('add',employee_data.team_data[counter].team_name);
	}

	for (let counter = 0; counter < employee_data.mobile_data.length; counter+=1) {
		if(employee_data.mobile_data[counter].number != null){
			const number_count = counter + 1;
			const mobile_data = {
				"mobile_number" : employee_data.mobile_data[counter].number,
				"mobile_status" : employee_data.mobile_data[counter].number_status,
				"mobile_priority" : employee_data.mobile_data[counter].priority,
				"mobile_id" : employee_data.mobile_data[counter].number_id
			}
			appendContactForms("Mobile", number_count, "employee_mobile", mobile_data);
		}
		
	}

	for (let counter = 0; counter < employee_data.landline_data.length; counter+=1) {
		if(employee_data.landline_data[counter].landline_number != null){
			const number_count = counter + 1;
			const landline_data = {
				"landline_number" : employee_data.landline_data[counter].landline_number,
				"landline_remarks" : employee_data.landline_data[counter].landline_remarks,
				"landline_id" : employee_data.landline_data[counter].landline_id
			}
			appendContactForms("Landline", number_count, "employee_landline", landline_data);
		}
	}
}
  
function displayUpdateCommunityDetails (community_data) {
	// console.log(community_data);
	let user_orgs = [];
	$("#user_id_cc").val(community_data.contact_info.id);
	$("#salutation_cc").val(community_data.contact_info.salutation);
	$("#firstname_cc").val(community_data.contact_info.firstname);
	$("#middlename_cc").val(community_data.contact_info.middlename);
	$("#lastname_cc").val(community_data.contact_info.lastname);
	$("#nickname_cc").val(community_data.contact_info.nickname);
	$("#birthdate_cc").val(community_data.contact_info.birthday);
	$("#gender_cc").val(community_data.contact_info.gender);
	$("#active_status_cc").val(community_data.contact_info.contact_active_status);
	if (community_data.ewi_data[0].ewi_status === "1") {
		$("#ewirecipient_cc").val(1);
	}else {
		$("#ewirecipient_cc").val(0);
	}

	for (let counter = 0; counter < community_data.mobile_data.length; counter+=1) {
		if(community_data.mobile_data[counter].number != null){
			const number_count = counter + 1;
			const mobile_data = {
				"mobile_number" : community_data.mobile_data[counter].number,
				"mobile_status" : community_data.mobile_data[counter].number_status,
				"mobile_priority" : community_data.mobile_data[counter].priority,
				"mobile_id" : community_data.mobile_data[counter].number_id
			}
			appendContactForms("Mobile", number_count, "community_mobile", mobile_data);
		}
	}

	for (let counter = 0; counter < community_data.landline_data.length; counter+=1) {
		if(community_data.landline_data[counter].landline_number != null){
			const number_count = counter + 1;
			const landline_data = {
				"landline_number" : community_data.landline_data[counter].landline_number,
				"landline_remarks" : community_data.landline_data[counter].landline_remarks,
				"landline_id" : community_data.landline_data[counter].landline_id
			}
			appendContactForms("Landline", number_count, "community_landline", landline_data);
		}
	}

	displaySiteSelection(community_data.list_of_sites, community_data.org_data);
	displayOrganizationSelection(community_data.list_of_orgs, community_data.org_data);
}

function appendContactForms (type, number_count, category, data) {
	let container = "";
	if (category == "employee_mobile") {
		container = "#mobile-div";
	} else if (category == "employee_landline"){
		container = "#landline-div";
	} else if (category == "community_mobile"){
		container = "#mobile-div-cc";
	} else if (category == "community_landline"){
		container = "#landline-div-cc";
	}

	if(number_count === 1) // Empty the container if first append. If not, just continue appending the next contact number.
		$(container).empty();

	if (category == "employee_mobile" || category == "community_mobile") {
		$(container)
		.append(
		"<div class='row'>"+
	    "<div class='col-md-4'>"+
	    "<div class='form-group hideable'>"+
		"<label class='control-label' for='"+category+"_number_"+number_count+"'>"+type+" #:</label>"+
		"<input type='number' class='form-control' id='"+category+"_number_"+number_count+"' name='"+category+"_number_"+number_count+"' value='"+data.mobile_number+"' required/>"+
		"</div>"+
		"</div>"+
		"<div class='col-md-4' hidden>"+
		"<label>"+type+" #:</label>"+
		"<input type='text' id='"+category+"_id_"+number_count+"' class='form-control' value='"+data.mobile_id+"' disabled>"+
		"</div>"+
		"<div class='col-md-4'>"+
		"<div class='form-group hideable'>"+
		"<label class='control-label' for='"+category+"_status_"+number_count+"'>"+type+" # Status:</label>"+
		"<select id='"+category+"_status_"+number_count+"' name='"+category+"_status_"+number_count+"' class='form-control' value='' required>"+
		"<option value='1'>Active</option>"+
		"<option value='0'>Inactive</option>"+
		"</select>"+
		"</div>"+
		"</div>"+
		"<div class='col-md-4'>"+
		"<div class='form-group hideable'>"+
		"<label class='control-label' for='"+category+"_priority_"+number_count+"'>"+type+" # Priority:</label>"+
		"<select id='"+category+"_priority_"+number_count+"' name='"+category+"_priority_"+number_count+"' class='form-control' value='' required>"+
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
		$("#"+category+"_priority_"+number_count).val(data.mobile_priority);
		$("#"+category+"_status_"+number_count).val(data.mobile_status);

	} else if (category == "employee_landline" || category == "community_landline"){
		$(container)
		.append(
		"<div class='row'>"+
	    "<div class='col-md-6'>"+
		"<div class='form-group hideable'>"+
        "<label class='control-label' for='"+category+"_number_"+number_count+"'>"+type+" #</label>"+
		"<input type='number' class='form-control' id='"+category+"_number_"+number_count+"' name='"+category+"_number_"+number_count+"' value='"+data.landline_number+"' required/>"+
		"</div>"+
		"</div>"+
		"<div class='col-md-4' hidden>"+
		"<label>"+type+" ID #:</label>"+
		"<input type='text' id='"+category+"_id_"+number_count+"' class='form-control' value='"+data.landline_id+"' disabled>"+
		"</div>"+
		"<div class='col-md-6'>"+
		"<div class='form-group hideable'>"+
		"<label class='control-label' for='"+category+"_remarks_"+number_count+"'>Remarks</label>"+
		"<input type='text' class='form-control' id='"+category+"_remarks_"+number_count+"' name='"+category+"_remarks_"+number_count+"' value='"+data.landline_remarks+"' required/>"+
		"</div>"+
		"</div>"+
		"</div>");
	}

	if (category == "employee_mobile") {
		employee_input_count += 1;
	} else if (category == "employee_landline"){
		employee_input_count_landline += 1;
	} else if (category == "community_mobile"){
		community_input_count += 1;
	} else if (category == "community_landline"){
		community_input_count_landline += 1;
	}
}

function loadSiteConversation(){
	if (quick_group_selection_flag == true) {
		$("#modal-select-sitenames").find(".checkbox").find("input").prop('checked', false);
		$("#modal-select-offices").find(".checkbox").find("input").prop('checked', false);
		// loadGroupsEmployee();
	} else  if (quick_group_selection_flag == false) {
		$("#modal-select-grp-tags").find(".checkbox").find("value").prop('checked', false);
		siteConversation();
	} else {
		alert('Something went wrong, Please contact the Administrator');
	}
}

function siteConversation(){
	$('#chatterbox-loader-modal').modal({backdrop: 'static', keyboard: false});
	try {
		let tag_offices = [];
		$('input[name="orgs"]:checked').each(function() {
			tag_offices.push($(this).val());
		});

		let tag_sites = [];
		let site_code = [];
		$('input[name="sitenames"]:checked').each(function() {
			tag_sites.push($(this).val());
			site_code.push($(this).closest('label').text());
		});
		tag_sites.sort();

		let convo_request = {
			'type': 'loadSmsForSites',
			'organizations': tag_offices,
			'sitenames': tag_sites,
			'site_code': site_code
		};

		addSitesActivity(convo_request);
		console.log(convo_request);
		wss_connect.send(JSON.stringify(convo_request));
	} catch(err) {
		console.log(err);
		// Add PMS here.
	}

}

function getRoutineMsgFromCBXMain() {
	var routine_msg = $("#routine-msg").val();
	return routine_msg;
}

function sendSms(recipients, message) {
	try {
		let convo_details = {
			type: 'sendSmsToRecipients',
			recipients: recipients,
			message: message + chatterbox_sms_signature
		};
		wss_connect.send(JSON.stringify(convo_details));
	} catch(err) {
		console.log(err);
		// Add PMS here
	}	
}

function updateConversationBubble(msg_response) {
	message_container = [];
	displayUpdatedMessages(msg_response);
	$("#msg").val("");
	$("#msg").text("");
}

function updateSmsInbox(data) {
	data[0].isunknown = 0;
	displayNewSmsQuickInbox(data);
}

function updateSmsConversationBubble(data) {
	if ($.inArray(data[0].user_id,conversation_recipients) != -1 ) {
		let msg_container = {
			user: data[0].full_name,
			convo_id: data[0].sms_id,
			gsm_id: data[0].gsm_id,
			isYou: 0,
			mobile_id: data[0].mobile_id,
			read_status: 0,
			send_status: null,
			sms_msg: data[0].msg,
			timestamp: data[0].ts_received,
			ts_received: data[0].ts_received,
			ts_sent: null,
			web_status: null
		};
		displayUpdatedMessages(msg_container);		
	} 
}

function updateSmsoutboxConversationBubble(data) {
	console.log($("#messages li:last #chat-user").text());
	if ($("#messages li:last #chat-user").text() == "You" && $("#messages li:last #timestamp-written").text() == latest_conversation_timestamp) {
		$("#messages li:last #timestamp-sent").html(data.ts_sent);
	}
}

function displayImportantTags (data , is_loaded = false) {
	if(is_loaded === true) {
		important_tags = data;
		data.join(", ");
		$("#important_tags").empty();
		$("#important_tags").append(data.join(", "));

		$('#gintag_selected').tagsinput({
			typeahead: {
				displayKey: 'text',
				afterSelect: function (val) { this.$element.val(""); },
				source: function (query) {
					return data;
				}
			}
		});
	}
	
}

function displayRoutineTemplate(template) {
	$("#routine-msg").val(template[0].template);
}

function addSitesActivity (sites) {
    $(".recent_activities").hide();

    for (var counter = 0; counter < recent_sites_collection.length; counter++) {
        if (recent_sites_collection[counter].sitenames[0] == sites.sitenames[0]) {
            return 1;
        }
    }

    if (recent_sites_collection.length == 6) {
        recent_sites_collection.shift();
    }
    recent_sites_collection.push(sites);
    localStorage.rv_sites = JSON.stringify(recent_sites_collection);
}

function addContactsActivity (contacts) {
    for (var counter = 0; counter < recent_contacts_collection.length; counter++) {
        if (recent_contacts_collection[counter].data.full_name == contacts.data.full_name) {
            return 1;
        }
    }

    if (recent_contacts_collection.length == 6) {
        recent_contacts_collection.shift();
    }
    recent_contacts_collection.push(contacts);
    localStorage.rv_contacts = JSON.stringify(recent_contacts_collection);
}

function displayEWITemplateOptions(data) {
    for (let counter = 0; counter < data.alert_status.length; counter++) {
        $("#alert_status").append($("<option>", {
            value: data.alert_status[counter].alert_status,
            text: data.alert_status[counter].alert_status
        }));
    }

    for (let counter = 0; counter < data.site_code.length; counter ++) {
        $("#sites").append($("<option>", {
            value: data.site_code[counter].site_code,
            text: data.site_code[counter].site_code.toUpperCase()
        }));
    }
    $("#early-warning-modal").modal("toggle");
}

function displayEWIAlertLvlInternalLvl(data) {
    $("#alert-lvl").empty();
    $("#internal-alert").empty();

    $("#alert-lvl").append($("<option>", {
        value: "------------",
        text: "------------"
    }));

    $("#internal-alert").append($("<option>", {
        value: "------------",
        text: "------------"
    }));

    for (var counter = 0; counter < data.length; counter++) {
        if (data[counter].alert_symbol_level.toLowerCase().indexOf("alert") > -1) {
            $("#alert-lvl").append($("<option>", {
                value: data[counter].alert_symbol_level,
                text: data[counter].alert_symbol_level
            }));
        } else {
            $("#internal-alert").append($("<option>", {
                value: data[counter].alert_symbol_level,
                text: data[counter].alert_symbol_level
            }));
        }
    }
}

function displaySearchedKey(data) {
	if (data != null) {
		data.forEach(function(result_data) {
		console.log(result_data);
		let search_key_container = [];
		result_data.user == "You" ? result_data.isYou = 1 : result_data.isYou = 0;
		search_key_container.unshift(result_data);
		messages_html = search_key_template({'search_messages': search_key_container});
		let html_string = $('#search-global-result').html();
		$('#search-global-result').html(html_string+messages_html);
		search_key_container = [];
	});
	}
}

function displayTemplateInChatbox (data) {
	$("#msg").val("");
	$("#msg").val(data);
}

function displayTeamsGroupSending(data) {
    for (var x = 0; x < 6; x++) {
        var myNode = document.getElementById(`tag-${x}`);
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
    }

    for (var i = 0; i < data.length; i++) {
        var modIndex = i % 4;
        var tag = data[i];
        if (tag != "" || tag != null) {
            $(`#tag-${modIndex}`).append(`<div class="checkbox"><label><input name="tag" type="checkbox" value="${tag}">${tag.toUpperCase()}</label></div>`);
        }
    }
}

function initializeAddSpecialCaseButtonOnClick () {
    $("#add-special-case").click(() => {
        addSpecialCase();
    });
}

function reconstructSavedSettingsForGndMeasReminder(settings, def_event, def_extended, def_routine, all_data) {
	$("#no-site-on-monitoring").hide();
	resetCaseDiv();
    ground_meas_reminder_data = {
        event: def_event,
        extended: def_extended,
        routine: def_routine,
        settings: settings,
        template: all_data.template.template,
        time_of_sending : all_data.time_of_sending

    }
    if(def_event.length == 0){
    	$("#no-site-on-monitoring-msg").text("No site under event monitoring.");
    	$("#save-gnd-meas-settings-button").prop("disabled",true);
    	$("#add-special-case").prop("disabled",true);
    }else {
    	$("#no-site-on-monitoring").hide();
    	$("#save-gnd-meas-settings-button").prop("disabled",false);
    	$("#add-special-case").prop("disabled",false);
    	displaySavedReminderMessage(settings, def_event, def_extended, def_routine);
    }
    
}

function changeSemiAutomationSettings(category, data) {
    if (category != "routine" && category != "event" && category != "extended") {
        reconstructSavedSettingsForGndMeasReminder(data.settings, data.event, data.extended, data.routine);
    } else {
        resetCaseDiv();
        const currentDate = new Date();
        const current_meridiem = currentDate.getHours();
        if(data.saved == false){
        	let template = data.template.template.replace("(monitoring_type)", category);
	        
	        $('#reminder-message').text(template);

	        $(".gndmeas-reminder-site").empty();
	        $(".gndmeas-reminder-office").empty();

	        switch(category) {
	            case 'extended':
	                site_count = data.extended_sites.length;
	                if (site_count == 0){
	                	$("#no-site-on-monitoring").show();
	                	$("#no-site-on-monitoring-msg").text("No site under extended monitoring.");
	                	$("#save-gnd-meas-settings-button").prop("disabled",true);
	                	$("#add-special-case").prop("disabled",true);
	                } else {
	                	$("#no-site-on-monitoring").hide();
	                	$("#save-gnd-meas-settings-button").prop("disabled",false);
	                	$("#add-special-case").prop("disabled",false);
	                	for (var i = 0; i < data.extended_sites.length; i++) {
		                    var modIndex = i % 6;
		                    sitename = data.extended_sites[i].toUpperCase();
					        if ($.inArray(data.extended_sites[i],data.cant_send_gndmeas) == -1) {
					        	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}" checked>${sitename}</label></div>`);
					        } else {
					        	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
					        } 
		                }
	                }
	                
	                break;
	            case 'event':
	                site_count = data.event_sites.length;
	                if (site_count == 0){
	                	$("#no-site-on-monitoring").show();
	                	$("#no-site-on-monitoring-msg").text("No site under event monitoring.");
	                	$("#save-gnd-meas-settings-button").prop("disabled",true);
	                	$("#add-special-case").prop("disabled",true);
	                } else {
	                	$("#no-site-on-monitoring").hide();
	                	$("#save-gnd-meas-settings-button").prop("disabled",false);
	                	$("#add-special-case").prop("disabled",false);
		                for (var i = 0; i < data.event_sites.length; i++) {
		                    var modIndex = i % 6;
		                    sitename = data.event_sites[i].site_code.toUpperCase();
					        if ($.inArray(data.event_sites[i].site_code,data.cant_send_gndmeas) == -1) {
					        	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}" checked>${sitename}</label></div>`);
					        } else {
					        	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
					        } 
		                }
		            }
	                break;
	            case 'routine':
	                site_count = data.routine_sites.length;
	                if (site_count == 0){
	                	$("#no-site-on-monitoring").show();
	                	$("#no-site-on-monitoring-msg").text("No site under routing monitoring.");
	                	$("#save-gnd-meas-settings-button").prop("disabled",true);
	                	$("#add-special-case").prop("disabled",true);
	                } else {
	                	$("#no-site-on-monitoring").hide();
	                	$("#save-gnd-meas-settings-button").prop("disabled",false);
	                	$("#add-special-case").prop("disabled",false);
		                for (var i = 0; i < data.routine_sites.length; i++) {
		                    var modIndex = i % 6;
		                    sitename = data.routine_sites[i].toUpperCase();
					        if ($.inArray(data.routine_sites[i],data.cant_send_gndmeas) == -1) {
					        	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}" checked>${sitename}</label></div>`);
					        } else {
					        	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
					        } 
		                }
		            }
	                break;
	        }
        }else {
	        displaySavedReminderMessage(data.settings, data.event, data.extended ,data.routine);
        }
        
    }

}

function displaySavedReminderMessage (settings, def_event, def_extended, def_routine) {
	gnd_meas_overwrite = "old";
    let event_sites = [];
    let event_sites_full = [];
    let event_templates_container = [];
    let event_altered = [];
    let routine_sites = [];
    let routine_sites_full = [];
    let routine_templates_container = [];
    let routine_altered = [];
    let extended_sites = [];
    let extended_sites_full = [];
    let extended_templates_container = [];
    let extended_altered = [];
    let special_cases = 0;
    let has_event_settings = false;
    let has_extended_settings = false;
    let has_routine_settings = false;
    let template = ground_meas_reminder_data.template.replace("(monitoring_type)", $("#gnd-meas-category").val());

    $(".gndmeas-reminder-site").empty();
    $(".gndmeas-reminder-office").empty();
	for (let counter = 0; counter < settings.length; counter++) {
        switch(settings[counter].type) {
            case 'routine':
            	has_routine_settings = true;
                routine_sites_full.push(settings[counter]);
                routine_sites.push(settings[counter].site);
                if(settings[counter].altered_template == 0){
	                if ($.inArray(settings[counter].msg, routine_templates_container) == -1) {
	                    routine_templates_container.push(settings[counter].msg);
	                }
            	}
                if (settings[counter].altered_template == 1) {
                    routine_altered.push(settings[counter]);
                }
                break;
            case 'extended':
            	has_extended_settings = true;
                extended_sites_full.push(settings[counter]);
                extended_sites.push(settings[counter].site);
                if(settings[counter].altered_template == 0){
	                if ($.inArray(settings[counter].msg, extended_templates_container) == -1) {
	                    extended_templates_container.push(settings[counter].msg); 
	                }
            	}

                if (settings[counter].altered_template == 1) {
                    extended_altered.push(settings[counter]);
                }
                break;
            case 'event':
            	has_event_settings = true;
                event_sites_full.push(settings[counter]);
                event_sites.push(settings[counter].site);
                if(settings[counter].altered_template == 0){
	                if ($.inArray(settings[counter].msg, event_templates_container) == -1) {
	                   event_templates_container.push(settings[counter].msg); 
	                }
                }
                if (settings[counter].altered_template == 1) {
                    event_altered.push(settings[counter]);
                }
                break;
        }
    }

    let gnd_meas_category = $("#gnd-meas-category").val();
    switch(gnd_meas_category) {
        case 'extended':
            site_count = def_extended.length;
            if(site_count == 0){
            	showAndHideGroudMeasButton(true);
            	$("#no-site-on-monitoring-msg").text(displayNoEventText(gnd_meas_category));
            }else {
				showAndHideGroudMeasButton(false);
            	if(has_extended_settings == true){
	            	for (var i = 0; i < def_extended.length; i++) {
		                var modIndex = i % 6;
		                sitename = def_extended[i].toUpperCase();
		                if ($.inArray(sitename, extended_sites) != -1 && $.inArray(extended_sites_full[i], extended_altered) == -1) {
		                    $(`#gnd-sitenames-${modIndex}`).append('<div class="checkbox"><label><input type="text" class="automation_distinction" value="reminder_automation_id_'+extended_sites_full[i].automation_id+'" hidden><input name="gnd-sitenames" type="checkbox" value="'+sitename+'" checked>'+sitename+'</label></div>');
		                } else {
		                    $(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input type="text" class="automation_distinction" value="new" hidden><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
		                }
		            }

		            $("#reminder-message").text(extended_templates_container[0]);
		            for (let counter = 0; counter < extended_altered.length; counter++){
		                addSpecialCase();
		                $("#special-case-message-"+counter+"").val(extended_altered[counter].msg);
		                $("#special-case-message-"+counter+"").after("<input type='text' id='reminder_automation_id_"+extended_altered[counter].automation_id+"' value="+extended_altered[counter].automation_id+" hidden> ");
		                $("input[name=\"gnd-meas-"+counter+"\"]:checkbox").each(function () {
		                    if (extended_altered[counter].site == this.value) {
		                        $(this).prop("checked", true);
		                    } else {
		                        $(this).prop("checked", false);
		                    }
		                });
		            }
            	}else {
            		gnd_meas_overwrite = "new";
            		delegateCheckboxesForNoSavedSettings(def_extended);
				    $("#reminder-message").text(template);
            	}
            }
            
            break;
        case 'event':
            site_count = def_event.length;
            if(site_count == 0){
            	showAndHideGroudMeasButton(true);
            	$("#no-site-on-monitoring-msg").text(displayNoEventText(gnd_meas_category));
            }else {
            	showAndHideGroudMeasButton(false);
            	if(has_event_settings == true){
            		for (var i = 0; i < def_event.length; i++) {
		                var modIndex = i % 6;
		                sitename = def_event[i].site_code.toUpperCase();
		                if ($.inArray(sitename, event_sites) != -1 && $.inArray(event_sites_full[i], event_altered) == -1) {
		                  	$(`#gnd-sitenames-${modIndex}`).append('<div class="checkbox"><label><input type="text" class="automation_distinction" value="reminder_automation_id_'+event_sites_full[i].automation_id+'" hidden><input name="gnd-sitenames" type="checkbox" value="'+sitename+'" checked>'+sitename+'</label></div>');  
		                } else {
		                   	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input type="text" class="automation_distinction" value="new" hidden><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
		                }

		            }

		            $("#reminder-message").text(event_templates_container[0]);
		            for (let counter = 0; counter < event_altered.length; counter++){
		                addSpecialCase();
		                $("#special-case-message-"+counter+"").val(event_altered[counter].msg);
		                $("#special-case-message-"+counter+"").after("<input type='text' id='reminder_automation_id_"+event_altered[counter].automation_id+"' value="+event_altered[counter].automation_id+" hidden> ");
		                $("input[name=\"gnd-meas-"+counter+"\"]:checkbox").each(function () {
		                    if (event_altered[counter].site == this.value) {
		                        $(this).prop("checked", true);
		                    } else {
		                        $(this).prop("checked", false);
		                    }
		                });
		            }
            	}else{
            		gnd_meas_overwrite = "new";
            		delegateCheckboxesForNoSavedSettings(def_event, "event");
				    $("#reminder-message").text(template);
            	}
            	
            }
            
            break;
        case 'routine':
            site_count = def_routine.length;
            if(site_count == 0){
            	showAndHideGroudMeasButton(true);
            	$("#no-site-on-monitoring-msg").text(displayNoEventText(gnd_meas_category));
            }else {
            	showAndHideGroudMeasButton(false);
            	if(has_routine_settings == true){
            		for (var i = 0; i < def_routine.length; i++) {
		                var modIndex = i % 6;
		                sitename = def_routine[i].toUpperCase();
		                if ($.inArray(sitename, routine_sites) != -1 && $.inArray(routine_sites_full[i], routine_altered) == -1) {
		                    $(`#gnd-sitenames-${modIndex}`).append('<div class="checkbox"><label><input type="text" class="automation_distinction" value="reminder_automation_id_'+routine_sites_full[i].automation_id+'" hidden><input name="gnd-sitenames" type="checkbox" value="'+sitename+'" checked>'+sitename+'</label></div>');
		                } else {
		                    $(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input class="automation_distinction1" type="text" value="new" hidden><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
		                }
		            }
		            $("#reminder-message").text(routine_templates_container[0]);
		            for (let counter = 0; counter < routine_altered.length; counter++){
		                addSpecialCase();
		                $("#special-case-message-"+counter+"").val(routine_altered[counter].msg);
		                $("#special-case-message-"+counter+"").after("<input type='text' id='reminder_automation_id_"+routine_altered[counter].automation_id+"' value="+routine_altered[counter].automation_id+" hidden> ");
		                $("input[name=\"gnd-meas-"+counter+"\"]:checkbox").each(function () {
		                    if (routine_altered[counter].site == this.value) {
		                        $(this).prop("checked", true);
		                    } else {
		                        $(this).prop("checked", false);
		                    }
		                });
		            }
            	}else {
            		gnd_meas_overwrite = "new";
            		delegateCheckboxesForNoSavedSettings(def_routine);
				    $("#reminder-message").text(template);
            	}
            	
            }
            
            break;
    }
    console.log(gnd_meas_overwrite);
}

function showAndHideGroudMeasButton (behavior) {
	if(behavior == true){
		$("#no-site-on-monitoring").show();
		$("#save-gnd-meas-settings-button").prop("disabled",true);
    	$("#add-special-case").prop("disabled",true);
    	$("#reminder-message").text();
    	$("#reminder-message").prop("disabled",true);
	}else {
		$("#no-site-on-monitoring").hide();
    	$("#save-gnd-meas-settings-button").prop("disabled",false);
    	$("#add-special-case").prop("disabled",false);
    	$("#reminder-message").prop("disabled",false);
    	$("#reminder-message").text();
	}
}

function displayNoEventText(type){
	let message = "";
	if (type == "event") {
		message = "No site under event monitoring.";
	}else if (type == "extended") {
		message = "No site under extended monitoring.";
	}else if (type == "routine") {
		message = "No site under routine monitoring.";
	}

	return message;
}

function delegateCheckboxesForNoSavedSettings(data, category){
	let site_name = null;
	for (var i = 0; i < data.length; i++) {
        var modIndex = i % 6;
        if(category == "event"){
        	site_name = data[i].site_code.toUpperCase();
        }else {
        	site_name = data[i].toUpperCase();
        }
            $(`#gnd-sitenames-${modIndex}`).append('<div class="checkbox"><label><input type="text" class="automation_distinction" hidden><input name="gnd-sitenames" type="checkbox" value="'+site_name+'" checked>'+site_name+'</label></div>');
    }

}


function updateGndMeasTemplate(template) {
	let current_date_time = moment().format('H:mm:ss');
	let gndmeas_time = null;
	if(current_date_time >= moment().format("07:30:00") && current_date_time <= moment().format("11:30:00")){
		template = template.replace("(ground_meas_submission)", "11:30 AM");
	}else if (current_date_time >= moment().format("11:30:00") && current_date_time <= moment().format("14:30:00")){
		template = template.replace("(ground_meas_submission)", "3:30 PM");
	}

	return template;

}

function displaySitesForGndMeasReminder(data) {
	$("#no-site-on-monitoring").hide();
    gnd_meas_overwrite = "new";
    ground_meas_reminder_data = data;
    const currentDate = new Date();
    const current_meridiem = currentDate.getHours();
    let template = ground_meas_reminder_data.template.template.replace("(monitoring_type)", $("#gnd-meas-category").val());
    $(".gndmeas-reminder-site").empty();
    $(".gndmeas-reminder-office").empty();

    if (current_meridiem >= 13 && current_meridiem <= 18) {
        template = template.replace("(greetings)", "hapon");
    } else if (current_meridiem >= 18 && current_meridiem <= 23) {
        template = template.replace("(greetings)", "hapon");
    } else if (current_meridiem >= 0 && current_meridiem <= 3) {
        template = template.replace("(greetings)", "umaga");
    } else if (current_meridiem >= 4 && current_meridiem <= 11) {
        template = template.replace("(greetings)", "umaga");
    } else {
        template = template.replace("(greetings)", "hapon");
    }

    $("#reminder-message").text(template);
    site_count = data.event_sites.length;
    for (var i = 0; i < data.event_sites.length; i++) {
    	console.log();
        var modIndex = i % 6;
        sitename = data.event_sites[i].site_code.toUpperCase();
        if ($.inArray(data.event_sites[i].site_code,data.cant_send_gndmeas) == -1) {
        	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}" checked>${sitename}</label></div>`);
        } else {
        	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
        } 
    }
}

function addSpecialCase () {
    const case_name = `clone-special-case-${special_case_id}`;
    const class_sites_div = `clone-sites-div-${special_case_num}`;
    const class_msg_div = `clone-msg-div-${special_case_num}`; 
    const $clone = $("#special-case-template").clone().prop("hidden", false);
    const regular_reminder_msg = $("#reminder-message").val();
    const $clone_sites = $(".gndmeas-reminder-site-container").children().clone();
    if (site_count <= special_case_num) {
        $("#add-special-case").prop('disabled',true);
    } else {
        $("#add-special-case").prop('disabled',false);
        $clone.attr("id", case_name);
        $clone.find("div#special-case-body .col-sm-6:first-child").addClass(class_sites_div);
        $clone.find("div#special-case-body .col-sm-6:last-child").addClass(class_msg_div);
        $clone.find("textarea.special-case-message-container").attr('id', `special-case-message-${special_case_num}`);
        $clone.find("textarea.special-case-message-container").val(regular_reminder_msg);
        
        // Set name for each checkbox based on div-id
        $clone_sites.find("input").each((index, element) => {
            let checkbox_name = `gnd-meas-${special_case_num}`;
            $(element).attr('name', checkbox_name);
            $(element).prop("checked", false);
        });
        
        $clone.find("#special-case-sites").append($clone_sites);
        // changeSemiAutomationSettings($("#gnd-meas-category").val(), ground_meas_reminder_data);
        $("#special-case-container").append($clone);
        special_case_id += 1;
        special_case_num += 1;

        // Disable add button if site_count is maxed out
        if (site_count <= special_case_num) $("#add-special-case").prop('disabled',true); 
    }
}

function removeInputField () {
    $(document).on("click", ".remove", ({ currentTarget }) => {
        special_case_num = special_case_num-1;
        $("#add-special-case").prop('disabled',false);
        $(currentTarget).closest("div.special-case-template").remove();
    });
}

function initializeResetSpecialCasesButtonOnCLick () {
    $("#reset-button").on("click",() => {
        resetSpecialCases();
    });    
}

function resetSpecialCases () {
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


function resetCaseDiv () {
    $("#add-special-case").prop('disabled',false);
    let case_div = $("#special-case-container");
    case_div.empty();
    special_case_num = 0;
    special_case_id = 0;
}

function scrollOldMessages() {

}