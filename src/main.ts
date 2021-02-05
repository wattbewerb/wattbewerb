import { App } from './app';
import { CalculatorController } from './controllers/calculator.controller';

const app = new App({ port: 3000, controllers: [new CalculatorController()] });

app.listen();
