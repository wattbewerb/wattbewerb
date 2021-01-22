#!/usr/bin/env ts-node
import axios, { AxiosResponse } from "axios";
import { Response } from "./interfaces/Response.interface";


const pageSize = '1000';
const plz = '67227';
const url = `https://www.marktstammdatenregister.de/MaStR/Einheit/EinheitJson/GetVerkleinerteOeffentlicheEinheitStromerzeugung?sort=InbetriebnahmeDatum-desc&page=1&pageSize=${pageSize}&group=&filter=Postleitzahl~eq~%27${plz}%27`;

axios.get(url)
    .then((response: AxiosResponse<Response>) => {
            console.dir(response.data.Data);
            console.log('page size: ' + pageSize);
            console.log('data size: ' + response.data.Data.length);
            console.log('total data size: ' + response.data.Total);
            
            let total = 0;
            response.data.Data.forEach((entry) => total += entry.Bruttoleistung);

            total = Math.floor(total);
            console.log(`Total kWp for ${plz}: ${total} kWp`);
        })
    .catch(function (error) {
        // handle error
        console.log(error);
    });
