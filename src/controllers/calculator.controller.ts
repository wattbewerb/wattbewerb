import * as express from 'express';
import { Request, Response } from 'express';
import { IBaseController } from './base-controller.interface';

export class CalculatorController implements IBaseController {
  public path = '/watt-info';
  public router = express.Router();

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.get(
      `${this.path}/:gemeindeschluessel/:einwohnerzahl`,
      this.index,
    );
  }

  index = (req: Request, res: Response) => {
    const gemeindeschluessel = req.params.gemeindeschluessel;
    const einwohnerzahl = req.params.einwohnerzahl;
    res.send(
      `Hello ${gemeindeschluessel}! Wow, you have ${einwohnerzahl} residents. Quite impressive!`,
    );

    // res.render('home/index', { users });
  };
}
