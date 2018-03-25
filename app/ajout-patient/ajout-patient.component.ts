import {Component, EventEmitter, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {PatientInterface} from "../dataInterfaces/patient";
import {NgForm} from "@angular/forms";
import {sexeEnum} from "../dataInterfaces/sexe";
import {Adresse} from "../dataInterfaces/adress";

@Component({
  selector: 'app-ajout-patient',
  templateUrl: './ajout-patient.component.html',
  styleUrls: ['./ajout-patient.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AjoutPatientComponent implements OnInit {

  @Output() messageAjout = new EventEmitter<PatientInterface>();

  constructor() {
  }

  ngOnInit() {
  }


  onSubmit(f: NgForm) {

    const adressePatient: Adresse = {
      ville: f.value.ville,
      codePostal: f.value.postalCode,
      rue: f.value.rue,
      numéro: f.value.numéro,
      étage: "0",
      lat: 0,
      lng: 0,
    }

    const patient: PatientInterface = {
      prénom: f.value.prénom,
      nom:  f.value.nom,
      sexe:  sexeEnum.M,
      numéroSécuritéSociale:  f.value.nir,
      adresse:  adressePatient,
      visites: null,
    }
    f.resetForm();
    this.messageAjout.emit(patient);
    console.log("Event ajout patient " + patient);
  }

}
