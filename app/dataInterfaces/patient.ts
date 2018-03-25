import {sexeEnum} from "./sexe";
import {Adresse} from "./adress";
import {VisiteInterface} from "./visite";

export interface PatientInterface {
 prénom: string;
 nom: string;
 sexe: sexeEnum;
 numéroSécuritéSociale: string;
 adresse: Adresse;
 visites: VisiteInterface[];
}
