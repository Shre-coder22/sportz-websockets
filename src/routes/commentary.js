import { Router } from 'express'
import { db } from '../db/db.js'
import { commentary } from '../db/schema.js'
import { matchIdParamSchema } from '../validation/matches.js'
import { createCommentarySchema, listCommentaryQuerySchema } from '../validation/commentary.js'
import { desc, eq } from 'drizzle-orm'

const MAX_LIMIT = 100

export const commentaryRouter = Router({
    mergeParams: true,
});

commentaryRouter.post('/', async (req, res) => {
    console.log(req.params);
  const parsedParams = matchIdParamSchema.safeParse(req.params)
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Inv Params', details: parsedParams.error.issues })
  }

  const parsedBody = createCommentarySchema.safeParse(req.body)
  if (!parsedBody.success) {
    return res.status(400).json({ error: 'Inv Payload', details: parsedBody.error.issues })
  }

  try {
    const { minute, ...rest } = parsedBody.data;
    const [result] = await db.insert(commentary).values({
        matchId: parsedParams.data.id,
        minute,
        ...rest
    }).returning();

    if(res.app.locals.broadcastCommentary) {
        res.app.locals.broadcastCommentary(result.matchId, result);
    }

    res.status(201).json({ data: result })
  } catch (e) {
    res.status(500).json({ error: 'Failed to create commentary', details: JSON.stringify(e) })
  }
});

commentaryRouter.get('/', async (req, res) => {
  const parsedParams = matchIdParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Inv Params', details: parsedParams.error.issues });
  }

  const parsedQuery = listCommentaryQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({ error: 'Inv Query', details: parsedQuery.error.issues });
  }

  const limit = Math.min(parsedQuery.data.limit ?? MAX_LIMIT, MAX_LIMIT)

  try {
    const commentaries = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, parsedParams.data.id))
      .orderBy(desc(commentary.createdAt))
      .limit(limit)

    res.status(200).json({ data: commentaries })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch commentary', details: JSON.stringify(e) })
  }
});

