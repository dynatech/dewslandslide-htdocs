var first_load = false;
var user;
var raw_contact_number;
var trimmed_number = [];
var contact_info;
var contact_name;
var contact_suggestions; /* should be inside the web socket function */
// var contactsList = [];
var messages = [];
var search_results = [];
var quick_inbox_registered = [];
var quick_event_inbox = [];
var quick_inbox_unknown = [];
var quick_release = [];
var group_message_quick_access = [];
var temp; /* for research */
var tempMsg;
var tempUser;
var tempRequest;
var message_type;
var WSS_CONNECTION_STATUS = -1; /* for review */
var offices_and_sites;
var employee_tags = [];
var group_tags = [];
var last_message_time_stamp_recipient = "";
var last_message_time_stamp_sender = "";
var ewi_recipient_flag = false;
var eom_flag = false; /* for review */
var connection_status = true;

var quick_group_selection_flag = false;
var reconnection_delay = 10000;
var gsm_timestamp_indicator = "";
var gintags_msg_details;
var temp_ewi_template_holder = "";
var temp_msg_holder = "";
var narrative_recipients = [];
var tag_indicator = "";
var searched_cache = [];
var routine_reminder_msg;
var temp_multiple_sites = "";

var is_first_successful_connect = true; /* flag detected */
var footer = `\n\n-${first_name} from PHIVOLCS-DYNASLOPE`;

var message_counter = 0;
var comboplete;

var data_timestamp;
var latest_release_id;
var coloredTimestamp;

var pms_module_indicator = "";

try {
	var messages_template_both = Handlebars.compile($("#messages-template-both").html());
	var selected_contact_template = Handlebars.compile($("#selected-contact-template").html());
	var quick_inbox_template = Handlebars.compile($("#quick-inbox-template").html());
	var quick_release_template = Handlebars.compile($("#quick-release-template").html());
	var group_message_template = Handlebars.compile($("#group-message-template").html());
	var ewi_template = Handlebars.compile($("#ewi_template").html());
} catch (err) {
	console.log("Chatterbox dashboard mode!");
}