var ground_meas_reminder_data;
let special_case_num = 0;
let special_case_id = 0;
let site_count = 0;
var gnd_meas_overwrite;
$(document).ready(function() {
    try {
        let remChars = 800 - $("#msg").val().length - footer.length;
        $("#remaining_chars").text(remChars);
        $("#msg").attr("maxlength", remChars);

    } catch (err) {
        console.log(err);
        console.log("Chatterbox : monitoring dashboard mode");
    }

    try {
        comboplete = new Awesomplete("input.dropdown-input[data-multiple]", {
            filter (text, input) {
                return Awesomplete.FILTER_CONTAINS(text, input.match(/[^;]*$/)[0]);
            },

            replace (text) {
                var before = this.input.value.match(/^.+;\s*|/)[0];
                this.input.value = `${before + text}; `;
            },
            minChars: 3
        });
        comboplete.list = [];

        Awesomplete.$(".dropdown-input").addEventListener("click", () => {
            var nameQuery = $(".dropdown-input").val();

            if (nameQuery.length >= 3) {
                if (comboplete.ul.childNodes.length === 0) {
                    comboplete.evaluate();
                } else if (comboplete.ul.hasAttribute("hidden")) {
                    comboplete.open();
                } else {
                    comboplete.close();
                }
            }
        });

        Awesomplete.$(".dropdown-input").addEventListener("keyup", (e) => {
            var code = (e.keyCode || e.which);
            if (code === 37 || code === 38 || code === 39 || code === 40) {
                return;
            }

            const allNameQueries = $(".dropdown-input").val();
            const nameQuery = getFollowingNameQuery(allNameQueries);

            if (allNameQueries.length < 3) {
                trimmed_number = [];
            }

            if (nameQuery.length >= 3) {
                getNameSuggestions(nameQuery);
            } else {
                comboplete.close();
            }
        }, false);

        Awesomplete.$(".dropdown-input").addEventListener("awesomplete-selectcomplete", (e) => {
            var allText = $(".dropdown-input").val();
            var size = allText.length;
            var allNameQueries = allText.slice(0, size - 2);
            var nameQuery = getFollowingNameQuery(allNameQueries);
        }, false);
    } catch (err) {
        console.log(err.message);
    }

    $("#gnd-meas-category").on("change",function() {
        // Reset special cases on div change [for review]
        // resetSpecialCases();
        changeSemiAutomationSettings($(this).val(), ground_meas_reminder_data);
    });

});

