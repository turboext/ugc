<?php

//////////////////////////////////////////////////////////////////
// Нужно только добавить код ниже в конец уже имеющегося файла. //
//////////////////////////////////////////////////////////////////

function turbo_frame_options_header() {
    // Указание CSP-заголовка с разрешением открывать страницу в iframe из Турбо.
    header('Content-Security-Policy: frame-ancestors yandex.com.tr yandex.com yandex.net yandex.uz yandex.fr yandex.kz yandex.ru yandex.by yandex.ua *.yandex.com.tr *.yandex.com *.yandex.net *.yandex.uz *.yandex.fr *.yandex.kz *.yandex.ru *.yandex.by *.yandex.ua *.turbopages.org;');
}

// Замена возвращаемых заголовков WP на наши.
remove_action('login_init', 'send_frame_options_header');
add_action('login_init', 'turbo_frame_options_header');

/**
 * Функция добавляет скрипт, отправляющий сообщение
 * об успешной авторизации в родительское окно.
 */
function turbo_login_success($user_login) {
    echo "<script>
        window.parent.postMessage({
            action: 'login',
            login: '" . $user_login . "',
            success: true
        }, '*');
    </script>";
    exit();
}

// Если страница открыта из Турбо.
if (strpos($_SERVER['HTTP_REFERER'], 'TURBO_ID') !== false) {
    // Добавление действия на событие авторизации.
    add_action('wp_login', 'turbo_login_success');
}
