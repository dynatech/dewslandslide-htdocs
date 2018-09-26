
/****
 *
 *  Created by Kevin Dhale dela Cruz
 *  JS file for Monitoring Issues and Reminders Modal
 *  
****/

let iarList = {};
let iarListCache = [];
let iarArchived = {};
let iarArchivedCache = [];
let current_iar_id = null;
let active_table = null;
let archived_table = null;


function getNormalAndLockedIssues(data) {

    if ( ($("#issuesAndRemindersModal").data('bs.modal') || {}).isShown ) {
        $('#issuesAndRemindersModal').on('hidden.bs.modal', function (e) {
            openModal();
        });
        $("#issuesAndRemindersModal").modal("hide");
        $(".modal-backdrop").remove();
    } else {
        openModal();
    }
    
    function openModal() 
    {
        let normal = data.normal, locked = data.locked;

        iarList = data.normal.concat(data.locked);
        iarListCache = iarList.map( x => x.iar_id );
        if(data.archived != "" && data.archived != null) {
            iarArchived = data.archived.slice(0);
            iarArchivedCache = iarArchived.map( x => x.iar_id )
        }

        let isPage = window.location.pathname.includes("issues_and_reminders");

        $.post("/../issues_and_reminders/modal", {normal: JSON.stringify(data.normal), locked: JSON.stringify(data.locked)})
        .done(function (data) {
            if( $("#issues_and_reminders_modal").length == 0 ) {
                $("#page-wrapper .container").append("<div id='issues_and_reminders_modal'></div>")
            }
            $("#issues_and_reminders_modal").html(data);
            reposition("#issuesAndRemindersModal");
            if(!isPage) {
                $("#issuesAndRemindersModal").modal("show");
                onLoadIssuesModal();
            } 
            else {
                if( active_table == null )
                    onLoadIssuesPage();
                else {
                    reloadIssuesTable(active_table);
                    reloadIssuesTable(archived_table);
                }
            }
        });
    }
}

