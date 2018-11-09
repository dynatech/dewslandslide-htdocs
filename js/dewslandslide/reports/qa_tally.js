let event_qa_template = Handlebars.compile($('#event-qa-template').html());
let extended_qa_template = Handlebars.compile($('#extended-qa-template').html());
let routine_qa_template = Handlebars.compile($('#routine-qa-template').html());
let event_data = null;
let extended_data = null;

$(document).ready(function () {
    initializeHandleBars();
    initializeEventQA().then((event_data) => {
       event_data = data;
       if (event_data.length == 0) {
        initializeDefaultEventQA().then((sites_data) => {
            initializeDefaultRecipients(sites_data);
        });
       } else {
        // DISPLAY
       }
    });

    initializeExtendedQA().done((extended_data) => {
       if (extended_data.length == 0) {
        initializeDefaultExtendedQA().then((sites_data) => {
            initializeDefaultRecipients(sites_data);
        });
       } else {
         // DISPLAY
       }
    });
    initializeRoutineQA();
});


function initializeHandleBars() {
    let event_qa_html = event_qa_template();
    let extended_qa_html = extended_qa_template();
    let routine_qa_html = routine_qa_template();
    $("#event-qa-display").html(event_qa_html);
    $("#extended-qa-display").html(extended_qa_html);
    $("#routine-qa-display").html(routine_qa_html);
}

function initializeEventQA() {
    return $.getJSON("../qa_tally/event");
}

function initializeExtendedQA() {
    return $.getJSON("../qa_tally/extended");
}

function initializeRoutineQA() {

}

function initializeDefaultEventQA() {
    return $.getJSON("../qa_tally/event_default");
}

function initializeDefaultExtendedQA() {
    return $.getJSON("../qa_tally/extended_default");
}

function initializeDefaultRecipients(site_data) {
    let site_ids_container = [];
    for (let counter = 0; counter < sites_data.length; counter++) {
        site_ids_container.push(sites_data.site_id);
    }

    $.post("../qa_tally/get_default_recipients", {site_ids : JSON.stringify(site_ids_container)})
    .done(function(data) {
        console.log(data);
    }); 

}