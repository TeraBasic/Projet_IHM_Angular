import { Injectable } from '@angular/core';
import { CabinetInterface } from "./dataInterfaces/cabinet";
import {Http} from '@angular/http';
import {Adresse} from "./dataInterfaces/adress";
import {InfirmierInterface} from "./dataInterfaces/nurse";
import {PatientInterface} from "./dataInterfaces/patient";
import {sexeEnum} from "./dataInterfaces/sexe";
import {VisiteInterface} from "./dataInterfaces/visite";


@Injectable()
export class CabinetMedicalService {

  public  http : Http;
  private text;
  constructor(http: Http) {
    this.http = http;
  }

  //"/data/cabinetInfirmier.xml"
  async getData( url: string ): Promise<CabinetInterface>{
    return this.http.get(url, "text/xml").toPromise().then( res => {
        if (res.status !== 200) {
          console.log("Bad response !");
        } else {
          var parse = new DOMParser();
          this.text = parse.parseFromString(res.text(), "text/xml");
          console.log("Good response !");
          const cabinet: CabinetInterface = {
            nom : this.text.querySelector("cabinet > nom").textContent,
            infirmiers : this.getListeInfirmierFromNode(this.text),
            patientsNonAffectés : this.getPatientNonAffectes(this.text),
            adresse : this.nodeToAddress(this.text.querySelector("cabinet > adresse"))
          };
          return cabinet;
        }
        return null;
      }
    )
  };

  nodeToAddress(node: Element): Adresse{
    let etageText = null;
    if(node.querySelector("étage") != null){
      etageText =  node.querySelector("étage").textContent;
    }

    let numeroText = null;
    if(node.querySelector("numéro") != null){
      numeroText =  node.querySelector("numéro").textContent;
    }

    let lat = 0;
    let lng = 0;
    if(node.querySelector("lat") != null){
      lat = Number(node.querySelector("lat").textContent);
    }
    if(node.querySelector("lng") != null){
      lng = Number(node.querySelector("lng").textContent);
    }
    const adresse: Adresse = {
      ville: node.querySelector("ville").textContent,
      codePostal: Number(node.querySelector("codePostal").textContent),
      rue: node.querySelector("rue").textContent,
      numéro: numeroText,
      étage: etageText,
      lat: lat,//Number(node.querySelector("lat").textContent),
      lng: lng,//Number(node.querySelector("lng").textContent),
    }
    return adresse;
  }

  getListeInfirmierFromNode(node: Element): InfirmierInterface[]{
    var listeInfirmierXML = Array.from(node.querySelectorAll("infirmier"));
    const infirmiers: InfirmierInterface[] = listeInfirmierXML.map(inf => this.getInfirmierFromNode(inf, node));
    return infirmiers;
  }

  getInfirmierFromNode(node: Element, doc: Element): InfirmierInterface{
    let id = node.attributes[0].value;
    const infirmier: InfirmierInterface = {
      id: id,
      prénom: node.querySelector("prénom").textContent,
      nom: node.querySelector("nom").textContent,
      photo: node.querySelector("photo").textContent,
      patients: this.getPatientFromInfirmier(id, doc),
      adresse: this.nodeToAddress(node.querySelector("adresse")),
    }
    return infirmier;
  }

  getPatientNonAffectes(node: Element): PatientInterface[] {

    var listPatientNonAffectesRAW = Array.from(node.querySelectorAll("patient"));
    const listPatientNonAffectes: PatientInterface[] = [];
    listPatientNonAffectesRAW.forEach((patientRaw) => {
      if(patientRaw.querySelector("visite").getAttribute("intervenant") === ""){
        listPatientNonAffectes.push(this.getPatientFromNode(patientRaw));
      }
    });

    return listPatientNonAffectes;
  }

  getPatientFromNode(node: Element): PatientInterface{
    const patient: PatientInterface = {
      prénom: node.querySelector("prénom").textContent,
      nom: node.querySelector("nom").textContent,
      sexe: <sexeEnum>sexeEnum[node.querySelector("sexe").textContent],
      numéroSécuritéSociale: node.querySelector("numéro").textContent,
      adresse: this.nodeToAddress(node.querySelector("adresse")),
      visites: null,
    }
    return patient;
  }

  getPatientFromInfirmier(id: string, doc: Element):PatientInterface[] {
    const listPatientInfirmier: PatientInterface[] = [];
    let tousPatient = Array.from(doc.querySelectorAll("patient"));
    tousPatient.forEach((patient) => {
      if(patient.querySelector("visite") != null){ // Si le patient au moins une visite
        let idVisite = patient.querySelector("visite").getAttribute("intervenant");
        if(idVisite === id){
          listPatientInfirmier.push(this.getPatientFromNode(patient));
        }
      }
    });
    return listPatientInfirmier
  }

  addPatient(patient: PatientInterface) {
  return this.http.post("/addPatient", {
      patientName: patient.nom,
      patientForname: patient.prénom,
      patientNumber: patient.numéroSécuritéSociale,
      patientSex: patient.sexe === sexeEnum.M ? "M" : "F",
      patientBirthday: "1990-12-08",
      patientFloor: patient.adresse.étage,
      patientStreetNumber: patient.adresse.numéro,
      patientStreet: patient.adresse.rue,
      patientPostalCode: patient.adresse.codePostal,
      patientCity: patient.adresse.ville
    });
  };

  desafecter($event: Event) {
    return this.http.post( "/affectation", {
      infirmier: "none",
      patient: $event["nir"]
    });
  }

  receiveAffectation($event: Event) {
    return this.http.post( "/affectation", {
      infirmier: $event[1],
      patient: $event[0]
    })
  }
}

