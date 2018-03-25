import {Component, Input, OnInit, ViewEncapsulation, Output, EventEmitter} from '@angular/core';
import {InfirmierInterface} from "../dataInterfaces/nurse";
import {PatientInterface} from "../dataInterfaces/patient";

@Component({
  selector: 'app-infirmier',
  templateUrl: './infirmier.component.html',
  styleUrls: ['./infirmier.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class InfirmierComponent implements OnInit {
  @Input("infirmier") private inf: InfirmierInterface;
  @Output() messageAffectation = new EventEmitter<string[]>();

  constructor() { }

  ngOnInit() {
  }

  getNom(): string {
    return this.inf.nom;
  }

  getPrenom(): string {
    return this.inf.prénom;
  }

  getImage(): string {
    return "http://localhost:8090/data/" + this.inf.photo;
  }

  getPatientList(): PatientInterface[] {
    return this.inf.patients;
  }

  getAdresse(): string {
    let adresse = this.inf.adresse.numéro + " ";
    adresse += this.inf.adresse.rue + "\n";
    adresse += this.inf.adresse.codePostal + " ";
    adresse += this.inf.adresse.ville;
    return adresse;
  }

  patientDrop($event: Event) {
    console.log("Patient drop :" + $event["nir"] + this.inf.id);
    let message = [$event["nir"], this.inf.id];
    this.messageAffectation.emit(message);
  }
}
