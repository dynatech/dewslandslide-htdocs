function sendViaAlertMonitor (dashboard_data) {
    let internal_alert = "";
    let backbone_message = "";
    let recommended_response = "";
    let alertLevel = dashboard_data.alert_level;
    if (alertLevel.length === 2 && alertLevel.indexOf("A") !== -1) {
        alertLevel = alertLevel.replace("A", "Alert ");
    }

    if (dashboard_data.internal_alert !== "N/A") {
        $.ajax({
            type: "POST",
            url: "../communications/getkeyinputviatriggertype",
            async: false,
            data: { trigger_type: dashboard_data.internal_alert },
            success (response) {
                let raw_response = JSON.parse(response);
                internal_alert = raw_response.key_input[0];
            }
        });
    }

    if (dashboard_data.alert_status !== "N/A") {
        $.ajax({
            type: "POST",
            url: "../communications/getbackboneviastatus",
            async: false,
            data: { alert_status: dashboard_data.alert_status },
            success (response) {
                backbone_message = JSON.parse(response);
            }
        });
    }

    if (alertLevel !== "N/A") {
        $.ajax({
            type: "POST",
            url: "../communications/getrecommendedresponse",
            async: false,
            data: { recommended_response: alertLevel },
            success (response) {
                recommended_response = JSON.parse(response);
                for (let counter = 0; counter < recommended_response.length; counter += 1) {
                   if (recommended_response[counter].alert_status === dashboard_data.alert_status) {
                        recommended_response = recommended_response[counter];
                    }
                }
            }
        });
    }

    let final_template = backbone_message[0].template;

    const currentDate = new Date();
    const current_meridiem = currentDate.getHours();

    if (current_meridiem >= 13 && current_meridiem <= 18) {
        final_template = final_template.replace("(greetings)", "hapon");
    } else if (current_meridiem >= 18 && current_meridiem <= 23) {
        final_template = final_template.replace("(greetings)", "gabi");
    } else if (current_meridiem >= 0 && current_meridiem <= 3) {
        final_template = final_template.replace("(greetings)", "gabi");
    } else if (current_meridiem >= 4 && current_meridiem <= 11) {
        final_template = final_template.replace("(greetings)", "umaga");
    } else {
        final_template = final_template.replace("(greetings)", "tanghali");
    }

    final_template = final_template.replace("(alert_level)", dashboard_data.alert_level);
    const ewiLocation = `${dashboard_data.sitio}, ${dashboard_data.barangay}, ${dashboard_data.municipality}, ${dashboard_data.province}`;
    let formatSbmp = ewiLocation.replace("null", "");
    if (formatSbmp.charAt(0) === ",") {
        formatSbmp = formatSbmp.substr(1);
    }

    final_template = final_template.replace("(site_location)", formatSbmp);
    final_template = final_template.replace("(recommended_response)", recommended_response.key_input);
    final_template = final_template.replace("(technical_info)", internal_alert[0].key_input);

    const currentTime = moment().format("YYYY-MM-DD HH:mm");
    if (moment(currentTime).valueOf() >= moment(`${moment().locale("en").format("YYYY-MM-DD")} 00:00`).valueOf() && moment(currentTime).valueOf() < moment(`${moment().locale("en").format("YYYY-MM-DD")} 04:00`).valueOf()) {
        final_template = final_template.replace("(gndmeas_time_submission)", "bago mag-07:30 AM");
        final_template = final_template.replace("(gndmeas_date_submission)", "mamaya");

        final_template = final_template.replace("(next_ewi_time)", "04:00 AM");
        final_template = final_template.replace("(next_ewi_date)", "mamayang");
    } else if (moment(currentTime).valueOf() >= moment(`${moment().locale("en").format("YYYY-MM-DD")} 04:00`).valueOf() && moment(currentTime).valueOf() < moment(`${moment().locale("en").format("YYYY-MM-DD")} 08:00`).valueOf()) {
        final_template = final_template.replace("(gndmeas_time_submission)", "bago mag-07:30 AM");
        final_template = final_template.replace("(gndmeas_date_submission)", "mamaya");

        final_template = final_template.replace("(next_ewi_time)", "08:00 AM");
        final_template = final_template.replace("(next_ewi_date)", "mamayang");
    } else if (moment(currentTime).valueOf() >= moment(`${moment().locale("en").format("YYYY-MM-DD")} 08:00`).valueOf() && moment(currentTime).valueOf() < moment(`${moment().locale("en").format("YYYY-MM-DD")} 12:00`).valueOf()) {
        final_template = final_template.replace("(gndmeas_time_submission)", "bago mag-11:30 AM");
        final_template = final_template.replace("(gndmeas_date_submission)", "mamaya");

        final_template = final_template.replace("(next_ewi_time)", "12:00 NN");
        final_template = final_template.replace("(next_ewi_date)", "mamayang");
    } else if (moment(currentTime).valueOf() >= moment(`${moment().locale("en").format("YYYY-MM-DD")} 12:00`).valueOf() && moment(currentTime).valueOf() < moment(`${moment().locale("en").format("YYYY-MM-DD")} 16:00`).valueOf()) {
        final_template = final_template.replace("(gndmeas_time_submission)", "bago mag-3:30 PM");
        final_template = final_template.replace("(gndmeas_date_submission)", "mamaya");

        final_template = final_template.replace("(next_ewi_time)", "04:00 PM");
        final_template = final_template.replace("(next_ewi_date)", "mamayang");
    } else if (moment(currentTime).valueOf() >= moment(`${moment().locale("en").format("YYYY-MM-DD")} 16:00`).valueOf() && moment(currentTime).valueOf() < moment(`${moment().locale("en").format("YYYY-MM-DD")} 20:00`).valueOf()) {
        final_template = final_template.replace("(gndmeas_time_submission)", "bago mag-7:30 AM");
        final_template = final_template.replace("(gndmeas_date_submission)", "bukas");

        final_template = final_template.replace("(next_ewi_time)", "08:00 PM");
        final_template = final_template.replace("(next_ewi_date)", "mamayang");
    } else if (moment(currentTime).valueOf() >= moment(`${moment().locale("en").format("YYYY-MM-DD")} 20:00`).valueOf() && moment(currentTime).valueOf() < moment(`${moment().locale("en").add(24, "hours").format("YYYY-MM-DD")} 00:00`).valueOf()) {
        final_template = final_template.replace("(gndmeas_time_submission)", "bago mag-7:30 AM");
        final_template = final_template.replace("(gndmeas_date_submission)", "bukas");

        final_template = final_template.replace("(next_ewi_time)", "12:00 MN");
        final_template = final_template.replace("(next_ewi_date)", "bukas ng");
    } else {
        alert("Error Occured: Please contact Administrator");
    }

    final_template = final_template.replace("(current_date)", moment(dashboard_data.data_timestamp).format("LL"));
    $("#msg").val(final_template);
    $("#site-abbr").val(dashboard_data.name);
}

let on_edit = null;
let pms_reference_id = null;
const pms_instances = [];

