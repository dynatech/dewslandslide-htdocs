
/****
 *
 *  Created by Kevin Dhale dela Cruz
 *  JS file for Monitoring Shift Checker [reports/accomplishment_checker.php]
 *  [host]/reports/accomplishment/checker
 *
****/

$(document).ready((a) => {
    $('.datetime').datetimepicker({
        format: 'YYYY-MM-DD HH:30:00',
        allowInputToggle: true,
        widgetPositioning: {
            horizontal: 'right',
            vertical: 'bottom'
        },
    })
    .on('dp.hide', (e) => {
        $("#shift_end").val( moment(e.date).add(13, "hours").format("YYYY-MM-DD HH:30:00") );
    });

    function checkTimestamp(value, element)
    {
        var hour = moment(value).hour();
        var minute = moment(value).minute();

        if (element.id === 'shift_start')
        {
            message = "Acceptable times of shift start are 07:30 and 19:30 only.";
            var temp = moment(value).add(13, 'hours')
            $("#shift_end").val(moment(temp).format('YYYY-MM-DD HH:mm:ss'))
            $("#shift_end").prop("readonly", true).trigger('focus');
            setTimeout(function() { 
                $("#shift_end").trigger('focusout');
            }, 500);
            return (hour == 7 || hour == 19) && minute == 30;
        } else if(element.id == 'shift_end')
        {   
            message = "Acceptable times of shift end are 08:30 and 20:30 only.";
            return ((hour == 8 || hour == 20) && minute == 30);
        }
    }

    var message;
    jQuery.validator.addMethod("TimestampTest", function(value, element) 
    {   
        return checkTimestamp(value, element);
    }, function () {return message});

    $("#checkerForm").validate(
    {
        rules: {
            shift_start: {
                required: true,
                TimestampTest: true
            },
            shift_end: {
                required: true,
                TimestampTest: true
            },
        },
        errorPlacement: function ( error, element ) {

            var placement = $(element).closest('.form-group');
            //console.log(placement);
            
            if( $(element).hasClass("cbox_trigger_switch") )
            {
                $("#errorLabel").append(error).show();
            }
            else if (placement) {
                $(placement).append(error)
            } else {
                error.insertAfter(placement);
            } //remove on success 

            element.parents( ".form-group" ).addClass( "has-feedback" );

            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if ( !element.next( "span" )[ 0 ] ) {
                if(element.parent().is(".datetime") || element.parent().is(".datetime")) element.next("span").css("right", "15px");
                if(element.is("select")) element.next("span").css({"top": "18px", "right": "30px"});
                if(element.is("input[type=number]")) element.next("span").css({"top": "18px", "right": "13px"});
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
            if($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
                $( element ).nextAll( "span.glyphicon" ).remove();
                $( "<span class='glyphicon glyphicon-remove form-control-feedback' style='top:0px; right:37px;'></span>" ).insertAfter( $( element ) );
            }
            else $( element ).next( "span" ).addClass( "glyphicon-remove" ).removeClass( "glyphicon-ok" );
        },
        unhighlight: function ( element, errorClass, validClass ) {
            $( element ).parents( ".form-group" ).addClass( "has-success" ).removeClass( "has-error" );
            if($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
                $( element ).nextAll( "span.glyphicon" ).remove();
                $( "<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>" ).insertAfter( $( element ) );
            }
            else $( element ).next( "span" ).addClass( "glyphicon-ok" ).removeClass( "glyphicon-remove" );
        },
        submitHandler: function (form) 
        {
            let formData = {
                start: $("#shift_start").val(),
                end: $("#shift_end").val()
            }

            getShiftReleases(formData, function (data) 
            {
                
                if( data.length == 0 )
                {
                    $("#reports").html('<td class="text-center td-padding" colspan="2">No monitoring events and releases for the shift</td>');
                    $("#mt, #ct").text('No monitoring personnel on-duty');
                }
                else
                {
                    let grouped_by_site = groupBy(data, 'site_id');

                    let unique_ct = getUnique(data, 'reporter_id_ct');
                    let unique_mt = getUnique(data, 'reporter_id_mt');

                    $("#mt").text(unique_mt.join(", "));
                    $("#ct").text(unique_ct.join(", "));


                    $("#reports").html("");

                    grouped_by_site.forEach(function (group) 
                    {   
                        let length = group.length;
                        let str = '<tr><td class="col-sm-4 text-center v-middle" rowspan="' + length + '"><strong>' + group[0].site_code.toUpperCase() + '</strong></td>';

                        for ( let i = 0; i < length; i++ )
                        {
                            if( i != 0 ) str += '<tr>'
                            str +=  '<td class=" col-sm-8 text-center"><a href="../../monitoring/events/' + group[i].event_id + '/' + group[i].release_id + '" target="_blank"> EWI Release for ' + moment(group[i].data_timestamp).add(30, "minutes").format("HH:mm:00") + '</a></td></tr>';
                        }

                        $("#reports").append(str);
                    });
                }

            });

        }
    });

    function getShiftReleases(formData, callback) 
    {
        $.ajax({
            url: "../../accomplishment/getShiftReleases",
            type: "GET",
            data : formData,
            success: function(response, textStatus, jqXHR)
            {
                result = JSON.parse(response);
                callback(result);
            },
            error: function(xhr, status, error) {
                var err = eval("(" + xhr.responseText + ")");
                alert(err.Message);
            }     
        });
    }

    function groupBy(collection, property) 
    {
        let i = 0, val, index,
            values = [], result = [];
        for (; i < collection.length; i++) {
            val = collection[i][property];
            index = values.indexOf(val);
            if (index > -1)
                result[index].push(collection[i]);
            else {
                values.push(val);
                result.push([collection[i]]);
            }
        }

        return result;
    }


    function getUnique( arr, prop, type )
    {
        let n = {}, r = [];
        for(let i = 0; i < arr.length; i++) 
        {
            if (!n[arr[i][prop]]) 
            {
                n[arr[i][prop]] = true; 
                if( prop == 'reporter_id_mt' )
                    r.push(arr[i]['mt_first'] + " " + arr[i]['mt_last']); 
                else if( prop == 'reporter_id_ct' )
                    r.push(arr[i]['ct_first'] + " " + arr[i]['ct_last']); 
            }
        }

        return r;
    }

});
