let recipient_container = [];
let recent_contacts_collection = [];
let recent_sites_collection = [];
let samar_sites_details = [];
let last_outbox_ts = null;
let last_inbox_ts = null;

let message_position = null;

$(document).ready(function() {
	$('#chatterbox-loader-modal').modal({backdrop: 'static', keyboard: false});
	// $('#ground-meas-reminder-modal').modal({backdrop: 'static', keyboard: false});
    initialize();
	$(".birthdate").datetimepicker({
		locale: "en",
		format: "YYYY-MM-DD"
	});

	getEmployeeContactGroups();
	initializeOnSubmitEmployeeContactForm();
	initializeOnSubmitCommunityContactForm();
});


function initialize() {
    setTimeout(function() {
        initializeOnClickGetRoutineReminder();
        initializeQuickInboxMessages();
        initializeDatepickers();
        getRecentActivity();
        recentActivityInitializer();
        getRoutineSites();
        getRoutineReminder();
        getRoutineTemplate();
        getImportantTags();
        initializeAddSpecialCaseButtonOnClick();
        removeInputField();
        initializeResetSpecialCasesButtonOnCLick();
        setTimeout(function(){
            try {
                initializeContactSuggestion("");
                initializeOnClickUpdateEmployeeContact();
                initializeOnClickUpdateCommunityContact();
                getSiteSelection();
                getLatestAlert()
                getOrganizationSelection();
                initializeMiscButtons();
                getQuickGroupSelection();
                initializeSamarSites();
                initializeScrollOldMessages();
                $("#chatterbox-loader-modal").modal("hide");
            } catch (err) {
                $("#chatterbox-loader-modal").modal("hide");
                console.log(err.message);
                // Add PMS HERE.
            }
            
        }, 3000);
    },3000);
}

function getContactSuggestion (name_suggestion) {
    $("#contact-suggestion-container").empty();
    $("#contact-suggestion-container").append(
        '<input type="text" class="awesomplete form-control dropdown-input" id="contact-suggestion" placeholder="Type name..." data-multiple />'+
        '<span class="input-group-btn">'+
        '<button class="btn btn-default" id="go-chat" type="button">Go!</button>'+
        '</span>'
    );

	let contact_suggestion_input = document.getElementById("contact-suggestion");
	awesomplete = new Awesomplete(contact_suggestion_input,{
            filter (text, input) {
                return Awesomplete.FILTER_CONTAINS(text, input.match(/[^;]*$/)[0]);
            },replace (text) {
                var before = this.input.value.match(/^.+;\s*|/)[0];
                this.input.value = `${before + text}; `;
            },minChars: 3
        });
	let contact_suggestion_container = [];

	name_suggestion.data.forEach(function(raw_names) {
        let mobile_number = raw_names.number.replace("63", "0");
        let display_info = `${raw_names.fullname} (${mobile_number})`;
		contact_suggestion_container.push(display_info);
	});
	awesomplete.list = contact_suggestion_container;
    initializeGoChatOnClick(awesomplete);
}

function initializeGoChatOnClick (awesomplete) {
    $("#go-chat").on("click", ()=>{
        let contact_suggestion = $("#contact-suggestion");
        let searchKey = contact_suggestion.val();

        let isValidContact = validateContactSearchKey(searchKey, contact_suggestion);

        if(isValidContact) {
            console.log("go click");
            let multiple_contact = contact_suggestion.val().split(";");

            conversation_details = prepareConversationDetails(multiple_contact);
            startConversation(conversation_details);            
        }
    });
}