$(document).ready(() => {

    $("#btn-automation-settings").on("click",function() {
        // Clear special cases
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
    
    $("#save-gnd-meas-settings-button").on("click",function() {
        let special_case_length = $(".special-case-template").length-1;
        let gnd_sitenames = [];
        console.log(gnd_meas_overwrite);
        if (gnd_meas_overwrite == "new") {
            $("input[name=\"gnd-sitenames\"]:checked").each(function () {
                gnd_sitenames.push(this.value);
            });
            let gnd_meas_settings = {
                type: "setGndMeasReminderSettings",
                sites: gnd_sitenames,
                altered: 0,
                category: $("#gnd-meas-category").val(),
                template: $("#reminder-message").text(),
                overwrite: false,
                modified: first_name
            };

            wss_connect.send(JSON.stringify(gnd_meas_settings));
            
            if (special_case_length > 0) {
                for (let counter = 0; counter < special_case_length; counter++) {
                    gnd_sitenames = [];
                    $("input[name=\"gnd-meas-"+counter+"\"]:checked").each(function () {
                        gnd_sitenames.push(this.value);
                    });
                    console.log(gnd_sitenames);
                    let gnd_meas_settings = {
                        type: "setGndMeasReminderSettings",
                        sites: gnd_sitenames,
                        category: $("#gnd-meas-category").val(),
                        altered: 1,
                        template: $("#special-case-message-"+counter).val(),
                        overwrite: false,
                        modified: first_name
                    };
                    console.log(gnd_meas_settings);
                    wss_connect.send(JSON.stringify(gnd_meas_settings));              
                }
            }
            $.notify('Ground measurement settings saved!','success');
        } else {
            if (confirm('You have a save template, are you sure you want to overwrite it?')){
                $("input[name=\"gnd-sitenames\"]:checked").each(function () {
                    gnd_sitenames.push(this.value);
                });

                let gnd_meas_settings = {
                    type: "setGndMeasReminderSettings",
                    sites: gnd_sitenames,
                    category: $("#gnd-meas-category").val(),
                    template: $("#reminder-message").text(),
                    overwrite: true,
                    modified: first_name
                };

                wss_connect.send(JSON.stringify(gnd_meas_settings));

                if (special_case_length > 0) {
                    for (let counter = 0; counter < special_case_length.length; counter++) {
                        gnd_sitenames = [];
                        $("input[name=\"gnd-sitenames-"+counter+"\"]:checked").each(function () {
                            gnd_sitenames.push(this.value);
                        });

                        let gnd_meas_settings = {
                            type: "setGndMeasReminderSettings",
                            sites: gnd_sitenames,
                            altered: 1,
                            category: $("#gnd-meas-category").val(),
                            template: $("#special-case-message-"+counter).text(),
                            overwrite: true,
                            modified: first_name
                        };
                        wss_connect.send(JSON.stringify(gnd_meas_settings));              
                    }
                }
                $.notify('Ground measurement settings saved!','success');
            }      
        }
    });

    if (window.location.host !== "www.dewslandslide.com") {
        $.notify(`This is a test site: https://${window.location.host}`, { autoHideDelay: 100000000 });
    }

    if (window.location.href === `${window.location.origin}/communications/chatterbox_beta` || window.location.href === `${window.location.origin}/communications/chatterbox_beta#`) {
        var recent_contacts_collection = [];
        var recent_sites_collection = [];
        getRecentActivity();
    }

    $("#routine-actual-option").on("click", function () {
        $("#routine-reminder-option").removeClass("active");
        $("#routine-msg").val("");
        $(this).addClass("active");
        $("#def-recipients").text("Default recipients: LEWC, BLGU, MLGU");
        $.get("../communications/getRoutine", (data) => {
            var routine_template = JSON.parse(data);
            $("#routine-msg").val(routine_template[0].template);
        });
    });

    $("#routine-reminder-option").on("click", function () {
        $("#routine-actual-option").removeClass("active");
        $("#def-recipients").text("Default recipients: LEWC");
        $("#routine-msg").val("");
        $("#routine-msg").val(routine_reminder_msg);
        $(this).addClass("active");
    });

    $(".rv_contacts a").on("click", function () {
        $(".recent_activities").hide();
        var index = $(this).closest("div").find("input[name='rc_index']").val();
        index = index.replace("activity_contacts_index_", "");
        var data = recent_contacts_collection[parseInt(index)];
        $(".dropdown-input").val(data.name[0].fullname);
        $("#go-chat").trigger("click");
    });

    $(".rv_sites a").on("click", function () {
        $(".recent_activities").hide();
        $("input[name=\"sitenames\"]").prop("checked", false);
        $("input[name=\"offices\"]").prop("checked", false);

        var index = $(this).closest("div").find("input[name='rs_index']").val();
        index = index.replace("activity_sites_index_", "");
        var data = recent_sites_collection[parseInt(index)];

        for (var counter = 0; counter < data.offices.length; counter++) {
            $("input[name=\"offices\"]:unchecked").each(function () {
                if (data.offices[counter] == $(this).val()) {
                    $(this).prop("checked", true);
                }
            });
        }

        for (var counter = 0; counter < data.sitenames.length; counter++) {
            $("input[name=\"sitenames\"]:unchecked").each(function () {
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

    $("#send-routine-msg").on("click", () => {
        $("#chatterbox-loading").modal("show");
        var offices = [];
        if ($(".btn.btn-primary.active").val() == "Reminder Message") {
            offices = ["LEWC"];
        } else {
            offices = ["LEWC", "MLGU", "BLGU"];
        }
        var sites_on_routine = [];
        var routine_msg = $("#routine-msg").val();
        var temp_msg = routine_msg;
        $("input[name=\"offices-routine\"]:checked").each(function () {
            sites_on_routine.push(this.value);
            $.post("../chatterbox_beta/getSiteDetailsOnRoutine/", { site_code: this.value }).done((data) => {
                var routine = JSON.parse(data);
                var ewiLocation = `${routine[0].sitio}, ${routine[0].barangay}, ${routine[0].municipality}, ${routine[0].province}`;
                var formatSbmp = ewiLocation.replace("null", "");
                if (formatSbmp.charAt(0) == ",") {
                    formatSbmp = formatSbmp.substr(1);
                }

                routine_msg = routine_msg.replace("(site_location)", formatSbmp);
                routine_msg = routine_msg.replace("(current_date)", moment().format("MMMM D, YYYY"));

                var data = {
                    type: "smssendgroup",
                    user: "You",
                    offices,
                    sitenames: [routine[0].name.toUpperCase()],
                    msg: routine_msg + footer,
                    ewi_filter: true,
                    ewi_tag: false
                };
                wss_connect.send(JSON.stringify(data));
                routine_msg = temp_msg;
            });
        });
        setTimeout(() => {
            $("#chatterbox-loading").modal("hide");
        }, 20000);
    });

    $.get("../generalinformation/initialize", (data) => {
    });

    $("#ewi-recipients-dashboard").on("beforeItemRemove", (event) => {
        var def_val = $("#default-recipients").val().split(",");
        if ($.inArray(event.item, def_val) != -1) {
            $.notify("You cannot remove default recipients.", "info");
            event.cancel = true;
        }
    });

    $(".chat-message").scroll(() => {
        if (first_load == false) {
            if ($(".chat-message").scrollTop() == 0) {
                if (message_type == "smsload") {
                    getOldMessage();
                } else if (message_type == "smsloadrequestgroup" || message_type == "smssendgroup") {
                    getOldMessageGroup();
                } else {
                    console.log("Invalid Request/End of the Conversation");
                }
            }
        }
    });

    $("#confirm-ewi-recipients").click(() => {
        var recipientsUpdate = [];
        $("input[name=\"ewi_recipients\"]:checked").each(function () {
            recipientsUpdate.push(JSON.parse(this.value));
        });

        request = {
            type: "updateEwiRecipients",
            data: recipientsUpdate
        };

        console.log(recipientsUpdate);
        wss_connect.send(JSON.stringify(request));
    });

    var tempTimestampYou;
    var tempTimestamp;

    function getOldMessage () {
        if (last_message_time_stamp_sender == "") {
            last_message_time_stamp_sender = tempTimestampYou;
        }

        if (last_message_time_stamp_recipient === "") {
            last_message_time_stamp_recipient = tempTimestamp;
        }

        var request = {
            type: "oldMessage",
            number: trimmed_number,
            timestampYou: last_message_time_stamp_sender,
            timestampIndi: last_message_time_stamp_recipient
        };

        tempTimestampYou = last_message_time_stamp_sender;
        tempTimestamp = last_message_time_stamp_recipient;

        $("#user").val("You");
        messages = [];
        wss_connect.send(JSON.stringify(request));
    }

    function getOldMessageGroup () {
        group_tags = [];
        user = "You";
        var tagOffices = [];
        $("input[name=\"offices\"]:checked").each(function () {
            tagOffices.push(this.value);
        });

        var tagSitenames = [];
        $("input[name=\"sitenames\"]:checked").each(function () {
            tagSitenames.push(this.value);
        });

        tagSitenames.sort();
        if (last_message_time_stamp_sender == "") {
            last_message_time_stamp_sender = tempTimestampYou;
        }

        if (last_message_time_stamp_recipient == "") {
            last_message_time_stamp_recipient = tempTimestamp;
        }

        request = {
            type: "oldMessageGroup",
            offices: tagOffices,
            sitenames: tagSitenames,
            lastMessageTimeStampYou: last_message_time_stamp_sender,
            lastMessageTimeStampGroup: last_message_time_stamp_recipient
        };

        group_tags = {
            type: "oldMessageGroup",
            offices: tagOffices,
            sitenames: tagSitenames
        };

        tempTimestampYou = last_message_time_stamp_sender;
        tempTimestamp = last_message_time_stamp_recipient;

        $("#user").val("You");

        messages = [];
        contact_info = "groups";
        wss_connect.send(JSON.stringify(request));
    }

    function replaceKeyInputs (narrative, gintag_details) {
        var key_list = ["(stakeholders)", "(current_release_time)", "(previous_release_time)", "(sms_msg)", "(sender)"];
        for (var counter = 0; counter < key_list.length; counter++) {
            if (narrative.indexOf(key_list[counter]) != -1) {
                var key_replacement = "";
                switch (key_list[counter]) {
                    case "(stakeholders)":
                        var tagOffices = [];
                        $("input[name=\"offices\"]:checked").each(function () {
                            tagOffices.push(this.value);
                        });
                        if (tagOffices.length == 0) {
                            gintag_details.office.forEach((x) => {
                                if (key_replacement == "") {
                                    key_replacement = x.trim();
                                } else {
                                    key_replacement = `${key_replacement}, ${x.trim()}`;
                                }
                            });
                        } else {
                            tagOffices.forEach((x) => {
                                if (key_replacement == "") {
                                    key_replacement = x.trim();
                                } else {
                                    key_replacement = `${key_replacement}, ${x.trim()}`;
                                }
                            });
                        }

                        narrative = narrative.replace(key_list[counter], key_replacement);
                        break;
                    case "(current_release_time)":
                        if (window.location.href == `${window.location.origin}/communications/chatterbox_beta` || window.location.href == `${window.location.origin}/communications/chatterbox_beta#`) {
                            narrative = narrative.replace(key_list[counter], moment(gintags_msg_details[2]).format("hh:mm A"));
                        } else {
                            // chill
                        }
                        break;
                    case "(previous_release_time)":
                        console.log("Go hererere");
                        break;
                    case "(sms_msg)":
                        narrative = narrative.replace(key_list[counter], gintags_msg_details[4]);
                        break;
                    case "(sender)":
                        narrative = narrative.replace(key_list[counter], gintags_msg_details[1]);
                        break;
                }
            }
        }
        return narrative;
    }

    function getOngoingEvents (sites, gintag_details = null) {
        $.get("../chatterbox/getOnGoingEventsForGintags", (data) => {
            var events = JSON.parse(data);
            $.post("../chatterbox/getSiteForNarrative/", { site_details: JSON.stringify(sites) })
            .done((response) => {
                siteids = JSON.parse(response);
                if (events.length == 0) {
                    return -1;
                }
                for (var counter = 0; counter < events.length; counter++) {
                    for (var siteid_counter = 0; siteid_counter < siteids.length; siteid_counter++) {
                        if (events[counter].site_id == siteids[siteid_counter].id) {
                            for (var tag_counter = 0; tag_counter < gintags_msg_details.tags.length; tag_counter++) {
                                var narrative_template = replaceKeyInputs(gintags_msg_details.tags[tag_counter].narrative_input, gintag_details);
                                var narrative_details = {
                                    event_id: events[counter].event_id,
                                    site_id: siteids[siteid_counter].id,
                                    ewi_sms_timestamp: gintags_msg_details[2],
                                    narrative_template
                                };
                                $.post("../narrativeAutomation/insert/", { narratives: narrative_details })
                                .done((response) => {
                                });
                            }
                        }
                    }
                }
            });
        });
    }

    function waitForSocketConnection () {
        if (!window.timerID) {
            window.timerID = setInterval(() => {
                if (wss_connect.readyState === 1) {
                    console.log("Connection is made");
                    return;
                }
                console.log(`wait for connection... ${reconnection_delay}`);
                wss_connect = connectWS();
                waitForSocketConnection();
                if (reconnection_delay < 20000) {
                    reconnection_delay += 1000;
                }
            }, reconnection_delay);
        }
    }

    function displayContactNamesForThread (source = "normal") {
        if (source == "normal") {
            var flags = [],
                uniqueName = [],
                l = contact_info.length,
                i;
            for (i = 0; i < l; i++) {
                if (flags[contact_info[i].fullname]) { continue; }

                flags[contact_info[i].fullname] = true;
                uniqueName.push(contact_info[i].fullname);
            }

            var tempText = "",
                tempCountContacts = uniqueName.length;
            for (i in uniqueName) {
                if (i == tempCountContacts - 1) { tempText += uniqueName[i]; } else { tempText = `${tempText + uniqueName[i]}, `; }
            }
        } else if (source == "quickInbox") {
            if (qiFullContact.search("unknown") >= 0) {
                tempText = qiFullContact;
                document.title = tempText;
            } else {
                var posDash = qiFullContact.search(" - ");
                tempText = qiFullContact.slice(0, posDash);
            }
        }
        $("#convo-header .panel-heading").text(tempText);
        $("#contact-indicator").val(tempText);
        document.title = tempText;
    }

    $(document).on("click", ".qaccess-contacts", () => {
        var convo_collection = [];
        $(".qaccess-contacts:checked").each(function () {
            convo_collection.push(this.value);
        });

        if (convo_collection.length == 0) {
            $(".qaccess-contacts:checked").each(function () {
                $(this).prop("checked", true);
            });
            $(".qaccess-contacts").trigger("click");
        } else {
            var get_convo = "";

            for (var counter = 0; counter < convo_collection.length; counter++) {
                if (counter == 0) {
                    get_convo = convo_collection[counter];
                } else {
                    get_convo = `${get_convo};${convo_collection[counter]}`;
                }
            }

            $(".dropdown-input").val(get_convo);
            $("#go-chat").trigger("click");
        }
    });

    $("#btn-standard-search").click(() => {
        if ($("#search-key").is(":visible") == true && $("#search-key").val() != "") {
            searchMessage();
        } else if ($("#search-key").is(":visible") == true && $("#search-key").val() == "") {
            $("#search-key").hide();
        } else {
            $("#search-key").show();
            $("#search-key").val("");
        }
    });

    $("#btn-search-global").click(() => {
        $("#chatterbox-loading").modal("show");
        switch ($("input[name=\"opt-search\"]:checked").val()) {
            case "gintag-search":
                searchGintagMessages($("#search-global-keyword").val(), $("#search-limit").val());
                break;
            case "global-search":
                searchMessageGlobal($("#search-global-keyword").val(), $("#search-limit").val());
                break;
            case "timestamp-sent-search":
                searchTimestampsent($("#search-from-date").val(), $("#search-to-date").val(), $("#search-limit").val());
                break;
            case "timestamp-written-search":
                searchTimestampwritten($("#search-from-date").val(), $("#search-to-date").val(), $("#search-limit").val());
                break;
            case "unknown-number-search":
                searchUnknownNumber($("#search-global-keyword").val(), $("#search-limit").val());
                break;
            case "general-search":
                searchGeneralMessages($("#search-global-keyword").val(), $("#search-limit").val());
                break;
        }
    });

    $("input[name=\"opt-search\"]").on("change", function () {
        if ($(this).val() === "timestamp-sent-search" || $(this).val() === "timestamp-written-search") {
            $("#time-div-container").show();
            $("#key-div-container").hide();
        } else {
            $("#time-div-container").hide();
            $("#key-div-container").show();
        }
    });

    function searchMessage () {
        messages = [];
        search_results = [];
        if (message_type === "smsload" || message_type === "searchMessage") {
            searchMessageIndividual();
        } else if (message_type === "smssendgroup" || message_type === "searchMessageGroup" || message_type === "smsloadrequestgroup") {
            searchMessageGroup();
        } else {
            console.log(message_type);
            console.log("Invalid Request");
        }
    }

    function searchMessageIndividual () {
        for (let numLen = 0; numLen < trimmed_number.length; numLen += 1) {
            if (trimmed_number[numLen].length === 12) {
                trimmed_number[numLen] = trimmed_number[numLen].slice(2);
            } else if (trimmed_number[numLen].length === 11) {
                trimmed_number[numLen] = trimmed_number[numLen].slice(1);
            } else {
            }
        }
        var request = {
            type: "searchMessageIndividual",
            number: trimmed_number,
            timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
            searchKey: $("#search-key").val()
        };

        wss_connect.send(JSON.stringify(request));
    }

    function searchMessageGroup () {
        group_tags = [];

        user = "You";

        var tagOffices = [];
        $("input[name=\"offices\"]:checked").each(function () {
            tagOffices.push(this.value);
        });

        var tagSitenames = [];
        $("input[name=\"sitenames\"]:checked").each(function () {
            tagSitenames.push(this.value);
        });
        tagSitenames.sort();

        request = {
            type: "searchMessageGroup",
            offices: tagOffices,
            sitenames: tagSitenames,
            searchKey: $("#search-key").val()
        };

        group_tags = {
            type: "searchMessageGroup",
            offices: tagOffices,
            sitenames: tagSitenames,
            searchKey: $("#search-key").val()
        };

        messages = [];
        contact_info = "groups";
        wss_connect.send(JSON.stringify(request));
    }

    function searchMessageGlobal (searchKey, searchLimit) {
        request = {
            type: "searchMessageGlobal",
            searchKey,
            searchLimit
        };
        console.log(request);
        wss_connect.send(JSON.stringify(request));
    }

    function searchGintagMessages (searchKey, searchLimit) {
        request = {
            type: "searchGintagMessages",
            searchKey,
            searchLimit
        };
        wss_connect.send(JSON.stringify(request));
    }

    function searchTimestampsent (fromDate, toDate, searchLimit) {
        request = {
            type: "searchTimestampsent",
            searchFromDate: fromDate,
            searchToDate: toDate,
            searchLimit
        };
        wss_connect.send(JSON.stringify(request));
    }

    function searchTimestampwritten (fromDate, toDate, searchLimit) {
        request = {
            type: "searchTimestampwritten",
            searchFromDate: fromDate,
            searchToDate: toDate,
            searchLimit
        };
        wss_connect.send(JSON.stringify(request));
    }

    function searchUnknownNumber (unknownNumber, searchLimit) {
        request = {
            type: "searchUnknownNumber",
            searchKey: unknownNumber,
            searchLimit
        };
        wss_connect.send(JSON.stringify(request));
    }

    function searchGeneralMessages (message, searchLimit) {
        request = {
            type: "searchGeneralMessages",
            searchKey: message,
            searchLimit
        };
        wss_connect.send(JSON.stringify(request));
    }

    $(document).on("click", "#search-result li", function () {
        var data = ($(this).closest("li")).find("input[id='msg_details']").val()
        .split("<split>");
        $("#chatterbox-loading").modal("show");
        loadSearchKey(data[0], data[1], data[2], data[3], data[4]);
    });

    $(document).on("click", "#search-global-result li", function () {
        var data = ($(this).closest("li")).find("input[id='msg_details']").val()
        .split("<split>");
        $("#chatterbox-loading").modal("show");
        loadSearchKey(data[0], data[1], data[2], data[3], data[4], data[5]);
        $(".recent_activities").hide();
    });

    function loadSearchKey (type, user, timestamp, user_number = null, sms_message = null, sms_id = "") {
        $("#search-result-modal").modal("hide");
        coloredTimestamp = `id_${timestamp}`;
        if (type == "searchMessage") {
            var request = {
                type: "smsLoadSearched",
                number: trimmed_number,
                timestamp
            };

            wss_connect.send(JSON.stringify(request));
        } else if (type == "searchMessageGroup") {
            var timestampYou = "";
            var timestampGroup = "";

            var tagOffices = [];
            $("input[name=\"offices\"]:checked").each(function () {
                tagOffices.push(this.value);
            });

            var tagSitenames = [];
            $("input[name=\"sitenames\"]:checked").each(function () {
                tagSitenames.push(this.value);
            });

            if (user == "You") {
                timestampYou = timestamp;
            } else {
                timestampGroup = timestamp;
            }

            request = {
                type: "smsLoadGroupSearched",
                offices: tagOffices,
                sitenames: tagSitenames,
                timestampYou,
                timestampGroup
            };

            wss_connect.send(JSON.stringify(request));
        } else if (type == "searchMessageGlobal" || type == "searchGintags" || type == "searchedUnknownNumber") {
            contact_info = [{ fullname: user, numbers: `0${trimmedContactNum(user_number)}` }];

            $("#current-contacts h4").text(user);
            document.title = user;
            trimmed_number = [];

            request = {
                type: "smsloadGlobalSearched",
                user,
                user_number,
                sms_msg: sms_message,
                timestamp
            };
            trimmed_number = [user_number];
            user = "You";

            wss_connect.send(JSON.stringify(request));
        } else if (type == "searchedTimestampsent") {
            trimmed_number = [];

            request = {
                type: "smsLoadTimestampsentSearched",
                sms_id,
                user,
                user_number,
                sms_msg: sms_message,
                timestamp
            };
            trimmed_number = [user_number];
            user = "You";
            wss_connect.send(JSON.stringify(request));
        } else if (type == "searchedTimestampwritten") {
            request = {
                type: "smsLoadTimestampwrittenSearched",
                sms_id,
                user,
                user_number,
                sms_msg: sms_message,
                timestamp
            };
            trimmed_number = [user_number];
            user = "You";
            wss_connect.send(JSON.stringify(request));
        }
    }

    function displayGroupTagsForThread () {
        var tempText = "[Sitenames: ";
        var titleSites = "";
        var tempCountSitenames = group_tags.sitenames.length;
        $("#convo-header .panel-body").text("");
        for (i in group_tags.sitenames) {
            displayDetailsForThread(group_tags.sitenames[i]);
            if (i == tempCountSitenames - 1) {
                tempText += group_tags.sitenames[i];
                titleSites += group_tags.sitenames[i];
            } else {
                tempText = `${tempText + group_tags.sitenames[i]}, `;
                titleSites = `${titleSites + group_tags.sitenames[i]}, `;
            }
        }
        tempText = `${tempText}]; [Offices: `;
        var tempCountOffices = group_tags.offices.length;
        for (i in group_tags.offices) {
            if (i == tempCountOffices - 1) {
                tempText += group_tags.offices[i];
            } else {
                tempText = `${tempText + group_tags.offices[i]}, `;
            }
        }

        document.title = titleSites;

        tempText = `${tempText}]`;
        $("#convo-header .panel-heading").text(tempText);
        document.title = tempText;
    }

    function displayGroupMembersForQuickAccess (offices, sites) {
        var data = {
            offices,
            sites,
            type: "groumMembersForQuickAccess"
        };
        wss_connect.send(JSON.stringify(data));
    }

    function displayDetailsForThread (siteabr) {
        $.post("../chatterbox/getsitbangprovmun", { sites: siteabr }).done((response) => {
            var site_details = JSON.parse(response);
            for (i in site_details) {
                var site = `${site_details[i].sitio}, ${site_details[i].barangay}, ${site_details[i].municipality}, ${site_details[i].province} <b>(${siteabr})</b>`;
                if ($("#convo-header .panel-body").html().split("<b>").length <= 3) {
                    $("#convo-header .panel-body").append(site.replace("null,", ""));
                } else if ($("#convo-header .panel-body").html().split("glyphicon glyphicon-th-list").length != 2) {
                    $("#convo-header .panel-body").append("&nbsp;&nbsp;<span class='glyphicon glyphicon glyphicon-th-list' data-toggle='tooltip' data-placement='bottom''></span>");
                    $("#convo-header .panel-body span").attr("title", site);
                } else {
                    var more_details = $("#convo-header .panel-body span").attr("title");
                    $("#convo-header .panel-body span").attr("title", site.replace("null,", "").replace("<b>", "").replace("</b>", "") + more_details);
                }
            }
        });
    }

    function displayGroupTagsForDynaThread (tags) {
        var tempText = "[Team Tags: ";
        var titleSites = "";
        var tempCountTag = tags.length;
        for (i in tags) {
            if (i == tempCountTag - 1) {
                tempText += tags[i];
            } else {
                tempText = `${tempText + tags[i]}, `;
            }
        }

        tempText = `${tempText}]`;
        $("#convo-header .panel-heading").text(tempText);
        document.title = tempText;
    }

    var qiFullContact = null;

    $(document).on("click", "#quick-inbox-display li,#quick-event-inbox-display li", function () {
        first_load = true;
        $("#chatterbox-loading").modal("show");
        $("input[name=\"offices\"]").attr("checked", false);
        $("input[name=\"sitenames\"]").attr("checked", false);
        quickInboxStartChat($(this).closest("li").find("input[type='text']").val());
    });

    $(document).on("click", "#quick-inbox-unknown-display li", function () {
        $("#chatterbox-loading").modal("show");
        $("input[name=\"offices\"]").attr("checked", false);
        $("input[name=\"sitenames\"]").attr("checked", false);
        quickInboxStartChat($(this).closest("li").find("input[type='text']").val());
    });

    $(document).on("click", "#quick-release-display li", function () {
        $("#chatterbox-loading").modal("show");
        message_counter = 0;
        eom_flag = false;
        group_tags = [];

        user = "You";

        var tagOffices = ["LEWC", "BLGU", "MLGU", "PLGU", "REG8"];

        var tagSitenames = [];
        tagSitenames.push($(this).closest("li").find("input[type='text']").val()
        .toUpperCase());
        $("input[name=\"sitenames\"]").prop("checked", false);
        $("input[name=\"offices\"]").prop("checked", false);
        $("input[name=\"opt-ewi-recipients\"]").prop("checked", true);

        if (tagSitenames[0] == "MSL" || tagSitenames[0] == "MSU") {
            tagSitenames[0] = "MES";
        }

        $("input[name=\"sitenames\"]:unchecked").each(function () {
            if (tagSitenames[0] == $(this).val()) {
                $(this).prop("checked", true);
            }
        });

        for (var counter = 0; counter < tagOffices.length; counter++) {
            $("input[name=\"offices\"]:unchecked").each(function () {
                if (tagOffices[counter] == $(this).val()) {
                    $(this).prop("checked", true);
                }
            });
        }

        group_tags = {
            type: "smsloadrequestgroup",
            offices: tagOffices,
            sitenames: tagSitenames
        };

        addSitesActivity(group_tags);
        displayGroupTagsForThread();
        displayGroupMembersForQuickAccess(tagOffices, tagSitenames);

        $("#user").val("You");
        $("#messages").html("");
        messages = [];
        contact_info = "groups";
        wss_connect.send(JSON.stringify(group_tags));
        $("#main-container").removeClass("hidden");
    });

    function quickInboxStartChat (fullContact = null) {
        $("#convo-header .panel-body").text("");
        if (fullContact == null) {
            console.log("Error: User or Name is null");
            return;
        }
        qiFullContact = fullContact;
        startChat(source = "quickInbox");
    }

    function startChat (source = "normal") {
        eom_flag = false;
        trimmed_number = [];
        contact_info = [];
        message_counter = 0;

        $(".recent_activities").hide();
        user = "You";

        if (source === "normal") {
            contact_name = $(".dropdown-input").val();
            raw_contact_number = contact_name.split(";");

            for (let counter = 0; counter < raw_contact_number.length; counter += 1) {
                if (raw_contact_number[counter].trim() !== "") {
                    const raw = trimmedContactNum(raw_contact_number[counter]);
                    for (let sub_counter = 0; sub_counter < raw.length; sub_counter += 1) {
                        trimmed_number.push(raw[sub_counter]);

                        var contactraw_inf = {
                            fullname: raw_contact_number[counter],
                            numbers: raw[sub_counter]
                        };
                        contact_info.push(contactraw_inf);
                    }
                }
            }
        } else if (source === "quickInbox") {
            contact_name = qiFullContact;
            raw_contact_number = contact_name;
            trimmed_number = trimmedContactNum(raw_contact_number);

            contact_info = [{ fullname: contact_name, numbers: raw_contact_number }];
        }

        displayContactNamesForThread(source);

        if (trimmed_number.length <= 0) {
            alert("Error: Invalid Contact Number here");
            return;
        }

        $("#user-container").addClass("hidden");
        $("#main-container").removeClass("hidden");

        var msgHistory = {
            type: "smsloadrequest",
            number: trimmed_number,
            name: contact_info,
            timestamp: moment().format("YYYY-MM-DD HH:mm:ss")
        };

        temp_multiple_sites = trimmed_number;

        addContactsActivity(msgHistory);

        $("#user").val("You");
        $("#messages").html("");
        messages = [];

        tempRequest = msgHistory;
        wss_connect.send(JSON.stringify(msgHistory));
    }

    $("#go-chat").click(() => {
        last_message_time_stamp_recipient = "";
        last_message_time_stamp_sender = "";
        tempTimestamp = "";
        tempTimestampYou = "";

        $("input[name=\"offices\"]").prop("checked", false);
        $("input[name=\"sitenames\"]").prop("checked", false);

        if (connection_status == false) {
            console.log("NO CONNECTION");
        } else {
            startChat();
        }
    });

    var testMsg;
    $("#send-msg").on("click", () => {
        let display_message;
        if (connection_status == false) {
            console.log("NO CONNECTION");
        } else {
            messages = [];
            message_counter = 0;
            ewi_filter = "";
            console.log($("#server-time").text());

            if (contact_info == "groups") {
                var text = $("#msg").val();
                user = "You";

                if (quick_group_selection_flag === true) {
                    var emp_tag = [];
                    $("input[name=\"tag\"]:checked").each(function () {
                        emp_tag.push(this.value);
                    });

                    gsm_timestamp_indicator = $("#server-time").text();
                    temp_msg_holder = {
                        type: "smssend",
                        user,
                        tag: emp_tag,
                        msg: text + footer,
                        timestamp_written: gsm_timestamp_indicator,
                        ewi_tag: false
                    };

                    console.log(temp_msg_holder);
                    display_message = temp_msg_holder;

                    wss_connect.send(JSON.stringify(temp_msg_holder));

                    message_type = "smssendgroup";
                    testMsg = msg;
                    message_counter = 0;
                    messages = [];

                    $("#msg").val("");
                } else {
                    gsm_timestamp_indicator = $("#server-time").text();
                    var tagOffices = [];
                    $("input[name=\"offices\"]:checked").each(function () {
                        tagOffices.push(this.value);
                    });

                    var tagSitenames = [];
                    $("input[name=\"sitenames\"]:checked").each(function () {
                        tagSitenames.push(this.value);
                    });

                    temp_msg_holder = {
                        type: "smssendgroup",
                        user,
                        offices: tagOffices,
                        sitenames: tagSitenames,
                        msg: text + footer,
                        ewi_filter: $("input[name=\"opt-ewi-recipients\"]:checked").val(),
                        timestamp_written: gsm_timestamp_indicator,
                        ewi_tag: false
                    };

                    console.log(temp_msg_holder);
                    display_message = temp_msg_holder;

                    wss_connect.send(JSON.stringify(temp_msg_holder));

                    message_type = "smssendgroup";
                    testMsg = msg;
                    message_counter = 0;
                    messages = [];
                    $("#msg").val("");
                }
            } else {
                var text = $("#msg").val();
                var normalized = [];
                for (i in trimmed_number) {
                    normalized[i] = normalizedContactNum(trimmed_number[i]);
                }

                user = "You";
                gsm_timestamp_indicator = $("#server-time").text();
                temp_msg_holder = {
                    type: "smssend",
                    user,
                    numbers: normalized,
                    msg: text + footer,
                    timestamp_written: gsm_timestamp_indicator,
                    ewi_tag: false
                };

                display_message = temp_msg_holder;
                wss_connect.send(JSON.stringify(temp_msg_holder));
                $("#msg").val("");
            }

            updateRemainingCharacters();
        }
    });

    function loadGroups () {
        $(".recent_activities").hide();
        if (quick_group_selection_flag == true) {
            $("#modal-select-sitenames").find(".checkbox").find("input").prop("checked", false);
            $("#modal-select-offices").find(".checkbox").find("input").prop("checked", false);
            loadGroupsEmployee();
        } else if (quick_group_selection_flag == false) {
            $("#modal-select-grp-tags").find(".checkbox").find("input").prop("checked", false);
            loadGroupsCommunity();
        } else {
            alert("Something went wrong, Please contact the Administrator");
        }
    }

    function loadGroupsCommunity () {
        message_counter = 0;
        eom_flag = false;
        group_tags = [];

        user = "You";

        var tagOffices = [];
        $("input[name=\"offices\"]:checked").each(function () {
            tagOffices.push(this.value);
        });

        var tagSitenames = [];
        $("input[name=\"sitenames\"]:checked").each(function () {
            tagSitenames.push(this.value);
        });
        tagSitenames.sort();

        group_tags = {
            type: "smsloadrequestgroup",
            offices: tagOffices,
            sitenames: tagSitenames
        };

        addSitesActivity(group_tags);

        displayGroupTagsForThread();
        displayGroupMembersForQuickAccess(tagOffices, tagSitenames);

        $("#user").val("You");
        $("#messages").html("");
        messages = [];
        contact_info = "groups";
        wss_connect.send(JSON.stringify(group_tags));
        $("#main-container").removeClass("hidden");
    }

    function loadGroupsEmployee () {
        var requestTag = [];

        var dynaTags = [];
        $("input[name=\"tag\"]:checked").each(function () {
            dynaTags.push(this.value);
        });
        displayGroupTagsForDynaThread(dynaTags);

        $("#user").val("You");
        $("#messages").html("");
        messages = [];
        contact_info = "groups";

        requestTag = {
            type: "smsloadrequesttag",
            teams: dynaTags
        };
        wss_connect.send(JSON.stringify(requestTag));
        $("#main-container").removeClass("hidden");
    }

    $("#go-load-groups").click(() => {
        $("#chatterbox-loading").modal("show");
        first_load = true;
        group_tags = [];
        tempTimestampYou = "";
        tempTimestampGroup = "";
        last_message_time_stamp_sender = "";
        last_message_time_stamp_recipient = "";
        if (connection_status === false) {
            console.log("NO CONNECTION");
        } else {
            loadGroups();
        }
    });

    $(document).ready(() => {
        var table = $("#response-contact-container").DataTable();
    });

    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    $("#response-contact-container").on("click", "tr:has(td)", function () {
        var table = $("#response-contact-container").DataTable();
        var data = table.row(this).data();
        if (data[0].charAt(0) === "c") {
            reset_cc();
            var container = document.getElementById("community-contact-wrapper");
            var input = document.createElement("input");
            input.id = "c_id";
            input.value = data[0];
            console.log(data[0]);
            input.setAttribute("hidden", true);
            container.appendChild(input);
            $("#response-contact-container_wrapper").prop("hidden", true);
            $("#community-contact-wrapper").prop("hidden", false);
            $("#employee-contact-wrapper").prop("hidden", true);
            $("#firstname_cc").val(data[1]);
            $("#lastname_cc").val(data[2]);
            $("#prefix_cc").val(data[3]);
            $("#office_cc").val(data[4]);
            $("#sitename_cc").val(data[5]);
            $("#numbers_cc").val(data[6]);
            $("#rel_cc").val(data[7]);
            if (data[8] == "Yes") {
                $("#ewirecipient").val(1);
            } else {
                $("#ewirecipient").val(0);
            }

            var numbers = data[6].split(",");

            for (x = 0; x < numbers.length; x++) {
                $("#numbers_cc").tagsinput("add", numbers[x]);
            }
        } else {
            reset_ec();
            var container = document.getElementById("employee-contact-wrapper");
            var input = document.createElement("input");
            input.id = "eid";
            input.value = data[0];
            input.setAttribute("hidden", true);
            container.appendChild(input);
            $("#response-contact-container_wrapper").prop("hidden", true);
            $("#community-contact-wrapper").prop("hidden", true);
            $("#employee-contact-wrapper").prop("hidden", false);
            $("#firstname_ec").val(data[1]);
            $("#lastname_ec").val(data[2]);
            $("#nickname_ec").val(data[3]);
            $("#birthdate_ec").val(data[4]);
            $("#email_ec").val(data[5]);
            $("#numbers_ec").val(data[6]);
            $("#grouptags_ec").val(data[7]);

            var numbers = data[6].split(",");
            var group_tags = data[7].split(",");

            for (x = 0; x < numbers.length; x++) {
                $("#numbers_ec").tagsinput("add", numbers[x]);
            }

            for (y = 0; y < group_tags.length; y++) {
                $("#grouptags_ec").tagsinput("add", group_tags[y]);
            }
        }
    });

    $("#btn-contact-settings").click(() => {
        pms_module_indicator = "contact_settigns";

        $("#employee-contact-wrapper").prop("hidden", true);
        $("#community-contact-wrapper").prop("hidden", true);
        $("#response-contact-container_wrapper").prop("hidden", true);
        $("#update-contact-container").prop("hidden", true);

        $("#contact-category option").prop("selected", function () {
            $("#contact-category").css("border-color", "#d6d6d6");
            $("#contact-category").css("background-color", "inherit");
            return this.defaultSelected;
        });

        $("#settings-cmd option").prop("selected", function () {
            $("#settings-cmd").prop("disabled", true);
            $("#settings-cmd").css("border-color", "#d6d6d6");
            $("#settings-cmd").css("background-color", "inherit");
            return this.defaultSelected;
        });

        $("#contact-result").remove();
        fetchSiteAndOffice();
    });

    function fetchSiteAndOffice () {
        $("#sitename_cc").empty();
        $("#office_cc").empty();
        $.ajax({
            type: "GET",
            url: "../chatterbox/getdistinctsitename",
            dataType: "json",
            success (response) {
                var counter = 0;
                select = document.getElementById("sitename_cc");
                for (counter = 0; counter < response.length; counter++) {
                    var opt = document.createElement("option");
                    opt.value = response[counter].sitename;
                    opt.innerHTML = response[counter].sitename;
                    select.className = "form-control";
                    select.setAttribute("required", "true");
                    select.appendChild(opt);
                }
                opt.value = "OTHERS";
                opt.innerHTML = "OTHERS";
                select.appendChild(opt);
            }
        });

        $.ajax({
            type: "GET",
            url: "../chatterbox/getdistinctofficename",
            dataType: "json",
            success (response) {
                var counter = 0;
                select = document.getElementById("office_cc");
                for (counter = 0; counter < response.length; counter++) {
                    var opt = document.createElement("option");
                    opt.value = response[counter].office;
                    opt.innerHTML = response[counter].office;
                    select.className = "form-control";
                    select.setAttribute("required", "true");
                    select.appendChild(opt);
                }
                var opt = document.createElement("option");
                opt.value = "OTHERS";
                opt.innerHTML = "OTHERS";
                select.className = "form-control";
                select.setAttribute("required", "true");
                select.appendChild(opt);
            }
        });
    }

    $("#sitename_cc").on("change", () => {
        if ($("#sitename_cc").val() == "OTHERS") {
            $("#other-sitename").show();
        } else {
            $("#other-sitename").hide();
        }
    });

    $("#office_cc").on("change", () => {
        if ($("#office_cc").val() == "OTHERS") {
            $("#other-officename").show();
        } else {
            $("#other-officename").hide();
        }
    });
    $("#btn-clear-ec").on("click", () => {
        if ($("#settings-cmd").val() == "updatecontact") {
            $("#employee-contact-wrapper").attr("hidden", true);
            getEmpContact();
        } else {
            reset_ec();
        }
    });

    $("#alert_status").on("change", function () {
        $.post("../chatterbox_beta/getAlertLevel", { alert_status: $(this).val() })
        .done((data) => {
            var response = JSON.parse(data);
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

            for (var counter = 0; counter < response.length; counter++) {
                if (response[counter].alert_symbol_level.toLowerCase().indexOf("alert") > -1) {
                    $("#alert-lvl").append($("<option>", {
                        value: response[counter].alert_symbol_level,
                        text: response[counter].alert_symbol_level
                    }));
                } else {
                    $("#internal-alert").append($("<option>", {
                        value: response[counter].alert_symbol_level,
                        text: response[counter].alert_symbol_level
                    }));
                }
            }
        });
    });

    $("#btn-ewi").on("click", () => {
        $("#alert-lvl").empty();
        $("#sites").empty();
        $("#alert_status").empty();
        $("#alert_lvl").empty();
        $("#internal_alert").empty();

        $("#alert_status").append($("<option>", {
            value: "------------",
            text: "------------"
        }));

        $.ajax({
            type: "GET",
            url: "../chatterbox_beta/getAlertStatus",
            dataType: "json",
            success (response) {
                $.each(response, (i, response) => {
                    $("#alert_status").append($("<option>", {
                        value: response.alert_status,
                        text: response.alert_status
                    }));
                });
            }
        });

        $.ajax({
            type: "GET",
            url: "../chatterbox/getdistinctsitename",
            dataType: "json",
            success (response) {
                var counter = 0;
                select = document.getElementById("sites");
                for (counter = 0; counter < response.length; counter++) {
                    var opt = document.createElement("option");
                    opt.value = response[counter].sitename;
                    opt.innerHTML = response[counter].sitename;
                    select.className = "form-control";
                    select.setAttribute("required", "true");
                    select.appendChild(opt);
                }
                opt.value = "NSS";
                opt.innerHTML = "NO SITE SELECTED";
                select.className = "form-control";
                select.setAttribute("required", "true");
                select.appendChild(opt);

                var counter = 0;
                $("input[name=\"sitenames\"]:checked").each(() => {
                    counter++;
                });

                if (counter == 1) {
                    $(`select option[value="${$("input[name=\"sitenames\"]:checked").val()}"]`).attr("selected", true);
                } else {
                    $("select option[value=\"NSS\"]").attr("selected", true);
                }
            }
        });
    });

    $("#confirm-ewi").click(() => {
        var samar_sites = ["jor", "bar", "ime", "lpa", "hin", "lte", "par", "lay"];
        if ($("#rainfall-sites").val() !== "#") {
            $("#chatterbox-loading").modal("show");
            var rain_info_template = "";
            if ($("#rainfall-cummulative").val() == "1d") {
                rain_info_template = `1 day cumulative rainfall as of ${$("#rfi-date-picker input").val()}: `;
            } else {
                rain_info_template = `3 day cumulative rainfall as of ${$("#rfi-date-picker input").val()}: `;
            }
            $.ajax({
                url: "/api/rainfallScanner",
                dataType: "json",
                success (result) {
	    	var data = JSON.parse(result);
	    	for (var counter = 0; counter < samar_sites.length; counter++) {
	    		for (var sub_counter = 0; sub_counter < data.length; sub_counter++) {
	    			if (data[sub_counter].site == samar_sites[counter]) {
	    			if ($("#rainfall-cummulative").val() == "1d") {
    					rainfall_percent = parseInt((data[sub_counter]["1D cml"] / data[sub_counter]["half of 2yr max"]) * 100);
	    				} else {
	    					rainfall_percent = parseInt((data[sub_counter]["3D cml"] / data[sub_counter]["2yr max"]) * 100);
	    				}
	    				rain_info_template = `${rain_info_template} ${data[sub_counter].site} = ${rainfall_percent}%,\n`;
	    			}
	    		}
	    	}

	    	for (var counter = 0; counter < samar_sites.length; counter++) {
                        $.post("../chatterbox/getsitbangprovmun", { sites: samar_sites[counter] })
                        .done((response) => {
                            var data = JSON.parse(response);
                            console.log(data);
                            var sbmp = `${data[0].sitio}, ${data[0].barangay}, ${data[0].municipality}`;
                            var formatSbmp = sbmp.replace("null", "");
                            if (formatSbmp.charAt(0) == ",") {
                                formatSbmp = formatSbmp.substr(1);
                            }
                            rain_info_template = rain_info_template.replace(data[0].name, formatSbmp);
                            $("#msg").val(rain_info_template);
                        });
	    	}

	    	$("#chatterbox-loading").modal("hide");
	    }
            });
        } else if ($("#ewi-date-picker input").val() == "" || $("#sites").val() == "") {
            alert("Invalid input, All fields must be filled");
        } else {
            $.post("../chatterbox/getsitbangprovmun", { sites: $("#sites").val() })
            .done((response) => {
                var location = JSON.parse(response);
                var toTemplate = {
                    name: $("#sites").val(),
                    internal_alert: $("#internal-alert").val() == "------------" ? "N/A" : $("#internal-alert").val(),
                    alert_level: $("#alert-lvl").val() == "------------" ? "N/A" : $("#alert-lvl").val(),
                    alert_status: $("#alert_status").val() == "------------" ? "N/A" : $("#alert_status").val(),
                    sitio: location[0].sitio == null ? "" : location[0].sitio,
                    barangay: location[0].barangay == null ? "" : location[0].barangay,
                    municipality: location[0].municipality == null ? "" : location[0].municipality,
                    province: location[0].province == null ? "" : location[0].province,
                    data_timestamp: $("#ewi-date-picker input").val()
                };
                sendViaAlertMonitor(toTemplate);
            });
        }
    });

    function getEWI (handledTemplate) {
        var constructedEWI = "";
        var dateReplaced = "";
        $.ajax({
            type: "GET",
            url: "../chatterbox/getewi",
            dataType: "json",
            success (response) {
                var d = new Date();
                var currentPanahon = d.getHours();
                if (currentPanahon >= 12 && currentPanahon <= 18) {
                    constructedEWI = response[$("#alert-lvl").val().toUpperCase()].replace("%%PANAHON%%", "hapon");
                } else if (currentPanahon > 18 && currentPanahon <= 23) {
                    constructedEWI = response[$("#alert-lvl").val().toUpperCase()].replace("%%PANAHON%%", "gabi");
                } else {
                    constructedEWI = response[$("#alert-lvl").val().toUpperCase()].replace("%%PANAHON%%", "umaga");
                }
                var year = $("#ewi-date-picker").val().substring(0, 4);
                var month = $("#ewi-date-picker").val().substring(5, 7);
                var day = $("#ewi-date-picker").val().substring(8, 10);

                var months = {
                    1: "January",
                    2: "February",
                    3: "March",
                    4: "April",
                    5: "May",
                    6: "June",
                    7: "July",
                    8: "August",
                    9: "September",
                    10: "October",
                    11: "November",
                    12: "December"
                };

                var reconstructedDate = `${day} ${months[parseInt(month)]} ${year}`;
                dateReplaced = constructedEWI.replace("%%DATE%%", reconstructedDate);
                handledTemplate(dateReplaced);
            }
        });
    }

    function setEWILocation (consEWI) {
        var finalEWI = "";
        if (consEWI != "") {
            $.post("../chatterbox/getsitbangprovmun", { sites: $("#sites").val() })
            .done((response) => {
                var location = JSON.parse(response);
                var sbmp = `${location[0].sitio}, ${location[0].barangay}, ${location[0].municipality}, ${location[0].province}`;
                var formatSbmp = sbmp.replace("null", "");
                if (formatSbmp.charAt(0) == ",") {
                    formatSbmp = formatSbmp.substr(1);
                }
                finalEWI = consEWI.replace("%%SBMP%%", formatSbmp);
                $("#msg").val(finalEWI);
            });
        } else {
            $("#msg").val("Site is not available");
        }
    }

    $("#ewi-date-picker").datetimepicker({
        locale: "en",
        format: "YYYY-MM-DD HH:mm:ss"
    });

    $("#rfi-date-picker").datetimepicker({
        locale: "en",
        format: "hh:mmA MMMM DD, YYYY"
    });

    $("#search-to-date-picker,#search-from-date-picker").datetimepicker({
        locale: "en",
        format: "YYYY-MM-DD HH:mm:ss"
    });



    $("#btn-ewi").on("click", () => {
        $("#early-warning-modal").modal("toggle");
    });

    $("#sbt-update-contact-info").click(() => {
        $("#edit-contact").modal("toggle");
    });
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

    $("#btn-gbl-search").click(() => {
        pms_module_indicator = "quick_search";
        if (connection_status == false) {
            console.log("NO CONNECTION");
        } else {
            $("#search-global-message-modal").modal("toggle");
            search_results = [];
            counter = 0;
            $("#search-global-keyword").val("");
        }
    });
    $("#msg").bind("input propertychange", () => {
        updateRemainingCharacters();
    });

    $("#btn-contact-settings").click(() => {
        if (connection_status == false) {
            console.log("NO CONNECTION");
        } else {
            $("#contact-settings").modal("toggle");
        }
    });

    $("#btn-advanced-search").click(() => {
        pms_module_indicator = "quick_group_selection";
        if (connection_status == false) {
            console.log("NO CONNECTION");
        } else {
            $("#advanced-search").modal("toggle");
        }
    });

    var isFirstAdvancedSearchActivation = false;

    function getRecentActivity () {
        var division = 1;

        if (localStorage.getItem("rv_searched") != null) {
            console.log(localStorage.rv_searched);
            recent_searched_collection = JSON.parse(localStorage.rv_searched);
        }

        if (localStorage.getItem("rv_sites") != null) {
            recent_sites_collection = JSON.parse(localStorage.rv_sites);
        }

        if (localStorage.getItem("rv_contacts") != null) {
            recent_contacts_collection = JSON.parse(localStorage.rv_contacts);
        }

        // if (recent_contacts_collection.length != 0) {
        //     division = 12 / recent_contacts_collection.length;
        //     for (var counter = 0; counter < recent_contacts_collection.length; counter++) {
        //         $(".rv_contacts").append(`<div class='col-md-${parseInt(division)} col-sm-${parseInt(division)} col-xs-${parseInt(division)} recent_contacts'><input name='rc_index' value = 'activity_contacts_index_${counter}' hidden><a href='#' class='clearfix'>   <img src='/images/Chatterbox/boy_avatar.png' alt='' class='img-circle'><div class='friend-name'><strong>${recent_contacts_collection[counter].name[0].fullname}</strong></div></a></div>`);
        //     }
        // } else {
        //     $(".rv_contacts").append("<div class='col-md-12 col-sm-12 col-xs-12'><h6>No recent activities</h6></div>");
        // }

        // if (recent_sites_collection.length != 0) {
        //     division = 12 / recent_sites_collection.length;
        //     var rv_quick_sites = "";
        //     var rv_quick_offices = "";
        //     for (var counter = 0; counter < recent_sites_collection.length; counter++) {
        //         for (var sub_counter = 0; sub_counter < recent_sites_collection[counter].offices.length; sub_counter++) {
        //             if (sub_counter == 0) {
        //                 rv_quick_offices = recent_sites_collection[counter].offices[sub_counter];
        //             } else {
        //                 rv_quick_offices = `${rv_quick_offices}, ${recent_sites_collection[counter].offices[sub_counter]}`;
        //             }
        //         }

        //         for (var sub_counter = 0; sub_counter < recent_sites_collection[counter].sitenames.length; sub_counter++) {
        //             if (sub_counter == 0) {
        //                 rv_quick_sites = recent_sites_collection[counter].sitenames[sub_counter];
        //             } else {
        //                 rv_quick_sites = `${rv_quick_sites}, ${recent_sites_collection[counter].sitenames[sub_counter]}`;
        //             }
        //         }

        //         $(".rv_sites").append(`<div class='col-md-${parseInt(division)} col-sm-${parseInt(division)} col-xs-${parseInt(division)} recent_sites'><input name='rs_index' value = 'activity_sites_index_${counter}' hidden><a href='#' class='clearfix'><img src='/images/Chatterbox/dewsl_03.png' alt='' class='img-circle'><div class='friend-name'><strong style='text-transform: uppercase;'>Site: ${rv_quick_sites}</strong><div class='last-message text-muted'>Offices: ${rv_quick_offices}</div></div></a></div>`);
        //     }
        // } else {
        //     $(".rv_sites").append("<div class='col-md-12 col-sm-12 col-xs-12'><h6>No recent activities</h6></div>");
        // }

        $.get("../chatterbox/getRoutine", (data) => {
            var sites_for_routine = JSON.parse(data);
            var day = moment().format("dddd");
            var month = moment().month();
            month += 1;

            var wet = [[1, 2, 6, 7, 8, 9, 10, 11, 12], [5, 6, 7, 8, 9, 10]];
    	    var dry = [[3, 4, 5], [1, 2, 3, 4, 11, 12]];
    	    var routine_sites = [];

            switch (day) {
                case "Friday":
                    $("#def-recipients").css("display", "inline-block");
                    $(".routine-options-container").css("display", "flex");
                    $("#send-routine-msg").css("display", "inline");
                    routine_reminder_msg = "Magandang umaga po.\n\nInaasahan namin ang pagpapadala ng LEWC ng ground data bago mag-11:30 AM para sa wet season routine monitoring.\nTiyakin ang kaligtasan sa pagpunta sa site.\n\nSalamat.";
                    for (var counter = 0; counter < sites_for_routine.length; counter++) {
                        if (wet[sites_for_routine[counter].season - 1].includes(month)) {
                            routine_sites.push(sites_for_routine[counter].site);
                        }
                    }

                    $(".routine_section").prepend("<div class='routine-site-selection'></div>");
                    for (var counter = 0; counter < routine_sites.length; counter++) {
                        $(".routine-site-selection").append(`<label><input name='offices-routine' type='checkbox' value='${routine_sites[counter]}' checked> ${routine_sites[counter].toUpperCase()}</label>`);
                    }

                    $(".routine_section").append("<div class='routine-msg-container'></div>");
                    $(".routine-msg-container").append("<textarea class='form-control' id='routine-msg' cols='30'rows='10'></textarea>");
                    $("#routine-msg").val(routine_reminder_msg);
                    break;
                case "Tuesday":
                    $("#def-recipients").css("display", "inline-block");
                    $(".routine-options-container").css("display", "flex");
                    $("#send-routine-msg").css("display", "inline");
                    routine_reminder_msg = "Magandang umaga po.\n\nInaasahan namin ang pagpapadala ng LEWC ng ground data bago mag-11:30 AM para sa wet season routine monitoring.\nTiyakin ang kaligtasan sa pagpunta sa site.\n\nSalamat.";
                    for (var counter = 0; counter < sites_for_routine.length; counter++) {
                        if (wet[sites_for_routine[counter].season - 1].includes(month)) {
                            routine_sites.push(sites_for_routine[counter].site);
                        }
                    }

                    $(".routine_section").prepend("<div class='routine-site-selection'></div>");
                    for (var counter = 0; counter < routine_sites.length; counter++) {
                        $(".routine-site-selection").append(`<label><input name='offices-routine' type='checkbox' value='${routine_sites[counter]}' checked> ${routine_sites[counter].toUpperCase()}</label>`);
                    }

                    $(".routine_section").append("<div class='routine-msg-container'></div>");
                    $(".routine-msg-container").append("<textarea class='form-control' id='routine-msg' cols='30'rows='10'></textarea>");
                    $("#routine-msg").val(routine_reminder_msg);
                    break;
                case "Wednesday":
                    $("#def-recipients").css("display", "inline-block");
                    $(".routine-options-container").css("display", "flex");
                    $("#send-routine-msg").css("display", "inline");
                    routine_reminder_msg = "Magandang umaga.\n\nInaasahan na magpadala ng ground data ang LEWC bago mag-11:30AM para sa ating DRY SEASON routine monitoring. Para sa mga nakapagpadala na ng sukat, salamat po.\nTiyakin ang kaligtasan kung pupunta sa site. Magsabi po lamang kung hindi makakapagsukat.\n\nSalamat at ingat kayo.";
                    for (var counter = 0; counter < sites_for_routine.length; counter++) {
                        if (dry[sites_for_routine[counter].season - 1].includes(month)) {
                            routine_sites.push(sites_for_routine[counter].site);
                        }
                    }

                    $(".routine_section").prepend("<div class='routine-site-selection'></div>");
                    for (var counter = 0; counter < routine_sites.length; counter++) {
                        $(".routine-site-selection").append(`<label><input name='offices-routine' type='checkbox' value='${routine_sites[counter]}' checked> ${routine_sites[counter].toUpperCase()}</label>`);
                    }

                    $(".routine_section").append("<div class='routine-msg-container'></div>");
                    $(".routine-msg-container").prepend("<textarea class='form-control' id='routine-msg' cols='30'rows='10'></textarea>");
                    $("#routine-msg").val(routine_reminder_msg);
                    break;
                default:
                    $(".routine_section").append("<div class='col-md-12 col-sm-12 col-xs-12'><h6>No Routine Monitoring for today.</h6></div>");
                    break;
            }
        });
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
            if (recent_contacts_collection[counter].number[0] == contacts.number[0]) {
                return 1;
            }
        }

        if (recent_contacts_collection.length == 6) {
            recent_contacts_collection.shift();
        }
        recent_contacts_collection.push(contacts);
        localStorage.rv_contacts = JSON.stringify(recent_contacts_collection);
    }

    $("a[href=\"#emp-group\"]").on("click", () => {
        employee_tags = [];
        $.get("../chatterbox/getEmployeeTags", (data) => {
            var dataFetched = JSON.parse(data);
            for (let counter = 0; counter < dataFetched.length; counter += 1) {
                const parts = dataFetched[counter].group_tags.split(/[ ,.]+/);
                if (employee_tags.length <= 0) {
                    for (let sub_counter = 0; sub_counter < parts.length; sub_counter += 1) {
                        employee_tags.push(parts[sub_counter]);
                    }
                } else {
                    for (let sub_counter = 0; sub_counter < parts.length; sub_counter += 1) {
                        if (!(employee_tags.indexOf(parts[sub_counter]) > -1)) {
                            employee_tags.push(parts[sub_counter]);
                        }
                    }
                }
            }
            loadEmployeeTags(employee_tags);
        });
    });

    $("#emp-grp-flag").on("click", () => {
        quick_group_selection_flag = true;
    });

    $("#comm-grp-flag").on("click", () => {
        quick_group_selection_flag = false;
    });

    function loadEmployeeTags (tags) {
        for (var x = 0; x < 6; x++) {
            var myNode = document.getElementById(`tag-${x}`);
            while (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild);
            }
        }

        for (var i = 0; i < tags.length; i++) {
            var modIndex = i % 4;
            var tag = tags[i];
            if (tag != "" || tag != null) {
                $(`#tag-${modIndex}`).append(`<div class="checkbox"><label><input name="tag" type="checkbox" value="${tag}">${tag.toUpperCase()}</label></div>`);
            }
        }
    }

    $("#contact-category").on("change", () => {
        $("#contact-result").remove();
        if ($("#contact-category").val() != "default") {
            $("#contact-category").css("border-color", "#3c763d");
            $("#contact-category").css("background-color", "#dff0d8");
        }
        $("#settings-cmd").prop("disabled", false);
        $("#settings-cmd option").prop("selected", function () {
            $("#settings-cmd").css("border-color", "#d6d6d6");
            $("#settings-cmd").css("background-color", "inherit");
            return this.defaultSelected;
        });

        reset_cc();
        reset_ec();

        $("#update-contact-container").prop("hidden", true);
        $("#response-contact-container_wrapper").prop("hidden", true);
        $("#employee-contact-wrapper").prop("hidden", true);
        $("#community-contact-wrapper").prop("hidden", true);
    });

    $("#settings-cmd").on("change", () => {
        reset_cc();
        reset_ec();

        if ($("#settings-cmd").val() != "default") {
            $("#settings-cmd").css("border-color", "#3c763d");
            $("#settings-cmd").css("background-color", "#dff0d8");
        }

        if ($("#contact-category").val() == "econtacts") {
            if ($("#settings-cmd").val() == "addcontact") {
                $("#response-contact-container_wrapper").prop("hidden", true);
                $("#community-contact-wrapper").prop("hidden", true);
                $("#employee-contact-wrapper").prop("hidden", false);
            } else if ($("#settings-cmd").val() == "updatecontact") {
                $("#employee-contact-wrapper").prop("hidden", true);
                $("#community-contact-wrapper").prop("hidden", true);
                reset_cc();
                reset_ec();
                getEmpContact();
            } else {
                console.log("Invalid Request");
            }
        } else if ($("#contact-category").val() == "ccontacts") {
            if ($("#settings-cmd").val() == "addcontact") {
                $("#response-contact-container_wrapper").prop("hidden", true);
                $("#employee-contact-wrapper").prop("hidden", true);
                $("#community-contact-wrapper").prop("hidden", false);
            } else if ($("#settings-cmd").val() == "updatecontact") {
                reset_cc();
                reset_ec();
                $("#employee-contact-wrapper").prop("hidden", true);
                $("#community-contact-wrapper").prop("hidden", true);
                getComContact();
            } else {
                console.log("Invalid Request");
            }
        } else {
            console.log("Invalid Request");
        }
    });

    function getComContact () {
        var table = $("#response-contact-container").DataTable();
        $.ajax({
            type: "GET",
            url: "../chatterbox/get_community_contacts",
            success (response) {
                var data = JSON.parse(response);
                console.log(data);

                $("#response-contact-container").DataTable().clear();
                $("#response-contact-container").DataTable().destroy();

                $("thead tr th").remove();
                $("thead tr").append($("<th />", { text: "c_id" }).css("display", "none"));
                $("thead tr").append($("<th />", { text: "First name" }));
                $("thead tr").append($("<th />", { text: "Last name" }));
                $("thead tr").append($("<th />", { text: "Prefix" }));
                $("thead tr").append($("<th />", { text: "Office" }));
                $("thead tr").append($("<th />", { text: "Sitename" }));
                $("thead tr").append($("<th />", { text: "Contact #" }));
                $("thead tr").append($("<th />", { text: "Rel" }));
                $("thead tr").append($("<th />", { text: "EWI Recipient" }));

                $("tfoot tr th").remove();
                $("tfoot tr").append($("<th />", { text: "c_id" }).css("display", "none"));
                $("tfoot tr").append($("<th />", { text: "First name" }));
                $("tfoot tr").append($("<th />", { text: "Last name" }));
                $("tfoot tr").append($("<th />", { text: "Prefix" }));
                $("tfoot tr").append($("<th />", { text: "Office" }));
                $("tfoot tr").append($("<th />", { text: "Sitename" }));
                $("tfoot tr").append($("<th />", { text: "Contact #" }));
                $("tfoot tr").append($("<th />", { text: "Rel" }));
                $("tfoot tr").append($("<th />", { text: "EWI Recipient" }));

                for (var i = 0; i < data.length; i++) {
                    var ewi_flag = "";
                    if (data[i].ewirecipient == true) {
                        ewi_flag = "Yes";
                    } else {
                        ewi_flag = "No";
                    }
                    var newContent = `<tr><td style='display:none;'>c_${data[i].c_id}</td><td>${data[i].firstname}</td><td>${data[i].lastname}</td><td>${data[i].prefix}</td><td>${data[i].office}</td><td>${data[i].sitename}</td><td>${data[i].number}</td><td>${data[i].rel}</td><td>${ewi_flag}</td></tr>`;
                    $("#response-contact-container tbody").append(newContent);
                }

                $("#response-contact-container").show();
                $("#response-contact-container").DataTable({
                    scrollX: true
                });
            }
        });
    }

    function getEmpContact () {
        var table = $("#response-contact-container").DataTable();
        $.ajax({
            type: "GET",
            url: "../chatterbox/get_employee_contacts",
            success (response) {
                var data = JSON.parse(response);
                $("#response-contact-container").DataTable().clear();
                $("#response-contact-container").DataTable().destroy();

                $("thead tr th").remove();
                $("thead tr").append($("<th />", { text: "eid" }).css("display", "none"));
                $("thead tr").append($("<th />", { text: "First name" }));
                $("thead tr").append($("<th />", { text: "Last name" }));
                $("thead tr").append($("<th />", { text: "Nickname" }));
                $("thead tr").append($("<th />", { text: "Birthdate" }));
                $("thead tr").append($("<th />", { text: "Email" }));
                $("thead tr").append($("<th />", { text: "Contact #" }));
                $("thead tr").append($("<th />", { text: "Group Tags" }));

                $("tfoot tr th").remove();
                $("tfoot tr").append($("<th />", { text: "eid" }).css("display", "none"));
                $("tfoot tr").append($("<th />", { text: "First name" }));
                $("tfoot tr").append($("<th />", { text: "Last name" }));
                $("tfoot tr").append($("<th />", { text: "Nickname" }));
                $("tfoot tr").append($("<th />", { text: "Birthdate" }));
                $("tfoot tr").append($("<th />", { text: "Email" }));
                $("tfoot tr").append($("<th />", { text: "Contact #" }));
                $("tfoot tr").append($("<th />", { text: "Group Tags" }));

                for (var i = 0; i < data.length; i++) {
                    var newContent = `<tr><td style='display:none;'>e_${data[i].eid}</td><td>${data[i].firstname}</td><td>${data[i].lastname}</td><td>${data[i].nickname}</td><td>${data[i].birthday}</td><td>${data[i].email}</td><td>${data[i].numbers}</td><td>${data[i].group_tags}</td></tr>`;
                    $("#response-contact-container tbody").append(newContent);
                }

                $("#response-contact-container").show();
                $("#response-contact-container").DataTable({
                    scrollX: true
                });
            }
        });
    }

    $("#save-contact").on('click',function() {
     var empty_fields = 0;
     if ($("#contact-category").val() == "ccontacts") {
        $("#community-contact-wrapper input").each(function () {
            if (($(this).val() == "" || $(this).val() == null) && $(this).attr("id") != undefined) {
                empty_fields++;
            }
        });

        if (empty_fields > 2) {
            $("#contact-result").remove();
            var container = document.getElementById("community-contact-wrapper");
            var resContainer = document.createElement("div");
            resContainer.id = "contact-result";
            resContainer.className = "alert alert-danger";
            resContainer.innerHTML = "<strong>Failed!</strong> All fields must be filled up.";
            container.insertBefore(resContainer, container.childNodes[0]);
        } else {
            if ($("#sitename_cc").val() == "OTHERS") {
                $site = $("#other-sitename").val();
            } else {
                $site = $("#sitename_cc").val();
            }

            if ($("#office_cc").val() == "OTHERS") {
                $office = $("#other-officename").val();
            } else {
                $office = $("#office_cc").val();
            }

            data = {
                category: "communitycontacts",
                c_id: "",
                lastname: $("#lastname_cc").val(),
                firstname: $("#firstname_cc").val(),
                prefix: $("#prefix_cc").val(),
                office: $office,
                sitename: $site,
                number: $("#numbers_cc").val(),
                rel: $("#rel").val(),
                ewirecipient: ($("#ewirecipient").val() == 1)
            };

            $.post("../communications/chatterbox/addcontact", { contact: JSON.stringify(data) })
            .done((response) => {
                if (response == true) {
                    $("#contact-result").remove();
                    $.notify("Success! New community contact added.", "success");
                    $("#community-contact-wrapper").prop("hidden", true);
                    getComContact();
                    $("#employee-contact-wrapper input").val("");
                } else {
                    $("#contact-result").remove();
                    var container = document.getElementById("community-contact-wrapper");
                    var resContainer = document.createElement("div");
                    resContainer.id = "contact-result";
                    resContainer.className = "alert alert-danger";
                    resContainer.innerHTML = "<strong>Failed!</strong> Duplicate Entry / Invalid input data";
                    container.insertBefore(resContainer, container.childNodes[0]);
                }
                reset_cc();
                fetchSiteAndOffice();
            });
        }
        } else {
            data = {
                'category': 'dewslcontacts',
                'eid': '',
                'lastname': $('#lastname_ec').val(),
                'firstname': $('#firstname_ec').val(),
                'nickname': $('#nickname_ec').val(),
                'birthday': $('#birthdate_ec').val(),
                'email': $('#email_ec').val(),
                'numbers': $('#numbers_ec').val(),
                'grouptags': $('#grouptags_ec').val()
            };
            $.post( "../communications/chatterbox/addcontact", {contact: JSON.stringify(data)})
            .done(function(response) {
                console.log(response);
                if (response == true) {
                    $('#contact-result').remove();
                    $('#employee-contact-wrapper').prop('hidden',true);
                    $.notify('Success! New employee contact added.','success');
                    getEmpContact();
                    $("#employee-contact-wrapper input").val('');
                } else {
                    $('#contact-result').remove();
                    var container = document.getElementById('employee-contact-wrapper');
                    var resContainer = document.createElement('div');
                    resContainer.id = "contact-result";
                    resContainer.className = "alert alert-danger";
                    resContainer.innerHTML = "<strong>Failed!</strong> Duplicate Entry / Invalid input data";
                    container.insertBefore(resContainer,container.childNodes[0]);
                }
                reset_ec();
        });
    }
    });


    $("#comm-settings-cmd button[type=\"submit\"]").on("click", () => {
        if ($("#settings-cmd").val() == "updatecontact") {
            let empty_fields = 0;
            $("#community-contact-wrapper input").each(function () {
                if (($(this).val() == "" || $(this).val() == null) && $(this).attr("id") != undefined) {
                    if (($(this).attr("id") == "other-officename" && $(this).val() == "") || ($(this).attr("id") == "other-sitename" && $(this).val() == "")) {
                        console.log($(this).attr("id"));
                    } else {
                        empty_fields++;
                    }
                }
            });

            if (empty_fields > 0) {
                $("#contact-result").remove();
                let container = document.getElementById("community-contact-wrapper");
                let resContainer = document.createElement("div");
                resContainer.id = "contact-result";
                resContainer.className = "alert alert-danger";
                resContainer.innerHTML = "<strong>Failed!</strong> All fields must be filled up.";
                container.insertBefore(resContainer, container.childNodes[0]);
            } else {
                data = {
                    id: $("#c_id").val(),
                    firstname: $("#firstname_cc").val(),
                    lastname: $("#lastname_cc").val(),
                    prefix: $("#prefix_cc").val(),
                    office: $("#office_cc").val(),
                    sitename: $("#sitename_cc").val(),
                    number: $("#numbers_cc").val(),
                    rel: $("#rel").val(),
                    ewirecipient: $("#ewirecipient").val()
                };
                updateContactService(data, "community-contact-wrapper");
            }  
        } else {
            $("#notify-text").text("The Changes you made will be saved. \n Do you want to proceed?");
            $("#confirm-notification").modal('toggle');
        };
    });

    $("#emp-settings-cmd button[type=\"submit\"]").on("click", () => {
        if ($("#settings-cmd").val() == "updatecontact") {
            var empty_fields = 0;
            $("#employee-contact-wrapper input").each(function () {
                if (($(this).val() == "" || $(this).val() == null) && $(this).attr("id") != undefined) {
                    empty_fields++;
                }
            });

           data = {
                id: $("#eid").val(),
                firstname: $("#firstname_ec").val(),
                lastname: $("#lastname_ec").val(),
                nickname: $("#nickname_ec").val(),
                birthdate: $("#birthdate_ec").val(),
                email: $("#email_ec").val(),
                numbers: $("#numbers_ec").val(),
                group_tags: $("#grouptags_ec").val()
            };
            updateContactService(data, "employee-contact-wrapper");
        } else {
            $("#notify-text").text("The Changes you made will be saved. \n Do you want to proceed?");
            $("#confirm-notification").modal('toggle');
        }
    });

    var message_li_index;
    $(document).on("click", "#messages li", function () {
        message_li_index = $(this).index();
        gintags_msg_details = ($(this).closest("li")).find("input[id='msg_details']").val()
        .split("<split>");
        current_gintags = getGintagService(gintags_msg_details[5]);
        $("#gintag-modal").modal("toggle");
        $(".bootstrap-tagsinput").prop("disabled", true);
    });

    $("#gintags").on("beforeItemAdd", (event) => {
        if (gintags_msg_details[1] === "You") {
            if (event.item === "#EwiResponse" || event.item === "#GroundMeas") {
                console.log("Cannot add EwiResponse Tag for this message");
                event.cancel = true;
                $.notify(`You cannot tag ${event.item} if you are the sender`, "error");
            }
        } else if (event.item === "#EwiMessage" || event.item === "#GroundMeasReminder") {
            console.log("Cannot add EwiMessage Tag for this message");
            event.cancel = true;
            $.notify(`You cannot tag ${event.item} if you are the recipient`, "error");
        }
    });

    $("#gintags").tagsinput({
        typeahead: {
            source : function(query) {
                let tagname_collection = [];
                $.ajax({
                    url: "../../../gintagshelper/getAllGinTags",
                    type: "GET",
                    async: false,
                    success (data) {
                        let all_gin_tags = JSON.parse(data);
                        for (let counter = 0; counter < all_gin_tags.length; counter += 1) {
                            tagname_collection.push(all_gin_tags[counter].tag_name);
                        }
                    }
                });
                return tagname_collection;
            }
        }
    });

    $("#confirm-gintags").click(() => {
        var tags = holdTags.split(",");
        var current_tags = $("#gintags").val().split(","); if (current_tags.length == 1 && current_tags[0] == 0) { current_tags = []; }
        var diff = "";
        $("#gintag-modal").modal("toggle");
        if (tags.length > current_tags.length) {
            diff = $(tags).not(current_tags).get();
            removeGintagService(gintags_msg_details, diff);
        } else if (tags.length < current_tags.length) {
            diff = $(tags).not(current_tags).get();
            insertGintagService(gintags_msg_details);
        } else {
            insertGintagService(gintags_msg_details);
        }
    });

    $("#grouptags_ec").tagsinput({
        typeahead: {
            displayKey: "text",
            source (query) {
                var group_tag = [];
                $.ajax({
                    url: "../chatterbox/get_employee_contacts",
                    type: "GET",
                    async: false,
                    success (data) {
                        const employee_contacts = JSON.parse(data);
                        console.log(employee_contacts);
                        for (let counter = 0; counter < employee_contacts.length; counter += 1) {
                            console.log(employee_contacts[counter].grouptags.split(","));
                            const raw_grouptags = employee_contacts[counter].grouptags.split(",");
                            for (let raw_counter = 0; raw_counter < raw_grouptags.length; raw_counter += 1) {
                                if ($.inArray(raw_grouptags[raw_counter], group_tag) === -1) {
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

    function removeGintagService (data, tags) {
        var tagOffices = [];
        $("input[name=\"offices\"]:checked").each(function () {
            tagOffices.push(this.value);
        });

        var tagSitenames = [];
        $("input[name=\"sitenames\"]:checked").each(function () {
            tagSitenames.push(this.value);
        });

        if (tagOffices.length != 0 && tagSitenames.length != 0) {
            if (data[1] == "You") {
                var gintag_details = {
                    office: tagOffices,
                    site: tagSitenames,
                    data,
                    cmd: "delete",
                    tags
                };
                getGintagGroupContacts(gintag_details);
            } else {
                var gintag_details = {
                    data,
                    cmd: "delete",
                    tags
                };
                getGintagGroupContacts(gintag_details);
            }
        } else {
            var db_used = "";
            if (data[1] == "You") {
                db_used = "smsoutbox";
            } else {
                db_used = "smsinbox";
            }
            var gintag_details = {
                data,
                tags,
                db_used
            };
            removeIndividualGintag(gintag_details);
        }
    }

    $("#confirm-narrative").on("click", () => {
        var data = JSON.parse($("#gintag_details_container").val());
        var tagSitenames = [];
        var temp_array = [];

        for (var counter = 0; counter < data.tags.length; counter++) {
            temp_array.push(data.tags[counter].tag_name);
        }

        $("#gintags").val(temp_array);
        var gintag_details = {
            office: data.office,
            site: data.site,
            data,
            cmd: "insert"
        };

        getGintagGroupContacts(data);

        $("input[name=\"sitenames\"]:checked").each(function () {
            tagSitenames.push(this.value);
        });

        var tagOffices = [];

        $("input[name=\"offices\"]:checked").each(function () {
            tagOffices.push(this.value);
        });

        if (tagSitenames.length == 0) {
            $("input[name=\"candidate-sites-narrative\"]:checked").each(function () {
                tagSitenames.push(this.value);
            });
        }

        if (tagOffices.length == 0) {
            tagOffices = data.office;
        }

        if (tagSitenames.length == 0) {
            tagSitenames = data.site;
        }

        gintags_msg_details.tags = data.tags;

        for (var tag_counter = 0; tag_counter < tagSitenames.length; tag_counter++) {
            if (tagSitenames[tag_counter] == "MES") {
                var mes_sites = ["MSL", "MSU"];
                for (var msl_msu_counter = 0; msl_msu_counter < 2; msl_msu_counter++) {
                    getOngoingEvents(mes_sites[msl_msu_counter], gintag_details);
                }
            } else {
                getOngoingEvents(tagSitenames[tag_counter], gintag_details);
            }
        }
    });

    function checkPersonForMultipleSite (gintag_details) {
        var site_collection = [];
        $.post("../gintags_manager/multipleSite/", { numbers: temp_multiple_sites })
        .done((response) => {
            try {
                var data = JSON.parse(response);
                for (var counter = 0; counter < data.length; counter++) {
                    for (var sub_counter = 0; sub_counter < data[counter].length; sub_counter++) {
                        if ($.inArray(data[counter][sub_counter].sitename, site_collection != -1)) {
                            site_collection.push(data[counter][sub_counter].sitename);
                        }
                    }
                }
                $("#site-select-narrative-container").hide();
                $("#site-select-narrative").empty();
                if (site_collection.length > 1) {
                    $("#site-select-narrative-container").show();
                    for (var counter = 0; counter < site_collection.length; counter++) {
                        $("#site-select-narrative").append(`<li><div class='checkbox' style='margin: 10px;'><label><input type='checkbox' name='candidate-sites-narrative' value='${site_collection[counter]}'>${site_collection[counter]}</label></div></li>`);
                    }
                }
            } catch (err) {
                console.log("Group message mode");
            }
        });
    }

    function displayNarrativeConfirmation (gintag_details) {
        checkPersonForMultipleSite(gintag_details);
        if (gintag_details.data[1] == "You") {
            var summary = "";
            var office = "Office(s): ";
            var site = "Site(s): ";
            for (var counter = 0; counter < gintag_details.office.length; counter++) {
                office = `${office + gintag_details.office[counter]} `;
            }
            for (var counter = 0; counter < gintag_details.site.length; counter++) {
                site = `${site + gintag_details.site[counter]} `;
            }

            summary = `${office}\n${site}\n\n${gintag_details.data[4]}`;
            $("#save-narrative-content p").text(`Saving an ${tag_indicator} tagged message will be saved to narratives.`);
            $("#ewi-tagged-msg").val(summary);
        } else {
            var summary = "";
            var sender = `Sender(s): ${gintag_details.data[1]}`;
            summary = `${sender}\n\n${gintag_details.data[4]}`;
            $("#save-narrative-content p").text(`Saving an ${tag_indicator} tagged message will be saved to narratives.`);
            $("#ewi-tagged-msg").val(summary);
        }
        $("#save-narrative-modal").modal("toggle");
    }

    function insertGintagService (data) {
        var tags = $("#gintags").val();
        var gintags;
        var gintags_collection = [];
        tags = tags.split(",");

        var tagOffices = [];
        $("input[name=\"offices\"]:checked").each(function () {
            tagOffices.push(this.value);
        });

        var tagSitenames = [];
        $("input[name=\"sitenames\"]:checked").each(function () {
            tagSitenames.push(this.value);
        });

        if (tagOffices.length == 0 && tagSitenames.length == 0) {
            tagOffices = [];
            tagSitenames = [];
            var contactIdentifier = $("#contact-indicator").val().split(" ");
            tagOffices.push(contactIdentifier[1]);
            if (contactIdentifier[0].indexOf("[") != -1 && contactIdentifier[0].indexOf("]")) {
                var sites = contactIdentifier[0].split(",");
                for (var counter = 0; counter < sites.length; counter++) {
                    sites[counter] = sites[counter].replace("[", "");
                    sites[counter] = sites[counter].replace("]", "");
                    tagSitenames.push(sites[counter]);
                }
            } else {
                tagSitenames.push(contactIdentifier[0]);
            }
        }

        $.post("../gintags_manager/getGintagDetails/", { gintags: tags })
        .done((response) => {
            var gintag_narratives = JSON.parse(response);

            var gintag_details = {
                office: tagOffices,
                site: tagSitenames,
                data,
                cmd: "insert"
            };

            var non_narratives = [];
            for (var counter = 0; counter < gintag_narratives.length; counter++) {
                tags.splice($.inArray(gintag_narratives[counter].tag_name, tags), 1);
            }

            // Insert to gintags all non narrative tags
            $("#gintags").val(tags);
            if (tags.length != 0) {
                getGintagGroupContacts(gintag_details);
            }
            if (gintag_narratives.length != 0) {
                gintag_details.tags = gintag_narratives;
                $("#gintag_details_container").val(JSON.stringify(gintag_details));
                displayNarrativeConfirmation(gintag_details);
                console.log("Has tag for narratives");
            }
        });
    }

    function removeIndividualGintag (gintag_details) {
        $.post("../generalinformation/removeIndividualGintagEntryViaChatterbox", { gintags: gintag_details })
        .done((response) => {
            $.notify("GINTAG successfully removed!", "success");
            $("#messages li").eq(message_li_index).removeClass("tagged");
        });
    }

    function getGintagGroupContacts (gintag_details) {
        if (gintag_details.cmd == "insert") {
            var tags = $("#gintags").val();
            tags = tags.split(",");
            if (tags[0] != "") {
                console.log("GO HERE");
                console.log(gintag_details);
                $.post("../communications/chatterbox/gintagcontacts/", { gintags: JSON.stringify(gintag_details) })
                .done((response) => {
                    var data = JSON.parse(response);
                    for (var i = 0; i < tags.length; i++) {
                        gintags_collection = [];
                        for (var x = 0; x < data.length; x++) {
                            for (var y = 0; y < data[x].length; y++) {
                                gintags = {
                                    tag_name: tags[i],
                                    tag_description: "communications",
                                    timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
                                    tagger: tagger_user_id,
                                    table_element_id: data[x][y].sms_id,
                                    table_used: "smsoutbox",
                                    remarks: ""
                                };
                                gintags_collection.push(gintags);
                            }
                        }
                        if (gintags_collection != null || gintags_collection.length > 0) {
                            $.post("../generalinformation/insertGinTags/", { gintags: gintags_collection })
                            .done((response) => {
                                $("#messages li").eq(message_li_index).addClass("tagged");
                            });
                        }
                    }
                    $.notify("GINTAG successfully tagged ", "success");
                });
            }
        } else if (gintag_details.cmd == "delete") {
            if (gintag_details.data[1] == "You") {
                $.post("../communications/chatterbox/gintagcontacts/", { gintags: JSON.stringify(gintag_details) })
                .done((response) => {
                    var data = JSON.parse(response);
                    var number_collection = [];
                    for (var counter = 0; counter < data.length; counter++) {
                        var numbers = data[counter].number.split(",");
                        for (var num_count = 0; num_count < numbers.length; num_count++) {
                            number_collection.push(numbers[num_count]);
                        }
                    }
                    var toBeRemoved = {
                        contact: number_collection,
                        details: gintag_details
                    };

                    $.post("../generalinformation/removeGintagsEntryViaChatterbox/", { gintags: toBeRemoved })
                    .done((response) => {
                        $.notify("GINTAG successfully removed!", "success");
                        $("#messages li").eq(message_li_index).removeClass("tagged");
                    });
                });
            } else {
                var toBeRemoved = {
                    details: gintag_details
                };
                $.post("../generalinformation/removeGintagsEntryViaChatterbox/", { gintags: toBeRemoved })
                .done((response) => {
                    $.notify("GINTAG successfully removed!", "success");
                    $("#messages li").eq(message_li_index).removeClass("tagged");
                });
            }
        }
    }

    $("#reset-gintags").on("click", () => {
        $("#gintags").val("");
        $("#gintags").tagsinput("removeAll");
        getGintagService(gintags_msg_details[5]);
    });

    var holdTags;
    function getGintagService (data) {
        $("#gintags").val("");
        $("#gintags").tagsinput("removeAll");
        $.get(`/../../gintagshelper/getGinTagsViaTableElement/${data}`, (response) => {
            for (var i = 0; i < response.length; i++) {
                $("#gintags").tagsinput("add", response[i].tag_name);
            }
            holdTags = $("#gintags").val();
        }, "json");
    }

    function updateContactService (data, wrapper) {
        $.post("../communications/chatterbox/updatecontacts", { contact: JSON.stringify(data) })
        .done((response) => {
            console.log(response);
            if (wrapper == "employee-contact-wrapper") {
                getEmpContact();
            } else {
                getComContact();
            }
            if (response == "true") {
                $("#contact-result").remove();
                $.notify("Success! Existing contact updated.", "success");
                $("#employee-contact-wrapper").prop("hidden", true);
                $("#community-contact-wrapper").prop("hidden", true);
            } else {
                $("#contact-result").remove();
                var container = document.getElementById(wrapper);
                var resContainer = document.createElement("div");
                resContainer.id = "contact-result";
                resContainer.className = "alert alert-danger";
                resContainer.innerHTML = "<strong>Failed!</strong> Invalid input data";
                container.insertBefore(resContainer, container.childNodes[0]);
            }
        });
    }

});
