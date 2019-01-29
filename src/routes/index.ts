import { auth } from './auth';
import { comments } from './comments';

export default [
    { namespace: '/auth', router: auth },
    { namespace: '/comments', router: comments }
];