function onLoadIssuesModal() {

    $(".datetime-issue").datetimepicker({
        format: 'YYYY-MM-DD HH:mm:00',
        allowInputToggle: true,
        widgetPositioning: {
            horizontal: 'right',
            vertical: 'bottom'
        },
        toolbarPlacement: "top"
    })
    .on('dp.show', function (e) {
        $(this).data("DateTimePicker").minDate(moment().second(0));
    });

    reposition("#iarConfirmModal");

    // Resize the modal height to a fixed height depending
    // to its relative window height
	let original_height = $('#issuesAndRemindersModal .modal-body.overflow').height();
	let height = $(window).height()* 0.5 > original_height ? original_height : $(window).height()* 0.5;
	$('#issuesAndRemindersModal .modal-body.overflow').height(height);
    $(window).trigger("resize");
	$(window).on('resize', function() {
		let height = $(window).height()* 0.5 > original_height ? original_height : $(window).height()* 0.5;
        $('#issuesAndRemindersModal .modal-body.overflow').height(height);
    });

    $("#lock").click(function () {
    	$(this).toggleClass("btn-info btn-danger");
    	if ($(this).text() == " Unlock") {
    		$("#issue_event").prop("disabled", false).val("");
       		$(this).attr("data-button-lock", 0).html('<span class="fa fa-lock" aria-hidden="true"></span> Lock');
    	}
    	else {
    		$("#issue_event").prop("disabled", true).val("");
        	$(this).attr("data-button-lock", 1).html('<span class="fa fa-unlock" aria-hidden="true"></span> Unlock');
    	}
    });

    //$(".show-bar a").unbind("click");
    $(".show-bar a").click(function (e) {
        e.preventDefault();
        let row_height = null;
    	$(".form-body").slideToggle("fast", function() {
            console.log("WEW");
            row_height = $(".form-body").height();
            let element = $("#issuesAndRemindersModal .modal-dialog");
            let position = parseInt(element.css("margin-top"), 10);

            if( $(".form-body").is(":visible") ) element.animate({"margin-top": position - row_height}, 200);
            else element.animate({"margin-top": position + row_height}, 200);
        });

    	if($(this).attr("data-show") == "0") { $(this).text("Hide Panel"); $(this).attr("data-show", 1); }
    	else { $(this).text("Add Issue/Reminder"); $(this).attr("data-show", 0); }
    });

    let temp = {};
    $("#issuesForm").validate(
    {
        rules: {
            issue_detail: {
                required: true,
            },
            issue_event: {
                required: {
                    depends: function () {
                        return $("#lock").attr("data-button-lock") == "0";
                }},
            }
        },
        /*messages: {
            comments: "Provide a reason to invalidate this event. If the event is not invalid and is really an end of event EWI, release it on the indicated end of validity."
        },*/
        errorPlacement: function ( error, element ) {

            var placement = $(element).closest('.form-group');
            //console.log(placement);
            
            if (placement) {
                $(placement).append(error)
            } else {
                error.insertAfter(placement);
            } //remove on success 

            element.parents( ".form-group" ).addClass( "has-feedback" );

            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if ( !element.next( "span" )[ 0 ] ) { 
                if(element.parent().is(".datetime-issue") || element.parent().is(".datetime-issue")) element.next("span").css("right", "15px");
                if(element.is("select") || element.is("textarea")) element.next("span").css({"top": "25px", "right": "25px"});
            }
        },
        success: function ( label, element ) {
            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if ( !$( element ).next( "span" )) {
                $( "<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>" ).insertAfter( $( element ) );
            }

            $(element).closest(".form-group").children("label.error").remove();
        },
        highlight: function ( element, errorClass, validClass ) {
            $( element ).parents( ".form-group" ).addClass( "has-error" ).removeClass( "has-success" );
            if($(element).parent().is(".datetime-issue") || $(element).parent().is(".time")) {
                $( element ).nextAll( "span.glyphicon" ).remove();
                $( "<span class='glyphicon glyphicon-remove form-control-feedback' style='top:0px; right:37px;'></span>" ).insertAfter( $( element ) );
            }
            else $( element ).next( "span" ).addClass( "glyphicon-remove" ).removeClass( "glyphicon-ok" );
        },
        unhighlight: function ( element, errorClass, validClass ) {
            $( element ).parents( ".form-group" ).addClass( "has-success" ).removeClass( "has-error" );
            if($(element).parent().is(".datetime-issue") || $(element).parent().is(".time")) {
                $( element ).nextAll( "span.glyphicon" ).remove();
                $( "<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>" ).insertAfter( $( element ) );
            }
            else $( element ).next( "span" ).addClass( "glyphicon-ok" ).removeClass( "glyphicon-remove" );
        },
        submitHandler: function (form, event) 
        {
            let data = $( "#issuesForm" ).serializeArray();
            temp = {};
            data.forEach(function (value) { temp[value.name] = value.value == "" ? null : value.value; });
            temp.ts_posted = moment().format("YYYY-MM-DD HH:mm:ss");
            temp.poster_id = $("#current_user_id").val();
            temp.isLocked = parseInt($("#lock").attr("data-button-lock"));

            $("#issuesAndRemindersModal").modal("hide");
            $("#iarConfirmModal").modal("show");
        }
    });

    $(".submit-buttons").click(function () {
        let button_id = $(this).attr("id");
        let action = "";

        $("#resolution-div").hide();
        $("#resolution").val("");

        switch(button_id) {
            case "add-issue-modal": 
                action = "add"; 
                $("#archive-issue, #edit-issue").css("display", "none"); 
                $("#add-issue").css("display", "inline");
                break;
            case "edit-issue-modal": 
                action = "submit an edit to"; 
                $("#add-issue, #archive-issue").css("display", "none"); 
                $("#edit-issue").css("display", "inline"); 
                break;
            case "archive-issue-modal": 
                action = "archive"; 
                $("#edit-issue, #add-issue").css("display", "none"); 
                $("#archive-issue").css("display", "inline"); 
                $("#resolution-div").show();
                break;
        }
        $("#iarConfirmModal #action").text(action);
    });

    $("#issuesAndRemindersModal .glyphicon-trash").click(function () {
        current_iar_id = $(this).attr("data-iar-id");
        $("#issuesAndRemindersModal").modal("hide");
        $("#edit-issue, #add-issue").css("display", "none"); 
        $("#archive-issue").css("display", "inline");
        $("#iarConfirmModal #action").text("archive");
        $("#iarConfirmModal").modal("show");
    });

    $("#issuesAndRemindersModal .glyphicon-edit").click(function () {
        // HTML Tweaks after clicking edit
        let html = $("<div />").append( $(this).parents(".alert").clone() ).html();
        ['lock', 'edit', 'trash'].forEach(function (x) {
            html = html.replace(/<span class="glyphicon glyphicon(.*)<\/span>/, "");
        })
        $(".show-bar, .overflow").hide();
        $(".issue-loader").html(html);
        $("#add-issue-modal, #close-issue-modal").css("display", "none");
        $("#edit-issue-modal, #archive-issue-modal, #cancel-issue-modal").css("display", "block");

        // JS Part after clicking edit
        current_iar_id = $(this).attr("data-iar-id");
        let index = iarListCache.indexOf(current_iar_id);
        let issue = iarList[index];

        $("#issue_detail").val(issue.detail);
        if(issue.status == "normal") {
            if($("#lock").attr("data-button-lock") == "1") lock_button("1");
            $("#issue_event").val(issue.event_id);
        } else {
            lock_button("0");
        }

        $("#issues-individual-view, .form-body").show();
    });

    $("#close-issue-modal").click(function () {
        if($("#lock").attr("data-button-lock") == "1") $("#lock").trigger("click");
        if($(".show-bar a").attr("data-show") == "1") $(".show-bar a").trigger("click");
    });

    $("#cancel-issue-modal").click(function () {
        $(".show-bar, .overflow").show();
        $("#add-issue-modal, #close-issue-modal").css("display", "block");
        $("#edit-issue-modal, #archive-issue-modal, #cancel-issue-modal").css("display", "none");
        $("#issues-individual-view").hide();

        $("#issue_detail, #issue_event").val("");
        if($("#lock").attr("data-button-lock") == "1") $("#lock").trigger("click");
        if($(".show-bar a").attr("data-show") == "1") $(".form-body").show();
        else $(".form-body").hide();
    });

    // Final Confirmation Modal on Sending or Editing
    $("#add-issue, #edit-issue, #archive-issue, #cancel-issue").click(function () {
        $("#iarConfirmModal").modal("hide");
        if(this.id == "add-issue") {
            $.post( "../issues_and_reminders/insert", temp)
            .done(function( data ) {
                console.log("Data saved: ", data);
                doSend("getNormalAndLockedIssues");
            });
        } else if(this.id == "edit-issue") {
            delete temp.ts_posted;
            temp.iar_id = current_iar_id;

            $.post( "../issues_and_reminders/update", temp)
            .done(function( data ) {
                console.log("Data edited: ", data);
                doSend("getNormalAndLockedIssues");
            });
        } else if(this.id == "archive-issue") {
            let data = {
                iar_id: current_iar_id, 
                resolved_by: $("#current_user_id").val(),
                resolution: $("#resolution").val()
            };

            $.post( "../issues_and_reminders/archive", {data: JSON.stringify(data)} )
            .done(function( data ) {
                console.log("Data archived: ", data);
                doSend("getNormalAndLockedIssues");
            });
        } else {
            $("#issuesAndRemindersModal").modal("show");
        }
    });
}

function onLoadIssuesPage() {

    loadTables();
}

function lock_button(bool) {
    if( typeof bool == 'undefined' ) data = $("#lock").attr("data-button-lock");
    else data = bool;
    if (data == "1") {
        $("#lock").removeClass("btn-danger").addClass("btn-info");
        $("#issue_event").prop("disabled", false).val("");
        $("#lock").attr("data-button-lock", 0).html('<span class="fa fa-lock" aria-hidden="true"></span> Lock');
    }
    else {
        $("#lock").removeClass("btn-info").addClass("btn-danger");
        $("#issue_event").prop("disabled", true).val("---");
        $("#lock").attr("data-button-lock", 1).html('<span class="fa fa-unlock" aria-hidden="true"></span> Unlock');
    }
}

let isJSLoadedYet = false;
function loadTables() 
{
    $.fn.dataTable.moment( 'D MMMM YYYY. h:mm A' );

    active_table = $('#active_table').DataTable({
        // "dom": "Bfrtip",
        "dom": "<'row'<'col-sm-6'B><'col-sm-6'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-5'i><'col-sm-7'p>>",
        "buttons": [
            {
                text: 'Add or Edit an Issue/Reminder',
                className: 'btn btn-danger iar_modal_link',
                action: function ( e, dt, node, config ) {
                    $("#issuesAndRemindersModal").modal("show");
                    if( isJSLoadedYet == false ) {
                        onLoadIssuesModal();
                        isJSLoadedYet = true;
                    }
                }
            }
        ],
        "columnDefs" : [
            { className: "text-right", "targets": [1] },
            { className: "text-left", "targets": [0, 2, 3, 4, 5] },
            {
                'sortable' : false,
                'targets' : [ 2, 3 ]
            },
        ],
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/../issues_and_reminders/getAllRowsAsync",
            "type": "POST",
            "data": function(data) {
                data.extra_filter = {
                    status : "normal",
                    hasFilter: false
                }
            }
        },
        "columns": [
            { 
                "data": "iar_id", 
                "render": function (data, type, full, meta) {
                    return data;
                }
            },
            {
                "data": "ts_posted",
                "render": function (data, type, full, meta) {
                    return moment(data).format("D MMMM YYYY, h:mm A");
                }
            },
            { 
                "data": "detail",
            },
            { 
                "data": "posted_by",
                "render": function (data, type, full, meta) {
                    return data;
                }
            },
            { 
                "data": "site_code",
                "render": function (data, type, full, meta) {
                    if( data == null ) return "---";
                    else return data.toUpperCase();
                }
            },
            { 
                "data": "status",
                "render": function (data, type, full, meta) {
                    return data.toUpperCase();
                }
            },
        ],
        "pagingType": "full_numbers",
        "displayLength": 10,
        "lengthChange": false,
        "order": [[0, 'desc']],
        "rowCallback": function (row, data, index) {
            // if( data.status == "finished" || data.status == "extended" ) {
            //     $(row).css("background-color", "rgba(0,140,0,0.7)");
            // } else if( data.status == "on-going" ) {
            //     $(row).css("background-color", "rgba(255,0,0,0.7)");
            // } else if( data.status == "invalid" ) {
            //     $(row).css("background-color", "rgba(90,90,90,0.7)");
            // }
        }
    });

    archived_table = $('#archived_table').DataTable({
        "autoWidth": false,
        columnDefs : [
            { className: "text-right", "targets": [1] },
            { className: "text-left", "targets": [0, 2, 3, 4, 5, 6] },
            {
                'sortable' : false,
                'targets' : [ 2, 3, 6 ]
            },
        ],
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/../issues_and_reminders/getAllRowsAsync",
            "type": "POST",
            "data": function(data) 
            {
                data.extra_filter = {
                    status : "archived",
                    hasFilter: false
                }
            }
        },
        "columns": [
            { 
                "data": "iar_id", 
                "render": function (data, type, full, meta) {
                    return data;
                }
            },
            {
                "data": "ts_posted",
                "render": function (data, type, full, meta) {
                    return moment(data).format("D MMMM YYYY, h:mm A");
                }
            },
            { 
                "data": "detail",
            },
            { 
                "data": "posted_by",
                "render": function (data, type, full, meta) {
                    return data;
                }
            },
            { 
                "data": "site_code",
                "render": function (data, type, full, meta) {
                    if( data == null ) return "---";
                    else return data.toUpperCase();
                }
            },
            { 
                "data": "status",
                "render": function (data, type, full, meta) {
                    return data.toUpperCase();
                }
            },
            { 
                "data": "resolved_by",
                "render": function (data, type, full, meta) {
                    return data;
                }
            },
            { 
                "data": "resolution",
            }
        ],
        "pagingType": "full_numbers",
        "displayLength": 10,
        "lengthMenu": [ 10, 20 ],
        "order": [[0, 'desc']],
        "rowCallback": function (row, data, index) {
            // if( data.status == "finished" || data.status == "extended" ) {
            //     $(row).css("background-color", "rgba(0,140,0,0.7)");
            // } else if( data.status == "on-going" ) {
            //     $(row).css("background-color", "rgba(255,0,0,0.7)");
            // } else if( data.status == "invalid" ) {
            //     $(row).css("background-color", "rgba(90,90,90,0.7)");
            // }
        },
        "initComplete": function () {
            $("#archived_table").css("width", '');
        }
    });
}

function reloadIssuesTable(table) {
    table.ajax.reload();
    isJSLoadedYet = false;
}

$(document).ready(function () {
    
    let isPage = window.location.pathname.includes("issues_and_reminders");

    // APPLIES ONLY ON DASHBOARD
    $("#iar_modal_link").click(function () {
        // if(isPage) {
        //     $(".overflow, .show-bar, #issues-individual-view").hide();
        //     $(".form-body").show();
        //     $("#add-issue-modal, #cancel-issue-modal").css("display", "block");
        //     $("#edit-issue-modal, #archive-issue-modal, #close-issue-modal").css("display", "none");
        //     lock_button("1");
        // }

       $("#issuesAndRemindersModal").modal("show");
    });

});
