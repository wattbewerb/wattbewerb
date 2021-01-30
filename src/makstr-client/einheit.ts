import axios from 'axios';
import { BetriebsStatus } from './interfaces/betrieb-status.enum';
import { Energietraeger } from './interfaces/energietraeger.enum';
import { MaStrResponse } from './responses/einheit-response.interface';

export interface EinheitFilterParams {
  'Betriebs-Status': BetriebsStatus;
  Gemeindeschlüssel: string;
  Energieträger: Energietraeger;
}

export interface EinheitQueryParams {
  sort: string;
  page: number;
  pageSize: number;
  filter: EinheitFilterParams;
}

export class Einheit {
  private baseUrl =
    'https://www.marktstammdatenregister.de/MaStR/Einheit/EinheitJson/GetVerkleinerteOeffentlicheEinheitStromerzeugung';

  async query(gemeindeschluessel: string): Promise<MaStrResponse> {
    const filter =
      `filter=` +
      `Betriebs-Status~eq~%27${BetriebsStatus.IN_BETRIEB}%27~and~` +
      `Gemeindeschl%C3%BCssel~eq~%27${gemeindeschluessel}%27~and~` +
      `Energietr%C3%A4ger~eq~%27${Energietraeger.SOLARE_STRAHLUNGSENERGIE}%27`;

    const url = `${this.baseUrl}?page=1&pageSize=0&${filter}`;
    console.log(url);

    const response = await axios.get<MaStrResponse>(url);
    console.log(response);

    return response.data;
  }
}

// const url = `https://www.marktstammdatenregister.de/MaStR/Einheit/EinheitJson/GetVerkleinerteOeffentlicheEinheitStromerzeugung?`
//     + `sort=InbetriebnahmeDatum-desc&`
//     + `page=1&pageSize=${pageSize}&group=&`
//     + `&filter=`
//     + `Betriebs-Status~eq~%27${BetriebsStatusId.IN_BETRIEB}%27~and~`
//     + `Gemeindeschl%C3%BCssel~eq~%27${gemeindeSchluessel}%27~and~`
//     + `Energietr%C3%A4ger~eq~%27${Energietraeger.SOLARE_STRAHLUNGSENERGIE}%27~and~`;
//     // + `Postleitzahl~eq~%27${plz}%27`;
