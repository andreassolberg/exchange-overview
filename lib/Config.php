<?php


class Config {
	
	protected static $config = null;
	protected static $users = null;
	protected static $resources = null;
	protected static $groups = null;



	public static function getUsers() {
		if (self::$users !== null) return self::$users;
		self::$users = json_decode(file_get_contents(dirname(__DIR__) . '/etc/users.json'), true);
		return self::$users;
	}

	public static function getResources() {
		if (self::$resources !== null) return self::$resources;
		self::$resources = json_decode(file_get_contents(dirname(__DIR__) . '/etc/resources.json'), true);
		return self::$resources;
	}


	public static function getGroups() {
		if (self::$groups !== null) return self::$groups;
		self::$groups = json_decode(file_get_contents(dirname(__DIR__) . '/etc/groups.json'), true);
		return self::$groups;
	}

	public static function getConfig() {
		if (self::$config !== null) return self::$config;
		self::$config = json_decode(file_get_contents(dirname(__DIR__) . '/etc/config.json'), true);
		return self::$config;
	}


}