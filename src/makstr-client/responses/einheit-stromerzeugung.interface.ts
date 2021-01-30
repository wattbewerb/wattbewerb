import { BetriebsStatus } from '../interfaces';

export interface EinheitStromerzeugung {
  AnlagenbetreiberId: number; // 2619336,
  AnlagenbetreiberMaStRNummer: string; // 'ABR967618844900',
  AnlagenbetreiberName: string; // '(natürliche Person)',
  AnzahlSolarModule: number; // 30,
  BetriebsStatusId: BetriebsStatus; // 35,
  BetriebsStatusName: string; // 'In Betrieb',
  Bruttoleistung: number; // 9.9,
  DatumLetzteAktualisierung: string; // '/Date(1610466306443)/',
  EinheitMeldeDatum: string; // '/Date(1607817600000)/',
  EinheitName: string; // 'EntenSolar',
  EnergietraegerName: string; // 'Solare Strahlungsenergie',
  Flurstueck: string | null; // null;
  Id: number; // 3871647,
  InbetriebnahmeDatum: string; // '/Date(1607644800000)/',
  IsAnonymisiert: boolean; // true;
  IsPilotwindanlage: null | string; // null;
  LokationId: number; // 3744912,
  MaStRNummer: string; // 'SEE903445330032',
  Nettonennleistung: number; // 8
  Ort: string; // 'Frankenthal',
  PersonenArtId: number; // 518,
  Plz: string; // '67227',
  Typ: number; // 1,
}