function validateContactSearchKey(searchKey, contact_suggestion) {
    let isInInput = searchKey.includes(";");

    console.log("searchKey " + searchKey);
    console.log("\";\" IN INPUT " + isInInput);

    if(isInInput) {
        let searchKey = contact_suggestion.val().split("; ");
        searchKey.pop();
        console.log(searchKey);
        isInSuggestions = searchKey.every(elem => awesomplete._list.indexOf(elem) > -1);
    } else {
        isInSuggestions = searchKey.indexOf(awesomplete._list) > -1;
    }
    console.log(isInSuggestions);
    if(contact_suggestion.val().length === 0){
        $.notify("No keyword specified! Please enter a value and select from the suggestions.", "warn");
        return false;
    } else if(!isInSuggestions) {
        console.log("contact_suggestion is empty.");
        $.notify("Please use the correct format and select from the suggestions.", "warn");
        return false
    } else {
        return true;
    }
}

function prepareConversationDetails(multiple_contact) { // Removed from initializeGoChatOnClick for purpose of unit test in the future
    let raw_name = "";
    let firstname = "";
    let lastname = "";
    let office = "";
    let site = "";
    let number = "N/A";
    let conversation_details = {};
    if (multiple_contact.length > 2) {
        let recipient_container = [];
        let temp = {};
        for (let counter = 0; counter < multiple_contact.length-1; counter++) {
            raw_name = multiple_contact[counter].split(",");
            firstname = raw_name[1].trim();
            lastname = raw_name[0].split("-")[1].trim();
            office = raw_name[0].split(" ")[1].trim();
            site = raw_name[0].split(" ")[0].trim();
            number = "N/A";

            temp = {
                raw_name: raw_name,
                firstname: firstname,
                lastname: lastname,
                office: office,
                site: site,
                number: number,
                isMultiple: true
            };
            recipient_container.push(temp);
        }
        conversation_details = {
            isMultiple: true,
            data: recipient_container
        };
    } else {
        raw_name = multiple_contact[0].split(",");
        firstname = raw_name[1].trim();
        lastname = raw_name[0].split("-")[1].trim();
        lastname = lastname.replace("NA ","");
        office = raw_name[0].split(" ")[1].trim();
        site = raw_name[0].split(" ")[0].trim();
        conversation_details = {
            full_name: $("#contact-suggestion").val(),
            firstname: firstname,
            lastname: lastname,
            office: office,
            site: site,
            number: "N/A",
            isMultiple: false
        }
        conversation_details_label = site+" "+office+" - "+firstname+" "+lastname;
    }    
    return conversation_details;
}

function initializeQuickInboxMessages () {
	getQuickInboxMain();
	getQuickInboxEvent();
	getQuickInboxUnregistered();
	getQuickInboxDataLogger();
}

function getQuickInboxMain () {
	let msg = {
		type: 'smsloadquickinboxrequest'
	}
	wss_connect.send(JSON.stringify(msg));
}

function getQuickInboxEvent() {

}

function getQuickInboxUnregistered() {
    let msg = {
        type: 'smsloadquickunknowninbox'
    }
    wss_connect.send(JSON.stringify(msg));
}

function getQuickInboxDataLogger() {

}

function getRecentActivity () {
	getRecentlyViewedContacts();
	getRecentlyViewedSites();
	getOnRoutineSites();
}

function getQuickAcces () {
	getQASitesWithEvent();
	getQAGroupMessages();
}

function getQASitesWithEvent () {

}

function getQAGroupMessages () {

}

function initializeOnClickUpdateEmployeeContact () {
	$('#emp-response-contact-container').on('click', 'tr:has(td)', function(){
		$("#emp-response-contact-container_wrapper").hide();
		$("#update-contact-container").show(300);
		$("#employee-contact-wrapper").show(300);
		$("#emp-settings-cmd").hide();
		var table = $('#emp-response-contact-container').DataTable();
		var data = table.row(this).data();
		var msg = {
			'type': 'loadDewslContact',
			'data': data.user_id
		};	
		wss_connect.send(JSON.stringify(msg));
	});
}

