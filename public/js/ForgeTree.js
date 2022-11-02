/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

// $(window).on('load', function(){
//   var treeNode = $('#appBuckets').jstree(true).get_selected(true)[0];
//   translateObject(treeNode)
// });


$(document).ready(function () {
  prepareAppBucketTree();
  $('#refreshBuckets').click(function () {
    $('#appBuckets').jstree(true).refresh();
    
  });

  // $('a').click(function(){
  //   $('a.jstree-anchor').trigger('click');
  // });

   // alert($('a').attr('id'));

    $('div.col-sm-4.fill').hide();

  // $('#showFormCreateBucket').trigger('click');

  $('#hiddenUploadField').hide();
  $('#btn_upload').hide();


  $('#createNewBucket').click(function () {
    createNewBucket();
  });

  $('#createBucketModal').on('shown.bs.modal', function () {
    $("#newBucketKey").focus();
  })

  /*$('#hiddenUploadField').change(function () {
    var node = $('#appBuckets').jstree(true).get_selected(true)[0];
    var _this = this;
    if (_this.files.length == 0) return;
    var file = _this.files[0];
    switch (node.type) {
      case 'bucket':
        var formData = new FormData();
        formData.append('fileToUpload', file);
        formData.append('bucketKey', node.id);

        $.ajax({
          url: '/api/forge/oss/objects',
          data: formData,
          processData: false,
          contentType: false,
          type: 'POST',
          success: function (data) {
            $('#appBuckets').jstree(true).refresh_node(node);
            _this.value = '';
          }
        });
        break;
    }
  });*/
  $('#btn_upload').click(function () {
    node = $('#appBuckets').jstree(true).get_selected(true)[0];
    if($('#hiddenUploadField').val().length > 0 && node) {
      switch(node.type) {
      	case 'bucket':
      		$('#uploadFile').attr('action','/api/forge/oss/objects');
      		var formData = new FormData($('#uploadFile')[0]);
        	formData.append('bucketKey', node.id);
      		//formData.submit();
      $.ajax({
        url: '/api/forge/oss/objects',
        data: formData,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (data) {$('#refreshBuckets').click();
          $('#forgeUrn').html(data);
          _this.value = '';
        },
        failure: function(err) {
          alert(err);
        }
      });
    		break;
    	default:
    		uploadFile();
    		return false;
      }
      //ajax call
      /*$.ajax({
        url: '/api/forge/oss/objects',
        data: formData,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (data) {
          $('#forgeUrn').html(data);
          _this.value = '';
        },
        failure: function(err) {
          alert(err);
        }
      });*/
    }
    else {
      uploadFile();
    }
    return false;
  });
});

function createNewBucket() {
  var bucketKey = $('#newBucketKey').val();
  var policyKey = $('#newBucketPolicyKey').val();
  jQuery.post({
    url: '/api/forge/oss/buckets',
    contentType: 'application/json',
    data: JSON.stringify({ 'bucketKey': bucketKey, 'policyKey': policyKey }),
    success: function (res) {
      $('#appBuckets').jstree(true).refresh();
      $('#createBucketModal').modal('toggle');
    },
    error: function (err) {
      if (err.status == 409)
        alert('Bucket already exists - 409: Duplicated')
      console.log(err);
    }
  });
}

function prepareAppBucketTree() {
  $('#appBuckets').jstree({
    'core': {
      'themes': { "icons": true },
      'data': {
        "url": '/api/forge/oss/buckets',
        "dataType": "json",
        'multiple': false,
        "data": function (node) {
          return { "id": node.id };
        }
      }
    },
    'types': {
      'default': {
        'icon': 'glyphicon glyphicon-question-sign'
      },
      '#': {
        'icon': 'glyphicon glyphicon-cloud'
      },
      'bucket': {
        'icon': 'glyphicon glyphicon-folder-open'
      },
      'object': {
        'icon': 'glyphicon glyphicon-file'
      }
    },
    "plugins": ["types", "state", "sort", "contextmenu"],
    contextmenu: { items: autodeskCustomMenu }
  }).on('loaded.jstree', function () {
    $('#appBuckets').jstree('open_all');
  }).bind("activate_node.jstree", function (evt, data) {
    if (data != null && data.node != null && data.node.type == 'object') {
      $("#MyViewerDiv").empty();
      var urn = data.node.id;
      urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bnRiYXA2eWViZ3F1ZmhuamdqNW5idXN4ZHhub204OHEtY29tcGFueV9wYWNlL1BsYW50JTIwU2NhZmZvbGRpbmcubndk';
      $('#forgeUrn').html("URN: "+urn);
      getForgeToken(function (access_token) {
        jQuery.ajax({
          url: 'https://developer.api.autodesk.com/modelderivative/v2/designdata/' + urn + '/manifest',
          headers: { 'Authorization': 'Bearer ' + access_token },
          success: function (res) {
            if (res.progress === 'success' || res.progress === 'complete') launchViewer(urn);
            else $("#MyViewerDiv").html('The translation job still running: ' + res.progress + '. Please try again in a moment.');
          },
          error: function (err) {
            var msgButton = 'This file is not translated yet! ' +
              '<button class="btn btn-xs btn-info" onclick="translateObject()"><span class="glyphicon glyphicon-eye-open"></span> ' +
              'Start translation</button>'
            $("#MyViewerDiv").html(msgButton);
          }
        });
      })
    }
  });
}

