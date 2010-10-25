<?php
require("twilio.php");
require("config.php");
require("number.php"); // declares the variable $phone_number

$action = $_REQUEST["action"];
if ($action != "" && function_exists($action)) {
  $action();
} else {
  index();
}



function index() {
  
} // index

// receives initial request from Twilio server
function initcall() {
  if ($_REQUEST["CallStatus"] == "completed") {
    // receives request from Twilio server when a call ends
    // remove call from active calls
    // saves call info in DB as current call
    $callGuid = $_REQUEST["CallGuid"];
    $db = new PDO("sqlite:twilio.db");
    $query = "UPDATE Calls SET Status = 'ended' WHERE CallGuid = '$callGuid'";
    $db->exec($query);
  } else {
    // dial all saved numbers for your account
    $numbers = getNumbersToCall(); // get numbers
    $r = new Response();
    for ($i = 0; $i < count($numbers); $i++) {
      $r->addDial($numbers[$i]);
    }
    $r->Respond();
    // saves call info in DB as current call
    $callGuid = $_REQUEST["CallGuid"];
    $caller = $_REQUEST["Caller"];
    $callLocation = ($_REQUEST["CallerCity"] != "" ? $_REQUEST["CallerCity"] :
                      ($_REQUEST["CallerState"] != "" ? $_REQUEST["CallerState"] :
                        ($_REQUEST["CallerZip"] != "" ? $_REQUEST["CallerZip"] :
                          ($_REQUEST["CallerCountry"] != "" ? $_REQUEST["CallerCountry"] : ""))));
    $db = new PDO("sqlite:twilio.db");
    $query = "INSERT INTO Calls (CallGuid, Caller, Location, Status) VALUES ('$callGuid', '$caller', '$callLocation', 'active')";
    $db->exec($query);
  }

  
} // initcall

// Pinged server to check settings
function ping() {
  if (verifySignature()) {
    echo "{success: 1, message: 'Success: your settings are correct.'}";
  } else {
    echo "{success: 0, message: 'Error: we could not verify the signature. Check your settings.'}";
  }
  
} // ping


// sends back information about all current calls
function getnotifications() {
  $db = new PDO("sqlite:twilio.db");
  
  echo "{";
  
  // Active calls
  echo '"Calls":';
  $query = "SELECT * FROM Calls";
  echo "[";
  $first_run = true;
  foreach($db->query($query) as $row) {
    if (!$first_run) {
      echo ',';
    }
    echo '{"CallGuid": "'.$row['CallGuid'].'", "Caller": "'.$row["Caller"].'", "Location": "'.$row["Location"].'", "Status": "'.$row["Status"].'"}';
    $first_run = false;
  }
  echo "]";
  
  // echo ",";
  
  // Voicemails
  // echo '"Voicemails":';
  // $query = "SELECT * FROM Voicemails WHERE Status = 'ended'";
  // echo "[";
  // $first_run = true;
  // foreach($db->query($query) as $row) {
  //   if (!$first_run) {
  //     echo ',';
  //   }
  //   echo '{"CallGuid": "'.$row['CallGuid'].'", "Caller": "'.$row["Caller"].'", "Location": "'.$row["Location"].'"}';
  //   $first_run = false;
  // }
  // echo "]";
  

  echo "}";
} // getnotifications


// change specific calls to end it, send to voicemail…
function altercall() {
  
} // altercall


// sends the current saves phone number to call
function getnumber() {
  echo PHONE_NUMBER;
} // getnumger

// save phone number to which all calls should be forwarded to
function savenumber() {
  $phone_number = $_REQUEST["number"];
  $fh = fopen("number.php", "w");
  fwrite($fh, "<?php define('PHONE_NUMBER', '$phone_number'); ?>");
  fclose($fh);
  echo "Number $phone_number saved.";
} // savenumber


// gets
function getNumbersToCall() {
  $numbers = Array(PHONE_NUMBER);
  
  return $numbers;
} // getNumbersToCall

function verifySignature() {
  
  return sha1($_REQUEST["timestamp"].SECRET) == $_REQUEST["sig"];
} // verifySignature

?>

