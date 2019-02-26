import { Router, Response, NextFunction } from 'express';
import { IRequest } from '../utils/request';
import { ResponseStatus } from '../utils/response';
import { readFile as readFileCallback } from 'fs';
import { promisify } from 'util';
import { resolve } from 'path';
import { getUserByLogin, setUser } from '../models/user';

const readFile = promisify(readFileCallback);
const authFormFilePath = resolve(__dirname, '..', '..', 'examples', 'default-auth-form', 'auth.html');

const router: Router = Router();

router.get('/', (req: IRequest, res: Response, next: NextFunction) => {
    if (req.user) {
        res.contentType('application/json');
        res.status(ResponseStatus.OK);
        res.send({ id: req.user.uid, login: req.user.login });
    } else {
        res.sendStatus(ResponseStatus.UNAUTHORIZED);
    }

    res.end();
});

router.get('/login/form', (req: IRequest, res: Response, next: NextFunction) => {
    return readFile(authFormFilePath, 'utf-8')
        .then((form) => {
            const body = form.replace(/\$TURBO_ID\$/g, req.query.TURBO_ID);
            res.status(ResponseStatus.OK);
            res.send(body);
            res.end();
        })
        .catch((e) => {
            next(e);
        });
});

router.post('/login', async (req: IRequest, res: Response, next: NextFunction) => {
    const { login, password } = req.body;
    const turboId = req.query.TURBO_ID;
    const user = await getUserByLogin(login);

    if (!user || user.password !== password) {
        res.contentType('text/html');
        res.status(ResponseStatus.UNAUTHORIZED);
        res.send('Wrong login or password');
        res.end();
        return;
    }

    if (user.turboId !== turboId) {
        user.turboId = turboId;
    }

    setUser(user);

    res.contentType('application/json');
    res.status(ResponseStatus.OK);
    res.send({ login });
    res.end();
});

router.get('/logout', (req: IRequest, res: Response, next: NextFunction) => {
    if (req.user) {
        req.user.turboId = '';
        setUser(req.user);
    }

    res.contentType('application/json');
    res.status(ResponseStatus.OK);
    res.send({ status: 'logged out' });
    res.end();
});

export const authRouter = router;