function autodeskCustomMenu(autodeskNode) {
  var items;

  $('#forgeUrn').html('');
  switch (autodeskNode.type) {
    case "bucket":
      items = {
        uploadFile: {
          label: "Upload file",
          action: function () {
            uploadFile();
          },
          icon: 'glyphicon glyphicon-cloud-upload'
        },
        // TODO: Not functioning
        // deleteBucket: {
        //   label: "Delete bucket",
        //   action: function () {
        //     const node = $('#appBuckets').jstree(true).get_selected(true)[0];
        //     console.log(node.id);
        //     fetch('/api/forge/oss/buckets/' + node.id, {
        //         method: 'DELETE'
        //     }).finally(() => {
        //         $('#appBuckets').jstree(true).refresh();
        //     });
        //   },
        // icon: 'glyphicon glyphicon-bin'
        // }
        deleteBucket: {
          label: "Delete bucket",
          action: function() {
                  var treeNode = $('#appBuckets').jstree(true).get_selected(true)[0];
                  console.log(treeNode)
            deleteBucket(treeNode);
          },
         icon: 'glyphicon glyphicon-bin'
        }
      };
      break;
    case "object":
      items = {
        translateFile: {
          label: "Translate",
          action: function () {
            var treeNode = $('#appBuckets').jstree(true).get_selected(true)[0];
            translateObject(treeNode);
          },
          icon: 'glyphicon glyphicon-eye-open'
        },
	viewUrn: {
	  label: "View URN",
	  action: function() {
	    var urn = $('#appBuckets').jstree(true).get_selected(true)[0].id;
      urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bnRiYXA2eWViZ3F1ZmhuamdqNW5idXN4ZHhub204OHEtY29tcGFueV9wYWNlL1BsYW50JTIwU2NhZmZvbGRpbmcubndk';
	    $('#forgeUrn').html("URN: "+urn);
	  },
	 icon: 'glyphicon glyphicon-flag'
	},
  // TODO: Not functioning
	// deleteFile: {
	//   label: "Delete",
	//   action: function() {
  //           var treeNode = $('#appBuckets').jstree(true).get_selected(true)[0];
	//     deleteFile(treeNode);
	//   },
	//  icon: 'glyphicon glyphicon-bin'
	// }
      };
      break;
  }

  return items;
}

function uploadFile() {
  $('#hiddenUploadField').click();
}

function translateObject(node) {
  $("#MyViewerDiv").empty();
  if (node == null) node = $('#appBuckets').jstree(true).get_selected(true)[0];
  var bucketKey = node.parents[0];
  var objectKey = node.id;
  jQuery.post({
    url: '/api/forge/modelderivative/jobs',
    contentType: 'application/json',
    data: JSON.stringify({ 'bucketKey': bucketKey, 'objectName': objectKey }),
    success: function (res) {
      $("#MyViewerDiv").html('Translation started! Please try again in a moment.');
    },
  });
}

function deleteFile(node) {
  var fileName = node.text;
  $('#deleteFile').attr('action', '/api/forge/oss/delete');
  $('#deleteFile > input[name="fileName"]').val(fileName);
  $('#deleteFile > input[name="bucketKey"]').val(node.parents[0]);
  //alert($('#deleteFile > input[name="fileName"]').val());
  //var formData = new FormData($('#deleteFile')[0]);
  /*$.ajax({
    url: '/api/forge/oss/delete',
    data: formData,
    processData: false,
    contentType: false,
    type: 'POST',
    success: function (data) {
      $('#forgeUrn').html('');
      prepareAppBucketTree();
    },
    failure: function(err) {
      alert(err);
    }
  });*/
  $('#deleteFile').submit();
}



function deleteBucket(node) {
	var bucketName = node.id;
	$('#deleteBucket').attr('action', '/api/forge/oss/delete');
	$('#deleteBucket > input[name="bucketKey"]').val(bucketName);
	var formData = new FormData($('#deleteBucket')[0]);
	$.ajax({
		url: '/api/forge/oss/delete',
		data: formData,
		processData: false,
		contentType: false,
		type: 'POST',
		success: function (data) {
			$('#forgeUrn').html('');
			//prepareAppBucketTree();
			window.location.refresh();
		},
		failure: function(err) {
			alert(err);
		}
	});
	$('#deleteBucket > input[name="bucketKey"]').val('');
	// $('#deleteBucket').submit();
}
