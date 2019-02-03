import { authRouter } from './auth';
import { commentsRouter } from './comments';

export default [
    { namespace: '/auth', router: authRouter },
    { namespace: '/comments', router: commentsRouter }
];
