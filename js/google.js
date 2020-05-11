var CLIENT_ID =
  "979338125901-72r3o8c2upfrhpgql3pfl8sh7npvdd9p.apps.googleusercontent.com";
var API_KEY = "AIzaSyBunE5pNu7cPbQM_zfAokpukSprhHEVjUo";

var DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];

var SCOPES = "https://www.googleapis.com/auth/drive";

var authorizeButton = document.getElementById("authorize_button");
var signoutButton = document.getElementById("signout_button");
var signedIn = document.getElementById("sign-in-div");

$('.uploadFile').prop('disabled', true);

var uploadFiles;

$(".uploadFile").on("click", function () {
  uploadFile();
});


$('#uploadFile').on("change", function(){ 
  var fileList = event.target.files;
  if(fileList){
    $('.uploadFile').prop('disabled', false);
  }
});


function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

function initClient() {
  gapi.client
    .init({
      apiKey: "AIzaSyBunE5pNu7cPbQM_zfAokpukSprhHEVjUo",
      clientId:
        "979338125901-72r3o8c2upfrhpgql3pfl8sh7npvdd9p.apps.googleusercontent.com",
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    })
    .then(
      function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
      },
      function (error) {
        appendPre(JSON.stringify(error, null, 2));
      }
    );
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "block";
    signedIn.style.display = "block";
    $('.sign-in-div').show();
    $('.sign-out-div').hide();
    listFiles();
  } else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
    signedIn.style.display = "none";
    $('.sign-in-div').hide();
    $('.sign-out-div').show();
  }
}

function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function appendPre(message) {
  var pre = document.getElementById("content");
  var textContent = document.createTextNode(message + "\n");
  pre.appendChild(textContent);
}

function uploadFile() {

  $('.uploadFile').prop('disabled', false);
  $('.loading-enabled').show();
  $('.loading-false').hide();

  var files = $("#uploadFile")[0].files[0];

  var file = new Blob([files], { type: files.type });
  var metadata = {
    name: files.name,
    mimeType: files.type,
  };

  var accessToken = gapi.auth.getToken().access_token;
  var form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", file);

  fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: new Headers({ Authorization: "Bearer " + accessToken }),
      body: form,
    }
  )
    .then((res) => {
      $('.loading-enabled').show();
      $('.lloading-false').hide();
      return res.json();
     
    })
    .then(function (val) {
      $('.loading-enabled').show();
      $('.lloading-false').hide();
      $('#uploadModal').modal('hide');
      listFiles();
    });
}

function listFiles() {
  gapi.client.drive.files
    .list({
      pageSize: 10,
      fields: "nextPageToken, files(id, name)",
    })
    .then(function (response) {
      var files = response.result.files;
      if (files && files.length > 0) {
        $("#table-files tbody").empty();
        for (var i = 0; i < files.length; i++) { 
          var num = i+1;   
          var file = files[i];
          $("#table-files tbody").append(
            "<tr><th>" +
              num +
              "</th><td>" +
              file.name +
              "</td><td>" +
              file.id +
              "</td></tr>"
          );
        }
      } else {
        appendPre("No files found.");
      }
    });
}

$("body").on("click", ".dwnload-btn", function () {
  let fileID = $(this).attr("data-src");
  downloadGDriveFile(fileID);
});


function downloadGDriveFile(file) {
  var fileId = file;
  drive.files
    .get({
      fileId: fileId,
      alt: "media",
    })
    .on("end", function () {
      console.log("Done");
    })
    .on("error", function (err) {
      console.log("Error during download", err);
    })
    .pipe(dest);

}
