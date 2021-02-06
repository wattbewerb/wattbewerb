import { stringify } from 'querystring';
import axios, { AxiosResponse } from 'axios';
import { BetriebsStatus } from './interfaces/betrieb-status.enum';
import { MaStrResponse } from './responses/einheit-response.interface';
import _, { identity, partialRight, range } from 'lodash';
import { plainToClass } from 'class-transformer';
import { EinheitStromerzeugung } from './responses';
import { Energietraeger } from './interfaces/energietraeger.enum';

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

export class MakstrClient {
  private querifyId = partialRight(stringify, {
    encodeURIComponent: identity,
  });
  private querifyURI = partialRight(stringify, {
    encodeURIComponent: encodeURI,
  });

  private baseUrl =
    'https://www.marktstammdatenregister.de/MaStR/Einheit/EinheitJson/GetVerkleinerteOeffentlicheEinheitStromerzeugung';

  constructor(private readonly pageSize = 5000) {}

  async query(gemeindeschluessel: string): Promise<EinheitStromerzeugung[]> {
    const filter = this.querifyId(
      {
        'Betriebs-Status': `'${BetriebsStatus.IN_BETRIEB}'`,
        Gemeindeschlüssel: `'${gemeindeschluessel}'`,
        Energieträger: `'${Energietraeger.SOLARE_STRAHLUNGSENERGIE}'`,
      },
      '~and~',
      '~eq~',
    );

    const queryObject = {
      page: 1,
      pageSize: 0,
      filter,
    };
    // calling URL with pagesize 0 gives us no data but the totals
    const getTotal = await axios.get<MaStrResponse<EinheitStromerzeugung>>(
      `${this.baseUrl}?${this.querifyURI(queryObject, '&', '=')}`,
    );

    const promises =
      // creates array with page numbers
      this.getPageNumbers(getTotal.data.Total)
        .map((page) => this.getPaginatedURL(filter, page)) // maps numbers to a query object
        .map(this.requestData);

    const data = (await Promise.all(promises)).flat();

    return plainToClass(EinheitStromerzeugung, data);
  }

  private getPageNumbers(total: number) {
    return range(1, Math.ceil(total / this.pageSize + 1));
  }

  private getPaginatedURL(filter: string, page: number) {
    const pageQueryObject = { filter, pageSize: this.pageSize, page };
    return `${this.baseUrl}?${this.querifyURI(pageQueryObject, '&', '=')}`;
  }

  private requestData(url: string) {
    return axios
      .get<MaStrResponse<EinheitStromerzeugung>>(url)
      .then((resp) => resp.data.Data);
  }
}
