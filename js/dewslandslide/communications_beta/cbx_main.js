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
let messages_template_both = Handlebars.compile($('#messages-template-both').html());
let selected_contact_template = Handlebars.compile($('#selected-contact-template').html());
let quick_release_template = Handlebars.compile($('#quick-release-template').html());
let search_key_template = Handlebars.compile($('#search-message-key-template').html());

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
		psgc = sitenames[i].psgc;
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
		// addContactsActivity(convo_details);
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

function displaySiteSelection (sites,psgc_source = []) {
	var column_count = 12; // 12 rows 
	$('#new-site').remove();
	for (var counter = 0; counter < column_count; counter++) {
		$('#sitenames-cc-'+counter).empty();
	}
	// console.log(psgc_source[1].psgc);
	for (var i = 0; i < sites.length; i++) {
		var modIndex = i % 12;
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
		var modIndex = i % 7;
		var org = orgs[i];
		$("#orgs-cc-"+modIndex).append('<div class="checkbox"><label><input type="checkbox" id="id_'+org.org_name+'" name="orgs" class="form-group organization-checkbox" value="'+org.org_name+'">'+org.org_name.toUpperCase()+'</label></div>');
		for (var counter = 0; counter < user_orgs.length; counter++) {
			if (user_orgs[counter].org_name.toUpperCase() == org.org_name.toUpperCase()) {
				$("#orgs-cc-"+modIndex).find(".checkbox").find("#id_"+org.org_name).prop('checked',true);
			}
		}
	}
	$('<div id="new-org" class="col-md-12"><a href="#" id="add-org"><span class="glyphicon glyphicon-info-sign"></span>&nbsp;Organization not on the list?</a></div>').appendTo('#organization-selection-div');
}

function displayConversationPanel(msg_data, full_data, recipients, titles) {
	conversation_recipients = [];
	recipients.forEach(function(user){
		conversation_recipients.push(user.user_id);
	});
	$("#messages").empty();
	$("#conversation-details").empty();
	$(".recent_activities").addClass("hidden");
	$("#main-container").removeClass("hidden");
	if(full_data === undefined){
		$("#conversation-details").append(conversation_details_label);
	}else {
		$("#conversation-details").append(full_data);
	}
	message_container = [];
	recipient_container = [];
	recipients.forEach(function(mobile_data){
		if (recipient_container.includes(mobile_data.mobile_id) != true) {recipient_container.push(mobile_data.mobile_id);}
	});
	msg_data.reverse();
	let counter = 0;
	msg_data.forEach(function(data) {
		// let title_container = titles[counter].split("<split>");
		// let title_holder = "";
		// for (let sub_counter = 0; sub_counter < title_container.length; sub_counter++) {
		// 	title_holder = title_holder+title_container[sub_counter]+"\n";
		// }
		// data.title = title_holder;
		displayUpdatedMessages(data);
		counter++;
	});
}

function displayUpdatedMessages(data) {
	latest_conversation_timestamp = data.ts_written;
	data.ts_received == null ? data.isYou = 1 : data.isYou = 0;
	data.sms_msg = data.sms_msg.replace(/\n/g, "<br />");
	message_container.unshift(data);
	messages_html = messages_template_both({'messages': message_container});
	let html_string = $('#messages').html();
	$('#messages').html(html_string+messages_html);
	$('.chat-message').scrollTop($('#messages').height());
	message_container = [];
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

function displayAddCommunityContactMessage (msg_data) {
	
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
	console.log(community_data);
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