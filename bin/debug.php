#!/usr/bin/env php
<?php

require(dirname(dirname(__FILE__)) . '/lib/_bootstrap.php');

$datadir = dirname(dirname(__FILE__)) . '/data/';
if (!is_writable($datadir)) throw new Exception('Could not write to data dir');
$users = Config::getUsers();
$eo = new EOverview();




$command = new Commando\Command();
$command->option()
    ->describedAs('Command to run: default is update.');
$command->option('m')
	->aka('mail')
	->describedAs('Debug mail address lookup');



if (isset($command['mail'])) {

	echo "Processing " . $command['mail'] . "\n";
	$response = $eo->getFreeBusy($command['mail']);
	print_r($response);

}




// if ($command[0] === 'termcolor') {
// 	phpterm_demo();
// 	exit;
// }