try {
    Handlebars.registerHelper("ifCond", function (v1, v2, v3, v4, v5, v6, v7, options) {
        if (v1 === v2 || v1 == v3 || v1 == v4 || v1 == v5 || v1 == v6 || v1 == v7) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    Handlebars.registerHelper("breaklines", (text) => {
        text = Handlebars.Utils.escapeExpression(text);
        text = text.replace(/(\r\n|\n|\r)/gm, " ");
        return new Handlebars.SafeString(text);
    });

    Handlebars.registerHelper("escape", variable => variable.replace(/(['"-])/g, "\\$1"));
} catch (err) {
    console.log(err.message);
}

function initLoadMessageHistory (msgHistory) {
    if (msgHistory.hasNull === true) {
        for (let counter = 0; counter < msgHistory.data.length; counter += 1) {
            $(".list-ewi-recipient").append(`<li class='list-group-item'><div class='checkbox'><label><input type='checkbox' name='ewi_recipients' value='${JSON.stringify(msgHistory.data[i])}'>${
                msgHistory.data[counter].office} ${msgHistory.data[counter].sitename} ${msgHistory.data[counter].lastname}, ${msgHistory.data[counter].firstname
            } - ${msgHistory.data[counter].number}</label></div></li>`);
        }
        $("#ewi-recipient-update-modal").modal("toggle");
    } else {
        if (msgHistory.data == null) {
            return;
        }
        const history = msgHistory.data;
        temp = msgHistory.data;
        let msg;
        for (let counter = history.length - 1; counter >= 0; counter -= 1) {
            msg = history[counter];
            updateMessages(msg);
            message_counter += 1;
        }
        message_counter = 0;
    }
    $(".chat-message").scrollTop($("#messages").height());
}

function updateMessages (msg) {

    if (msg.timestamp_sent == null) {
        msg.noTimestamp = 1;
    } else {
        msg.noTimestamp = 0;
    }

    if (msg.type != null) {
        msg.recentlySent = 1;
    } else {
        msg.recentlySent = 0;
    }

    if (msg.network == "GLOBE") {
        msg.isGlobe = 1;
    } else {
        msg.isGlobe = 0;
    }

    if (msg.status === "SUCCESS" || msg.status === "SENT") {
        msg.status = 1;
    } else {
        msg.status = 0;
    }
    $("#search-key").hide();

    if (msg.user === "You") {
        msg.isyou = 1;

        if (contact_info === "groups") {
            if (msg.type === "loadEmployeeTag") {
                messages.push(msg);
            } else {
                if (message_type === "smsloadrequestgroup") {
                    messages.push(msg);
                } else {
                    search_results.push(msg);
                }
                if (arraysEqual(msg.offices, group_tags.offices)) {
                    if (message_type === "searchMessageGroup") {
                        search_results.push(msg);
                    } else if (msg.sitenames !== undefined || group_tags.sitenames !== undefined) {
                        if (arraysEqual(msg.sitenames.sort(), group_tags.sitenames)) {
                            messages.push(msg);
                        }
                    } else {
                        messages.push(msg);
                    }
                }
            }
        } else {
            if (message_type === "smsloadrequestgroup") {
                return;
            }
            if (message_type === "searchMessage" || message_type === "smsLoadSearched") {
                search_results.push(msg);
            } else if (message_type === "searchMessageGlobal") {
                search_results.push(msg);
            } else {
                messages.push(msg);
            }
        }
    } else if (contact_info === "groups") {
        if (msg.type === "loadEmployeeTag") {
            msg.isyou = 0;
            messages.push(msg);
        } else {
            if (msg.name === "unknown") {
                return;
            }

            var isTargetSite = false;
            for (i in group_tags.sitenames) {
                if (msg.name == null || msg.msg != null) {
                    msg.isyou = 0;
                    msg.user = "PASALOAD REQUEST";
                    isTargetSite = true;
                    continue;
                } else if ((msg.name.toUpperCase()).indexOf(group_tags.sitenames[i].toUpperCase()) >= 0) {
                    isTargetSite = true;
                    continue;
                }
            }

            if (isTargetSite == false) {
                return;
            }

            var isOffices = false;
            for (i in group_tags.offices) {
                if (msg.name == null) {
                    msg.name = "PASALOAD REQUEST";
                    isOffices = true;
                    continue;
                } else if ((msg.name.toUpperCase()).indexOf(group_tags.offices[i].toUpperCase()) >= 0) {
                    isOffices = true;
                    continue;
                }
            }

            if (isOffices == false) {
                return;
            }

            if (msg.type == "searchMessageGroup" || msg.type == "smsLoadGroupSearched") {
                msg.isyou = 0;
                msg.user = msg.name;
                search_results.push(msg);
            } else {
                msg.isyou = 0;
                msg.user = msg.name;
                messages.push(msg);
            }
        }
    } else {
        for (const counter in contact_info) {
            if (msg.type === "searchMessage" || msg.type === "searchMessageGroup" ||
                    msg.type === "smsLoadGroupSearched" || msg.type === "smsLoadSearched" || msg.type === "smsloadGlobalSearched") {
                if (contact_info[counter].numbers.search(trimmedContactNum(msg.user)) >= 0) {
                    msg.isyou = 0;
                    msg.user = contact_info[counter].fullname;
                    search_results.push(msg);
                    break;
                }
            } else if (contact_info[counter].numbers.search(trimmedContactNum(msg.user)) >= 0) {
                msg.isyou = 0;
                msg.user = contact_info[counter].fullname;
                messages.push(msg);
                break;
            }
        }
    }

    if (ewi_recipient_flag === false && !(msg.type === "oldMessages" || msg.type === "oldMessagesGroup") &&
        !(msg.type === "searchMessage" || msg.type === "searchMessageGroup" || msg.type === "searchMessageGlobal")) {
        try {
            if (messages[message_counter].user === "You") {
                if (last_message_time_stamp_sender === "") {
                    last_message_time_stamp_sender = messages[message_counter].timestamp;
                }
            } else if (last_message_time_stamp_recipient === "") {
                last_message_time_stamp_recipient = messages[message_counter].timestamp;
            }
            if (msg.type === "smssend" || msg.type === "smssendgroup" || msg.type === "smssendgroupemployee") {
                var messages_html = messages_template_both({ messages });
                var htmlString = $("#messages").html();
                $("#messages").html(htmlString + messages_html);
                $(".chat-message").scrollTop($("#messages").height());
                messages = [];
            } else {
                var messages_html = messages_template_both({ messages });
                $("#messages").html(messages_html);
                $(".chat-message").scrollTop($("#messages").height());
            }
        } catch (err) {
            console.log("Not a Scroll/Search related feature");
        }
    }
}


function getNameSuggestions (nameQuery) {
    var nameSuggestionRequest = {
        type: "requestnamesuggestions",
        namequery: nameQuery
    };
    wss_connect.send(JSON.stringify(nameSuggestionRequest));
}

function getFollowingNameQuery (allNameQueries) {
    var before = allNameQueries.match(/^.+;\s*|/)[0];
    var size = before.length;
    var nameQuery = allNameQueries.slice(size);

    return nameQuery;
}

function updateRemainingCharacters () {
    remChars = 800 - $("#msg").val().length - footer.length;
    $("#remaining_chars").text(remChars);
}

function initLoadLatestAlerts (latestAlerts) {
    if (latestAlerts.data == null) {
        return;
    }
    var alerts = latestAlerts.data;
    temp = latestAlerts.data;
    var msg;
    for (var i = alerts.length - 1; i >= 0; i--) {
        msg = alerts[i];
        updateLatestPublicRelease(msg);
        $("input[name=\"sitenames\"]:unchecked").each(function () {
            if ($(this).val().toLowerCase() == alerts[i].name.toLowerCase()) {
                if (alerts[i].status == "on-going") {
                    $(this).parent().css("color", "red");
                } else if (alerts[i].status == "extended") {
                    $(this).parent().css("color", "blue");
                } else {
                    $(this).parent().css("color", "green");
                }
            } else if ($(this).val().toLowerCase() == "mes") {
                if (alerts[i].name == "msl" || alerts[i].name == "msu") {
                    if (alerts[i].status == "on-going") {
                        $(this).parent().css("color", "red");
                    } else if (alerts[i].status == "extended") {
                        $(this).parent().css("color", "blue");
                    } else {
                        $(this).parent().css("color", "green");
                    }
                }
            }
        });
    }
}

function getLatestAlert () {
    var msg = {
        type: "latestAlerts"
    };
    wss_connect.send(JSON.stringify(msg));
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

function updateQuickInbox (msg) {
    if (window.location.href == `${window.location.origin}/communications/chatterbox_beta` || window.location.href == `${window.location.origin}/communications/chatterbox_beta#`) {
        if (msg.user == "You") {
        } else {
            var targetInbox;
            var quick_inbox_html;

            if (msg.name == "unknown") {
                try {
                    msg.isunknown = 1;
                    targetInbox = "#quick-inbox-unknown-display";
                    quick_inbox_unknown.unshift(msg);
                    quick_inbox_html = quick_inbox_template({ quick_inbox_messages: quick_inbox_unknown });
                } catch (err) {
                }
            } else {
                try {
                    msg.isunknown = 0;
                    targetInbox = "#quick-inbox-display";
                    quick_inbox_registered.unshift(msg);
                    quick_inbox_html = quick_inbox_template({ quick_inbox_messages: quick_inbox_registered });
                } catch (err) {
                }
            }

            $(targetInbox).html(quick_inbox_html);
            $(targetInbox).scrollTop(0);
        }

        if (msg.onevent == 1) {
            if (msg.user != "You") {
                var targetInbox;
                var quick_inbox_html;
                msg.isunknown = 0;
                targetInbox = "#quick-event-inbox-display";
                quick_event_inbox.unshift(msg);
                quick_inbox_html = quick_inbox_template({ quick_inbox_messages: quick_event_inbox });
            }

            $(targetInbox).html(quick_inbox_html);
            $(targetInbox).scrollTop(0);
        }
    }
}

function initLoadQuickInbox (quickInboxMsg) {
    if (quickInboxMsg.data == null) {
        return;
    }
    var qiMessages = quickInboxMsg.data;
    temp = quickInboxMsg.data;
    var msg;
    for (var i = qiMessages.length - 1; i >= 0; i--) {
        msg = qiMessages[i];
        updateQuickInbox(msg);
    }
}

function initLoadGroupMessageQA (siteMembers) {
    const group_contacts_quick_access = [];
    group_message_quick_access = [];
    if (siteMembers.data == null) {
        return;
    }

    var members = siteMembers.data;
    temp = siteMembers.data;
    var msg;

    $("#group-message-display").empty();
    var arr_sites = [];
    var arr_contacts = [];

    for (var i = members.length - 1; i >= 0; i--) {
        msg = members[i];
        if ($.inArray(msg.fullname, arr_contacts) == -1) {
            arr_contacts.push(msg.fullname);
        }
    }

    for (var i = members.length - 1; i >= 0; i--) {
        msg = members[i];
        if ($.inArray(msg.site, arr_sites) == -1) {
            arr_sites.push(msg.site);
            var contact_per_site = [];
            for (var counter = 0; counter < arr_contacts.length; counter++) {
                if (arr_contacts[counter].substring(0, 3) == msg.site) {
                    var temp_contacts = {
                        contacts: arr_contacts[counter]
                    };
                    contact_per_site.push(temp_contacts);
                }
            }
            msg.data = contact_per_site;
            updateGroupMessageQuickAccess(msg);
        }
    }
}

function updateGroupMessageQuickAccess (msg) {
    try {
        group_message_quick_access.unshift(msg);
        let group_message_html = group_message_template({ group_message: group_message_quick_access });
        $("#group-message-display").html(group_message_html);
        $("#group-message-display").scrollTop(0);
    } catch (err) {
        console.log(err.message);
    }
}

function updateOldMessages (oldMessages) {
    if (contact_info === "groups") {
        if (oldMessages.user === "You") {
            oldMessages.isyou = 1;
            messages.push(oldMessages);
        } else {
            oldMessages.isyou = 0;
            var isTargetSite = false;
            for (i in group_tags.sitenames) {
                if ((oldMessages.name.toUpperCase()).indexOf(group_tags.sitenames[i].toUpperCase()) >= 0) {
                    isTargetSite = true;
                    continue;
                }
            }
            if (isTargetSite === false) {
                return;
            }
            var isOffices = false;
            for (i in group_tags.offices) {
                if ((oldMessages.name.toUpperCase()).indexOf(group_tags.offices[i].toUpperCase()) >= 0) {
                    isOffices = true;
                    continue;
                }
            }

            if (isOffices === false) {
                return;
            }
            oldMessages.user = oldMessages.name;
            messages.push(oldMessages);
        }
    } else {
        for (i in contact_info) {
            if (oldMessages.user === "You") {
                oldMessages.isyou = 1;
                messages.push(oldMessages);
            } else if (contact_info[i].numbers.search(oldMessages.user) >= 0) {
                oldMessages.isyou = 0;
                oldMessages.user = contact_info[i].numbers;
                messages.push(oldMessages);
            } else {
                oldMessages.isyou = 0;
                oldMessages.user = contact_info[i].fullname;
                messages.push(oldMessages);
            }
        }
    }
}

function loadOldMessages (msg) {
    message_counter = 0;
    last_message_time_stamp_sender = "";
    last_message_time_stamp_recipient = "";

    var oldMessagesIndi = msg.data;
    var oldMsg;
    messages = [];

    if (msg.data != null) {
        for (var i = oldMessagesIndi.length - 1; i >= 0; i--) {
            oldMsg = oldMessagesIndi[i];
            oldMsg.type = msg.type;
            updateOldMessages(oldMsg);
            if (messages[message_counter].user === "You") {
                if (last_message_time_stamp_sender === "") {
                    last_message_time_stamp_sender = messages[message_counter].timestamp;
                    tempTimestampYou = last_message_time_stamp_sender;
                }
            } else if (last_message_time_stamp_recipient === "") {
                last_message_time_stamp_recipient = messages[message_counter].timestamp;
                tempTimestamp = last_message_time_stamp_recipient;
            }
            message_counter += 1;
        }

        var htmlStringMessage = $("#messages").html();
        var messages_html = messages_template_both({ messages });
        $("#messages").html(messages_html + htmlStringMessage);
        $(".chat-message").scrollTop(200);
    } else {
        eom_flag = true;
        alert("End of the Conversation");
        console.log("Invalid Request/End of the Conversation");
    }
    console.log("Loading Old Messages");
}

function loadOfficesAndSites (msg) {
    var offices = msg.offices;
    var sitenames = msg.sitenames;
    var office,
        sitename;
    for (var i = 0; i < offices.length; i++) {
        var modIndex = i % 5;
        office = offices[i];
        $(`#offices-${modIndex}`).append(`<div class="checkbox"><label><input name="offices" type="checkbox" value="${office}">${office}</label></div>`);
    }
    for (var i = 0; i < sitenames.length; i++) {
        var modIndex = i % 6;

        sitename = sitenames[i];
        $(`#sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
    }
}

function getInitialQuickInboxMessages () {
    var msg = {
        type: "smsloadquickinboxrequest"
    };
    wss_connect.send(JSON.stringify(msg));
}

function displaySitesForGndMeasReminder(data) {
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
        var modIndex = i % 6;
        sitename = data.event_sites[i].name.toUpperCase();
        $(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}" checked>${sitename}</label></div>`);
    }

    for (var i = 0; i < data.cant_send_gndmeas.length; i++) {
        var modIndex = i % 6;
        sitename = data.cant_send_gndmeas[i].toUpperCase();
        $(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
    }
}

function reconstructSavedSettingsForGndMeasReminder(settings, def_event, def_extended, def_routine) {

    ground_meas_reminder_data = {
        event: def_event,
        extended: def_event,
        routine: def_routine,
        settings: settings
    }

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
    $(".gndmeas-reminder-site").empty();
    $(".gndmeas-reminder-office").empty();

    for (let counter = 0; counter < settings.length; counter++) {
        switch(settings[counter].type) {
            case 'routine':
                routine_sites_full.push(settings[counter]);
                routine_sites.push(settings[counter].site);
                if ($.inArray(settings[counter].msg, routine_templates_container) == -1) {
                    routine_templates_container.push(settings[counter].msg);
                }
                if (settings[counter].altered_template == 1) {
                    routine_altered.push(settings[counter]);
                }
                break;
            case 'extended':
                extended_sites_full.push(settings[counter]);
                extended_sites.push(settings[counter].site);
                if ($.inArray(settings[counter].msg, extended_templates_container) == -1) {
                    extended_templates_container.push(settings[counter].msg); 
                }

                if (settings[counter].altered_template == 1) {
                    extended_altered.push(settings[counter]);
                }
                break;
            case 'event':

                event_sites_full.push(settings[counter]);
                event_sites.push(settings[counter].site);
                if ($.inArray(settings[counter].msg, event_templates_container) == -1) {
                   event_templates_container.push(settings[counter].msg); 
                }
                if (settings[counter].altered_template == 1) {
                    event_altered.push(settings[counter]);
                }
                break;
        }
    }


    switch($("#gnd-meas-category").val()) {
        case 'extended':
            site_count = def_extended.length;
            for (var i = 0; i < def_extended.length; i++) {
                var modIndex = i % 6;
                sitename = def_extended[i].toUpperCase();
                if ($.inArray(sitename, extended_sites) != -1) {
                    $(`#gnd-sitenames-${modIndex}`).append('<div class="checkbox"><label><input type="text" class="automation_distinction" value="automation_id_'+extended_sites_full[i].automation_id+'" hidden><input name="gnd-sitenames" type="checkbox" value="'+sitename+'" checked>'+sitename+'</label></div>');
                } else {
                    $(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input type="text" class="automation_distinction" value="new" hidden><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
                }
            }
            $("#reminder-message").text(extended_templates_container[0]);

            for (let counter = 0; counter < routine_altered.length; counter++){
                addSpecialCase();
                $("input[name=\"gnd-meas-"+counter+"\"]:checkbox").each(function () {
                    if (extended_altered[counter].site == this.value) {
                        console.log("test");
                        $(this).prop("checked", true);
                    } else {
                        $(this).prop("checked", false);
                    }
                });
            }
            break;
        case 'event':
            site_count = def_event.length;
            for (var i = 0; i < def_event.length; i++) {
                var modIndex = i % 6;
                sitename = def_event[i].name.toUpperCase();
                if ($.inArray(sitename, event_sites) != -1 && $.inArray(event_sites_full[i], event_altered) == -1) {
                  $(`#gnd-sitenames-${modIndex}`).append('<div class="checkbox"><label><input type="text" class="automation_distinction" value="automation_id_'+event_sites_full[i].automation_id+'" hidden><input name="gnd-sitenames" type="checkbox" value="'+sitename+'" checked>'+sitename+'</label></div>');  
                } else {
                    $(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input type="text" class="automation_distinction" value="new" hidden><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
                }

            }

            $("#reminder-message").text(event_templates_container[0]);
            for (let counter = 0; counter < event_altered.length; counter++){
                addSpecialCase();
                $("input[name=\"gnd-meas-"+counter+"\"]:checkbox").each(function () {
                    if (event_altered[counter].site == this.value) {
                        console.log("test");
                        $(this).prop("checked", true);
                    } else {
                        $(this).prop("checked", false);
                    }
                });
            }
            break;
        case 'routine':
            site_count = def_routine.length;
            for (var i = 0; i < def_routine.length; i++) {
                var modIndex = i % 6;
                sitename = def_routine[i].toUpperCase();
                if ($.inArray(sitename, routine_sites) != -1) {
                    $(`#gnd-sitenames-${modIndex}`).append('<div class="checkbox"><label><input type="text" class="automation_distinction" value="automation_id_'+routine_sites_full[i].automation_id+'" hidden><input name="gnd-sitenames" type="checkbox" value="'+sitename+'" checked>'+sitename+'</label></div>');
                } else {
                    $(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input class="automation_distinction" type="text" value="new" hidden><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
                }
            }
            $("#reminder-message").text(routine_templates_container[0]);
            for (let counter = 0; counter < routine_altered.length; counter++){
                addSpecialCase();
                $("input[name=\"gnd-meas-"+counter+"\"]:checkbox").each(function () {
                    if (routine_altered[counter].site == this.value) {
                        $(this).prop("checked", true);
                    } else {
                        $(this).prop("checked", false);
                    }
                });
            }
            break;
    }
}

function changeSemiAutomationSettings(category, data) {
    if (category != "routine" && category != "event" && category != "extended") {
        reconstructSavedSettingsForGndMeasReminder(data.settings, data.event, data.extended, data.routine);
    } else {
        resetCaseDiv();
        console.log(data);
        const currentDate = new Date();
        const current_meridiem = currentDate.getHours();
        let template = data.template.template.replace("(monitoring_type)", category);
        if (current_meridiem >= 13 && current_meridiem <= 18) {
            template = template.replace("(greetings)", "hapon");
        } else if (current_meridiem >= 18 && current_meridiem <= 23) {
            template = template.replace("(greetings)", "gabi");
        } else if (current_meridiem >= 0 && current_meridiem <= 3) {
            template = template.replace("(greetings)", "gabi");
        } else if (current_meridiem >= 4 && current_meridiem <= 11) {
            template = template.replace("(greetings)", "umaga");
        } else {
            template = template.replace("(greetings)", "tanghali");
        }

        $('#reminder-message').text(template);

        $(".gndmeas-reminder-site").empty();
        $(".gndmeas-reminder-office").empty();

        switch(category) {
            case 'extended':
                site_count = data.extended_sites.length;
                for (var i = 0; i < data.extended_sites.length; i++) {
                    var modIndex = i % 6;
                    sitename = data.extended_sites[i].toUpperCase();
                    console.log(sitename);
                    $(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}" checked>${sitename}</label></div>`);
                }

                for (var i = 0; i < data.cant_send_gndmeas.length; i++) {
                    var modIndex = i % 6;
                    sitename = data.cant_send_gndmeas[i].toUpperCase();
                    $(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
                }
                break;
            case 'event':
                site_count = data.event_sites.length;
                console.log(site_count);
                for (var i = 0; i < data.event_sites.length; i++) {
                    var modIndex = i % 6;
                    sitename = data.event_sites[i].name.toUpperCase();
                    $(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}" checked>${sitename}</label></div>`);
                }

                for (var i = 0; i < data.cant_send_gndmeas.length; i++) {
                    var modIndex = i % 6;
                    sitename = data.cant_send_gndmeas[i].toUpperCase();
                    $(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
                }
                break;
            case 'routine':
                site_count = data.routine_sites.length;
                for (var i = 0; i < data.routine_sites.length; i++) {
                    var modIndex = i % 6;
                    sitename = data.routine_sites[i].toUpperCase();
                    $(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}" checked>${sitename}</label></div>`);
                }
                break;
        }
    }

}

$( document ).ready(() => {
    initializeAddSpecialCaseButtonOnClick();
    removeInputField();
    initializeResetSpecialCasesButtonOnCLick();
});

function initializeAddSpecialCaseButtonOnClick () {
    $("#add-special-case").click(() => {
        addSpecialCase();
    });
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
