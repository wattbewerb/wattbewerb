import { Queue, Job } from 'bullmq';
import { deserializeArray, plainToClass } from 'class-transformer';
import Redis from 'ioredis';
import moment from 'moment';

import { Netzbetreiberpruefung } from '../makstr-client/interfaces';
import { MakstrClient } from '../makstr-client/makstr-client';
import { EinheitStromerzeugungExtended } from '../makstr-client/responses';

// Connect to a local redis instance locally, and the Heroku-provided URL in production
let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
// should go into a config
const queueName = 'wattbewerb';

export class CalculatorService {
  private readonly makStrClient: MakstrClient;
  private readonly redis: Redis.Redis;
  private readonly queue: Queue;

  constructor() {
    this.redis = new Redis(REDIS_URL);
    this.queue = new Queue(queueName, {
      connection: this.redis,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        timeout: 20,
      },
    });
    this.makStrClient = new MakstrClient();
  }

  async calculate(gemeindeschluessel: string, einwohnerzahl: number) {
    const todayString = moment().format('YYYYMMDD');
    // check redis for key: "ags:gemeindeschluessel"
    const cacheHit = await this.redis.hgetall('ags:' + gemeindeschluessel);
    if (Object.keys(cacheHit).length > 0) {
      return this.handleCacheHit(cacheHit, einwohnerzahl, gemeindeschluessel);
    }

    // otherwise: look for a existing bull job, if one exists tell client to keep polling
    const jobId = `${gemeindeschluessel}-${todayString}`;
    const jobExists = await this.queue.getJob(jobId);
    if (jobExists) return null;

    // otherwise: create a new bull job, tell client to keep polling
    await this.queue.add(jobId, { gemeindeschluessel }, { jobId });
    return null;
  }

  private handleCacheHit(
    cacheHit: Record<string, string>,
    einwohnerzahl: number,
    gemeindeschluessel: string,
  ) {
    const durationInSecs = cacheHit['duration'];
    const dataAsJson: any[] = JSON.parse(cacheHit['data']);
    const data = plainToClass(EinheitStromerzeugungExtended, dataAsJson);

    const dataAtStart = this.calculateDataSetPerDate(
      data,
      einwohnerzahl,
      null,
      // technical start date of wattbewerb
      moment('2021-02-13T01:00:00+01:00'),
    );

    return {
      ort: data[0].Ort,
      netzbetreiberName: data[0].NetzbetreiberNamen,
      gemeindeschluessel,
      start: dataAtStart,
      growth: [],
      secs: durationInSecs,
    };
  }

  lookForData(gemeindeSchluessel: string) {}

  calculateDataSetPerDate(
    inputData: EinheitStromerzeugungExtended[],
    einwohnerzahl: number,
    fromDate: moment.Moment | null,
    toDate: moment.Moment | null,
  ) {
    let data = inputData;
    if (fromDate) {
      data = data.filter(
        (entry) =>
          entry.InbetriebnahmeDatum.isAfter(fromDate) &&
          entry.EinheitMeldeDatum.isAfter(fromDate),
      );
    }
    if (toDate) {
      data = data.filter(
        (entry) =>
          entry.InbetriebnahmeDatum.isBefore(toDate) &&
          entry.EinheitMeldeDatum.isBefore(toDate),
      );
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
    const geprueft = Math.floor(
      this.aggregateNumeric(geprueftData, 'Bruttoleistung'),
    );
    const inPruefung = Math.floor(
      this.aggregateNumeric(inPruefungData, 'Bruttoleistung'),
    );

    const totalModule = Math.floor(
      this.aggregateNumeric(data, 'AnzahlSolarModule'),
    );
    const geprueftModule = Math.floor(
      this.aggregateNumeric(geprueftData, 'AnzahlSolarModule'),
    );
    const inPruefungModule = Math.floor(
      this.aggregateNumeric(inPruefungData, 'AnzahlSolarModule'),
    );

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
    };
  }

  aggregateNumeric(
    data: EinheitStromerzeugungExtended[],
    field: keyof EinheitStromerzeugungExtended,
  ) {
    return data.reduce((memo, entry) => memo + (entry[field] as number), 0);
  }
}
