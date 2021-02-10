import { EinheitStromerzeugung } from './einheit-stromerzeugung.class';
import {
  Energietraeger,
  Batterietechnologie,
  HauptausrichtungSolarModule,
  Netzbetreiberpruefung,
} from '../interfaces';
import { Transform, Type } from 'class-transformer';
import { dateStringToDate } from './utils';
import { Moment } from 'moment';

export class EinheitStromerzeugungExtended extends EinheitStromerzeugung {
  AktenzeichenGenehmigung!: string | null; // null;

  AnlagenbetreiberMaskedName!: string; // 'natürliche Person (ABR954892468113)';

  AnlagenbetreiberPersonenArt!: number; // 518;

  Batterietechnologie!: Batterietechnologie | null; // null;

  Breitengrad!: string | null; // null;

  Bundesland!: string; // 'Nordrhein-Westfalen';

  BundeslandId!: number; // 1409;

  EegAnlageMastrNummer!: string; // 'EEG995766357737';

  @Type(() => String)
  @Transform(({ value }) => dateStringToDate(value), { toClassOnly: true })
  EegAnlageMeldedatum!: Moment; // '/Date(1548979200000)/';

  EegAnlagenschluessel!: string; // 'E31817020000000000000050301511708';

  @Type(() => String)
  @Transform(({ value }) => dateStringToDate(value), { toClassOnly: true })
  EegInbetriebnahmeDatum!: Moment; // '/Date(1377216000000)/';

  EegZuschlag!: string | null; // null;

  EndgueltigeStilllegungDatum!: string | null; // null;

  EnergietraegerId!: Energietraeger; // 2495;

  Gemarkung!: string | null; // null;

  Gemeinde!: string; // 'Köln';

  Gemeindeschluessel!: string; // '05315000';

  GemeinsamerWechselrichter!: number; // 1450;

  GenehmigungDatum!: string | null; // null;

  GenehmigungMeldedatum!: string | null; // null;

  Genehmigungbehoerde!: string | null; // null;

  GenehmigungsMastrNummer!: string | null; // null;

  GeplantesInbetriebsnahmeDatum!: string | null; // null;

  Gruppierungsobjekte!: string; // 'EEG995766357737';

  GruppierungsobjekteIds!: string; // '1793034';

  HatFlexibilitaetspraemie!: string | null; // null;

  HauptausrichtungSolarModule!: HauptausrichtungSolarModule | null;

  HauptausrichtungSolarModuleBezeichnung!: string; // 'Nord-Ost';

  HauptbrennstoffId!: string | null; // null;

  HauptbrennstoffNamen!: string | null; // null;

  HauptneigungswinkelSolarmodule!: number; // 809;

  Hausnummer!: string | null; // null;

  HerstellerWindenergieanlage!: string | null; // null;

  HerstellerWindenergieanlageBezeichnung!: string | null; // null;

  IsEinheitNotstromaggregat!: string | null; // null;

  IsNBPruefungAbgeschlossen!: Netzbetreiberpruefung;

  KraftwerkBlockName!: string | null; // null;

  KraftwerkName!: string | null; // null;

  KwkAnlageElektrischeLeistung!: string | null; // null;

  KwkAnlageInbetriebnahmedatum!: string | null; // null;

  KwkAnlageMastrNummer!: string | null; // null;

  KwkAnlageMeldedatum!: string | null; // null;

  KwkZuschlag!: string | null; // null;

  Laengengrad!: string | null; // null;

  LageEinheit!: number; // 853;

  LageEinheitBezeichnung!: string; // 'Bauliche Anlagen (Hausdach, Gebäude und Fassade)';

  LandId!: number; // 84;

  Landkreis!: string; // 'Köln';

  Leistungsbegrenzung!: number; // 803;

  LokationMastrNr!: string; // 'SEL936055881182';

  MieterstromAngemeldet!: string | null; // null;

  MigrationseinheitMastrNummer!: string | null; // null;

  Migriert!: boolean; // false;

  NabenhoeheWindenergieanlage!: string | null; // null;

  NetzbetreiberId!: string; // '1000710';

  NetzbetreiberMaStRNummer!: string; // 'SNB924477581384';

  NetzbetreiberMaskedNamen!: string; // 'Rheinische NETZGesellschaft mbH (SNB924477581384)';

  NetzbetreiberNamen!: string; // 'Rheinische NETZGesellschaft mbH (SNB924477581384)';

  NetzbetreiberPersonenArt!: string; // '517';

  NutzbareSpeicherkapazitaet!: string | null; // null;

  NutzungsbereichGebSA!: number; // 713;

  Pilotwindanlage!: string | null; // null;

  Prototypanlage!: string | null; // null;

  Regelzone!: string | null; // null;

  RotordurchmesserWindenergieanlage!: string | null; // null;

  SpannungsebenenId!: string | null; // null;

  SpannungsebenenNamen!: string; // 'Niederspannung (= Hausanschluss/Haushaltsstrom)';

  SpeicherEinheitMastrNummer!: string | null; // null;

  StandortAnonymisiert!: string; // '50859 Köln; Deutschland';

  Statistik!: number; // 2883;

  Strasse!: string | null; // null;

  SystemStatusId!: number; // 472;

  SystemStatusName!: string; // 'Aktiviert';

  TechnologieStromerzeugung!: string | null; // null;

  TechnologieStromerzeugungId!: string | null; // null;

  ThermischeNutzleistung!: string | null; // null;

  Typenbezeichnung!: string | null; // null;

  VollTeilEinspeisung!: number; // 689;

  VollTeilEinspeisungBezeichnung!: string; // 'Teileinspeisung';

  WasserkraftErtuechtigung!: boolean; // false;

  WindClusterNordseeId!: string | null; // null;

  WindClusterOstseeId!: string | null; // null;

  WindparkName!: string | null; // null;
}
