// Script that will be embedded in all pages
// - pings background.html every second to know if there is something to display
// - sends requests to server on action from user
// (c) 2010 Timothée Boucher timotheeboucher.com

String.prototype.capitalize = function(){
   return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
  };

var serverUrl, secret;

// Retrieves settings
chrome.extension.sendRequest({command: "restoreOptions"}, restoreOptions);
function restoreOptions(response) {
  serverUrl = response.serverUrl;
  secret    = response.secret;
};


function pollnotifications () {
  chrome.extension.sendRequest({command: "getNotifications"}, treatNotifications);
  setTimeout(pollnotifications, 1000);
}


function treatNotifications (server_response) {
  // response = JSON.parse(server_response);
  response = server_response;
  // console.log(response);
  // response = {"Calls":[{"CallGuid": "CAaa443b0ba0189511296edfd2b5875463", "Caller": "4152791864", "Location": "SAN FRANCISCO", "Status": "ended"},{"CallGuid": "CA8fb799cb836c29037566886304f0b56d", "Caller": "4152791864", "Location": "SAN FRANCISCO", "Status": "ended"},{"CallGuid": "CA280ac4abca1ff36c440c0af25181dcd2", "Caller": "4152791864", "Location": "SAN FRANCISCO", "Status": "ended"}]};
  
  // Calls
  for (var i = 0; i < response["Calls"].length; i++) {
    var call = response["Calls"][i];
    if (call["Status"] == "ended") {
      $('#'+call["CallGuid"]).remove();
    } else if (document.getElementById(call["CallGuid"]) == undefined) {
      var new_call = document.createElement('div');
      new_call.id = call["CallGuid"];
      new_call.className = "call";
      var location = call["Location"].toLowerCase().capitalize();
      new_call.innerHTML = "<h1>Incoming call: "+call["Caller"]+"</h1>";
      new_call.innerHTML += "<h2>"+location+"</h2>";
      // new_call.innerHTML += "<div class='button ignore' onclick='ignoreCall("+call["CallGuid"]+");'>Ignore</div>";
      // var function_code = "$.ajax({url: \""+serverUrl+"?action=ignorecall&CallGuid="+call["CallGuid"]+"\", success: function () {console.log(\"Call successfully ignored\")}});";
      // var function_code = '$.ajax({url: \''+serverUrl+'?action=getnumber\', success: function (data) {console.log(data)}});';
      var function_code = 'var s=document.createElement(\'script\');s.type=\'text/javascript\';s.src=\''+serverUrl+'?action=ignorecall&CallGuid='+call["CallGuid"]+'\';document.body.appendChild(s);';
      new_call.innerHTML += "<div class='button ignore' onclick=\""+function_code+"\">Ignore</div>";
      function_code = 'var s=document.createElement(\'script\');s.type=\'text/javascript\';s.src=\''+serverUrl+'?action=sendtovoicemail&CallGuid='+call["CallGuid"]+'\';document.body.appendChild(s);';
      new_call.innerHTML += "<div class='button sendtovoicemail' onclick=\""+function_code+"\">Voicemail</div>";
      $('#notwilfications #calls').append(new_call);
    }
  }
  
  // Voicemails
  for (var i = 0; i < response["Voicemails"].length; i++) {
    var vm = response["Voicemails"][i];
    if (document.getElementById("VM"+vm["CallGuid"]) == undefined) {
      var new_vm = document.createElement('div');
      new_vm.id = "VM"+vm["CallGuid"];
      new_vm.className = "voicemail";
      var location = vm["Location"].toLowerCase().capitalize();
      new_vm.innerHTML = "<h1>New voicemail: "+vm["Caller"]+"</h1>";
      new_vm.innerHTML += "<h2>"+location+"</h2>";
      new_vm.innerHTML += "<audio src='"+vm["RecordingUrl"]+".mp3' controls autobuffer></audio>";
      // new_call.innerHTML += "<div class='button ignore' onclick='ignoreCall("+call["CallGuid"]+");'>Ignore</div>";
      // var function_code = "$.ajax({url: \""+serverUrl+"?action=ignorecall&CallGuid="+call["CallGuid"]+"\", success: function () {console.log(\"Call successfully ignored\")}});";
      // var function_code = '$.ajax({url: \''+serverUrl+'?action=getnumber\', success: function (data) {console.log(data)}});';
      var function_code = 'var s=document.createElement(\'script\');s.type=\'text/javascript\';s.src=\''+serverUrl+'?action=vmlistened&CallGuid='+vm["CallGuid"]+'\';document.body.appendChild(s);';
      new_vm.innerHTML += "<div class='close' onclick=\""+function_code+"\">Close</div>";
      $('#notwilfications #voicemails').append(new_vm);
    }
  }
  
}

pollnotifications();

function ignoreCall (callGuid) {
  $.ajax({url: serverUrl+"?action=ignorecall&CallGuid="+callGuid, success: function () {console.log("Call successfully ignored")}});
}

function sendToVoicemail (callGuid) {
  $.ajax({url: serverUrl+"?action=sendtovoicemail&CallGuid="+callGuid, success: function () {console.log("Call successfully sent to voicemail")}});
}


// var style = document.createElement('link');
// style.href = chrome.extension.getURL('page_style.css');
// style.rel = "stylesheet";
// style.type = "text/css";
// document.head.appendChild(style);

var notif_div = document.createElement('div');
notif_div.id = "notwilfications";
notif_div.innerHTML = "<div id='voicemails'></div><div id='calls'></div>";
document.body.appendChild(notif_div);


// Listens to keypress and adds script if it matches setting
// window.addEventListener('keydown', launchLogMeOut, false);

function launchLogMeOut (event) {
  if (event.ctrlKey+"" == ctrl &&
      event.altKey+"" == alt &&
      event.shiftKey+"" == shift &&
      event.keyIdentifier == keyIdentifier) {
    var logMeOut;
    if (logMeOut!=undefined) {
      logMeOut.start();
    } else {
      var script=document.createElement('script');
      script.src='http://logmeoutthx.com/logmeout.js';
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  }
}
