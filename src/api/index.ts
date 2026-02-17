import express from 'express';
import healthRouter from './health';
import itemsRouter from './items';
import offersRouter from './offers';
import { renderUI } from '../ui';
import { TAXONOMY } from '../taxonomy';

export function createApp(): express.Express {
  const app = express();

  app.use(express.json());

  app.get('/', (_req, res) => {
    res.type('html').send(renderUI());
  });

  app.get('/taxonomy', (_req, res) => {
    res.json(TAXONOMY);
  });

  app.use('/health', healthRouter);
  app.use('/items', itemsRouter);
  app.use('/offers', offersRouter);

  return app;
}
