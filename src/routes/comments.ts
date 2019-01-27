import { Router } from 'express';

const router: Router = Router();

// Заглушка для комментариев
router.get('/', (req, res, next) => {
    res.send('comments');
});

export const comments = router;
