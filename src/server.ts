import * as bodyParser from 'body-parser';
// import loggerMiddleware from './middleware/logger'

import { App } from './app';
import { CalculatorController } from './controllers/calculator.controller';

// import PostsController from './controllers/posts/posts.controller'
// import HomeController from './controllers/home/home.controller'

const app = new App({
  port: 3000,
  controllers: [
    new CalculatorController(),
    // new PostsController()
  ],
  middleWares: [
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    // loggerMiddleware
  ],
});

app.listen();
