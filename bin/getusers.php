#!/usr/bin/env php
<?php

require(dirname(dirname(__FILE__)) . '/lib/_bootstrap.php');

$datadir = dirname(dirname(__FILE__)) . '/data/';
if (!is_writable($datadir)) throw new Exception('Could not write to data dir');
$users = Config::getUsers();
$eo = new EOverview();


$users = [];

/**
 * Get a list of users from LDAP.
 */

$ldap_connection = ldap_connect('ldaps://ldap-bs-01.uninett.no ldaps://ldap-bs-02.uninett.no ldaps://ldap-tb-01.uninett.no');
if (FALSE === $ldap_connection){
    throw new Exception('Error connecting to UNINETT LDAP');
}

// We have to set this option for the version of Active Directory we are using.
ldap_set_option($ldap_connection, LDAP_OPT_PROTOCOL_VERSION, 3) or die('Unable to set LDAP protocol version');
ldap_set_option($ldap_connection, LDAP_OPT_REFERRALS, 0); // We need this for doing an LDAP search.

// if (TRUE === ldap_bind($ldap_connection, $ldap_username, $ldap_password)){
$ldap_base_dn = 'cn=internal,cn=people,dc=uninett,dc=no';
$search_filter = '(&(objectCategory=person)(eduPersonPrincipalName=*))';
$search_filter = '(&(objectClass=person)(edupersonorgdn=dc=uninett,dc=no))';

$attributes = array();
$attributes[] = 'displayName';
$attributes[] = 'mail';
$attributes[] = 'uid';
$attributes[] = 'eduPersonPrincipalName';
$attributes[] = 'eduPersonOrgDN';
$attributes[] = 'eduPersonOrgUnitDN';
$attributes[] = 'edupersonaffiliation';


$preset = [

	'ba9114bd4c503f65a52ace6acfa2ad1fe1d56874' => 'System',
	'6878b2109639f8339fdec1ef8a060e69b9de20d7' => 'Nett',
	'43f3daf14eac1c8d7e205a888dec9a5c0614b19b' => 'Tjeneste',
	'af180ffb5c3f22ec534f311bfef41114adc78047' => 'Org',

	'45aa883bc7ca9a38d12cfe2dcbc4c042ccc6f1c1' => 'SIGMA',

	'1389b0fbd9570918e09641759d994a1e62069b9e' => 'NORID',
	'39434697e2895424e51d3f7ec2f608b5319edd20' => 'NORID Teknisk',
	'58ce8e38b7f135baf51bfc3985f897437c2bc93f' => 'NORID Adm',
	'83ed1860a2326599d9ec81c367c70b75dc5f063a' => 'NORID Støtte',

	'dfc9331df7b670d2b946cb67359711c643b5c2db' => 'Stab',


	'db135be6b4687626c6b05cfaa2caf69f42f3095a' => 'Økonomi',

	'3a2dc70bcf370582cda4cec31fd4802045750f28' => 'HR',


	'534971a3fa56d1e943e508969cb2b36ac1c28189' => 'Kommunikasjon',
	'675481144a117d55b90440ba59b2ccc5aa39cbd1' => 'Innkjøp',



	'a4b69e8ec19ed6c24adad477ecd4ea716635ba77' => 'Adm. systemer',
	'12e27edfcc08a7abefb2325ddd89a996fc29f361' => 'Egenproduserte',
	'66b893e549d5df554cf1a0942e5b7dc7d2490187' => 'Undervisningsnære',

	'c4a784a2efa1832323a6e93604b009f6b83a0755' => 'Stamnett',
	'a12aedad613fab8f0075c56dd52e69c5e4f3f063' => 'Campus',
	'b2a3de5221927bcc68615b620aaf9c0a9a0f9a8e' => 'Sanntid',



	'396c6b28c6883f35e11a24dab0cc02a422e067fa' => 'Verktøy',

	'd5fcb4532c7d30b65f0f1578452df6d067e011e7' => 'Sikkerhet',
	'e4c3b71a9f5003f766d658db97cc868cfbe655f8' => 'UDS',
];

