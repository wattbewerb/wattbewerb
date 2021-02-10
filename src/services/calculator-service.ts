import { plainToClass } from 'class-transformer';
import { clone } from 'lodash';
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

  async requestData(gemeindeSchluessel: string) {
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

    const data = [...installedTransformed, ...temporarilyShutoffTransformed];

    return data;
  }


  async calculate(gemeindeSchluessel: string, einwohnerzahl: number) {
    const start = process.hrtime();
    const data = await this.requestData(gemeindeSchluessel);
    const [durationInSec] = process.hrtime(start);

    const ort = data[0].Ort;
    const netzbetreiberName = data[0].NetzbetreiberNamen;

    const dataAtStart = this.calculateDataSetPerDate(
      data, 
      einwohnerzahl,
      null,
      // technical start date of wattbewerb
      moment('2021-02-13T01:00:00+01:00'), 
    )

    return {
      ort,
      netzbetreiberName,
      gemeindeSchluessel,
      start: dataAtStart,
      growth: [],
      secs: durationInSec,
    };
  }


  calculateDataSetPerDate(
    inputData: EinheitStromerzeugungExtended[], 
    einwohnerzahl: number, 
    fromDate: moment.Moment | null, 
    toDate: moment.Moment | null
  ) {
    let data = inputData;
    if (fromDate) {
      data = data.filter(
        (entry) => 
          (entry.InbetriebnahmeDatum.isAfter(fromDate)
          && entry.EinheitMeldeDatum.isAfter(fromDate))
      )
    }
    if (toDate) {
      data = data.filter(
        (entry) => 
          (entry.InbetriebnahmeDatum.isBefore(toDate)
          && entry.EinheitMeldeDatum.isBefore(toDate))
      )
    }

    const geprueftData = data.filter(
      (entry) =>
        entry.IsNBPruefungAbgeschlossen === Netzbetreiberpruefung.GEPRUEFT,
    );
    const inPruefungData = data.filter(
      (entry) =>
        entry.IsNBPruefungAbgeschlossen === Netzbetreiberpruefung.IN_PRUEFUNG,
    );

    const total = Math.floor(this.aggregateNumeric(data, 'Bruttoleistung'));
    const geprueft = Math.floor(this.aggregateNumeric(geprueftData, 'Bruttoleistung'));
    const inPruefung = Math.floor(this.aggregateNumeric(inPruefungData, 'Bruttoleistung'));

    const totalModule = Math.floor(this.aggregateNumeric(data, 'AnzahlSolarModule'));
    const geprueftModule = Math.floor(this.aggregateNumeric(geprueftData, 'AnzahlSolarModule'));
    const inPruefungModule = Math.floor(this.aggregateNumeric(inPruefungData, 'AnzahlSolarModule'));

    const perResidentNow = (total / einwohnerzahl) * 1000;
    const geprueftPerResidentNow = (geprueft / einwohnerzahl) * 1000;
    const inPruefungPerResidentNow = (inPruefung / einwohnerzahl) * 1000;

    return {
      dateFrom: fromDate ? fromDate.format('DD.MM.YYYY') : '',
      dateTo: toDate ? toDate.format('DD.MM.YYYY') : '',
      total: {
        kwp: total,
        anlagen: data.length,
        module: totalModule,
        wpPerResident: perResidentNow,
      },
      geprueft: {
        kwp: geprueft,
        anlagen: geprueftData.length,
        module: geprueftModule,
        wpPerResident: geprueftPerResidentNow,
      },
      inPruefung: {
        kwp: inPruefung,
        anlagen: inPruefungData.length,
        module: inPruefungModule,
        wpPerResident: inPruefungPerResidentNow,
      },
    }
  }


  aggregateNumeric(data: EinheitStromerzeugungExtended[], field: keyof EinheitStromerzeugungExtended) {
    return data.reduce((memo, entry) => memo + (entry[field] as number), 0)
  }
}
