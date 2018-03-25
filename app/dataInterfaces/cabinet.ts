import {InfirmierInterface} from "./nurse";
import {PatientInterface} from "./patient";
import {Adresse} from "./adress";

export interface CabinetInterface {
 nom: String[];
 infirmiers: InfirmierInterface[];
 patientsNonAffectés: PatientInterface  [];
 adresse: Adresse;
}
