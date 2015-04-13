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


function getEvents($response) {
	$x = $response->FreeBusyResponseArray->FreeBusyResponse->FreeBusyView;
	$result = [];

	if (empty($x->CalendarEventArray)) {
		return $result;
	}

	if ($x->CalendarEventArray->CalendarEvent) {
		foreach($x->CalendarEventArray->CalendarEvent AS $event) {

			if  (empty($event->CalendarEventDetails)) {
				continue;
			}

			if  (empty($event->CalendarEventDetails->Subject)) {
				continue;
			}

			$result[] = $event;

			if ($event->CalendarEventDetails && $event->CalendarEventDetails->Subject) {



				if (strpos(strtolower($event->CalendarEventDetails->Subject), 'ferie') !== false) {
					// $result[] = $event;
				}

			}

		}
	}
	return $result;
}




foreach($users AS $item) {
	echo "Processing " . $item['mail'] . " (" . $item['name'] . ")\n";

	$response = $eo->getFreeBusy($item['mail']);

	if ($response->FreeBusyResponseArray->FreeBusyResponse->ResponseMessage->ResponseCode !== 'NoError') {
		echo "Error Processing this item [" . $item['name'] . "] " . $response->FreeBusyResponseArray->FreeBusyResponse->ResponseMessage->ResponseCode . "\n";
		continue;
	}

	// $data = $response->FreeBusyResponseArray->FreeBusyResponse->FreeBusyView;
	$events = getEvents($response);
	// print_r($resarr); exit;


	$filename = $datadir . $item['mail'] . '.json';
	file_put_contents($filename, json_encode($events, JSON_PRETTY_PRINT));
}


foreach($resources AS $item) {
	echo "Processing " . $item['mail'] . " (" . $item['name'] . ")\n";

	$response = $eo->getFreeBusy($item['mail']);

	if ($response->FreeBusyResponseArray->FreeBusyResponse->ResponseMessage->ResponseCode !== 'NoError') {
		echo "Error Processing this item [" . $item['name'] . "] " . $response->FreeBusyResponseArray->FreeBusyResponse->ResponseMessage->ResponseCode . "\n";
		continue;
	}

	$events = getEvents($response);
	$filename = $datadir . $item['mail'] . '.json';
	file_put_contents($filename, json_encode($events, JSON_PRETTY_PRINT));

}