function initializeOnClickUpdateCommunityContact () {
	$('#comm-response-contact-container').on('click', 'tr:has(td)', function(){
		$('#comm-response-contact-container_wrapper').hide();
		$("#update-comm-contact-container").show(300);
		$("#community-contact-wrapper").show(300);
		$("#comm-settings-cmd").hide();
		var table = $('#comm-response-contact-container').DataTable();
		var data = table.row(this).data();
		var msg = {
			'type': 'loadCommunityContact',
			'data': data.user_id
		};	
		wss_connect.send(JSON.stringify(msg));
	});
}

function initLoadLatestAlerts (data) {
    initCheckboxColors();
    if (data == null) {
        return;
    }
    var alerts = data;
    temp = data;
    var msg;
    for (var i = alerts.length - 1; i >= 0; i--) {
        msg = alerts[i];
        updateLatestPublicRelease(msg);
        $("input[name=\"sitenames\"]:unchecked").each(function () {
            if ($(this).val() == alerts[i].site_id) {
                if (alerts[i].status == "on-going") {
                    $(this).parent().css("color", "red");
                } else if (alerts[i].status == "extended") {
                    $(this).parent().css("color", "blue");
                } 
            } else if ($(this).val() == 32 || $(this).val() == 33) { 
                if (alerts[i].site_code == "msl" || alerts[i].site_code == "msu") {
                    if (alerts[i].status == "on-going") {
                        $(this).parent().css("color", "red");
                    } else if (alerts[i].status == "extended") {
                        $(this).parent().css("color", "blue");
                    }
                }
            }
        });
    }
    // if(quick_inbox_registered.length != 0){
        displayQuickEventInbox(quick_inbox_registered, quick_release);
    // }
}

function displayQuickEventInbox (){
    try {
        try {
            let inbox_site_code = null;
            let event_site_code = null;
            for (let counter = 0; counter < quick_inbox_registered.length; counter++) {
                inbox_site_code = quick_inbox_registered[counter].full_name;
                inbox_site_code = inbox_site_code.split(" ");
                let inbox_data = quick_inbox_registered[counter];
                for (let counter = 0; counter < quick_release.length; counter++) {
                    event_site_code = quick_release[counter].site_code.toUpperCase();
                    if(event_site_code == inbox_site_code[0]){
                        quick_inbox_event.unshift(inbox_data);
                    }
                }
            }

            let event_inbox_html = event_inbox_template({'event_inbox_messages': quick_inbox_event});
            $("#quick-event-inbox-display").html(event_inbox_html);
            $("#quick-event-inbox-display").scrollTop(0);
        } catch (err) {
            console.log(err);
        }
    } catch (err) {
        console.log(err);
        //Add PMS here
    }
}

function initCheckboxColors () {
    $("input[name=\"sitenames\"]:unchecked").each(function () {
        $(this).parent().css("color", "#333");
    });    
}

function getSiteSelection() {
	let msg = {
		type: 'getAllSitesConSet'
	}
	wss_connect.send(JSON.stringify(msg));
}

function getOrganizationSelection() {
	let msg = {
		type: 'getAllOrgsConSet'
	}
	wss_connect.send(JSON.stringify(msg));
}

function initializeContactSuggestion(name_query) {
	let msg = {
		'type': 'requestnamesuggestions',
		'namequery': name_query
	}
	wss_connect.send(JSON.stringify(msg));
}

function getImportantTags () {
	let msg = {
		type: 'getImportantTags'
	}
	wss_connect.send(JSON.stringify(msg));
}

function getEmployeeContactGroups () {
	$('#team_ec').tagsinput({
		typeahead: {
			displayKey: 'text',
			source: function (query) {
				var group_tag = [];
				$.ajax({
					url : "../chatterbox/get_employee_contacts",
					type : "GET",
					async: false,
					success : function(data) {
						var data = JSON.parse(data);
						for (var counter = 0; counter < data.length; counter ++) {
							var raw_grouptags = data[counter].grouptags.split(",");
							for (var raw_counter = 0; raw_counter < raw_grouptags.length; raw_counter++) {
								if ($.inArray(raw_grouptags[raw_counter],group_tag) == -1) {
									group_tag.push(raw_grouptags[raw_counter]);
						
								}
							}
						}
					}
				});
				return group_tag;
			}
		} 
	});
}

