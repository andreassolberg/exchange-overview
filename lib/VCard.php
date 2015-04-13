<?php



class VCard {

	protected $users;
	function __construct($users) {
		$this->users = $users;
	}

	public function getAttr($user, $attr, $default = '') {

		if (isset($user[$attr])) {
			return $user[$attr];
		}
		return $default;

	}

	public function getVCard() {

		$str = '';

		foreach($this->users AS $user) {

			// print_r($user);

			$str .= "BEGIN:VCARD
VERSION:3.0
PRODID:-//Apple Inc.//Mac OS X 10.10.2//EN
N:" . $this->getAttr($user, "sn") . ";" . $this->getAttr($user, "givenName") . ";;;
FN:" . $this->getAttr($user, "displayName") . "
ORG:UNINETT;UNINETT
EMAIL;type=INTERNET;type=WORK;type=pref:" . $user["mail"] . "
ADR;type=WORK;type=pref:;;Abelsgate 5;Trondheim;;NO-7465;\n";
			
			if (isset($user["mobile"])) {
				$str .= "TEL;type=CELL;type=VOICE:" . $user["mobile"] . "\n";
			}

			if (isset($user["telephoneNumber"]) && $user["telephoneNumber"] !== "+47 73557901") {
				$str .= "TEL;type=WORK;type=VOICE;type=pref:" . $user["telephoneNumber"] . "\n";
			}

			if (isset($user["jpegPhoto"])) {
				$str .= "PHOTO;ENCODING=b;TYPE=JPEG:" . $user["jpegPhoto"] . "\n";
			}

			$str .= "NOTE:Feide brukerID " . $user["uid"] . "@uninett.no\n";

			$str .= "END:VCARD\n";


 			// break;

		}


		return $str;
	}

}