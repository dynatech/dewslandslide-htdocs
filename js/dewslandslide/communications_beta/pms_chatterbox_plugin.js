let pms_data = {};
let page = "";

const instance = PMS_MODAL.create({
    modal_id: "chatterbox-accuracy-1"
});

$(document).ready(() => {
	pms_data = {
		"metric_indicator": "registered_inbox",
		"table_source": "smsinbox"
	};
		
    setTimeout(() => {
        if (instance.is_attached) {
            pms_instances['12'] = instance;
        }
    }, 300);

	$("#quick_search_report").click(function() {
		pms_data = {
			"metric_indicator": "quick_search",
			"table_source": "smsinbox,smsoutbox"
		};
		cbx_report_submit(pms_data);
	});

	$("#routine_report").click(function() {
		pms_data = {
			"metric_indicator": "routine_section",
			"table_source": "site",
			"modal_id": "chx_pms_modal"
		};
		cbx_report_submit(pms_data);
	});

	$("#sms_report").click(function() {
		pms_data = {
			"metric_indicator": "sms_section",
			"table_source": "smsinbox"
		};
		cbx_report_submit(pms_data);
	});

	$("#contact_settings_report").click(function() {
		pms_data = {
			"metric_indicator": "contact_settings",
			"table_source": "communitycontacts"
		};
		cbx_report_submit(pms_data);
	});

	$("#quick_group_selection_report").click(function() {
		pms_data = {
			"metric_indicator": "quick_group_selection",
			"table_source": "site"
		};
		cbx_report_submit(pms_data);
	});


    $("#registered_inbox").click(function() {
		pms_data = {
			"metric_indicator": "registered_inbox",
			"table_source": "smsinbox"
		};
    });

    $("#unregistered_inbox").click(function() {
		pms_data = {
			"metric_indicator": "unregistered_inbox",
			"table_source": "smsinbox"
		};
    });

    $("#event_inbox").click(function() {
		pms_data = {
			"metric_indicator": "event_inbox",
			"table_source": "smsinbox"
		};
    });

	$("#qa_site_with_event_report").click(function() {
		pms_data = {
			"metric_indicator": "qa_site_with_event",
			"table_source": "site"
		};
	});

	$("#qa_group_message_report").click(function() {
		pms_data = {
			"metric_indicator": "qa_group_message",
			"table_source": "site"
		};
	});

	$(".report-tabs").click(function() {
		cbx_report_submit(pms_data);
	});
	
	$("#report-pms-submit").on("click",function() {
		console.log("TEST");
	})
});

function cbx_report_submit(pms_data) {
    console.log(pms_data);
    instance.set({
        reference_id: 0,
        reference_table: "communitycontacts",
        metric_name: pms_data.metric_indicator,
        module_name: "chatterbox"
    });
    
    instance.show();
    instance.print();
    console.log(instance);
}

function attachMetricChecklist() {
	 $(".metric-checklist").empty();
	switch(pms_module_indicator) {
	    case "quick_search":
	        $(".metric-checklist").append("<div class='col-sm-12' style='margin-left:15px;'><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi' value='greeting'>Employee Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='data_ts'>Community Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='alert_desc'>Contact Suggestion</label></div></div>");
	        break;
	    case "routine_section":
	    	$(".metric-checklist").append("<div class='col-sm-12' style='margin-left:15px;'><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='greeting'>Employee Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='data_ts'>Community Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='alert_desc'>Contact Suggestion</label></div></div>");
	    	break
	    case "sms_section":
	    	$(".metric-checklist").append("<div class='col-sm-12' style='margin-left:15px;'><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='greeting'>Employee Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='data_ts'>Community Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='alert_desc'>Contact Suggestion</label></div></div>");
	    	break
	    case "contact_settings":
	    	$(".metric-checklist").append("<div class='col-sm-12' style='margin-left:15px;'><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='greeting'>Employee Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='data_ts'>Community Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='alert_desc'>Contact Suggestion</label></div></div>");
	    	break
	    case "quick_group_selection":
	    	$(".metric-checklist").append("<div class='col-sm-12' style='margin-left:15px;'><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='greeting'>Employee Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='data_ts'>Community Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='alert_desc'>Contact Suggestion</label></div></div>");
	    	break
	    case "registered_inbox":
	    	$(".metric-checklist").append("<div class='col-sm-12' style='margin-left:15px;'><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='greeting'>Employee Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='data_ts'>Community Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='alert_desc'>Contact Suggestion</label></div></div>");
	    	break
	    case "unregistered_inbox":
	    	$(".metric-checklist").append("<div class='col-sm-12' style='margin-left:15px;'><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='greeting'>Employee Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='data_ts'>Community Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='alert_desc'>Contact Suggestion</label></div></div>");
	    	break
	    case "event_inbox":
	    	$(".metric-checklist").append("<div class='col-sm-12' style='margin-left:15px;'><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='greeting'>Employee Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='data_ts'>Community Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='alert_desc'>Contact Suggestion</label></div></div>");
	    	break
	    case "qa_site_with_event":
	    	$(".metric-checklist").append("<div class='col-sm-12' style='margin-left:15px;'><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='greeting'>Employee Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='data_ts'>Community Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='alert_desc'>Contact Suggestion</label></div></div>");
	    	break
	    case "qa_group_message":
	    	$(".metric-checklist").append("<div class='col-sm-12' style='margin-left:15px;'><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='greeting'>Employee Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='data_ts'>Community Contact Settings</label></div><div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='ewi-sms-checkbox' value='alert_desc'>Contact Suggestion</label></div></div>");
	    	break
	    default:
	       console.log("def");
	}
}

function timelinessReport() {
	$.post("../narrativeAutomation/insert/", { narratives: narrative_details })
    .done((response) => {

    });
}