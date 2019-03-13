import { Router } from 'express';
import { ResponseStatus } from '../utils/response';
import { IRequest } from '../utils/request';
import { setComment, getCommentsPage } from '../models/comments';

const router: Router = Router();
const DEFAULT_PAGE_LIMIT = 16;
const DEFAULT_PAGE_OFFSET = 0;

// Заглушка для комментариев
router.get('/', async (req: IRequest, res, next) => {
    const pageUrl = req.query.ORIGINAL_URL;
    const limit = parseInt(req.query.limit) || DEFAULT_PAGE_LIMIT;
    const offset = parseInt(req.query.offset) || DEFAULT_PAGE_OFFSET;

    if (!pageUrl) {
        res.sendStatus(ResponseStatus.BAD_REQUEST);
        return res.end();
    }

    const { data, index, ...pager } = await getCommentsPage(pageUrl, { limit, offset });

    res.status(ResponseStatus.OK).json({ comments: data.comments, ...pager });
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

    const { id, date } = await setComment(
        pageUrl,
        {
            answer_to,
            text
        },
        req.user
    );

    res.status(ResponseStatus.OK);
    res.send({ id, date });
    res.end();
});

export const commentsRouter = router;
