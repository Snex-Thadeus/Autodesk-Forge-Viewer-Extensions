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

var viewer;

function launchViewer(urn) {
  urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bnRiYXA2eWViZ3F1ZmhuamdqNW5idXN4ZHhub204OHEtY29tcGFueV9wYWNlL1BsYW50JTIwU2NhZmZvbGRpbmcubndk';
  var options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken
  };

  Autodesk.Viewing.Initializer(options, () => {
    // const config = {
    //   extensions: ['MyAwesomeExtension', 'Autodesk.VisualClusters', 'HandleSelectionExtension', 'ModelSummaryExtension'] //'MyMapboxForgeExtension'
    // };
    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('MyViewerDiv')); //, config
    viewer.start();
    
    var documentId = 'urn:' + urn;
    // console.log(urn);
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
  });

}

launchViewer('test');

function onDocumentLoadSuccess(doc) {
  var viewables = doc.getRoot().getDefaultGeometry();
  viewer.loadDocumentNode(doc, viewables).then(i => {
    // documented loaded, any action?
  });
  
}



function onDocumentLoadFailure(viewerErrorCode) {
  console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}


// Get public access token for read only,
// using ajax to access route /api/forge/oauth/public in the background
function getForgeToken(callback) {
  jQuery.ajax({
      //headers: {"Access-Control-Allow-Origin": "*"},
      //url: 'https://stage.teknobuilt.com:8443/api/forge/oauth/public',
      url: 'https://dev2.teknobuilt.com:8443/api/forge/oauth/token',
      success: function (res) {
          callback(res.access_token, res.expires_in);
      }
  });
}

// function getForgeToken(callback) {
//   fetch('https://dev2.teknobuilt.com:8443/api/forge/oauth/token').then(res => {
//     res.json().then(data => {
//       callback(data.access_token, data.expires_in);
//     });
//   });
// }