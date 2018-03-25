import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {PatientInterface} from "../dataInterfaces/patient";
import {SecretaryComponent} from "../secretary/secretary.component";

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PatientComponent implements OnInit {

  @Input("patient") private pat: PatientInterface;
  @Output() messageEvent = new EventEmitter<string[]>();


  panelOpenState: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  getNom(): string {
    return this.pat.nom;
  }

  getPrenom(): string {
    return this.pat.prénom;
  }

  getNir(): string{
    return this.pat.numéroSécuritéSociale;
  }

  getAdresse(): string {
    let adresse = this.pat.adresse.numéro + " ";
    adresse += this.pat.adresse.rue + "\n";
    adresse += this.pat.adresse.codePostal + " ";
    adresse += this.pat.adresse.ville;
    return adresse;
  }
}
