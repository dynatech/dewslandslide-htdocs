var templateData = {};
var templateTable;
var backboneTable;
var tableId;
var template="";
var alertLevelSymbol;
var tempSymbol;
var tempLevel;
var tempStatus;
var defaultTemplateInputs = {
    'ALERT_LVL' : 'Alert 1',
    'GREETINGS': 'Hapon',
    'SBMP': 'Boloc, Tubungan, Iloilo',
    'CURRENT_DATE': '17 May 2017',
    'CURRENT_TIME': '04:00 PM',
    'EXPECTED_DATE_GDATA': 'bukas bago ',
    'EXPECTED_TIME_GDATA': 'mag-7:30 AM',
    'NEXT_EWI_DATE': 'mamayang',
    'NEXT_EWI_TIME': '08:00 PM',
    'LOWERING_EXTENDED_TIME': '08:00 PM',
    'EXT_DAY': 'ikatlo',
    'KEY_INPUT': 'Ang recommended response ay PREPARE TO EVACUATE THE HOUSEHOLDS AT RISK.'
}

$(document).ready(function(e){
    $('#template_table').empty();
    template_table = $('#template_table').DataTable( {
        "processing": true,
        "serverSide": false,
        "ajax": '../communications/fetchalltemplate',
        columns: [
            { "data" : "id" , title:"Id"},
            { "data" : "alert_status", title:"Alert Status"},
            { "data" : "alert_symbol_level", title:"Alert Symbol / Alert Level"},
            { "data" : "key_input", title:"Key Input"},
            { "data" : "last_update_by", title:"Latest Modification"},
            { "data" : "functions", title: "*"}
        ]
    });

    $('#backbone_template').empty();
    backboneTable = $('#backbone_table').DataTable({
    	"processing": true,
    	"bSort" : false,
    	"scrollCollapse": true,
    	"serverSide": false,
    	"ajax": '../communications/fetchallbackbonetemplate',
    	columns: [
    		{ "data" : "id", title: "Id"},
    		{ "data" : "alert_status", title: "Alert Status"},
    		{ "data" : "template", title: "Backbone Message"},
    		{ "data" : "last_modified_by", title: "Last Update"},
    		{ "data" : "functions", title : "*"}
    	]
    });

    $("#template_table_length").prepend('<button type="button" class="btn btn-primary btn-sm" id="add_template"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add template</button>&nbsp;&nbsp;');

    $('#template_table tbody').on('mouseover', 'tr', function () {
       var ttip = $('#template_table').DataTable().row(this).data();
       tooltipKeyinput(ttip);
    });

    $('#key_input_tab').on('click',function(){
    	reloadTable();
    });

    $('#message_backbone_tab').on('click',function(){
    	reloadBackboneTable();
    });

    

    $('#show_key_inputs').on('click',function(){
    	$('#key_input_display').modal('toggle');
    });

    $('#show_key_input_display').on('click',function(){
        $('#key_input_display').modal('toggle');
    });

    $('#backbone_template').on('input',function(){
        var realtime_input = $(this).val();
        triggerChange(realtime_input);
    });

    $('#submit_template').on('click',function(){
    	templateData['last_modified'] = moment().format("YYYY-MM-DD H:mm A")+"/"+first_name+"/"+tagger_user_id;
        templateData['alert_level'] = $('#alert_level').val();
        templateData['alert_symbols'] = $('#alert_symbols').val();

        if (!$('#response_template').prop('disabled')) {
            templateData['response_template'] = $('#response_template').val();
        } else {
            templateData['response_template'] = ""; 
        }

        if (!$('#techinfo_template').prop('disabled')) {
            templateData['techinfo_template'] =$('#techinfo_template').val();
        } else {
            templateData['techinfo_template'] = "";
        }

        templateData['alert_status'] = $('#alert_status').val();
        templateData['backbone_message'] = $('#backbone_template').val();

    	if ($('#submit_template').text() == "CREATE") {
			$.post("../communications/addtemplate", {template : JSON.stringify(templateData)})
			.done(function(data) {
                console.log(data);
                var response = JSON.parse(data);
				if (response.template == 1 || response.template == true) {
					$.notify("Successfully added a new template.","success");
					reloadTable();
					$('#template_modal').modal('toggle');
				} else {
					$.notify("Failed to add a new template, Duplicate entry.","error");
				}
			});	
    	} else {
    		templateData['id'] = tableId;
			$.post("../communications/updatetemplate", {template : JSON.stringify(templateData)})
			.done(function(data) {
                console.log(data);
				var response = JSON.parse(data);
				if (response == 1 || response == true) {
					$.notify("Successfully updated a template.","success");
					reloadTable();
					$('#template_modal').modal('toggle');
				} else {
					$.notify("Failed to update a template, template already exist.","error");
				}
			});	
    	}
    	templateData = {};
    });

    $('#submit_backbone').on('click',function(){
    	templateData['backbone_message'] = $('#update-backbone').val();
    	templateData['last_modified'] = moment().format("YYYY-MM-DD H:mm A")+"/"+first_name+"/"+tagger_user_id;
    	if ($('#submit_backbone').text() == "CREATE") {
            templateData['alert_status'] = $('#bb_alert_status').val();
            console.log(templateData);
    		$.post('../communications/addbackbonemessage',{backbone_message: JSON.stringify(templateData)})
    		.done(function(data){
    			console.log(data);
    			var response = JSON.parse(data);
				if (response == 1 || response == true) {
					$.notify("Successfully added a new backbone message.","success");
					reloadBackboneTable();
					$('#backbone_modal').modal('toggle');
				} else {
					$.notify("Failed to add a new backbone message, Duplicate entry.","error");
				}

    		});
    	} else {
    		templateData['id'] = tableId;
            templateData['alert_status'] = $('#bb_alert_status').val();
    		$.post('../communications/updatebackbonemessage',{backbone_message: JSON.stringify(templateData)})
    		.done(function(data){
                console.log(data);
    			var response = JSON.parse(data);
                if (response == 1 || response == true) {
                    $.notify("Successfully updated a backbone message.","success");
                    reloadBackboneTable();
                    $('#backbone_modal').modal('toggle');
                } else {
                    $.notify("Failed to update a backbone message, backbone category already exist.","error");
                }
    		});
    	}
        tempStatus = "";
    	templateData = {};
    });

    $('#delete_template').on('click',function(){
    	templateData['id'] = tableId;
		$.post("../communications/deletetemplate", {template : JSON.stringify(templateData)})
		.done(function(data) {
			var response = JSON.parse(data);
			if (response == 1 || response == true) {
				$.notify("Successfully deleted  template.","success");
				reloadTable();
				$('#delete_template_modal').modal('toggle');
			} else {
				$.notify("Failed to delete template. Please contact one of the SWAT member.","error");
			}
		});	
    })

    $('#delete_backbone').on('click',function(){
        templateData['id'] = tableId;
        $.post("../communications/deletebackbone", {backbone_message : JSON.stringify(templateData)})
        .done(function(data) {
            var response = JSON.parse(data);
            if (response == 1 || response == true) {
                $.notify("Successfully deleted the backbone message.","success");
                reloadBackboneTable();
                $('#delete_backbone_modal').modal('toggle');
            } else {
                $.notify("Failed to delete backbone message. Please contact one of the SWAT member.","error");
            }
        }); 
    });

    $('#template_table tbody').on('click','.update',function(){
        $('form').trigger('reset');
        resetFields();
        keyInputAutocomplete();
    	var table = $('#template_table').DataTable();
		var data = table.row($(this).closest('tr')).data();
		tableId = data.id;
		$('#modal-title').text('Update Template');
        if (data.alert_symbol_level.toLowerCase().indexOf("alert") == -1) {
            tempSymbol = data.alert_symbol_level;
            $('#alert_symbols').val(data.alert_symbol_level);
            $('#techinfo_template').val(data.key_input);
            $('#techinfo_template').text(data.key_input);
            $('#response_template').prop('disabled',true);
        } else {
            tempLevel = data.alert_symbol_level;
            $('#alert_level').val(data.alert_symbol_level);
            $('#response_template').val(data.key_input);
            $('#response_template').text(data.key_input);
            $('#techinfo_template').prop('disabled',true);
        }
        $('#backbone_template').prop('disabled',true);
		$('#submit_template').text("UPDATE");
		$('#template_modal').modal('toggle');
    });

    $('#template_table tbody').on('click','tr:has(td) .delete',function(){
    	var table = $('#template_table').DataTable();
		var data = table.row($(this).closest('tr')).data();
		tableId = data.id;
		var to_be_deleted = "Alert Level / Alert Symbol: "+data.alert_symbol_level+"\n"+
							"Key input: "+data.key_input;
		$('#delete-template').val(to_be_deleted);
		$('#submit_template').text("UPDATE");
		$('#delete_template_modal').modal('toggle');
    });

    $('#update-backbone').on('input',function(){
    	triggerChange($('#update-backbone').val());
    });

    $('#backbone_table tbody').on('click','.update',function(){
    	var table = $('#backbone_table').DataTable();
		var data = table.row($(this).closest('tr')).data();
		tableId = data.id;
		$('#modal-title-backbone').text('Update Message Backbone');
        $('#update-backbone').val(data.template);
        $('#update-backbone').text(data.template);
        tempStatus = data.alert_status;
		$('#submit_backbone').text("UPDATE");
		$('#backbone_modal').modal('toggle');
		triggerChange(data);
    });

    $('#backbone_table tbody').on('click','.view',function(){
        $('#template_simulation').modal('toggle');
    });

    $('#backbone_table tbody').on('click','tr:has(td) .delete',function(){
    	var table = $('#backbone_table').DataTable();
		var data = table.row($(this).closest('tr')).data();
		tableId = data.id;
		console.log(data);
        var to_be_deleted = "Alert Status: "+data.alert_status+"\n"+
                            "Template: "+data.template+"\n";
        $('#delete-backbone').val(to_be_deleted);
		$('#submit_backbone').text("UPDATE");
        $('#delete_backbone_modal').modal('toggle');
    });

    $('a#open_popover').popover().parent().delegate('button#alert_lvl', 'click', function() {
        template = $('#backbone_template').val()+$(this).val();
        $('#backbone_template').val(template);
        triggerChange(template);
    });

    $('a#open_popover').popover().parent().delegate('button#greetings', 'click', function() {
        template = $('#backbone_template').val()+$(this).val();
        $('#backbone_template').val(template);
        triggerChange(template);
    });

    $('a#open_popover').popover().parent().delegate('button#tech_info', 'click', function() {
        template = $('#backbone_template').val()+$(this).val();
        $('#backbone_template').val(template);
        triggerChange(template);
    });

    $('a#open_popover').popover().parent().delegate('button#current_date', 'click', function() {
        template = $('#backbone_template').val()+$(this).val();
        $('#backbone_template').val(template);
        triggerChange(template);
    });

    $('a#open_popover').popover().parent().delegate('button#current_time', 'click', function() {
        template = $('#backbone_template').val()+$(this).val();
        $('#backbone_template').val(template);
        triggerChange(template);
    });

    $('a#open_popover').popover().parent().delegate('button#gndmeas_date', 'click', function() {
        template = $('#backbone_template').val()+$(this).val();
        $('#backbone_template').val(template);
        triggerChange(template);
    });

    $('a#open_popover').popover().parent().delegate('button#gndmeas_time', 'click', function() {
        template = $('#backbone_template').val()+$(this).val();
        $('#backbone_template').val(template);
        triggerChange(template);
    });

    $('a#open_popover').popover().parent().delegate('button#next_ewi_date', 'click', function() {
        template = $('#backbone_template').val()+$(this).val();
        $('#msg_backbone').val(template);
        triggerChange(template);
    });

    $('a#open_popover').popover().parent().delegate('button#next_ewi_time', 'click', function() {
        template = $('#backbone_template').val()+$(this).val();
        $('#backbone_template').val(template);
        triggerChange(template);
    });

    $('a#open_popover').popover().parent().delegate('button#nth-day', 'click', function() {
        template = $('#backbone_template').val()+$(this).val();
        $('#backbone_template').val(template);
        triggerChange(template);
    });

    $('a#open_popover').popover().parent().delegate('button#tech_info', 'click', function() {
        template = $('#backbone_template').val()+$(this).val();
        $('#backbone_template').val(template);
        triggerChange(template);
    });

    $('a#open_popover').popover().parent().delegate('button#recom_response', 'click', function() {
        template = $('#backbone_template').val()+$(this).val();
        $('#backbone_template').val(template);
        triggerChange(template);
    });

    $('.update_backbone').on('click',function(){
        $('#update-backbone').val($('#update-backbone').val()+$(this).val());
        $('#update-backbone').text($('#update-backbone').val()+$(this).val());
    });

    $.get('../chatterbox/getdistinctsitename',function(data){
        var response = JSON.parse(data);
        for (var counter = 0; counter < response.length;counter++) {
            $('#site_code').append($("<option></option>")
                        .attr("value",response[counter].sitename)
                        .text("("+response[counter].sitename +")  "+ response[counter].address)); 
        }
    });

    $('#date-time-of-release').datetimepicker({
        format: 'YYYY-MM-DD HH:mm'
    });

    $('#techinfo_template').on('input',function(){
        triggerChange($('#backbone_template').val());
    });

    $('#response_template').on('input',function(){
        triggerChange($('#backbone_template').val());
    });

    $('#open_popover').popover();
    $('#close_popover').popover('hide');

});

