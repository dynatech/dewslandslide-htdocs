let event_qa_template = Handlebars.compile($('#event-qa-template').html());
let extended_qa_template = Handlebars.compile($('#extended-qa-template').html());
let routine_qa_template = Handlebars.compile($('#routine-qa-template').html());

$(document).ready(function () {
    initializeHandleBars();
});


function initializeHandleBars() {
    let event_qa_html = event_qa_template();
    let extended_qa_html = extended_qa_template();
    let routine_qa_html = routine_qa_template();
    $("#event-qa-display").html(event_qa_html);
    $("#extended-qa-display").html(extended_qa_html);
    $("#routine-qa-display").html(routine_qa_html);
}