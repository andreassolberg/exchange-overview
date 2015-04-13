#!/usr/bin/env php
<?php

require(dirname(dirname(__FILE__)) . '/lib/_bootstrap.php');
require(dirname(dirname(__FILE__)) . '/lib/VCard.php');

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
$attributes[] = 'givenName';
$attributes[] = 'sn';
$attributes[] = 'displayName';

$attributes[] = 'jpegPhoto';
$attributes[] = 'mobile';
$attributes[] = 'mail';
$attributes[] = 'uid';
$attributes[] = 'eduPersonPrincipalName';
$attributes[] = 'eduPersonOrgDN';
$attributes[] = 'eduPersonOrgUnitDN';
$attributes[] = 'edupersonaffiliation';
$attributes[] = 'telephoneNumber';


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


    for ($x=0; $x<$entries['count']; $x++){

    	if (empty($entries[$x]['mail'])) continue;
    	if (empty($entries[$x]['displayname'])) continue;

    	$nu = [];

        // print_r($entries[$x]);

        foreach($attributes AS $attr) {

            $lc = strtolower($attr);
            // echo "Checking " . $attr . "\n";

            if (isset($entries[$x][$lc])  ) {

                if ($attr === 'jpegPhoto') {
                    $nu[$attr] = base64_encode($entries[$x][$lc][0]);
                } else {
                    $nu[$attr] = ($entries[$x][$lc][0]); 
                }

            } else {
                // echo "Could not find " . var_export(array_keys($entries[$x]));
            }
   

        } 

        // print_r($nu); exit;


        $users[] = $nu;
    	
    }
} else {
	echo "Error doing ldap search \n";
}
ldap_unbind($ldap_connection); // Clean up after ourselves.

// 

echo "Done connecting... Found " . count($users) . " users\n";
// print_r($users);
// print_r($groups);

file_put_contents(dirname(__DIR__) . '/etc/contacts.json', json_encode($users, JSON_PRETTY_PRINT));
// file_put_contents(dirname(__DIR__) . '/etc/groups.json', json_encode($groups, JSON_PRETTY_PRINT));



$vcard = new VCard($users);
$res = $vcard->getVCard();

// echo $res;


file_put_contents(dirname(__DIR__) . '/etc/contacts.vcard', $res);


















