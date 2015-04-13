<?php

require_once(__DIR__ . '/lib/_bootstrap.php');

try {


	$file = dirname(__FILE__) . '/etc/contacts.vcard';
	if (!file_exists($file)) throw new Exception('Could not read file');

	$vcard = file_get_contents($file);

	header("Content-Type: text/vcard; charset=utf-8");
	echo $vcard;



} catch (Exception $e) {


	echo "Error";

}