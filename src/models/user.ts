import { resolve } from 'path';
import { readFile as readFileCallback, writeFile as writeFileCallback } from 'fs';
import { promisify } from 'util';

const readFile = promisify(readFileCallback);
const writeFile = promisify(writeFileCallback);

const userDataFilePath = resolve(process.cwd(), 'src', 'data', 'users.json');

export interface IUser {
    uid: string;
    login: string;
    password: string;
    turboId?: string;
}

async function readUsers() {
    return await readFile(userDataFilePath, 'utf8');
}

async function writeUsers(users: { list: IUser[] }) {
    // tslint:disable-next-line:no-magic-numbers
    return await writeFile(userDataFilePath, JSON.stringify(users, null, 4));
}

export async function getUsers(): Promise<IUser[]> {
    const content = await readUsers();
    return JSON.parse(content).list as IUser[];
}

export async function getUserByLogin(login: string): Promise<IUser | undefined> {
    const users = await getUsers();
    return users.find((record: IUser) => record.login === login);
}

export async function addUser(login: string, password: string) {
    const content = await readUsers();
    const db = JSON.parse(content) as { list: IUser[] };

    const isExist = db.list.some((user) => user.login === login);
    if (isExist) {
        return false;
    }

    const newUser: IUser = {
        login, password,
        uid: `test-site@user_id@${Date.now()}`
    };

    db.list.push(newUser);
    await writeUsers(db);

    return true;
}

export async function setUser(user: IUser) {
    const content = await readUsers();
    const db = JSON.parse(content) as { list: IUser[] };

    const oldUser = db.list.find((record: IUser) => record.uid === user.uid);

    if (!oldUser) {
        return false;
    }

    Object.assign(oldUser, user);

    await writeUsers(db);

    return true;
}
