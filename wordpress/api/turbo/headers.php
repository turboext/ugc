<?php
/**
 * Определение возможности доступа к API.
 */
function turbo_get_allow_origin() {
    $http_origin = $_SERVER['HTTP_ORIGIN'];

    if (preg_match('/^(https:\/\/(?:.*\.)?yandex\.(?:ru|by|uz|com|com\.tr))$/', $http_origin, $matches)) {
        return $matches[0];
    } else if (preg_match('/^(https:\/\/(?:.*\.)?turbopages.org)$/', $http_origin, $matches)) {
        return $matches[0];
    }

    return null;
}

$http_allow_origin = turbo_get_allow_origin();

if (is_null($http_allow_origin)) {
    // Если доступа нет, должен вернуться код статуса 403.
    http_response_code(403);
    exit('Access denied');
}

// Отправка CORS-заголовков.
header("Access-Control-Allow-Origin: " . $http_allow_origin);
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Origin, Content-Type, Content-Length, Accept-Encoding");

// Отправка заголовка о том, что данные возвращаются в формате JSON.
header("Content-Type: application/json;charset=utf-8");