function initializeOnSubmitEmployeeContactForm () {
	$('#emp-settings-cmd button[type="submit"], #sbt-update-contact-info').on('click',function(){
		employeeContactFormValidation();
	});
}

function initializeOnSubmitCommunityContactForm () {
	$('#comm-settings-cmd button[type="submit"], #sbt-update-comm-contact-info').on('click',function(){
		try{
			communityContactFormValidation();
		} catch (e) {
			console.log(e.message);
		}
	});
}

function employeeContactFormValidation() {
	$("#employee-contact-form").validate({
        debug: true,
        rules: {
            firstname_ec: "required",
			lastname_ec: "required",
			middlename_ec: "required",
			gender_ec: "required",
			birthdate_ec: "required",
			email_ec: "required",
			active_status_ec: "required",
			team_ec: "required"
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
            submitEmployeeInformation();
            initializeContactSuggestion("");
            getEmployeeContact();
            console.log("success");
        }
    });
}

function communityContactFormValidation () {

	$("#community-contact-form").validate({
        debug: true,
        rules: {
            firstname_cc: "required",
			lastname_cc: "required",
			gender_cc: "required",
			birthdate_cc: "required",
			active_status_cc: "required",
			ewirecipient_cc: "required"
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
        	site_selected = [];
			organization_selected = [];
			$('#site-selection-div input:checked').each(function() {
			    site_selected.push($(this).attr('value'));
			});

			$('#organization-selection-div input:checked').each(function() {
			    organization_selected.push($(this).attr('value'));
			});

			$("#org-and-site-alert").hide(300);
			if (site_selected.length === 0 && organization_selected.length === 0) {
				$("#selection-feedback").text("site and organization selection");
			} else if (site_selected.length === 0) {
				$("#selection-feedback").text("site selection");
			} else if (organization_selected.length === 0) {
				$("#selection-feedback").text("organization selection");
			} else {
				$("#org-and-site-alert").hide(300);
				//success function here
				submitCommunityContactForm(site_selected, organization_selected);
                initializeContactSuggestion("");
                getCommunityContact();
			}
            
        }
    });
}


function recentActivityInitializer() {
$("#routine-actual-option").on("click", function () {
        $("#routine-reminder-option").removeClass("active");
        $("#routine-msg").val("");
        $(this).addClass("active");
        $("#def-recipients").text("Default recipients: LEWC, BLGU, MLGU");
    });

    $("#routine-reminder-option").on("click", function () {
        $("#routine-actual-option").removeClass("active");
        $("#def-recipients").text("Default recipients: LEWC");
        $("#routine-msg").val("");
        // $("#routine-msg").val(routine_reminder_msg);
        $(this).addClass("active");
    });

    $(".rv_contacts a").on("click", function () {
        $(".recent_activities").hide();
        var index = $(this).closest("div").find("input[name='rc_index']").val();
        index = index.replace("activity_contacts_index_", "");
        var data = recent_contacts_collection[parseInt(index)];
        $(".dropdown-input").val(data.data.full_name);
        $("#go-chat").trigger("click");
    });

    $(".rv_sites a").on("click", function () {
        $(".recent_activities").hide();
        $("input[name='sitenames']").prop("checked", false);
        $("input[name='orgs']").prop("checked", false);

        var index = $(this).closest("div").find("input[name='rs_index']").val();
        index = index.replace("activity_sites_index_", "");
        var data = recent_sites_collection[parseInt(index)];

        for (var counter = 0; counter < data.organizations.length; counter++) {
            $("input[name='orgs']:unchecked").each(function () {
                if (data.organizations[counter] == $(this).val()) {
                    $(this).prop("checked", true);
                }
            });
        }

        for (var counter = 0; counter < data.sitenames.length; counter++) {
            $("input[name='sitenames']:unchecked").each(function () {
                if (data.sitenames[counter] == $(this).val()) {
                    $(this).prop("checked", true);
                }
            });
        }

        $("#go-load-groups").trigger("click");
    });

    $(".rv_searched div.recent_searched").on("click", function () {
        $(".recent_activities").hide();
        wss_connect.send(JSON.stringify(recent_searched_collection[$(this).index()]));
    });
}

