<?php

/**
* 
*/
class EOverview {
	
	protected $config, $ews;

	function __construct() {
	
		$this->config = Config::getConfig();
		$this->ews = new ExchangeWebServices($this->config['server'], $this->config['user'], $this->config['password'],
				ExchangeWebServices::VERSION_2010_SP2);
		
	}

	function debug() {

		$response = $this->ews->GetServerTimeZones();
		print_r($response);


	}


	function getFreeBusyYear($user) {

		// $user = 'linda.steffenakk@uninett.no';
		$result = [];
		for($i = 1; $i <= 12; $i++) {
			$response = $this->getFreeBusyMonth($user, $i);
			$x = $response->FreeBusyResponseArray->FreeBusyResponse->FreeBusyView;

			if  (empty($x->CalendarEventArray)) {
				continue;
			}

			// print_r($x);

			$calarray = [];

			if (!$x->CalendarEventArray->CalendarEvent) {
				continue;
			}

			if (is_array($x->CalendarEventArray->CalendarEvent)) {
				$calarray = $x->CalendarEventArray->CalendarEvent;
			} else if ($x->CalendarEventArray->CalendarEvent instanceof stdClass ) {
				$calarray[] = $x->CalendarEventArray->CalendarEvent;
			}


			
			foreach($calarray AS $event) {

				if  (empty($event->CalendarEventDetails)) {
					continue;
				}

				if  (empty($event->CalendarEventDetails->Subject)) {
					continue;
				}


				if ($event->CalendarEventDetails && $event->CalendarEventDetails->Subject) {

					if (strpos(strtolower($event->CalendarEventDetails->Subject), 'ferie') !== false) {
						$result[] = $event;
					} 
					// else {
					// 	echo "No match for " . $event->CalendarEventDetails->Subject . "\n";
					// }

				}

			}
		

		}

		return $result;

	}


	function getFreeBusyMonth($user, $period) {

		$year = date('Y');
		$nyear = intval(date('Y')) + 1;

		if  ($period === 12) {

			$from = $year . '-' . sprintf("%'.02d", $period) . '-01T00:00:00';
			$to = $nyear . '-' . sprintf("%'.02d", 1) . '-01T00:00:00';

		} else {
			$from = $year . '-' . sprintf("%'.02d", $period) . '-01T00:00:00';
			$to = $year . '-' . sprintf("%'.02d", $period + 1) . '-01T00:00:00';

		}

		$request = new EWSType_GetUserAvailabilityRequestType();
		$request->TimeZone = new EWSType_SerializableTimeZone();
		$request->TimeZone->Bias = '0';
		$request->TimeZone->StandardTime = new EWSType_SerializableTimeZoneTime();
		$request->TimeZone->StandardTime->Bias = '-60';
		$request->TimeZone->StandardTime->Time = '02:00:00';
		$request->TimeZone->StandardTime->DayOrder = 4;
		$request->TimeZone->StandardTime->Month = 10;
		$request->TimeZone->StandardTime->DayOfWeek = 'Sunday';

		$request->TimeZone->DaylightTime = new EWSType_SerializableTimeZoneTime();
		$request->TimeZone->DaylightTime->Bias = '-120';
		$request->TimeZone->DaylightTime->Time = '02:00:00';
		$request->TimeZone->DaylightTime->DayOrder = 5;
		$request->TimeZone->DaylightTime->Month = 3;
		$request->TimeZone->DaylightTime->DayOfWeek = 'Sunday';
		$request->TimeZone->DaylightTime->Year = 2015;

		$request->MailboxDataArray = new EWSType_ArrayOfMailboxData();
		$request->MailboxDataArray->MailboxData = new EWSType_MailboxData();
		$request->MailboxDataArray->MailboxData->Email = new EWSType_EmailAddressType();
		$request->MailboxDataArray->MailboxData->Email->Address = $user;
		$request->MailboxDataArray->MailboxData->Email->RoutingType = 'SMTP';
		$request->MailboxDataArray->MailboxData->AttendeeType = 'Required';
		$request->MailboxDataArray->MailboxData->ExcludeConflicts = false;
		$request->FreeBusyViewOptions = new EWSType_FreeBusyViewOptionsType();
		$request->FreeBusyViewOptions->TimeWindow = new EWSType_Duration();
		$request->FreeBusyViewOptions->TimeWindow->StartTime = $from; // '2014-12-24T08:00:00';
		$request->FreeBusyViewOptions->TimeWindow->EndTime = $to; //'2015-02-14T18:00:00';
		$request->FreeBusyViewOptions->MergedFreeBusyIntervalInMinutes = '30';
		$request->FreeBusyViewOptions->RequestedView = 'Detailed';



		$response = $this->ews->GetUserAvailability($request);
		return $response;

	}



