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




foreach($users AS $item) {
	echo "Processing " . $item['mail'] . " (" . $item['name'] . ")\n";

	$response = $eo->getFreeBusy($item['mail']);

	if ($response->FreeBusyResponseArray->FreeBusyResponse->ResponseMessage->ResponseCode !== 'NoError') {
		echo "Error Processing this item [" . $item['name'] . "] " . $response->FreeBusyResponseArray->FreeBusyResponse->ResponseMessage->ResponseCode . "\n";
		continue;
	}

	$data = $response->FreeBusyResponseArray->FreeBusyResponse->FreeBusyView;
	$filename = $datadir . $item['mail'] . '.json';
	file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));

}


foreach($resources AS $item) {
	echo "Processing " . $item['mail'] . " (" . $item['name'] . ")\n";

	$response = $eo->getFreeBusy($item['mail']);

	if ($response->FreeBusyResponseArray->FreeBusyResponse->ResponseMessage->ResponseCode !== 'NoError') {
		echo "Error Processing this item [" . $item['name'] . "] " . $response->FreeBusyResponseArray->FreeBusyResponse->ResponseMessage->ResponseCode . "\n";
		continue;
	}

	$data = $response->FreeBusyResponseArray->FreeBusyResponse->FreeBusyView;
	$filename = $datadir . $item['mail'] . '.json';
	file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));

}














