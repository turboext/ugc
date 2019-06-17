<?php
require(dirname(__FILE__) . '/../../wp-load.php');
require(dirname(__FILE__) . '/headers.php');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Возвращаем положительный ответ на запрос о возможности оставлять комментарии.
    http_response_code(200);
    exit();
}

try {
    // Считываем данные из поступившего запроса.
    $data = json_decode(file_get_contents('php://input'), true);
} catch(Exception $e) {
    exit('Invalid JSON');
}

// Получение ID статьи в WP на основе её адреса.
$post_id = url_to_postid($_GET['ORIGINAL_URL']);

if ($post_id === 0) {
    wp_die('Cannot find original post');
}

$raw_comment = array();
$raw_comment['comment_post_ID'] = $post_id;
$raw_comment['comment_parent'] = isset($data['answer_to']) ? $data['answer_to'] : 0;
$raw_comment['comment'] = $data['text'];

// Вызов функции WP для добавления нового комментария.
$comment = wp_handle_comment_submission($raw_comment);

// Обработка возможной ошибки при добавлении комментария.
if (is_wp_error($comment)) {
    if ($comment->get_error_data()) {
        http_response_code(406);
        echo wp_json_encode(array('response' => $comment->get_error_message()));
        exit();
    }
    echo wp_json_encode(array('response' => 'Unknown error'));
    exit();
}

// При успешном добавлении комментария необходимо вернуть информацию о нём.
echo wp_json_encode(array(
    'id' => $comment->comment_ID,
    'date' => strtotime($comment->comment_date)
));
