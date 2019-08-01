import { authRouter } from './auth';
import { commentsRouter } from './comments';
import { exchangeApi } from './exchangeapi-proxy';

export default [
    { namespace: '/auth', router: authRouter },
    { namespace: '/comments', router: commentsRouter },
    { namespace: '/exchange', router: exchangeApi }
];
