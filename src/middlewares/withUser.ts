import { Response, NextFunction } from 'express';
import { IRequest } from '../utils/request';
import { getUsers, IUser } from '../models/user';

export const USER_ID_COOKIE = 'uid';

export const withUser = async (req: IRequest, res: Response, next: NextFunction) => {
    const turboId = req.query.TURBO_ID;

    const users = await getUsers();

    const user = users.find(
        (record) => record.turboId === turboId
    );

    req.user = user;

    next();
};