	function getFreeBusy($user = null) {

		$from = date('Y-m-d', strtotime('last monday', strtotime('tomorrow'))) . 'T00:00:00';
		$to = date('Y-m-d', strtotime('8 week')) . 'T00:00:00';
		// echo "Monday is ". $from . "\n";
		// echo "Until     ". $to . "\n";
		// exit;

		$request = new EWSType_GetUserAvailabilityRequestType();
		$request->TimeZone = new EWSType_SerializableTimeZone();
		$request->TimeZone->Bias = '0';
		$request->TimeZone->StandardTime = new EWSType_SerializableTimeZoneTime();
		$request->TimeZone->StandardTime->Bias = '-60';
		$request->TimeZone->StandardTime->Time = '02:00:00';
		$request->TimeZone->StandardTime->DayOrder = 4;
		$request->TimeZone->StandardTime->Month = 10;
		$request->TimeZone->StandardTime->DayOfWeek = 'Sunday';

		$request->TimeZone->DaylightTime = new EWSType_SerializableTimeZoneTime();
		$request->TimeZone->DaylightTime->Bias = '-120';
		$request->TimeZone->DaylightTime->Time = '02:00:00';
		$request->TimeZone->DaylightTime->DayOrder = 5;
		$request->TimeZone->DaylightTime->Month = 3;
		$request->TimeZone->DaylightTime->DayOfWeek = 'Sunday';
		$request->TimeZone->DaylightTime->Year = 2015;

		$request->MailboxDataArray = new EWSType_ArrayOfMailboxData();
		$request->MailboxDataArray->MailboxData = new EWSType_MailboxData();
		$request->MailboxDataArray->MailboxData->Email = new EWSType_EmailAddressType();
		$request->MailboxDataArray->MailboxData->Email->Address = $user;
		$request->MailboxDataArray->MailboxData->Email->RoutingType = 'SMTP';
		$request->MailboxDataArray->MailboxData->AttendeeType = 'Required';
		$request->MailboxDataArray->MailboxData->ExcludeConflicts = false;
		$request->FreeBusyViewOptions = new EWSType_FreeBusyViewOptionsType();
		$request->FreeBusyViewOptions->TimeWindow = new EWSType_Duration();
		$request->FreeBusyViewOptions->TimeWindow->StartTime = $from; // '2014-12-24T08:00:00';
		$request->FreeBusyViewOptions->TimeWindow->EndTime = $to; //'2015-02-14T18:00:00';
		$request->FreeBusyViewOptions->MergedFreeBusyIntervalInMinutes = '30';
		$request->FreeBusyViewOptions->RequestedView = 'Detailed';



		$response = $this->ews->GetUserAvailability($request);
		return $response;
	}


	function mycalendar($user = null) {

		$countMounts = 2;

		// Set init class
		$request = new EWSType_FindItemType();
		// Use this to search only the items in the parent directory in question or use ::SOFT_DELETED
		// to identify "soft deleted" items, i.e. not visible and not in the trash can.
		$request->Traversal = EWSType_ItemQueryTraversalType::SHALLOW;
		// This identifies the set of properties to return in an item or folder response
		$request->ItemShape = new EWSType_ItemResponseShapeType();
		$request->ItemShape->BaseShape = EWSType_DefaultShapeNamesType::DEFAULT_PROPERTIES;

		// Define the timeframe to load calendar items
		$request->CalendarView = new EWSType_CalendarViewType();
		$request->CalendarView->StartDate =  date("c");// current date
		$request->CalendarView->EndDate = date("c", strtotime("+".$countMounts." months"));// "countmonths" month(s) later

		// Only look in the "calendars folder"
		$request->ParentFolderIds = new EWSType_NonEmptyArrayOfBaseFolderIdsType();
		$request->ParentFolderIds->DistinguishedFolderId = new EWSType_DistinguishedFolderIdType();
		$request->ParentFolderIds->DistinguishedFolderId->Id = EWSType_DistinguishedFolderIdNameType::CALENDAR;

		if ($user !== null) {
			$request->ParentFolderIds->DistinguishedFolderId->Mailbox = new StdClass;
			$request->ParentFolderIds->DistinguishedFolderId->Mailbox->EmailAddress = $user;

		}

		// Send request
		$response = $this->ews->FindItem($request);

		return $response;

	}