function initializeAddTemplateButton () {
    $('#add_template').on('click',function(){
        $('form').trigger('reset');
        resetFields();
        $('#modal-title').text('Create Template');
        $('#submit_template').text("CREATE");
        $('#template_modal').modal('toggle');

        keyInputAutocomplete();
    });

}

function initializeAddBackboneButton(){

    $('#add_backbone').on('click',function(){
        // loadKeyInputs();
        $('form').trigger('reset');
        $('#modal-title-backbone').text('Create Message Backbone');
        $('#submit_backbone').text("CREATE");
        $('#backbone_modal').modal('toggle');
        backboneAutocomplete();
    });
}

function tooltipKeyinput(toToolTip) {
    $.get('../communications/fetchallbackbonetemplate',function(data){
        var response = JSON.parse(data);
        console.log(response);
        var tooltip = "";
        for (var counter =0; counter < response.data.length;counter++) {
            if (response.data[counter].alert_status == toToolTip.alert_status) {
                tooltip = response.data[counter].template.replace('{KEY_INPUT}',toToolTip.recommended_response);
                tooltip = tooltip.replace('{GREETINGS}',defaultTemplateInputs.GREETINGS);
                tooltip = tooltip.replace('{SBMP}',defaultTemplateInputs.SBMP);
                tooltip = tooltip.replace('{CURRENT_DATE}',defaultTemplateInputs.CURRENT_DATE);
                tooltip = tooltip.replace('{CURRENT_TIME}',defaultTemplateInputs.CURRENT_TIME);
                tooltip = tooltip.replace('{EXPECTED_DATE_GDATA}',defaultTemplateInputs.EXPECTED_DATE_GDATA);
                tooltip = tooltip.replace('{EXPECTED_TIME_GDATA}',defaultTemplateInputs.EXPECTED_TIME_GDATA);
                tooltip = tooltip.replace('{NEXT_EWI_DATE}',defaultTemplateInputs.NEXT_EWI_DATE);
                tooltip = tooltip.replace('{NEXT_EWI_TIME}',defaultTemplateInputs.NEXT_EWI_TIME);
                tooltip = tooltip.replace('{LOWERING_EXTENDED_TIME}',defaultTemplateInputs.LOWERING_EXTENDED_TIME);
                tooltip = tooltip.replace('{EXT_DAY}',defaultTemplateInputs.EXT_DAY);   
                $('#template_table').attr('title',tooltip);
            }
        }
    });
}

