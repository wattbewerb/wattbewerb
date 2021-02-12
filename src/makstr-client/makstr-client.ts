import { stringify } from 'querystring';
import axios, { AxiosResponse } from 'axios';
import { BetriebsStatus } from './interfaces/betrieb-status.enum';
import { MaStrResponse } from './responses/einheit-response.interface';
import _, { identity, partialRight, range } from 'lodash';
import { plainToClass } from 'class-transformer';
import {
  EinheitStromerzeugung,
  EinheitStromerzeugungExtended,
} from './responses';
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
  private extendedUrl =
    'https://www.marktstammdatenregister.de/MaStR/Einheit/EinheitJson/GetErweiterteOeffentlicheEinheitStromerzeugung';

  constructor(private readonly pageSize = 5000) {}

  async query<T>(filterQuery: Record<string, any>): Promise<T[]> {
    const filter = this.querifyId(filterQuery, '~and~', '~eq~');

    const queryObject = {
      page: 1,
      pageSize: 0,
      filter,
    };
    // calling URL with pagesize 0 gives us no data but the totals
    const getTotalsUrl = `${this.baseUrl}?${this.querifyURI(
      queryObject,
      '&',
      '=',
    )}`;
    const getTotal = await axios.get<MaStrResponse<T>>(getTotalsUrl);

    const promises =
      // creates array with page numbers
      this.getPageNumbers(getTotal.data.Total)
        .map((page) => this.getPaginatedURL(this.baseUrl, filter, page)) // maps numbers to a query object
        .map((url: string) => this.requestData<T>(url));

    const data = (await Promise.all(promises)).flat();

    return data;
  }

  async extendedQuery<T>(filterQuery: Record<string, any>): Promise<T[]> {
    const filter = this.querifyId(filterQuery, '~and~', '~eq~');

    const queryObject = {
      page: 1,
      pageSize: 0,
      filter,
    };
    // calling URL with pagesize 0 gives us no data but the totals
    const getTotalsUrl = `${this.extendedUrl}?${this.querifyURI(
      queryObject,
      '&',
      '=',
    )}`;
    const getTotal = await axios.get<MaStrResponse<T>>(getTotalsUrl);

    const promises =
      // creates array with page numbers
      this.getPageNumbers(getTotal.data.Total)
        .map((page) => this.getPaginatedURL(this.extendedUrl, filter, page)) // maps numbers to a query object
        .map((url: string) => this.requestData<T>(url));

    const data = (await Promise.all(promises)).flat();

    return data;
  }

  private getPageNumbers(total: number) {
    return range(1, Math.ceil(total / this.pageSize + 1));
  }

  private getPaginatedURL(baseUrl: string, filter: string, page: number) {
    const pageQueryObject = { filter, pageSize: this.pageSize, page };
    return `${baseUrl}?${this.querifyURI(pageQueryObject, '&', '=')}`;
  }

  private requestData<T>(url: string) {
    return axios.get<MaStrResponse<T>>(url).then((resp) => resp.data.Data);
  }
}