function getRecentActivity () {
    var division = 1;
    
    if (localStorage.getItem("rv_searched") != null) {
        recent_searched_collection = JSON.parse(localStorage.rv_searched);
    }

    if (localStorage.getItem("rv_sites") != null) {
        recent_sites_collection = JSON.parse(localStorage.rv_sites);
    }

    if (localStorage.getItem("rv_contacts") != null) {
        recent_contacts_collection = JSON.parse(localStorage.rv_contacts);
    }
}


function getRoutineSites() {
	let msg = {
		type: 'getRoutineSites'
	};
	wss_connect.send(JSON.stringify(msg));
}

function getRoutineReminder() {
	let msg = {
		type: 'getRoutineReminder'
	};
	wss_connect.send(JSON.stringify(msg));
}

function initializeOnClickGetRoutineReminder() {
    $("#routine-reminder-option").on("click", () => {
        getRoutineReminder();
    });
}

function getRoutineTemplate() {
	$("#routine-actual-option").on("click", () => {
		let msg = {
			type: 'getRoutineTemplate'
		};
		wss_connect.send(JSON.stringify(msg));
	});
}

function getLatestAlert() {
    var msg = {
        type: 'latestAlerts'
    };
    wss_connect.send(JSON.stringify(msg));
}

function displayRoutineReminder(sites,template) {
	let day = moment().format("dddd");
    let month = moment().month();
    month += 1;

    let parsed_template = parseRoutineReminderViaCbx(template[0].template);

    let wet = [[1, 2, 6, 7, 8, 9, 10, 11, 12], [5, 6, 7, 8, 9, 10]];
    let dry = [[3, 4, 5], [1, 2, 3, 4, 11, 12]];
    let routine_sites = [];

    switch (day) {
        case "Friday":
            $("#def-recipients").css("display", "inline-block");
            $(".routine-options-container").css("display", "flex");
            $("#send-routine-msg").css("display", "inline");
            for (var counter = 0; counter < sites.length; counter++) {
                if (wet[sites[counter].season - 1].includes(month)) {
                    routine_sites.push(sites[counter]);
                }
            }

            $(".routine-site-selection").remove();
            $(".routine-msg-container").remove(); 

            $(".routine_section").prepend("<div class='routine-site-selection'></div>");

            routine_sites.forEach((data) => {
                $(".routine-site-selection").append(`<label><input name='sites-on-routine' id='${data.id}' type='checkbox' value='${data.site}' checked> ${data.site.toUpperCase()}</label>`);
            });

            $(".routine_section").append("<div class='routine-msg-container'></div>");
            $(".routine-msg-container").append("<textarea class='form-control' id='routine-msg' cols='30'rows='10'></textarea>");
            $("#routine-msg").val(parsed_template);
            break;
        case "Tuesday":
            $("#def-recipients").css("display", "inline-block");
            $(".routine-options-container").css("display", "flex");
            $("#send-routine-msg").css("display", "inline");
            for (var counter = 0; counter < sites.length; counter++) {
                if (wet[sites[counter].season - 1].includes(month)) {
                    routine_sites.push(sites[counter]);
                }
            }

            $(".routine-site-selection").remove();
            $(".routine-msg-container").remove(); 

            $(".routine_section").prepend("<div class='routine-site-selection'></div>");

            routine_sites.forEach((data) => {
                $(".routine-site-selection").append(`<label><input name='sites-on-routine' id='${data.id}' type='checkbox' value='${data.site}' checked> ${data.site.toUpperCase()}</label>`);
            });

            $(".routine_section").append("<div class='routine-msg-container'></div>");
            $(".routine-msg-container").append("<textarea class='form-control' id='routine-msg' cols='30'rows='10'></textarea>");
            $("#routine-msg").val(parsed_template);
            break;
        case "Wednesday":
            $("#def-recipients").css("display", "inline-block");
            $(".routine-options-container").css("display", "flex");
            $("#send-routine-msg").css("display", "inline");
            for (var counter = 0; counter < sites.length; counter++) {
                if (dry[sites[counter].season - 1].includes(month)) {
                    routine_sites.push(sites[counter]);
                }
            }

            $(".routine-site-selection").remove();
            $(".routine-msg-container").remove();             

            $(".routine_section").prepend("<div class='routine-site-selection'></div>");

            routine_sites.forEach((data) => {
                $(".routine-site-selection").append(`<label><input name='sites-on-routine' id='${data.id}' type='checkbox' value='${data.site}' checked> ${data.site.toUpperCase()}</label>`);
            });

            $(".routine_section").append("<div class='routine-msg-container'></div>");
            $(".routine-msg-container").prepend("<textarea class='form-control' id='routine-msg' cols='30'rows='10'></textarea>");
            $("#routine-msg").val(parsed_template);
            break;
        default:
            $(".routine_section").append("<div class='col-md-12 col-sm-12 col-xs-12'><h6>No Routine Monitoring for today.</h6></div>");
            break;
    }

}

