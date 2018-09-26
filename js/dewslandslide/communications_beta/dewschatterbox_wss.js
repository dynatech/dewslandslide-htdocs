var wss_connect = connectWS();

$(document).ready(function() {

});

function getOfficesAndSitenames () {
    try {
        var msg = {
            type: "loadofficeandsitesrequest"
        };
        wss_connect.send(JSON.stringify(msg));
    } catch (err) {
    }
}

function connectWS () {
    $("#chatterbox-loading").modal("show");
    console.log("trying to connect to web socket server");
    try {
        var tempConn = new WebSocket(`ws://${window.location.host}:5050`);
    } catch (err) {

    }

    tempConn.onopen = function (e) {
        $("#chatterbox-loading").modal("hide");
        console.log("Connection established!");

        connection_status = true;
        WSS_CONNECTION_STATUS = 0;
        reconnection_delay = 10000;

        if (is_first_successful_connect) {
            getOfficesAndSitenames();
            setTimeout(
                () => {
                    getInitialQuickInboxMessages();
                    getLatestAlert();
                },
                500
            );
            is_first_successful_connect = false;
        }
        if (window.timerID) {
            window.clearInterval(window.timerID);
            window.timerID = 0;
        }
        $("#send-msg").removeClass("disabled");
    };

    tempConn.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        tempMsg = msg;
        message_type = msg.type;
        if ((msg.type == "smsload") || (msg.type == "smsloadrequestgroup") || (msg.type == "loadEmployeeTag")) {
            $("#chatterbox-loading").modal("hide");
            initLoadMessageHistory(msg);
            first_load = false;
        } else if (msg.type == "hasNullEWIRecipient") {
            initLoadMessageHistory(msg);
        } else if (msg.type == "resumeLoading") {
            $("#ewi-recipient-update-modal").modal("toggle");
            loadGroups();
        } else if (msg.type == "fetchGndMeasReminderSettings") {
            if (msg.saved == true) {
                reconstructSavedSettingsForGndMeasReminder(msg.save_settings,msg.event_sites, msg.extended_sites, msg.routine_sites);
            } else {
                displaySitesForGndMeasReminder(msg);
            }
            $("#ground-meas-reminder-modal").modal("show");
            $("#add-special-case").prop("disabled", false); // Re-enables the Add Special Case when modal is dismissed
        } else if (msg.type == "oldMessage") {
            loadOldMessages(msg);
            message_type = "smsload";
        } else if (msg.type == "oldMessageGroup") {
            loadOldMessages(msg);
            message_type = "smsloadrequestgroup";
        } else if (msg.type == "searchMessage") {
            $("#chatterbox-loading").modal("hide");
            loadSearchedMessage(msg);
            message_type = "searchMessage";
        } else if (msg.type == "searchMessageGlobal") {
            $("#chatterbox-loading").modal("hide");
            loadSearchedMessage(msg);
        } else if (msg.type == "searchMessageGroup") {
            $("#chatterbox-loading").modal("hide");
            loadSearchedMessage(msg);
            message_type = "searchMessageGroup";
        } else if (msg.type == "searchGintags") {
            $("#chatterbox-loading").modal("hide");
            loadSearchedMessage(msg);
        } else if (msg.type == "smsLoadSearched" || msg.type == "smsLoadGroupSearched") {
            $("#chatterbox-loading").modal("hide");
            loadSearchedMessage(msg);
        } else if (msg.type == "smsloadGlobalSearched") {
            $("#chatterbox-loading").modal("hide");
            loadSearchedMessage(msg);
        } else if (msg.type == "searchedTimestampwritten") {
            $("#chatterbox-loading").modal("hide");
            loadSearchedMessage(msg);
        } else if (msg.type == "searchedTimestampsent") {
            $("#chatterbox-loading").modal("hide");
            loadSearchedMessage(msg);
        } else if (msg.type == "searchedUnknownNumber") {
            $("#chatterbox-loading").modal("hide");
            loadSearchedMessage(msg);
        } else if (msg.type == "smsloadTimestampsentSearched") {
            $("#chatterbox-loading").modal("hide");
            loadSearchedMessage(msg);
        } else if (msg.type == "smsloadTimestampwrittenSearched") {
            $("#chatterbox-loading").modal("hide");
            loadSearchedMessage(msg);
        } else if (msg.type == "smsloadquickinbox") {
            initLoadQuickInbox(msg);
        } else if (msg.type == "latestAlerts") {
            initLoadLatestAlerts(msg);
            $("#chatterbox-loading").modal("hide");
        } else if (msg.type == "groupMessageQuickAcces") {
            initLoadGroupMessageQA(msg);
        } else if (msg.type == "loadofficeandsites") {
            offices_and_sites = msg;
            loadOfficesAndSites(offices_and_sites);
        } else if (msg.type == "loadnamesuggestions") {
            contact_suggestions = msg.data;

            if (msg.data == null) {
                return;
            }

            var suggestionsArray = [];
            for (var i in msg.data) {
                var suggestion = `${msg.data[i].fullname.replace(/\?/g, () => "\u00f1")
                } - ${msg.data[i].numbers}`;
                suggestionsArray.push(suggestion);
            }

            comboplete.list = suggestionsArray;
        } else if (msg.type == "ewi_tagging") {
            gintags_collection = [];
            var tag = "";
            if ($("#edit-btn-ewi-amd").val() === "edit") {
                tag = "#EwiMessage";
                $("#messages li").last().addClass("tagged");
            } else if ($("#edit-btn-ewi-amd").val() === "undo") {
                tag = "#AlteredEWI";
                $("#messages li").last().addClass("tagged");
            }

            temp_msg_holder.sms_id = msg.data[parseInt(msg.data.length - 1)];
            temp_msg_holder.timestamp = msg.timestamp;
            temp_msg_holder.table_used = "smsoutbox";

            updateMessages(temp_msg_holder);

            var current_timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
            if (tag != "") {
                for (var i = 0; i < msg.data.length; i++) {
                    gintags = {
                        tag_name: tag,
                        tag_description: "communications",
                        timestamp: current_timestamp,
                        tagger: tagger_user_id,
                        table_element_id: msg.data[i][0],
                        table_used: "smsoutbox",
                        remarks: ""
                    };
                    gintags_collection.push(gintags);
                }
                $.post("../generalinformation/insertGinTags/", { gintags: gintags_collection })
                .done((response) => {
                    var event_details = JSON.parse($("#event_details").val());
                    var current_recipients = $("#ewi-recipients-dashboard").tagsinput("items");
                    var tagOffices = [];

                    $("input[name=\"offices\"]:checked").each(function () {
                        tagOffices.push(this.value);
                    });

                    var raw_recipient = $("#ewi-recipients-dashboard").val().split(",");
                    for (var recipient_counter = 0; recipient_counter < raw_recipient.length; recipient_counter++) {
                        if ($.inArray(raw_recipient[recipient_counter].slice(0, raw_recipient[recipient_counter].indexOf(":")), narrative_recipients) == -1) {
                            narrative_recipients.push(raw_recipient[recipient_counter].slice(0, raw_recipient[recipient_counter].indexOf(":")));
                        }
                    }

                    $.post("../gintags_manager/getGintagDetails/", { gintags: [tag] })
                    .done((response) => {
                        var data = JSON.parse(response);
                        var narrative_template = data[0].narrative_input;
                        var key_list = ["(stakeholders)", "(current_release_time)", "(previous_release_time)", "(sms_msg)", "(sender)"];
                        for (var counter = 0; counter < key_list.length; counter++) {
                            if (narrative_template.indexOf(key_list[counter]) != -1) {
                                var key_replacement = "";
                                switch (key_list[counter]) {
                                    case "(stakeholders)":
                                        narrative_recipients.forEach((x) => {
                                            if (key_replacement == "") {
                                                key_replacement = x.trim();
                                            } else {
                                                key_replacement = `${key_replacement}, ${x.trim()}`;
                                            }
                                        });
                                        narrative_template = narrative_template.replace("(stakeholders)", key_replacement);
                                        break;
                                    case "(current_release_time)":
                                        var x = moment(data_timestamp).hour() % 1 == 0 && moment(data_timestamp).minute() == 30 ? moment(data_timestamp).add(30, "m").format("hh:mm A") : moment(data_timestamp).format("hh:mm A");
                                        if (/12:\d{2} PM/g.test(x)) x = x.replace("PM", "NN"); else if (/12:\d{2} AM/g.test(x)) x = x.replace("AM", "MN");
                                        narrative_template = narrative_template.replace("(current_release_time)", x);
                                        break;
                                }
                            }
                        }
                        narrative_recipients = [];

                        if (tag == "#EwiMessage" || tag == "#AlteredEWI") {
                            var narrative_details = {
                                event_id: event_details.event_id,
                                site_id: event_details.site_id,
                                municipality: event_details.municipality,
                                province: event_details.province,
                                barangay: event_details.barangay,
                                sition: event_details.sition,
                                ewi_sms_timestamp: current_timestamp,
                                narrative_template: narrative_template
                            };
                            $.post("../narrativeAutomation/insert/", { narratives: narrative_details })
                            .done((response) => {
                                var start = moment().format("YYYY-MM-DD HH:mm:ss");
                                var rounded_release;
                                var last_rounded_release;
                                var previous_release;

                                if (moment(start).minute() < 30) {
                                    var rounded_release = moment(start).startOf("hour").format("YYYY-MM-DD HH:mm:ss");
                                } else {
                                    var rounded_release = moment(start).add(1, "h").startOf("hour").format("YYYY-MM-DD HH:mm:ss");
                                }

                                var current_release_day = moment(start).startOf("day").format("YYYY-MM-DD HH:mm:ss");

                                if (moment(moment(event_details.data_timestamp).add(30, "m")).hour() % 4 != 0) {
                                    var onset = moment(event_details.data_timestamp).format("YYYY-MM-DD HH:mm:ss");
                                }

                                if (moment(rounded_release).hour() % 4 == 0 && moment(event_details.data_timestamp).add(30, "m").hour() % 4 == 0) {
                                    last_rounded_release = moment(rounded_release).subtract(4, "h").format("YYYY-MM-DD HH:mm:ss");
                                } else {
                                    last_rounded_release = moment(event_details.data_timestamp).format("YYYY-MM-DD HH:mm:ss");
                                }

                                previous_release = moment(last_rounded_release).subtract(210, "m").format("YYYY-MM-DD HH:mm:ss");

                                var lastReleaseData = {
                                    event_id: event_details.event_id,
                                    current_release_time: rounded_release,
                                    last_release_time: last_rounded_release,
                                    previous_release,
                                    data_timestamp: event_details.data_timestamp
                                };

                                $.post("../narrativeautomation/checkack/", { last_release: lastReleaseData }).done((data) => {
                                    var response = JSON.parse(data);
                                    var last_rounded_release = response.res[0].narrative.substring(5, 13);
                                    if (response.ack == "no_ack") {
                                        var narrative_details = {
                                            event_id: event_details.event_id,
                                            site_id: event_details.site_id,
                                            municipality: event_details.municipality,
                                            province: event_details.province,
                                            barangay: event_details.barangay,
                                            sition: event_details.sition,
                                            ewi_sms_timestamp: moment(data_timestamp).add(29, "m").format("YYYY-MM-DD HH:mm:ss"),
                                            narrative_template: `No acknowledgement from all stakeholders for ${last_rounded_release} EWI Release`
                                        };
                                        $.post("../narrativeAutomation/insert/", { narratives: narrative_details }).done((data) => {
                                            console.log(data);
                                        });
                                    }
                                });
                                $("#loading").hide();
                                $("#result-ewi-message").text("Early Warning Information sent successfully!");
                                $("#success-ewi-modal").modal("toggle");
                            });
                        }
                    });
                });
            }
        } else {
            var numbers = /^[0-9]+$/;
            if (msg.type == "ackgsm") {
                let execution_time = moment(moment(msg.timestamp_written).format("YYYY-MM-DD HH:mm:ss")).diff(moment(msg.timestamp_sent).format("YYYY-MM-DD HH:mm:ss"),'ms'); // to change to performance.now
                console.log(execution_time);
                let timeliness_report = {
                    "type": "timeliness",
                    "metric_name": "sms_execution_time",
                    "module_name": "chatterbox",
                    "reference_id": msg.sms_id,
                    "reference_table": "smsoutbox",
                    "execution_time": moment(execution_time).format("X")
                };
                PMS.send(timeliness_report);
                
                $("#messages li:last #timestamp-sent").removeClass();
                if ($("#chat-user").text() == "You" && $("#messages li:last #timestamp-written").text() == gsm_timestamp_indicator) {
                    $("#messages li:last #timestamp-sent").html(msg.timestamp_sent);
                    if (msg.status == "SENT") {
                        $("#messages li:last .ack_status").text("Sent by GSM");
                        $("#messages li:last .fas").removeClass("fa-spinner fa-spin");
                        $("#messages li:last .fas").addClass("fa-check-circle");
                        $("#messages li:last .primary-font").addClass("sent-status-success");
                        $("#messages li:last #timestamp-sent").addClass("sent-status-success");
                    } else {
                        $("#messages li:last .ack_status").text("GSM sending failed");
                        $("#messages li:last .fas").removeClass("fa-spinner fa-spin");
                        $("#messages li:last .fas").addClass("fa-times-circle");
                        $("#messages li:last .primary-font .right-content").addClass("sent-status-fail");
                        $("#messages li:last #timestamp-sent").addClass("sent-status-pending");
                        $("#messages li:last #chat-user").removeClass("sent-status-pending");
                        $("#messages li:last #chat-user").addClass("sent-status-fail");
                    }
                }
            } else if (msg.type == "ackrpi") {
                $("#messages li:last #timestamp-sent").removeClass();
                if (msg.send_status == "SENT-PI") {
                    $("#messages li:last .ack_status").text("Sent to server");
                    $("#messages li:last #timestamp-sent").addClass("sent-status-pending");
                    $("#messages li:last #chat-user").addClass("sent-status-pending");
                } else {
                    $("#messages li:last .ack_status").text("Unable to send to server");
                    $("#messages li:last #timestamp-sent").addClass("sent-status-pending");
                    $("#messages li:last #chat-user").removeClass("sent-status-pending");
                    $("#messages li:last #chat-user").addClass("sent-status-fail");
                }
            } else if (contact_info === "groups") {
                if (msg.type == "smsrcv") {
                    $.notify("New Message Received!", "info");
                    updateQuickInbox(msg);
                }

                var select_raw_site = $("#current-contacts h4").text().substring(11);
                var selected_site = select_raw_site.substring(0, select_raw_site.indexOf("]")).replace(/\s/g, "").split(",");

                var select_raw_office = select_raw_site.substring(select_raw_site.indexOf("]"));
                var selected_office = select_raw_office.substring(13, select_raw_office.length - 1).replace(/\s/g, "").split(",");

                var sender = msg.name.split(" ");

                for (var i = 0; i < selected_site.length; i++) {
                    if (selected_site[i] == sender[0]) {
                        for (var x = 0; x < selected_office.length; x++) {
                            if (selected_office[x] == sender[1]) {
                                updateMessages(msg);
                            }
                        }
                    }
                }
            } else {
                if (msg.type == "smsrcv") {
                    $.notify("New Message Received!", "info");
                    updateQuickInbox(msg);
                }

                if (msg.user.match(numbers)) {
                    for (i in trimmed_number) {
                        if (normalizedContactNum(trimmed_number[i]) == normalizedContactNum(msg.user)) {
                            updateMessages(msg);
                            return;
                        }
                    }
                } else {
                    for (i in trimmed_number) {
                        for (j in msg.numbers) {
                            if (normalizedContactNum(trimmed_number[i]) == normalizedContactNum(msg.numbers[j])) {
                                updateMessages(msg);
                                return;
                            }
                        }
                    }
                }
            }
        }
    };

    tempConn.onclose = function (e) {
        WSS_CONNECTION_STATUS = -1;

        var reason;
        if (event.code == 1000) { reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled."; } else if (event.code == 1001) { reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page."; } else if (event.code == 1002) { reason = "An endpoint is terminating the connection due to a protocol error"; } else if (event.code == 1003) { reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message)."; } else if (event.code == 1004) { reason = "Reserved. The specific meaning might be defined in the future."; } else if (event.code == 1005) { reason = "No status code was actually present."; } else if (event.code == 1006) {
            reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
            $(".notifyjs-wrapper").hide();
            $.notify("VPN Connection detected. Please disable your VPN Proxy (Ultrasurf, Hotspotshield, TunnelBear, etc..) then refresh the page.", "error");
            connection_status = false;
            $("#send-msg").addClass("disabled");
            waitForSocketConnection();
        } else if (event.code == 1007) { reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message)."; } else if (event.code == 1008) { reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy."; } else if (event.code == 1009) { reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process."; } else if (event.code == 1010) { reason = `An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: ${event.reason}`; } else if (event.code == 1011) { reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request."; } else if (event.code == 1015) { reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified)."; } else { reason = "Unknown reason"; }

        console.log(reason);
    };

    return tempConn;
}