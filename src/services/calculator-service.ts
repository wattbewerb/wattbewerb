import moment from 'moment';
import { MakstrClient } from '../makstr-client/makstr-client';

export class CalculatorService {
  private readonly makStrClient: MakstrClient;
  constructor() {
    this.makStrClient = new MakstrClient();
  }
  async calculate(gemeindeSchluessel: string, einwohnerZahl: number) {
    const year2021 = moment('2021-01-01T01:00:00+01:00');

    const start = process.hrtime();
    const data = await this.makStrClient.query(gemeindeSchluessel);
    const [durationInSec] = process.hrtime(start);

    const ort = data[0].Ort;

    const anlagenEnd2020 = data.filter((entry) =>
      entry.InbetriebnahmeDatum.isBefore(year2021),
    );

    const totalEnd2020 = Math.floor(
      anlagenEnd2020.reduce((memo, entry) => memo + entry.Bruttoleistung, 0),
    );

    const totalNow = Math.floor(
      data.reduce((memo, entry) => memo + entry.Bruttoleistung, 0),
    );

    const perResidentEnd2020 = (totalEnd2020 / einwohnerZahl) * 1000;
    const perResidentNow = (totalNow / einwohnerZahl) * 1000;

    const growth = totalNow / totalEnd2020 - 1;
    return {
      ort,
      gemeindeSchluessel,
      end2020: {
        date: year2021.subtract(1, 'day').format('DD.MM.YYYY'),
        anlagen: anlagenEnd2020.length,
        total: totalEnd2020,
        perResident: perResidentEnd2020,
      },
      now: {
        date: moment().format('DD.MM.YYYY'),
        anlagen: data.length,
        total: totalNow,
        perResident: perResidentNow,
      },
      growth,
      secs: durationInSec,
    };
  }
}
