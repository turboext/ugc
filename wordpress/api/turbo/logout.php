<?php
require(dirname(__FILE__) . '/../../wp-load.php');
require(dirname(__FILE__) . '/headers.php');

// Вызов функции WP для выхода из авторизации.
wp_logout();

// Необходимо вернуть пустой ответ.
echo wp_json_encode(array());
