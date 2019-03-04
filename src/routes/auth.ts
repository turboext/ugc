import { Router, Response, NextFunction } from 'express';
import { IRequest } from '../utils/request';
import { ResponseStatus } from '../utils/response';
import { readFile as readFileCallback } from 'fs';
import { promisify } from 'util';
import { resolve } from 'path';
import { addUser, getUserByLogin, setUser } from '../models/user';

const readFile = promisify(readFileCallback);

const forms = {
    login: resolve(__dirname, '..', '..', 'examples', 'default-auth-form', 'auth.html'),
    register: resolve(__dirname, '..', '..', 'examples', 'default-register-form', 'register.html')
};

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

router.get('/:formName/form', (req: IRequest, res: Response, next: NextFunction) => {
    const { formName } = req.params;
    if (!forms.hasOwnProperty(formName)) {
        next();
        return;
    }

    return readFile(forms[formName], 'utf-8')
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

router.post('/register', async (req: IRequest, res: Response) => {
    const { login, password } = req.body;
    if (!login || !password) {
        res.contentType('text/html');
        res.status(ResponseStatus.BAD_REQUEST);
        res.send('Invalid login or password');
        res.end();
        return;
    }

    const isUserAdded = await addUser(login, password);
    if (!isUserAdded) {
        res.status(ResponseStatus.CONFLICT);
        res.send('Email already exist');
        return;
    }

    res.status(ResponseStatus.OK);
    res.end();
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
