$(document).ready(function(){

});

function setTargetTime (hour, minute) {
    var t = new Date();
    t.setHours(hour);
    t.setMinutes(minute);
    t.setSeconds(0);
    t.setMilliseconds(0);

    return t;
}

function arraysEqual (a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    for (let counter = 0; counter < a.length; counter += 1) { // originally ++counter: subject to debugging
        if (a[counter] !== b[counter]) return false;
    }
    return true;
}

function trimmedContactNum (inputContactNumber) {
    var numbers = /^[0-9]+$/;
    var trimmed_collection = [];
    var trimmed;
    var raw = inputContactNumber.split("-");
    if (raw.length == 1) {
        var targetNumber = raw[0].split(",");
    } else {
        var targetNumber = raw[1].split(",");
    }
    for (var counter = 0; counter < targetNumber.length; counter++) {
        if (targetNumber[counter].trim().match(numbers) && targetNumber[counter].trim() != "") {
            var size = targetNumber[counter].trim().length;

            if (size == 12) {
                trimmed = targetNumber[counter].trim().slice(2, size);
            } else if (size == 11) {
                trimmed = targetNumber[counter].trim().slice(1, size);
            } else if (size == 10) {
                trimmed = targetNumber[counter].trim();
            } else {
                console.log("Error: No such number in the Philippines");
                return -1;
            }

            trimmed_collection.push(trimmed);
        } else {
            console.log("Please input numeric characters only");
            return -1;
        }
    }

    return trimmed_collection;
}

function normalizedContactNum (targetNumber) {
    var trimmed = trimmedContactNum(targetNumber);

    if (trimmed < 0) {
        console.log("Error: Invalid Contact Number");
        return -1;
    }

    return `63${trimmed}`;
}

function loadSearchedMessage (msg) {
    message_counter = 0;
    if (msg.type == "searchMessage" || msg.type == "searchMessageGroup") {
        messages = [];
        search_results = [];
        var searchedResult = msg.data;
        var res;
        try {
            for (var i = searchedResult.length - 1; i >= 0; i--) {
                res = searchedResult[i];
                updateMessages(res);
                message_counter += 1;
            }
        } catch (err) {
            console.log("No Result/Invalid Request");
        }
        var messages_html = messages_template_both({ messages: search_results });
        $("#search-result").html(messages_html);
        $("#search-result-modal").modal("toggle");

        if (msg.type == "searchMessage") {
            message_type = "smsload";
        } else {
            message_type = "smsloadrequestgroup";
        }
        message_counter = 0;
    } else if (msg.type == "smsLoadSearched" || msg.type == "smsLoadGroupSearched") {
        messages = [];
        var searchedResult = msg.data;
        var res;
        try {
            for (var i = 0; i < searchedResult.length; i++) {
                res = searchedResult[i];
                updateMessages(res);
                if (contact_header == "") {
                    if (res.user != "You") {
                        contact_header = res.user;
                    }
                }
                message_counter += 1;
            }
        } catch (err) {
            console.log("No Result/Invalid Request");
        }

        var messages_html = messages_template_both({ messages: search_results });
        $("#messages").html(messages_html);
        messages = [];

        if (msg.type == "smsLoadSearched" || msg.type == "smsloadGlobalSearched") {
            message_type = "smsload";
        } else if (msg.type == "smsLoadGroupSearched") {
            message_type = "smsloadrequestgroup";
        }
        message_counter = 0;

        var targetLi = document.getElementById(coloredTimestamp);
        targetLi.style.border = "solid";
        targetLi.style.borderColor = "#dff0d8";
        targetLi.style.borderRadius = "3px";
        targetLi.style.borderWidth = "5px";
        $("html, body").scrollTop(targetLi.offsetTop - 300);
    } else if (msg.type == "smsloadGlobalSearched" || msg.type == "smsloadTimestampsentSearched" || msg.type == "smsloadTimestampwrittenSearched") {
        messages = [];
        trimmed_number = [];
        var searchedResult = msg.data;
        var res;
        var contact_header = "";
        try {
            for (var i = searchedResult.length - 1; i >= 0; i--) {
                res = searchedResult[i];
                updateGlobalMessage(res);
                if (contact_header == "") {
                    if (res.user != "You" || res.sender != "You") {
                        contact_header = res.user;
                    }
                }
                message_counter += 1;
            }
        } catch (err) {
            console.log("No Result/Invalid Request");
        }
        message_type = "smsload";
        var messages_html = messages_template_both({ messages: search_results });
        $("#messages").html(messages_html);
        message_counter = 0;

        $("#convo-header .panel-heading").text(msg.talking_to);
        trimmed_number.push(`0${msg.mobile_no}`);
        $("#convo-header .panel-body").text(trimmed_number);
        $("#contact-indicator").val(msg.talking_to);

        $("#main-container").removeClass("hidden");
        $("#search-global-message-modal").modal("hide");
        $("body").removeClass("modal-open");
        $(".modal-backdrop").remove();

        var targetLi = document.getElementById(coloredTimestamp);
        targetLi.style.borderColor = "#dff0d8";
        targetLi.style.borderRadius = "3px";
        targetLi.style.borderWidth = "5px";
        console.log(targetLi.offsetTop);
        $("html, body").scrollTop(targetLi.offsetTop - 300);
    } else if (msg.type == "searchMessageGlobal" || msg.type == "searchGintags" || msg.type == "searchedTimestampwritten" || msg.type == "searchedTimestampsent" || msg.type == "searchedUnknownNumber") {
        messages = [];
        var searchedResult = msg.data;
        var currentPos = 1;
        var itemPerPage = 50;
        var totalItems = searchedResult.length;
        var totalPages = Math.round(totalItems / itemPerPage);
        var res;

        $("#searched-key-pages").empty();
        try {
            if (totalItems > 50) {
                console.log("Candidate for paginate");
                var msg_search_data = {
                    curretPost: currentPos,
                    itemPerPage,
                    totalItems,
                    totalPages,
                    data: searchedResult
                };

                paginate(msg_search_data);
                search_results = [];
            } else {
                for (var i = 0; i < searchedResult.length; i++) {
                    res = searchedResult[i];
                    updateGlobalMessage(res);
                    message_counter += 1;
                }

                var messages_html = messages_template_both({ messages: search_results });
                $("#search-global-result").html(messages_html);
                var maxScroll = $(document).height() - $(window).height();
                $("#search-global-result").scrollTop(maxScroll);
            }
        } catch (err) {
            console.log("No Result/Invalid Request");
            console.log(err.message);
        }
    } else {
        console.log("No Result/Invalid Request");
    }
    search_results = [];
    message_counter = 0;
}

