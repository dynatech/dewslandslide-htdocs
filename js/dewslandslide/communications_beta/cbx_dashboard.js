let ewi_event_id = null;
let ewi_site_id = null;
let ewi_timestamp = null;
let ewi_data_timestamp = null;
let ewi_event_start = null;
let temp_ewi_button_container = null;
$(document).ready(() => {
	let temp_ewi_template_holder = "";
	console.log("Chatterbox: Dashboard mode...");

	initializeEwiPhoneButton();
	initializeEwiPhoneExtendedButton();
	initializeEditUndoButtons();
	initializeSendButton();
});


function initializeEwiPhoneButton() {
    $("#latest").on("click", "tbody tr .send_ewi_sms", ({ currentTarget }) => {
        const i = $(currentTarget).parents("tr");
        temp_ewi_button_container = $(currentTarget).attr('id');
        current_row = latest_table.row(i).data();
        current_row.formatted_data_timestamp =  moment(current_row.data_timestamp).add(30, "m").format('MMMM D, YYYY h:mm A');
        current_row.formatted_data_timestamp = current_row.formatted_data_timestamp.replace("12:00 PM", "12:00 NN");
        current_row.formatted_data_timestamp = current_row.formatted_data_timestamp.replace("12:00 AM", "12:00 MN");
        ewi_timestamp = moment(current_row.data_timestamp).add(30, "m").format('h:mm A');
        ewi_event_id = current_row.event_id;
        ewi_site_id = current_row.site_id;
        ewi_event_start = current_row.event_start;
        ewi_data_timestamp = moment(current_row.data_timestamp).add(30, "m").format('YYYY-MM-DD H:mm:ss');
        let request = {
        	"type": "getEwiDetailsViaDashboard",
        	"event_category": "event",
        	"data": current_row
        };

		wss_connect.send(JSON.stringify(request));
    });
}

function initializeEwiPhoneExtendedButton() {
    $("#extended").on("click", "tbody tr .send_ewi_extended_sms", ({ currentTarget }) => {
        const i = $(currentTarget).parents("tr");
        current_row = extended_table.row(i).data();
        temp_ewi_button_container = $(currentTarget).attr('id');
        current_row.formatted_data_timestamp =  moment(current_row.data_timestamp).add(30, "m").format('MMMM D, YYYY');
        current_row.formatted_data_timestamp = current_row.formatted_data_timestamp.replace("12:00 PM", "12:00 NN");
        current_row.formatted_data_timestamp = current_row.formatted_data_timestamp.replace("12:00 AM", "12:00 MN");
        ewi_timestamp = moment(current_row.data_timestamp).add(30, "m").format('h:mm A');
        ewi_event_id = current_row.event_id;
        ewi_site_id = current_row.site_id;
        ewi_data_timestamp = moment(current_row.data_timestamp).add(30, "m").format('YYYY-MM-DD H:mm:ss');
        console.log(current_row);
        let request = {
        	"type": "getEwiDetailsViaDashboard",
        	"event_category": 'extended',
        	"data": current_row
        };

		wss_connect.send(JSON.stringify(request));
    });
}

function displayTemplatesAndRecipients(recipients,template) {
	temp_ewi_template_holder = template.data;
	$("#ewi-recipients-dashboard").tagsinput('removeAll');
	recipients.forEach(function(row) {
		let construct_name = row.site_code.toUpperCase()+" "+row.org_name.toUpperCase()+" - "+row.firstname.toUpperCase()+". "+row.lastname.toUpperCase();
		$("#ewi-recipients-dashboard").tagsinput('add', construct_name );
	});
    $("#constructed-ewi-amd").prop("disabled", true);
    $("#constructed-ewi-amd").val(temp_ewi_template_holder);
    $("#edit-btn-ewi-amd").attr("class", "btn btn-warning");
    $("#edit-btn-ewi-amd").text("Edit");
    $("#edit-btn-ewi-amd").val("edit");
	$("#constructed-ewi-amd").text(template.data);
	$("#ewi-asap-modal").modal("show");
}


function initializeEditUndoButtons() {
    $("#edit-btn-ewi-amd").click(() => {
        if ($("#edit-btn-ewi-amd").val() === "edit") {
            $("#constructed-ewi-amd").prop("disabled", false);
            $("#edit-btn-ewi-amd").val("undo");
            $("#edit-btn-ewi-amd").text("Undo");
            $("#edit-btn-ewi-amd").attr("class", "btn btn-danger");
        } else {
            $("#constructed-ewi-amd").prop("disabled", true);
            $("#constructed-ewi-amd").val(temp_ewi_template_holder);
            $("#edit-btn-ewi-amd").attr("class", "btn btn-warning");
            $("#edit-btn-ewi-amd").text("Edit");
            $("#edit-btn-ewi-amd").val("edit");
        }
    });
}

function initializeSendButton() {
	let dashboard_sms_signature = ` - ${first_name} from PHIVOLCS-DYNASLOPE`;
	$("#send-btn-ewi-amd").click(function() {
		let request = {
			"type": "sendEwiViaDashboard",
			"event_id": ewi_event_id,
			"site_id": ewi_site_id,
			"timestamp": ewi_timestamp,
			"data_timestamp":ewi_data_timestamp,
            "event_start": ewi_event_start,
			"previous_release_time": ewi_timestamp = moment(ewi_data_timestamp).subtract(240, "m").format('h:mm A'),
			"recipients": $("#ewi-recipients-dashboard").tagsinput('items'),
			"msg": $("#constructed-ewi-amd").val() + dashboard_sms_signature,
			"account_id": $("#current_user_id").val()
		}

		wss_connect.send(JSON.stringify(request));
		$("#"+temp_ewi_button_container).css("color","red");
	});
}

function displayEwiStatus(ewi_status,gtag_status) {
	let temp = "";
	ewi_status.forEach(function(ewi) {
		if (ewi.status == null || ewi.status[0].status == false) {
			if (temp == "") {
				temp = "Failed to send EWI to: "+ewi.recipient;
			} else {
				temp = temp+", "+ewi.recipient;
			}
		}
	});
  	
	if (temp == "") {
		$.notify("Successfully Tagged message as #EwiMessage", "success", {hideDuration: 400});
		$.notify("Successfully Sent Early Warning Information.", "success",{hideDuration: 400});
	} else {
		$.notify(temp, "error",{hideDuration: 400});
	}
	$("#ewi-asap-modal").modal("hide");
}