import * as express from 'express';
import { Request, Response } from 'express';
import { CalculatorService } from '../services/calculator-service';
import { IBaseController } from './base-controller.interface';

export class CalculatorController implements IBaseController {
  public path = '/watt-info';
  public router = express.Router();
  private readonly calculatorService: CalculatorService;

  constructor() {
    // TODO: should be done via dependency injetion
    this.calculatorService = new CalculatorService();
    this.initRoutes();
  }

  public initRoutes() {
    console.log('CalculatorController routes initialized');
    this.router.get(
      `${this.path}/:gemeindeschluessel/:einwohnerzahl`,
      this.index,
    );
  }

  index = async (req: Request, res: Response) => {
    const gemeindeschluessel = req.params.gemeindeschluessel;
    const einwohnerzahl = parseInt(req.params.einwohnerzahl);

    console.log(gemeindeschluessel, einwohnerzahl);
    const data = await this.calculatorService.calculate(
      gemeindeschluessel,
      einwohnerzahl,
    );

    res.status(200).json(data);
  };
}