function reloadTable() {
	var templateTable = $('#template_table').DataTable();
	$('#template_table').DataTable().clear();
	$('#template_table').DataTable().destroy();

    template_table = $('#template_table').DataTable( {
    	"processing": true,
    	"serverSide": false,
        "ajax": '../communications/fetchalltemplate',
        columns: [
            { "data" : "id" , title:"ID"},
            { "data" : "alert_status", title:"Alert Status"},
            { "data" : "alert_symbol_level", title:"Alert Symbol / Alert Level"},
            { "data" : "key_input", title:"Key Input"},
            { "data" : "last_update_by", title:"Latest Modification"},
            { "data" : "functions", title: "*"}
        ]
    });
    $("#template_table_length").prepend('<button type="button" class="btn btn-primary btn-sm" id="add_template"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add template</button>&nbsp;&nbsp;');
    initializeAddTemplateButton();
}

function keyInputAutocomplete() {
    $.get('../communications/fetchalltemplate',function(data){
        var response = JSON.parse(data);
        alertLevelSymbol = response;
        alertSymbolAutocomplete(response);
        alertLevelAutocomplete(response);
        backboneCategoryAutocomplete(response);
        $('#alert_symbols').on('change',function(){
            for(var counter = 0; counter < response.data.length; counter++){
                if ($(this).val() == response.data[counter].alert_symbol_level && $('#alert_status').val() == response.data[counter].alert_status) {
                    $('#techinfo_template').prop('disabled', true);
                    $('#techinfo_template').val(response.data[counter].key_input);
                    break;
                } else {
                    $('#techinfo_template').prop('disabled', false);
                    $('#techinfo_template').val("");
                }
            }
            triggerChange($('#backbone_template').val());
        });

        $('#alert_level').on('change',function(){
            for(var counter = 0; counter < response.data.length; counter++){
                if ($(this).val() == response.data[counter].alert_symbol_level) {
                    $('#response_template').prop('disabled', true);
                    $('#response_template').val(response.data[counter].key_input);
                    break;
                } else {
                    $('#response_template').prop('disabled', false);
                    $('#response_template').val("");
                }
            }
            triggerChange($('#backbone_template').val());
        });

        $('#alert_status').on('change',function(){
            $.post('../communications/getbackboneviastatus',{alert_status: $('#alert_status').val()}).done(function(data){
                var response = JSON.parse(data);
                $('#backbone_template').trigger("change");
                $('#backbone_template').text(response[0].template);
                $('#backbone_template').val(response[0].template);
                triggerChange(response[0].template);
            });
        });

    });
}

