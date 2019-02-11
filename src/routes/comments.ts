import { Router } from 'express';
import { ResponseStatus } from '../utils/response';
import { IRequest } from '../utils/request';
import { getComments, ICommentsStore, setComment } from '../models/comments';

const router: Router = Router();

// Заглушка для комментариев
router.get('/', async (req: IRequest, res, next) => {
    const pageUrl = req.query.ORIGIN_URL;

    if (!pageUrl) {
        res.sendStatus(ResponseStatus.BAD_REQUEST);
        return res.end();
    }

    const comments: ICommentsStore = await getComments(pageUrl);

    res.contentType('application/json');
    res.status(ResponseStatus.OK);
    res.send(comments.data);
    res.end();
});

router.post('/', async (req: IRequest, res, next) => {
    if (!req.user) {
        res.sendStatus(ResponseStatus.UNAUTHORIZED);
        return res.end();
    }

    const pageUrl = req.query.ORIGIN_URL;

    if (!pageUrl) {
        res.sendStatus(ResponseStatus.BAD_REQUEST);
        return res.end();
    }

    const { answer_to, text } = req.body;

    const { id, data } = await setComment(
        pageUrl,
        {
            answer_to,
            text
        },
        req.user
    );

    res.status(ResponseStatus.OK);
    res.send({ id, data });
    res.end();
});

export const commentsRouter = router;
