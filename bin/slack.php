#!/usr/bin/env php
<?php



require_once(dirname(__DIR__) . '/lib/_bootstrap.php');

try {


	$datadir = dirname(dirname(__FILE__)) . '/data/';
	if (!is_writable($datadir)) throw new Exception('Could not write to data dir');


	$users = Config::getUsers();
	$groups = Config::getGroups();
	$resources = Config::getResources();

	$config = Config::getConfig();



	$response = [
		'users' => $users,
		'resources' => $resources, 
		'groups' => $groups,
		'data' => []
	];



	$userlist = $groups['ba9114bd4c503f65a52ace6acfa2ad1fe1d56874']['users'];


	$usernames = [];
	foreach($users AS $u) {
		if (in_array($u['mail'], $userlist)) {
			$usernames[$u['mail']] = $u['name'];
		}
	}


	// print_r($userlist); 
	// print_r($users);
	// print_r($usernames);

	// exit;


	$eo = new EOverview();

	foreach($users AS $item) {

		if (!isset($usernames[$item['mail']])) {
			continue;
		}
		$filename = $datadir . $item['mail'] . '.json';
		if (!file_exists($filename)) { continue; }
		$data = json_decode(file_get_contents($filename), true);
		
		if (isset($data['CalendarEventArray']) && isset($data['CalendarEventArray']['CalendarEvent'])) {
			foreach($data['CalendarEventArray']['CalendarEvent'] AS $event) {
				print_r($event); 

				if (isset($event['CalendarEventDetails'])) {

					$start = strtotime($event['StartTime']);
					$end = strtotime($event['EndTime']);
					echo "start " . $start . "\n";
					echo "end " . $end . "\n";
				}

				exit;
			}
		}


		echo "data for ". $usernames[$item['mail']] . "\n\n";
		print_r($data); exit;
	}



} catch (Exception $e) {

	$response = ["error" => $e->getMessage()];

}


header('Content-Type: application/json; charset=utf-8');
echo json_encode($response, JSON_PRETTY_PRINT);

