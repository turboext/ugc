<?php
require(dirname(__FILE__) . '/../../wp-load.php');
require(dirname(__FILE__) . '/headers.php');

// Получение ID статьи в WP на основе её адреса.
$post_id = url_to_postid($_GET['ORIGINAL_URL']);
// Получение позиции, начиная с которой нужно сформировать список комментариев.
$offset = filter_input(INPUT_GET, 'offset', FILTER_VALIDATE_INT, array('options' => array('default' => 0)));
// Получение количества комментариев, которые нужно вернуть.
$limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT, array('options' => array('default' => 10)));

if ($post_id === 0) {
    wp_die('Cannot find original post');
}

// Получение списка комментариев из WP.
$comments = get_comments(array(
    'post_id' => $post_id,
    'hierarchical' => 'threaded',
    'order' => 'ASC'
));

/**
 * Функция, преобразовывающая комментарий из формата WP в формат, необходимый для Турбо-страниц.
 */
function prepareComment($comment, $options = array()) {
    $preparedComment = array(
        'id' => $comment->comment_ID,
        'name' => $comment->comment_author,
        'content' => sanitize_text_field($comment->comment_content),
        'date' => strtotime($comment->comment_date),
        'answer_to' => $comment->comment_parent ? $comment->comment_parent : null
    );

    if ($options['replies']) {
        // Добавление одного вложенного уровеня комментариев, если есть ответы.
        $preparedComment['replies'] = array_map(prepareComment, $comment->get_children(array(
            'format' => 'flat',
            'hierarchical' => 'flat'
        )));
    }

    return $preparedComment;
}

// Возврат списка комментариев.
echo wp_json_encode(array(
    'offset' => $offset,
    'limit' => $limit,
    'total' => count($comments),
    'comments' => array_values(array_map(function($comment) {
        return prepareComment($comment, array('replies' => true));
    }, array_slice($comments, $offset, $limit)))
));
