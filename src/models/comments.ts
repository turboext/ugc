import { resolve } from 'path';
import {
    readFile as readFileCallback,
    writeFile as writeFileCallback,
    exists as existsCallback
} from 'fs';
import { promisify } from 'util';
import { IUser } from './user';

const readFile = promisify(readFileCallback);
const writeFile = promisify(writeFileCallback);
const exists = promisify(existsCallback);

const commentsRootPath = resolve(process.cwd(), 'src', 'data', 'comments');

export interface ICommentsStore {
    data: IComments;
    index: Record<string, string>;
}

export interface IComments {
    comments: IComment[];
}

export interface IComment {
    id: string;
    date: number;

    name: string;
    content: string;

    replies?: IComment[];
}

export interface IIncomingComment {
    text: string;
    answer_to?: string;
}

function normalizeUrl(url: string): string {
    return url
        .replace(/^http(s?):\/\//, '')
        .replace(/\//, '--');
}

function emptyComments(): ICommentsStore {
    return {
        data: {
            comments: []
        },
        index: {}
    };
}

async function readComments(normalizedUrl: string) {
    const filePath = resolve(commentsRootPath, `${normalizedUrl}.json`);

    const isExists = await exists(filePath);

    if (!isExists) {
        return false;
    }

    return await readFile(filePath, 'utf8');
}

async function writeComments(normalizedUrl: string, comments: ICommentsStore) {
    const filePath = resolve(commentsRootPath, `${normalizedUrl}.json`);
    // tslint:disable-next-line:no-magic-numbers
    return await writeFile(filePath, JSON.stringify(comments, null, 4));
}

export async function getComments(url: string): Promise<ICommentsStore> {
    url = normalizeUrl(url);

    const rawComments = await readComments(url);

    if (!rawComments) {
        return emptyComments();
    }

    return JSON.parse(rawComments);
}

function findReplyList(comments: ICommentsStore, parentCommentId?: string) {
    parentCommentId = parentCommentId as string;

    const index = comments.index[parentCommentId];
    let replies = comments.data.comments;

    if (!index) {
        return { replies, index: '' };
    }

    const chunks = index.split('.');

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < chunks.length; i++) {
        const commentToReplies = replies.find((c) => c.id === chunks[i]);

        // Если нет нужного комментария,
        // то выходим из поиска
        if (!commentToReplies) {
            break;
        }

        commentToReplies.replies = commentToReplies.replies || [];
        replies = commentToReplies.replies;
    }

    return { replies, index };
}

export async function setComment(
    url: string,
    incomingComment: IIncomingComment,
    user: IUser
) {
    url = normalizeUrl(url);

    const comments = await getComments(url);
    const parentCommentId = incomingComment.answer_to;
    const ms = 1000;
    const multiple = 10000;
    const date = Math.round(Date.now() / ms);

    const newId = `id-${date}-${Math.round(Math.random() * multiple)}`;
    const comment: IComment = {
        id: newId,
        date,
        name: user.login,
        content: incomingComment.text
    };

    const { replies, index: parentIndex } = findReplyList(comments, parentCommentId);

    // Создаем index для новой записи
    const index = parentIndex ?
        `${parentIndex}.${newId}`
        : newId;

    // Добавляем комментарий в список ответов
    replies.push(comment);

    // Сохраняем индекс
    comments.index[newId] = index;

    await writeComments(url, comments);

    return comment;
}
