import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';

import routes from './routes';
import { StatusedError } from './utils/error';
import { withUser } from './middlewares/withUser';
import { IRequest } from './utils/request';
import { ResponseStatus } from './utils/response';
import { resolve } from 'path';

const app = express();

app.use('/ugc/examples', express.static(resolve(__dirname, '..', 'examples')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(withUser);

routes.forEach((route) => {
    app.use(route.namespace, route.router);
});

// Обрабатываем 404 и оправляем дальше, в обработчик ошибок
app.use((req: IRequest, res: Response, next: NextFunction) => {
    const err: StatusedError = new StatusedError('Not Found');
    err.status = ResponseStatus.NOTFOUND;
    next(err);
});

app.use((err: StatusedError, req: IRequest, res: Response, next: NextFunction): any => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || ResponseStatus.SERVER_ERROR);
});

const DEFAULT_PORT = 8085;
const port = process.env.PORT || DEFAULT_PORT;
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.info(`Server running on ${port}`);
});

module.exports = app;
