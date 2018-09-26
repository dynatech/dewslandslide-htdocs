
/****
 *
 *	Created by Kevin Dhale dela Cruz
 *	JS file for Monitoring Events Table [public_alert/monitoring_events_all.php]
 *  [host]/public_alert/monitoring_events
 *	
****/

$(document).ready(function() 
{
	let table = $('#table').DataTable({
        columnDefs : [
            { className: "text-right", "targets": [4,5] },
            { className: "text-left", "targets": [1, 2, 3] },
            {
                'sortable' : false,
                'targets' : [ 1, 2, 3 ]
            },
        ],
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/../pubrelease/getAllEventsAsync",
            "type": "POST",
            "data": function(data) {
                let status = null, site = null;
                if( $("#status_filter").val() != "" && typeof $("#status_filter").val() != "undefined" ) 
                    status = $("#status_filter").val();
                if( $("#site_filter").val() != "" && typeof $("#site_filter").val() != "undefined") 
                    site = $("#site_filter").val();

                data.extra_filter = {
                    hasFilter: status !== null || site !== null,
                    status : status,
                    site: site
                }
            }
        },
        "columns": [
            { 
                "data": "event_id", 
                "render": function (data, type, full, meta) {
                    return "<a style='color:blue'  href='/../monitoring/events/" + data + "'>" + data + "</a>";
                }
            },
            { 
                "data": "site_code",
                "render": function (data, type, full, meta) {
                    return data.toUpperCase() + " (" + full.barangay + ", " + full.municipality + ", " + full.province + ")";
                }
            },
            { 
                "data": "status",
                "render": function (data, type, full, meta) {
                    return data.toUpperCase();
                }
            },
            { "data": "internal_alert_level" },
            {
                "data": "event_start",
                "render": function (data, type, full, meta) {
                    return moment(data).format("D MMMM YYYY, h:mm A");
                }
            },
            {
                "data": "validity",
                "render": function (data, type, full, meta) {
                    if( data == null ) return "-";
                    else 
                        return moment(data).format("D MMMM YYYY, h:mm A");
                }
            }
        ],
        "pagingType": "full_numbers",
        "displayLength": 20,
        "lengthMenu": [ 10, 20, 50 ],
        "order": [[0, 'desc']],
        "rowCallback": function (row, data, index) {
            if( data.status == "finished" || data.status == "extended" ) {
                $(row).css("background-color", "rgba(0,140,0,0.7)");
            } else if( data.status == "on-going" ) {
                $(row).css("background-color", "rgba(255,0,0,0.7)");
            } else if( data.status == "invalid" ) {
                $(row).css("background-color", "rgba(90,90,90,0.7)");
            }
        },
        "initComplete": function () 
        {

            this.api().columns([1]).every( function () {
                var column = this;
                var select = $('<select id="site_filter"><option value="">---</option></select>')
                    .appendTo( $(column.footer()).empty() )
                    .on( 'change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );

                        reloadTable(val);

                    } );
  
                $.get("/../pubrelease/getSites", function( data ) {
                    data.forEach(function (x) {
                        select.append( '<option value="'+x.site_id+'">'+ x.site_code.toUpperCase() + " (" + x.address + ")" +'</option>' )
                    });
                }, "json");

            });

            this.api().columns([2]).every( function () {
                var column = this;
                var select = $('<select id="status_filter"><option value="">---</option></select>')
                    .appendTo( $(column.footer()).empty() )
                    .on( 'change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );

                        reloadTable(val);

                    } );
  
                ["on-going", "extended", "finished", "routine", "invalid"].forEach( function ( d ) {
                    select.append( '<option value="'+d+'">'+d.toUpperCase()+'</option>' )
                });
            });
        }
    });

    function reloadTable(val) {
        table.ajax.reload();
    }
    
});