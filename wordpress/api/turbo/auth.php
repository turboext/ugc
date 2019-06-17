<?php
require(dirname(__FILE__) . '/../../wp-load.php');
require(dirname(__FILE__) . '/headers.php');

// Получение информации о текущем пользователе из WP.
$current_user = wp_get_current_user();

if (!$current_user->user_login) {
    // Если пользователь не авторизован, должен вернуться код статуса 401.
    http_response_code(401);
    // Необходимо вернуть пустой ответ.
    echo wp_json_encode(array());
    exit();
}

// Если пользователь авторизован, нужно вернуть его имя для отображения на Турбо-страницах.
echo wp_json_encode(array('login' => wp_get_current_user()->user_login));
