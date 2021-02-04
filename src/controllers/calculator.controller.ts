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
    
    console.log(gemeindeschluessel);
    console.log(einwohnerzahl);
    
    res.send({
      ort: 'Nürnberg',
      start: {
        kwp: 80431,
        anlagen: 3120,
        module: 256920,
        // watt peak
        wpPerResident: 155.163
      },
      now: {
        kwp: 80548,
        anlagen: 3136,
        module: 257277,
        // watt peak
        wpPerResident: 155.389
      },
      diff: {
        kwp: 117,
        anlagen: 16,
        module: 357,
        // watt peak
        wpPerResident: 0.226
      }
    });
  };
}
