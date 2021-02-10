# wattbewerb ☀️✖️2️⃣

[https://faktor2.solar/](https://faktor2.solar/)

## Using the Script

* Install [node.js](https://nodejs.org/en/)
* open a console / terminal
* Execute `npm install -g typescript ts-node`
* Execute `npx @wattbewerb/wattbewerb [Gemeindeschlüssel] [Einwohnerzahl]`

```sh
$ npx @wattbewerb/wattbewerb 05166012 34597

☀️ ✖️ 2️⃣  Willkommen beim Wattbewerb ☀️ ✖️ 2️⃣

Daten werden berechnet für
Gemeindeschlüssel: 05166012
Einwohner: 34597


kWp für Kempen (05166012)
################################

31.12.2020
  Gesamt:          42343 kWp
  Pro Einwohner:   1.2238922449923404 kWp/Einwohner
29.01.2021
  Gesamt:          42380 kWp
  Pro Einwohner:   1.224961701881666 kWp/Einwohner
Wachstum 2021
  kWp:             37 kWp
  Prozentual:      0.0873816215194978 %


Disclaimer: Diese Berechnung ist unverbindlich und möglicherweise fehlerhaft.
Zur Anmeldung ist daher eine genaue Berechnung auf Grundlage des Datenexports aus dem
Markstammdatenregister erforderlich.

Weiter Informationen unter https://faktor2.solar/staedte-challenge/
```

## Applied Filters in Markstammdatenregister

| Field                | Operand     | Value                                         |
|----------------------|-------------|-----------------------------------------------|
| Gemeindeschlüssel    | entspricht  | "05166012"                                    |
| Energieträger        | entspricht  | "Solare Strahlungsenergie"                    |
| Netzbetreiberprüfung | entspricht  | "Geprüft"                                     |
| Betriebsstatus       | entspricht  | "In Betrieb" oder "Vorübergehend stillgelegt" |
| Meldedatum           | vor         | 13.02.2021                                    |
| Inbetriebnahmedatum  | vor         | 13.02.2021                                    |

## License

This project is licensed under the [MIT](https://mit-license.org/) License.
