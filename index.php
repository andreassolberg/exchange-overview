<?php

require_once(__DIR__ . '/lib/_bootstrap.php');

$eo = new EOverview();

$user = $_REQUEST['user'];
// $response = $eo->mycalendar($user);
$response = $eo->getFreeBusy($user);
// $response = $eo->listContacts();
// $response = $eo->contactsSearch('c');
// $response = $eo->test2();

header('Content-Type: text/plain; charset=utf-8');

echo "response: \n";
print_r($response);

