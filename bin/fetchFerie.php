#!/usr/bin/env php
<?php

require(dirname(dirname(__FILE__)) . '/lib/_bootstrap.php');

$datadir = dirname(dirname(__FILE__)) . '/data/';
if (!is_writable($datadir)) throw new Exception('Could not write to data dir');


$users = Config::getUsers();
$resources = Config::getResources();
$eo = new EOverview();



// $response = $eo->getFreeBusy('andreas.solberg@uninett.no');

// print_r($response);
// exit;





// $mail = 'sigmund.augdal@uninett.no';
// echo "Processing " . $mail . "\n"; 
// $data = $eo->getFreeBusyYear($mail);
// print_r($data);


// exit;


foreach($users AS $item) {
	echo "Processing " . $item['mail'] . " (" . $item['name'] . ")\n";

	$data = $eo->getFreeBusyYear($item['mail']);

	if (empty($data)) {
		echo "no data for user " . $item["mail"] . "\n";
			continue;
	}
	

	$filename = $datadir . $item['mail'] . '.ferie.json';
	file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));
	


}












