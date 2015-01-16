<?php


/**
 * Function to autoload the requested class name.
 * 
 * @param string $class_name Name of the class to be loaded.
 * @return boolean Whether the class was loaded or not.
 */
function my_autoloader($class_name) {
    // Start from the base path and determine the location from the class name,
    $base_path = dirname(__DIR__) . '/php-ews';
    $include_file = $base_path . '/' . str_replace('_', '/', $class_name) . '.php';

    return (file_exists($include_file) ? require_once $include_file : false);
}

spl_autoload_register('my_autoloader');


require_once(__DIR__ . '/Config.php');
require_once(__DIR__ . '/EOverview.php');
require_once(dirname(__DIR__) . '/vendor/autoload.php');