function alertSymbolAutocomplete(response) {
    var alert_symbols = [];
    for (var counter=0;counter < response.data.length;counter++){
        if ($.inArray(response.data[counter].alert_symbol_level,alert_symbols) == -1) {
           if (response.data[counter].alert_symbol_level.toLowerCase().indexOf("alert") == -1) {
            alert_symbols.push(response.data[counter].alert_symbol_level);
           }
        }
    }
    var alert = document.getElementById("alert_symbols");
    var awesomplete = new Awesomplete(alert, {
        minChars: 1,
    });
    awesomplete.list = alert_symbols;
}

function alertLevelAutocomplete(response) {
    var alert_levels = [];
    for (var counter=0;counter < response.data.length;counter++){
        if ($.inArray(response.data[counter].alert_symbol_level,alert_levels) == -1) {
           if (response.data[counter].alert_symbol_level.toLowerCase().indexOf("alert") != -1) {
            alert_levels.push(response.data[counter].alert_symbol_level);
           }
        }
    }
    var alert = document.getElementById("alert_level");
    var awesomplete = new Awesomplete(alert, {
        minChars: 1,
    });
    awesomplete.list = alert_levels;
}

function backboneCategoryAutocomplete(response) {
    var backbone_category = [];
    for (var counter=0;counter < response.data.length;counter++){
        if ($.inArray(response.data[counter].alert_status,backbone_category) == -1) {
           backbone_category.push(response.data[counter].alert_status); 
        }
    }
    var input = document.getElementById("alert_status");
    var awesomplete = new Awesomplete(input, {
        minChars: 1,
    });
    awesomplete.list = backbone_category;
}

