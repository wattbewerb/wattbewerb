import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';

import { MakstrClient } from '../makstr-client/makstr-client';
import { BetriebsStatus, Energietraeger } from '../makstr-client/interfaces';
import { EinheitStromerzeugungExtended } from '../makstr-client/responses';

// Connect to a local redis instance locally, and the Heroku-provided URL in production
let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redis = new Redis(REDIS_URL);

// should go into a config
const queueName = 'wattbewerb';

// let workQueue: Queue = new Queue(queueName, { connection: redisConnection });
const makStrClient = new MakstrClient();

async function getData(gemeindeSchluessel: string) {
  const mainQuery = {
    Gemeindeschlüssel: gemeindeSchluessel,
    Energieträger: Energietraeger.SOLARE_STRAHLUNGSENERGIE,
  };
  // In Betrieb
  return Promise.all([
    // installed
    makStrClient.extendedQuery<EinheitStromerzeugungExtended>({
      ...mainQuery,
      'Betriebs-Status': BetriebsStatus.IN_BETRIEB,
    }),
    // temporarily shutoff
    makStrClient.extendedQuery<EinheitStromerzeugungExtended>({
      ...mainQuery,
      'Betriebs-Status': BetriebsStatus.VORUEBERGEHEND_STILLGELEGT,
    }),
  ]);
}

const worker = new Worker(
  queueName,
  async (job: Job) => {
    const { gemeindeschluessel } = job.data;
    const cacheKeyname = `ags:${gemeindeschluessel}`;

    const start = process.hrtime();
    const [installed, temporarilyShuttedoff] = await getData(
      gemeindeschluessel,
    );
    const [duration] = process.hrtime(start);

    const [err, results] = await redis
      .multi()
      .hset(cacheKeyname, {
        duration,
        data: JSON.stringify([...installed, ...temporarilyShuttedoff]),
      })
      .expire(cacheKeyname, 2 * 24 * 60 * 60)
      .exec();

    return;
  },
  {
    concurrency: 50, // could even be higher since we are only fetching network data
    connection: redis,
  },
);

// // Spin up multiple processes to handle jobs to take advantage of more CPU cores
// // See: https://devcenter.heroku.com/articles/node-concurrency for more info
// let workers = process.env.WEB_CONCURRENCY || 1;

// // The maximum number of jobs each worker should process at once. This will need
// // to be tuned for your application. If each job is mostly waiting on network
// // responses it can be much higher. If each job is CPU-intensive, it might need
// // to be much lower.
// let maxJobsPerWorker = 50;

// function sleep(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// function start() {
//   workQueue.process(maxJobsPerWorker, async (job) => {
//     // This is an example job that just slowly reports on progress
//     // while doing no work. Replace this with your own job logic.
//     let progress = 0;

//     // throw an error 5% of the time
//     if (Math.random() < 0.05) {
//       throw new Error('This job failed!');
//     }

//     while (progress < 100) {
//       await sleep(50);
//       progress += 1;
//       job.progress(progress);
//     }

//     // write to cache cache:gemeindeschluessel with "EXPIRE cache:gemeindeschluessel {now + 2 days}"
//     // A job can return values that will be stored in Redis as JSON
//     // This return value is unused in this demo application.
//     return { value: 'This will be stored' };
//   });
// }

// // Initialize the clustered worker process
// // See: https://devcenter.heroku.com/articles/node-concurrency for more info
// throng({ workers, start });
