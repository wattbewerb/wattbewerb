#!/usr/bin/env ts-node
import axios, { AxiosResponse } from "axios";
import * as moment from 'moment';
import { BetriebsStatusId } from "./interfaces/BetriebsStatusId.enum";
import { Response } from "./interfaces/Response.interface";

const population = 49237;
const year2021 = moment("2021-01-01T01:00:00+01:00");

const TYPE_SOLAR = '2495';

const pageSize = '1000';
const plz = '67227';
const type = TYPE_SOLAR;

const url = `https://www.marktstammdatenregister.de/MaStR/Einheit/EinheitJson/GetVerkleinerteOeffentlicheEinheitStromerzeugung`
    + `?sort=InbetriebnahmeDatum-desc`
    + `&page=1&pageSize=${pageSize}&group=`
    + `&filter=Energietr%C3%A4ger~eq~%27${type}%27~and~Postleitzahl~eq~%27${plz}%27`;

axios.get(url)
    .then((response: AxiosResponse<Response>) => {
            // console.dir(response.data.Data);
            // console.log('page size: ' + pageSize);
            // console.log('data size: ' + response.data.Data.length);
            // console.log('total data size: ' + response.data.Total);
            
            let totalNow = 0;
            let totalEnd2020 = 0;
            response.data.Data.forEach((entry) => {
                // filter only running entities
                if (entry.BetriebsStatusId !== BetriebsStatusId.IN_BETRIEB) {
                    return;
                }

                // console.log(entry.EnergietraegerName);
                // console.log(entry.EinheitName);
                // console.log(moment(entry.InbetriebnahmeDatum));
                // console.log(entry.Bruttoleistung);

                if (moment(entry.InbetriebnahmeDatum).isBefore(year2021)) {
                    totalEnd2020 += entry.Bruttoleistung;
                }
                totalNow += entry.Bruttoleistung;
            });

            totalEnd2020 = Math.floor(totalEnd2020);
            totalNow = Math.floor(totalNow);

            const perResidentEnd2020 = totalEnd2020 / population;
            const perResidentNow = totalNow / population;

            const growth = totalNow / (totalEnd2020 / 100) - 100;

            console.log(`kWp for ${plz}`);
            console.log(`\n################################\n`);
            console.log(`31.12.2020`);
            console.log(`  total:           ${totalEnd2020} kWp`);
            console.log(`  per resident:    ${perResidentEnd2020} kWp/resident`);
            console.log(moment().format('DD.MM.YYYY'));
            console.log(`  total:           ${totalNow} kWp`);
            console.log(`  per resident:    ${perResidentNow} kWp/resident`);
            console.log(`Growth`);
            console.log(`  kWp:             ${totalNow - totalEnd2020} kWp`);
            console.log(`  Percentage:      ${growth} %`)
        })
    .catch(function (error) {
        // handle error
        console.log(error);
    });