	function contactsSearch($query) {

		$request = new EWSType_FindItemType();
		$request->ContactsView = new EWSType_ContactsViewType();
		$request->Traversal = EWSType_ItemQueryTraversalType::SHALLOW;

		$request->ItemShape = new EWSType_ItemResponseShapeType();
		$request->ItemShape->BaseShape = EWSType_DefaultShapeNamesType::ALL_PROPERTIES;

		$request->ParentFolderIds = new EWSType_NonEmptyArrayOfBaseFolderIdsType();
		$request->ParentFolderIds->DistinguishedFolderId = new EWSType_DistinguishedFolderIdType();
		$request->ParentFolderIds->DistinguishedFolderId->Id = EWSType_DistinguishedFolderIdNameType::CONTACTS;



		// Build a new contains expression.
		$request->Restriction = new EWSType_RestrictionType();
		$request->Restriction->Contains = new EWSType_ContainsExpressionType();

		// Search the contacts given (first) name.
		$request->Restriction->Contains->FieldURI = new EWSType_PathToUnindexedFieldType();
		$request->Restriction->Contains->FieldURI->FieldURI = 'contacts:GivenName';

		// Search where the name contains the letter 'c'.
		$request->Restriction->Contains->Constant = new EWSType_ConstantValueType();
		$request->Restriction->Contains->Constant->Value = $query;

		// We don't care about case.
		$request->Restriction->Contains->ContainmentComparison = new EWSType_ContainmentComparisonType();
		$request->Restriction->Contains->ContainmentComparison->_ = EWSType_ContainmentComparisonType::IGNORE_CASE;

		// We only want contacts where the name starts with our expression.
		$request->Restriction->Contains->ContainmentMode = new EWSType_ContainmentModeType();
		$request->Restriction->Contains->ContainmentMode->_ = EWSType_ContainmentModeType::PREFIXED;

	}


	function listContacts() {

		$request = new EWSType_FindItemType();

		$request->ItemShape = new EWSType_ItemResponseShapeType();
		$request->ItemShape->BaseShape = EWSType_DefaultShapeNamesType::ALL_PROPERTIES;

		$request->ContactsView = new EWSType_ContactsViewType();
		$request->ContactsView->InitialName = 'a';
		$request->ContactsView->FinalName = 'z';

		$request->ParentFolderIds = new EWSType_NonEmptyArrayOfBaseFolderIdsType();
		$request->ParentFolderIds->DistinguishedFolderId = new EWSType_DistinguishedFolderIdType();
		$request->ParentFolderIds->DistinguishedFolderId->Id = EWSType_DistinguishedFolderIdNameType::CONTACTS;

		$request->Traversal = EWSType_ItemQueryTraversalType::SHALLOW;

		$response = $this->ews->FindItem($request);
		return $response;

	}

	function test2() {


		$request = new EWSType_FindItemType();

		$request->ItemShape = new EWSType_ItemResponseShapeType();
		$request->ItemShape->BaseShape = EWSType_DefaultShapeNamesType::ALL_PROPERTIES;

		$request->ContactsView = new EWSType_ContactsViewType();
		$request->ContactsView->InitialName = 'a';
		$request->ContactsView->FinalName = 'z';

		$request->ParentFolderIds = new EWSType_NonEmptyArrayOfBaseFolderIdsType();
		$request->ParentFolderIds->DistinguishedFolderId = new EWSType_DistinguishedFolderIdType();
		$request->ParentFolderIds->DistinguishedFolderId->Id = EWSType_DistinguishedFolderIdNameType::CONTACTS;

		$request->Traversal = EWSType_ItemQueryTraversalType::SHALLOW;

		$response = $this->ews->FindItem($request);

		return $response;
	}



}