import { plainToClass } from 'class-transformer';
import moment from 'moment';
import { inspect } from 'util';
import {
  BetriebsStatus,
  Energietraeger,
  Netzbetreiberpruefung,
} from '../makstr-client/interfaces';
import { MakstrClient } from '../makstr-client/makstr-client';
import { EinheitStromerzeugungExtended } from '../makstr-client/responses';

export class CalculatorService {
  private readonly makStrClient: MakstrClient;
  constructor() {
    this.makStrClient = new MakstrClient();
  }
  async calculate(gemeindeSchluessel: string, einwohnerZahl: number) {
    const start = process.hrtime();
    const mainQuery = {
      Gemeindeschlüssel: `'${gemeindeSchluessel}'`,
      Energieträger: `'${Energietraeger.SOLARE_STRAHLUNGSENERGIE}'`,
    };
    // In Betrieb
    const installedRequested = await this.makStrClient.extendedQuery<EinheitStromerzeugungExtended>(
      {
        ...mainQuery,
        'Betriebs-Status': `'${BetriebsStatus.IN_BETRIEB}'`,
      },
    );

    const installedTransformed = plainToClass(
      EinheitStromerzeugungExtended,
      installedRequested,
    );

    // Vorrübergehend stillgelegt
    const temporarilyShutoffRequested = await this.makStrClient.extendedQuery<EinheitStromerzeugungExtended>(
      {
        ...mainQuery,
        'Betriebs-Status': `'${BetriebsStatus.VORUEBERGEHEND_STILLGELEGT}'`,
      },
    );
    const temporarilyShutoffTransformed = plainToClass(
      EinheitStromerzeugungExtended,
      temporarilyShutoffRequested,
    );

    const [durationInSec] = process.hrtime(start);

    const data = [...installedTransformed, ...temporarilyShutoffTransformed];

    const ort = data[0].Ort;
    const netzbetreiberName = data[0].NetzbetreiberNamen;

    const geprueftData = data.filter(
      (entry) =>
        entry.IsNBPruefungAbgeschlossen === Netzbetreiberpruefung.GEPRUEFT,
    );
    const inPruefungData = data.filter(
      (entry) =>
        entry.IsNBPruefungAbgeschlossen === Netzbetreiberpruefung.IN_PRUEFUNG,
    );

    const totalNow = Math.floor(
      data.reduce((memo, entry) => memo + entry.Bruttoleistung, 0),
    );
    const geprueftNow = Math.floor(
      geprueftData.reduce((memo, entry) => memo + entry.Bruttoleistung, 0),
    );
    const inPruefungNow = Math.floor(
      inPruefungData.reduce((memo, entry) => memo + entry.Bruttoleistung, 0),
    );

    const perResidentNow = (totalNow / einwohnerZahl) * 1000;
    const geprueftPerResidentNow = (geprueftNow / einwohnerZahl) * 1000;
    const inPruefungPerResidentNow = (inPruefungNow / einwohnerZahl) * 1000;

    return {
      ort,
      netzbetreiberName,
      gemeindeSchluessel,
      now: {
        date: moment().format('DD.MM.YYYY'),
        anlagen: data.length,
        total: totalNow,
        perResident: perResidentNow,
      },
      geprueft: {
        anlagen: geprueftData.length,
        total: geprueftNow,
        perResident: geprueftPerResidentNow,
      },
      inPruefung: {
        anlagen: inPruefungData.length,
        total: inPruefungNow,
        perResident: inPruefungPerResidentNow,
      },
      secs: durationInSec,
    };
  }
}
