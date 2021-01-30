#!/usr/bin/env ts-node
import axios, { AxiosResponse } from 'axios';
import moment from 'moment';

import {
  BetriebsStatus,
  Energietraeger,
  Netzbetreiberpruefung,
} from './makstr-client/interfaces';
import {
  MaStrResponse,
  EinheitStromerzeugungExtended,
} from './makstr-client/responses';

const year2021 = moment('2021-01-01T01:00:00+01:00');
const pageSize = '10000';

// const input = {
//     ort: 'Frankenthal',
//     plz: '67227',
//     einwohner: 48561,
//     gemeindeschluessel: '07311000'
// };

// const input = {
//     ort: 'Köln',
//     plz: '50667',
//     einwohner: 1085664,
//     gemeindeschluessel: '05315000'
// };

// const input = {
//     ort: 'Bous',
//     plz: '66359',
//     einwohner: 7011,
//     gemeindeschluessel: '10044122'
// };

// const input = {
//   ort: 'Kempen, Niederrhein',
//   plz: '47906',
//   einwohner: 34597,
//   gemeindeschluessel: '05166012',
// };

// const { plz, ort, einwohner, gemeindeschluessel } = input;

/* @ts-ignore */
const gemeindeschluessel = process.argv[2];
/* @ts-ignore */
const einwohner: number = process.argv[3];

if (!gemeindeschluessel || !einwohner) {
  console.log('\nEingabedaten fehlen!\n');
  console.log('Das Skript ist wie folgt zu benutzen:');
  console.log(
    '> npx @wattbewerb/wattbewerb [Gemeindeschlüssel] [Einwohnerzahl]',
  );
  console.log('Beispiel:');
  console.log('> npx @wattbewerb/wattbewerb 05315000 1085664');

  /* @ts-ignore */
  process.exit(0);
}

console.log(`\n☀️ ✖️ 2️⃣  Willkommen beim Wattbewerb ☀️ ✖️ 2️⃣\n`);
console.log(`Daten werden berechnet für`);
console.log(`Gemeindeschlüssel: ${gemeindeschluessel}`);
console.log(`Einwohner: ${einwohner}\n`);

const url =
  `https://www.marktstammdatenregister.de/MaStR/Einheit/EinheitJson/GetVerkleinerteOeffentlicheEinheitStromerzeugung?` +
  `sort=InbetriebnahmeDatum-desc&` +
  `page=1&pageSize=${pageSize}&group=&` +
  `&filter=` +
  `Gemeindeschl%C3%BCssel~eq~%27${gemeindeschluessel}%27~and~` +
  `Betriebs-Status~eq~%27${BetriebsStatus.IN_BETRIEB}%27~and~` +
  `Netzbetreiberpr%C3%BCfung~eq~%27${Netzbetreiberpruefung.GEPRUEFT}%27~and~` +
  `Energietr%C3%A4ger~eq~%27${Energietraeger.SOLARE_STRAHLUNGSENERGIE}%27~and~`;
// + `Postleitzahl~eq~%27${plz}%27`;

// console.log(url);

axios
  .get<MaStrResponse<EinheitStromerzeugungExtended>>(url)
  .then(
    (response: AxiosResponse<MaStrResponse<EinheitStromerzeugungExtended>>) => {
      // console.log('page size: ' + pageSize);
      // console.log('data size: ' + response.data.Data.length);
      // console.log('total data size: ' + response.data.Total);

      let biggestEntry: EinheitStromerzeugungExtended | null = null;
      let smallestEntry: EinheitStromerzeugungExtended | null = null;
      let totalKwpNow = 0;
      let totalKwpEnd2020 = 0;
      let totalEntriesNow = 0;
      let totalEntriesEnd2020 = 0;
      let totalModulesNow = 0;
      let totalModulesEnd2020 = 0;
      let ort = '';
      response.data.Data.forEach((entry) => {
        if (!ort) {
          ort = entry.Ort;
        }

        if (
          !biggestEntry ||
          biggestEntry.Bruttoleistung < entry.Bruttoleistung
        ) {
          biggestEntry = entry;
        }
        if (
          !smallestEntry ||
          smallestEntry.Bruttoleistung > entry.Bruttoleistung
        ) {
          smallestEntry = entry;
        }

        if (moment(entry.InbetriebnahmeDatum).isBefore(year2021)) {
          totalKwpEnd2020 += entry.Bruttoleistung;
          totalEntriesEnd2020++;
          totalModulesEnd2020 += entry.AnzahlSolarModule;
        }
        totalKwpNow += entry.Bruttoleistung;
        totalEntriesNow++;
        totalModulesNow += entry.AnzahlSolarModule;
      });

      // console.dir(smallestEntry);
      // console.dir(biggestEntry);

      totalKwpEnd2020 = Math.floor(totalKwpEnd2020);
      totalKwpNow = Math.floor(totalKwpNow);

      const perResidentEnd2020 = totalKwpEnd2020 / einwohner;
      const perResidentNow = totalKwpNow / einwohner;

      const growth = totalKwpNow / (totalKwpEnd2020 / 100) - 100;

      console.log(`\nkWp für ${ort} (${gemeindeschluessel})`);
      console.log(`################################\n`);
      console.log(`31.12.2020`);
      console.log(`  Gesamt:          ${totalKwpEnd2020} kWp`);
      console.log(`  Anzahl Anlagen:  ${totalEntriesEnd2020}`);
      console.log(`  Anzahl Module:   ${totalModulesEnd2020}`);
      console.log(`  Pro Einwohner:   ${perResidentEnd2020} kWp/Einwohner\n`);
      console.log(moment().format('DD.MM.YYYY'));
      console.log(`  Gesamt:          ${totalKwpNow} kWp`);
      console.log(`  Anzahl Anlagen:  ${totalEntriesNow}`);
      console.log(`  Anzahl Module:   ${totalModulesNow}`);
      console.log(`  Pro Einwohner:   ${perResidentNow} kWp/Einwohner\n`);
      console.log(`Wachstum 2021`);
      console.log(`  kWp:             ${totalKwpNow - totalKwpEnd2020} kWp`);
      console.log(
        `  Anzahl Anlagen:  ${totalEntriesNow - totalEntriesEnd2020}`,
      );
      console.log(
        `  Anzahl Module:   ${totalModulesNow - totalModulesEnd2020}`,
      );
      console.log(`  Prozentual:      ${growth} %\n\n`);

      console.log(
        `Disclaimer: Diese Berechnung ist unverbindlich und möglicherweise fehlerhaft.\n` +
          `Zur Anmeldung ist daher eine genaue Berechnung auf Grundlage des Datenexports aus dem\n` +
          `Markstammdatenregister erforderlich.\n\n` +
          `Weiter Informationen unter https://faktor2.solar/staedte-challenge/\n\n`,
      );
    },
  )
  .catch(function (error) {
    // handle error
    console.log(error);
  });
