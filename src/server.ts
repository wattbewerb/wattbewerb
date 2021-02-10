import * as bodyParser from 'body-parser';
import express from 'express';

import { App } from './app';
import { CalculatorController } from './controllers/calculator.controller';

const port = parseInt(process.env.PORT!) || 3000;
// const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const app = new App({
  port,
  controllers: [
    new CalculatorController(),
    // new PostsController()
  ],
  middleWares: [
    express.static('public'),
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    // loggerMiddleware
  ],
});

app.listen();