function backboneAutocomplete() {
    $.get('../communications/fetchallbackbonetemplate').done(function(data){
        var response = JSON.parse(data);
        var category = [];
        for (var counter =0; counter < response.data.length;counter++) {
            if ($.inArray(response.data[counter].category,category) == -1){
                category.push(response.data[counter].category);
            }
        }
        var input = document.getElementById("category");
        var awesomplete = new Awesomplete(input, {
            minChars: 1,
        });
        awesomplete.list = category;
    });
}

function reloadBackboneTable() {
	var backboneTable = $('#backbone_table').DataTable();
	$('#backbone_table').DataTable().clear();
	$('#backbone_table').DataTable().destroy();
    backbone_table = $('#backbone_table').DataTable( {
    	"processing": true,
    	"serverSide": false,
        "ajax": '../communications/fetchallbackbonetemplate',
        columns: [
    		{ "data" : "id", title: "ID"},
    		{ "data" : "alert_status", title: "Alert Status"},
    		{ "data" : "template", title: "Backbone Message"},
    		{ "data" : "last_modified_by", title: "Latest Modification"},
    		{ "data" : "functions", title : "*"}
        ]
    });
    $("#backbone_table_length").prepend('<button type="button" class="btn btn-primary btn-sm" id="add_backbone"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add message backbone</button>&nbsp;&nbsp;');
    initializeAddBackboneButton();
}

function loadKeyInputs(){
    var objKeys = Object.keys(defaultTemplateInputs);
    for (var counter =0; counter < objKeys.length; counter++) {
        var r= $('<button type="button" id="'+objKeys[counter].toLowerCase()+'" class="btn btn-info" style="margin: 2px;"" value="{'+objKeys[counter]+'}">+ '+objKeys[counter]+'</button>');
        $("#key-input-container").append(r);
    }
}

