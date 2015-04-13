define(function() {
	"use strict";
	
	return {
		"userinfo": {
			"title": "Brukerinfo",
			"descr": "Basisinformasjon om brukere. BrukerID, navn og profilbilde.",
			"public": true,
			"policy": {
				"auto": true
			}
		},
		"userinfo-mail": {
			"title": "E-post",
			"descr": "Brukerens e-postadresse",
			"public": true,
			"policy": {
				"auto": false
			}
		},
		"userinfo-feide": {
			"title": "Feide-navn",
			"descr": "Brukerens identifikator i Feide. Tilsvarende eduPersonPrincipalName.",
			"public": true,
			"policy": {
				"auto": true
			}
		},
		"openid": {
			"title": "OpenID Connect",
			"descr": "Klienten vil få utstedt en id_token og kunne bruke OpenID Connect for autentisering.",
			"public": true,
			"policy": {
				"auto": true
			}
		},
		"longterm": {
			"title": "Longterm",
			"descr": "Langvarig tilgang. Tilgang inntil brukeren trekker rettighetene tilbake.",
			"public": true
		},
		"clientadmin": {	
			"title": "Klient Admin",
			"descr": "Adminsitrer klienter",
			"public": false,
			"policy": {
				"auto": false
			}
		},
		"apigkadmin": {	
			"title": "API Gatekeeper Admin",
			"descr": "Administrer API Gatekeeper instanser.",
			"public": false,
			"policy": {
				"auto": false
			}
		},
		"peoplesearch": {
			"title": "PeopleSearch",
			"descr": "Search for users",
			"public": true,
			"policy": {
				"auto": false
			}
		},
		"groups": {	
			"title": "Grupper",
			"descr": "Tilgang til basis gruppeinfo",
			"public": true,
			"policy": {
				"auto": true
			}
		},
		"adhocgroupadmin": {
			"title": "Håndtering av ad-hoc groupper",
			"descr": "Legge til, endre ad-hoc grupper, og kunne legge til og fjerne medlemmer.",
			"public": false,
			"policy": {
				"auto": false
			}
		},
		"authzinfo": {
			"title": "List ut samtykke",
			"descr": "List ut og endre samtykke gitt til applikasjoner.",
			"public": false,
			"policy": {
				"auto": false
			}
		}
	};

});