import * as express from 'express';
import { IUser } from '../models/user';

export interface IRequest extends express.Request {
    user?: IUser;
}
