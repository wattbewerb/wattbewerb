import { Stromerzeugung } from './stromerzeugung.interface';

export interface EinheitResponse {
  Data: Stromerzeugung[];
  Total: number;
  AggregateResults: [];
  Errors: null;
}