function updateGlobalMessage (msg) {
    if (msg.user == "You" || msg.sender == "You") {
        msg.isyou = 1;
        search_results.push(msg);
    } else {
        msg.isyou = 0;
        msg.user = msg.user;
        search_results.push(msg);
    }
}
    

function paginate (data) {
    // Initialize pages
    temp = [];
    for (var item_counter = 1; item_counter <= data.totalItems; item_counter++) {
        if (item_counter % 50 != 0) {
            temp.push(data.data[item_counter]);
        } else {
            searched_cache.push(temp);
            temp = [];
            temp.push(data.data[item_counter]);
        }
    }

    $("#searched-key-pages").show();
    $("#searched-key-pages").twbsPagination({
        totalPages: data.totalPages,
        visiblePages: 7,
        onPageClick (event, page) {
            for (var paginate_counter = 0; paginate_counter < searched_cache[page - 1].length; paginate_counter++) {
                updateGlobalMessage(searched_cache[page - 1][paginate_counter]);
            }
            var messages_html = messages_template_both({ messages: search_results });
            $("#search-global-result").html(messages_html);
            var maxScroll = $(document).height() - $(window).height();
            $("#search-global-result").scrollTop(maxScroll);
            search_results = [];
        }
    });
}

function reset_ec () {
    $("#firstname_ec").val("");
    $("#lastname_ec").val("");
    $("#grouptags_ec").val("");
    $("#nickname_ec").val("");
    $("#email_ec").val("");
    $("#numbers_ec").val("");
    $("#grouptags_ec").val("");
    $("#numbers_ec").tagsinput("removeAll");
    $("#grouptags_ec").tagsinput("removeAll");
}
$("#btn-clear-cc").on("click", () => {
    if ($("#settings-cmd").val() == "updatecontact") {
        $("#community-contact-wrapper").attr("hidden", true);
        getComContact();
    } else {
        reset_cc();
    }
});

function reset_cc () {
    $("#firstname_cc").val("");
    $("#lastname_cc").val("");
    $("#prefix_cc").val("");
    $("#rel_cc").val("");
    $("#numbers_cc").val("");
    $("#numbers_cc").tagsinput("removeAll");
    $("#office_cc").val("LLMC");
    $("#sitename_cc").val("AGB");
    $("#rel").val("Y");
    $("#ewirecipient").val("1");

    $("#other-officename").val("");
    $("#other-sitename").val("");

    $("#other-officename").hide();
    $("#other-sitename").hide();
}