function triggerChange(realtime_input) {
    if (($("#template_modal").data('bs.modal') || {}).isShown == true) {
        $.post('../chatterbox/getsitbangprovmun', {sites: $('#site_code').val()}).done(function(data){
            var response = JSON.parse(data);
            var location = response[0].sition+", "+response[0].barangay+", "+response[0].municipality+", "+response[0].province;
            location = location.replace("undefined,","");
            location = location.trim();
            var d = new Date();
            var current_meridiem = d.getHours();

            if (current_meridiem >= 13 && current_meridiem <= 18) {
                realtime_input = realtime_input.replace("(greetings)","hapon");
            } else if (current_meridiem >= 18 && current_meridiem <=23) {
                realtime_input = realtime_input.replace("(greetings)","gabi");
            } else if (current_meridiem >= 0 && current_meridiem <= 3) {
                realtime_input = realtime_input.replace("(greetings)","gabi");
            } else if (current_meridiem >= 4 && current_meridiem <= 11) {
                realtime_input = realtime_input.replace("(greetings)","umaga");
            } else {
                realtime_input = realtime_input.replace("(greetings)","tanghali");
            }

            // var currentTime = moment(moment().format("YYYY-MM-DD HH:mm")).format('LLL');
            var meridiem = moment().format("hh:mm A");
            if (meridiem == "12:00 AM") {
                meridiem = meridiem.replace("AM","MN");
            } else if (meridiem == "12:00 PM") {
                meridiem = meridiem.replace("PM","NN");
            }
            var current_date = moment(moment().format("YYYY-MM-DD")).format('LL');
            realtime_input = realtime_input.replace("(current_date_time)",current_date+" "+meridiem);
            realtime_input = realtime_input.replace('(site_location)',location);
            realtime_input = realtime_input.replace('(alert_level)',$('#alert_level').val());
            realtime_input = realtime_input.replace('(technical_info)',$('#techinfo_template').val());
            realtime_input = realtime_input.replace('(recommended_response)',$('#response_template').val());
            realtime_input = realtime_input.replace('(staff_duty)',$('#staff_duty').val()+" - PHIVOLCS-DYNASLOPE");
            realtime_input = realtime_input.replace('(release_time)',$('#time_of_release').val());
            realtime_input = realtime_input.replace('(gndmeas_date_submission)','mamaya bago mag 11:30 AM');
            realtime_input = realtime_input.replace('(gndmeas_time_submission)','mamaya bago mag 11:30 AM');
            realtime_input = realtime_input.replace('(new_ewi_time)','12:00 NN');
            $('#template_view').val(realtime_input);
            $('#template_view').text(realtime_input);
        });
    } else {
        var template = $('#update-backbone').val();
        if (tempStatus == "Event-Level3") {
            template = template.replace('(technical_info)','naka-detect ang sensor ng critical ground movement');
            template = template.replace('(recommended_response)','EVACUATE THE HOUSEHOLDS AT RISK ang recommended response');
            template = template.replace('(alert_level)','Alert 3');
        } else {
            template = template.replace('(technical_info)','nakapagsukat ng significant ground movement ang LEWC');
            template = template.replace('(recommended_response)','PREPARE TO EVACUATE THE HOUSEHOLDS AT RISK');
            template = template.replace('(alert_level)','Alert 2');
        }
        template = template.replace('(site_location)','Agbatuan, Dumarao, Capiz');
        template = template.replace('(staff_duty)','You - PHIVOLCS-DYNASLOPE');
        template = template.replace('(release_time)','2017-05-24 08:00 AM');
        template = template.replace('(current_date_time)','2017-05-24 08:00 AM');
        template = template.replace('(gndmeas_date_submission)','mamaya bago mag 11:30 AM');
        template = template.replace('(gndmeas_time_submission)','mamaya bago mag 11:30 AM');
        template = template.replace('(new_ewi_time)','12:00 NN');
        template = template.replace('(next_ewi_date)','mamaya');
        $('#preview-backbone').val(template);
        $('#preview-backbone').text(template);
    }
}

function resetFields(){
    $('#backbone_template').val('');
    $('#backbone_template').text('');
    $('#backbone_template').prop('disabled',false);
    $('#techinfo_template').prop('disabled',false);
    $('#response_template').prop('disabled',false);
    $('#techinfo_template').val('');
    $('#techinfo_template').text('');
    $('#response_template').val('');
    $('#response_template').text('');
    $('#template_view').val('');
    $('#template_view').text('');
}