function parseRoutineReminderViaCbx(template) {
    template = template.replace("(greetings)","umaga");
    template = template.replace("(ground_meas_submission)","11:30 AM");
    template = template.replace("(monitoring_type)","routine");
    return template
}

function initializeDatepickers() {
    $("#ewi-date-picker").datetimepicker({
        locale: "en",
        format: "YYYY-MM-DD HH:mm:ss"
    });

    $("#rfi-date-picker").datetimepicker({
        locale: "en",
        format: "hh:mmA MMMM DD, YYYY"
    });
}

function initializeMiscButtons() {
    $("#checkAllOffices").click(() => {
        $("#modal-select-offices").find(".checkbox").find("input").prop("checked", true);
    });
    $("#uncheckAllOffices").click(() => {
        $("#modal-select-offices").find(".checkbox").find("input").prop("checked", false);
    });
    $("#checkAllTags").click(() => {
        $("#modal-select-grp-tags").find(".checkbox").find("input").prop("checked", true);
    });
    $("#uncheckAllTags").click(() => {
        $("#modal-select-grp-tags").find(".checkbox").find("input").prop("checked", false);
    });
    $("#checkAllSitenames").click(() => {
        $("#modal-select-sitenames").find(".checkbox").find("input").prop("checked", true);
    });
    $("#uncheckAllSitenames").click(() => {
        $("#modal-select-sitenames").find(".checkbox").find("input").prop("checked", false);
    });
}

function initializeSamarSites() {
    let msg = {
        type: "getSiteDetails"
    };
    wss_connect.send(JSON.stringify(msg));
}

function initializeScrollOldMessages() {
    $('.chat-message').scroll(function() {
      if ($(this).scrollTop() == 0) {
        $('#chatterbox-loader-modal').modal({backdrop: 'static', keyboard: false});

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

        recipient_container = recipient_container.filter(function (el) {
          return el != null;
        });

        let msg = {
            type: "loadOldMessages",
            recipients: recipient_container,
            last_outbox_ts: last_outbox_ts,
            last_inbox_ts: last_inbox_ts
        };
        wss_connect.send(JSON.stringify(msg));
      }
    });
}