$groups = array();
foreach($preset AS $k => $v) {
	$groups[$k] = [
		'title' => $v,
		'users' => [],
	];
}

$groups['iou'] = [
    'title' => 'IoU',
    'users' => [
            "andreas.solberg@uninett.no",
            "otto.wittner@uninett.no",
            "gurvinder.singh@uninett.no",
            "bjorn.villa@uninett.no",
            "arne.oslebo@uninett.no",
            "vidar.faltinsen@uninett.no",
            "kurosh@uninett.no",
            "olav.kvittem@uninett.no",
        ]
];

$groups['feide'] = [
    'title' => 'Feide',
    'users' => [
            "renate.langeland@uninett.no",
            "olav.morken@uninett.no",
            "snorre.lovas@uninett.no",
            "lars.kviteng@uninett.no",
            "jaime.perez@uninett.no",
            "hildegunn.vada@uninett.no",
        ]
];

$groups['feideconnect'] = [
    'title' => 'Feide Connect',
    'users' => [
            "hildegunn.vada@uninett.no",
            "andreas.solberg@uninett.no",
            "snorre.lovas@uninett.no",
            "sigmund.augdal@uninett.no",
            "jon.kare.hellan@uninett.no",
            "lars.fuglevaag@uninett.no",
            "anders.lund@uninett.no",
            "monica.steneng@uninett.no",
        ]
];
$groups['feideconnectc'] = [
    'title' => 'Feide Connect utv',
    'users' => [
            "hildegunn.vada@uninett.no",
            "andreas.solberg@uninett.no",
            "snorre.lovas@uninett.no",
            "sigmund.augdal@uninett.no",
            "jon.kare.hellan@uninett.no",
        ]
];

function getAttrList($data) {
	$res = [];
	for($i = 0; $i < $data['count']; $i++) {
		$res[] = $data[$i];
	}
	return $res;
}



$result = ldap_search($ldap_connection, $ldap_base_dn, $search_filter, $attributes);
if (FALSE !== $result){
    $entries = ldap_get_entries($ldap_connection, $result);

    // echo "Entries was:\n";
    // print_r($entries);

    for ($x=0; $x<$entries['count']; $x++){

    	if (empty($entries[$x]['mail'])) continue;
    	if (empty($entries[$x]['displayname'])) continue;

    	$mail = $entries[$x]['mail'][0];
    	$name = $entries[$x]['displayname'][0];
    	$uid = $entries[$x]['edupersonprincipalname'][0];

    	$nu = [
    		'mail' => $mail,
    		'name' => $name,
    		'uid' => $uid,
    	];

    	$users[] = $nu;

    	if (empty($entries[$x]['edupersonorgunitdn'])) {
    		echo "No groups for [" . $mail . "]\n";
    		continue;
    	}

    	$g = getAttrList($entries[$x]['edupersonorgunitdn']);
    	foreach($g AS $gg) {
    		$gkey = sha1($gg);
    		if (!isset($groups[$gkey])) {
    			// $groups[$gkey] = [
    			// 	'title' => $gg,
    			// 	'users' => []
    			// ];
    			continue;
    		}
    		$groups[$gkey]['users'][] = $mail;
    	}

    	
    }
} else {
	echo "Error doing ldap search \n";
}
ldap_unbind($ldap_connection); // Clean up after ourselves.

// 

echo "Done connecting... Found " . count($users) . " users\n";
// print_r($users);
// print_r($groups);

file_put_contents(dirname(__DIR__) . '/etc/users.json', json_encode($users, JSON_PRETTY_PRINT));
file_put_contents(dirname(__DIR__) . '/etc/groups.json', json_encode($groups, JSON_PRETTY_PRINT));




