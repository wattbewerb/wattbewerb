import { Stromerzeugung } from "./Stromerzeugung.interface";

export interface Response {
    Data: Stromerzeugung[],
    Total: number,
    AggregateResults: [],
    Errors: null,
}