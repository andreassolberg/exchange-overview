<?php

require_once(__DIR__ . '/lib/_bootstrap.php');

try {

		header('Access-Control-Allow-Origin: *');
	if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {


		header('Access-Control-Allow-Methods: HEAD, GET, OPTIONS, POST, PATCH, DELETE');
		header('Access-Control-Allow-Headers: Authorization, X-Requested-With, Origin, Accept, Content-Type');
		header('Access-Control-Expose-Headers: Authorization, X-Requested-With, Origin, Accept, Content-Type');
		exit;
	}



	$datadir = dirname(__FILE__) . '/data/';
	if (!is_writable($datadir)) throw new Exception('Could not write to data dir');


	$users = Config::getUsers();
	$groups = Config::getGroups();
	$resources = Config::getResources();

	$config = Config::getConfig();


	if (!isset($_SERVER['PHP_AUTH_USER'])) {
		throw new Exception('Not present Feide Connect authentication');
	}

	if ($_SERVER['PHP_AUTH_USER'] !== $config['FC-user']) {
		throw new Exception('FeideConnectAuth Token username');
	}
	if ($_SERVER['PHP_AUTH_PW'] !== $config['FC-pass']) {
		throw new Exception('FeideConnectAuth Token password');
	}








	$userstr = $_SERVER['HTTP_X_FEIDECONNECT_USERID_SEC'];
	$userl = explode(',', $userstr);


	$user = $userl[0];
	$userid = null;

	$realm = '';
	if (preg_match('/^feide:(.*@(.*))$/', $user, $matches)) {
		$realm = $matches[2];
		$userid = $matches[1];
	} else {
		throw new Exception('No realm on userid');
	}

	$access = false;
	if ($realm === 'uninett.no') {
		$access = true;
	}
	if (in_array($user, ["ag@iktsenteret.no", "ca@iktsenteret.no"])) {
		$access = true;
	}

	if (!$access) throw new Exception('Access denied. Only access for uninett employees.');

	$current = null;
	foreach($users AS $u) {
		if ($u['uid'] === $userid) $current = $u['mail'];
	}

	foreach($groups AS $key => $group) {
		if (in_array($current, $group['users'])) {
			$groups[$key]['member'] = true;
		}
	}








	$PATH = $_SERVER['PATH_INFO'];


	if ($PATH === '/') {



		$response = [
			'users' => $users,
			'resources' => $resources, 
			'groups' => $groups,
			'data' => [],
			'currentUser' => $current,
			// 'headers' => $_SERVER,
			'realm' => $realm,
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


	} else if ($PATH === '/ferie') {

		$response = array('ferie');
		$response = [
			'users' => $users,
			// 'resources' => $resources, 
			'groups' => $groups,
			'data' => [],
			'currentUser' => $current,
			// 'headers' => $_SERVER,
			'realm' => $realm
		];

		$eo = new EOverview();

		foreach($users AS $item) {
			$filename = $datadir . $item['mail'] . '.ferie.json';
			if (!file_exists($filename)) { continue; }
			$data = json_decode(file_get_contents($filename), true);
			$response['data'][$item['mail']] = $data;
		}


	} else {

		throw new Exception('Invalid path');
	}








} catch (Exception $e) {

	error_log("error: " . $e->getMessage());

	$response = ["error" => $e->getMessage()];

}


header('Content-Type: application/json; charset=utf-8');
echo json_encode($response, JSON_PRETTY_PRINT);


