import { resolve } from 'path';
import {
    readFile as readFileCallback,
    exists as existsCallback,
} from 'fs';

import { outputFile } from 'fs-extra';

import { promisify } from 'util';
import { IUser } from './user';

const readFile = promisify(readFileCallback);
const writeFile = outputFile;
const exists = promisify(existsCallback);

const commentsRootPath = resolve(process.cwd(), 'src', 'data', 'comments');

export interface ICommentsStore {
    data: IComments;
    index: Record<string, string>;
}

export interface IComments {
    comments: IComment[];
}

interface IPager {
    limit: number;
    total: number;
    offset: number;
}

export interface IComment {
    id: string;
    answer_to?: string;
    name: string;
    date: number;
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

export async function getCommentsPage(
    url: string,
    pageMeta: { limit: number, offset: number }
): Promise<ICommentsStore & IPager> {
    const store = await getComments(url)
    const { limit, offset } = pageMeta;
    const total = store.data.comments.length;
    const startIndex = limit * offset;
    const endIndex = (offset + 1) * limit;

    return {
        data: {
            comments: store.data.comments.slice(startIndex, endIndex),
        },
        total,
        offset,
        limit,
        index: store.index
    };
}

function findReplyList(comments: ICommentsStore, parentCommentId?: string) {
    parentCommentId = parentCommentId as string;

    const index = comments.index[parentCommentId];
    let rootComments = comments.data.comments;

    if (!index) {
        return { replies: rootComments, index: '' };
    }

    // комментарии имею глубину 2, нам интересен id корневого комментария
    const rootId = index.split('.')[0];
    const rootComment = rootComments.find((c) => c.id === rootId);

    // если вдруг такого нет - отдаем весь список
    if (!rootComment) {
        return { replies: rootComments, index };
    }
    rootComment.replies = rootComment.replies || [];

    return { replies: rootComment.replies, index: rootId };
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
        answer_to: parentCommentId,
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
