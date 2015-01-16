<?php

require_once(__DIR__ . '/lib/_bootstrap.php');

try {


	$datadir = dirname(__FILE__) . '/data/';
	if (!is_writable($datadir)) throw new Exception('Could not write to data dir');


	$users = Config::getUsers();
	$groups = Config::getGroups();
	$resources = Config::getResources();

	$config = Config::getConfig();


	if (empty($_SERVER['HTTP_UWAP_X_AUTH'])) {
		throw new Exception('Not present Feide Connect authentication token');
	}
	if ($_SERVER['HTTP_UWAP_X_AUTH'] !== $config['FeideConnectAuth']) {
		throw new Exception('FeideConnectAuth Token invalid');
	}

	$user = $_SERVER['HTTP_UWAP_USERIDSEC'];
	$realm = '';
	if (preg_match('/^(.*)@(.*)$/', $user, $matches)) {
		$realm = $matches[2];

	} else {
		throw new Exception('No realm on userid');
	}


	if ($realm !== 'uninett.no')throw new Exception('Access denied. Only access for uninett employees.');

	$current = null;
	foreach($users AS $u) {
		if ($u['uid'] === $user) $current = $u['mail'];
	}

	foreach($groups AS $key => $group) {
		if (in_array($current, $group['users'])) {
			$groups[$key]['member'] = true;
		}
	}


	$response = [
		'users' => $users,
		'resources' => $resources, 
		'groups' => $groups,
		'data' => [],
		'currentUser' => $current,
		// 'headers' => $_SERVER,
		'realm' => $realm
	];



	$eo = new EOverview();

	foreach($users AS $item) {
		$filename = $datadir . $item['mail'] . '.json';
		if (!file_exists($filename)) { continue; }
		$data = json_decode(file_get_contents($filename), true);
		$response['data'][$item['mail']] = $data;
	}

	foreach($resources AS $item) {
		$filename = $datadir . $item['mail'] . '.json';
		if (!file_exists($filename)) { continue; }
		$data = json_decode(file_get_contents($filename), true);
		$response['data'][$item['mail']] = $data;
	}


} catch (Exception $e) {

	$response = ["error" => $e->getMessage()];

}


header('Content-Type: application/json; charset=utf-8');
echo json_encode($response, JSON_PRETTY_PRINT);


