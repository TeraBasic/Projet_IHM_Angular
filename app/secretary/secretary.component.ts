import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {CabinetInterface} from "../dataInterfaces/cabinet";
import { CabinetMedicalService } from '../cabinet-medical.service';
import {InfirmierInterface} from "../dataInterfaces/nurse";
import {PatientInterface} from "../dataInterfaces/patient";
import {MapsAPILoader} from "@agm/core";
import {} from '@types/googlemaps';
import {Adresse} from "../dataInterfaces/adress";

@Component({
  selector: 'app-secretary',
  templateUrl: './secretary.component.html',
  styleUrls: ['./secretary.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SecretaryComponent implements OnInit {

  private cabinet: CabinetInterface;
  private patients: PatientInterface[];
  private Pgapi: Promise<any>; // Indique quand l’API est disponible
  private geocoder: google.maps.Geocoder;

  constructor(private cabinetService: CabinetMedicalService, mapsAPILoader: MapsAPILoader) {
    this.cabinet = null;
    this.cabinetService.getData("/data/cabinetInfirmier.xml").then((cab) => {
      this.cabinet = cab;
      this.patients = this.getPatients();
      this.Pgapi = mapsAPILoader.load().then(() => {
        console.log('google script loaded');
        this.geocoder = new google.maps.Geocoder();
        this.updateAdresse();
      } );
    });
  }


  refreshData(){
    this.cabinetService.getData("/data/cabinetInfirmier.xml").then((cab) => {
      this.cabinet = cab;
      this.updateAdresse();
    });
  }

  ngOnInit() {

  }

  getInfirmiers(): InfirmierInterface[]{
    if(this.cabinet != null){
      return this.cabinet.infirmiers;
    }else{
      return null;
    }
  }

  getNomCabinet(): string{
    if(this.cabinet != null){
      return this.cabinet.nom.toString();
    }else{
      return null;
    }
  }

  getPatientNonAffecteList(): PatientInterface[] {
    if(this.cabinet != null){
      return this.cabinet.patientsNonAffectés;
    }else{
      return null;
    }
  }

  receiveAffectation($event) {
    this.cabinetService.receiveAffectation($event).subscribe(res => {
      this.refreshData();
    });
  }

  desafecter($event: Event) {
    this.cabinetService.desafecter($event).subscribe(res => {
      this.refreshData();
    });
  }

  ajoutPatient(patient: PatientInterface) {
    this.cabinetService.addPatient(patient).subscribe(res => {
      this.refreshData();
    });
  }

  private getLatLngFor( adressables: {adresse: Adresse}[] ) {
    adressables = adressables.slice(); // Copie pour éviter problèmes récursions
    this.Pgapi.then( () => {
      if (adressables.length) {
        const itemWithAdress = adressables.pop();
        const A = itemWithAdress.adresse;
        const address = `${A.numéro} ${A.rue}, ${A.codePostal} ${A.ville}`;
        this.geocoder.geocode({address}, (res, status) => {
          if (status === google.maps.GeocoderStatus.OK) {
            const place = res[0].geometry.location;
            itemWithAdress.adresse.lat = place.lat();
            itemWithAdress.adresse.lng = place.lng();
          }
          switch (status) {
            case google.maps.GeocoderStatus.OVER_QUERY_LIMIT:
              adressables.push(itemWithAdress);
              this.getLatLngFor(adressables);
              break;
            default:
              this.getLatLngFor(adressables);
          }
        });
      }
    });
  }

  getCabinetLat() {
    if(this.cabinet != null){
      return 45.192992;
    }else{
      return null;
    }
  }

  getCabinetLng() {
    if(this.cabinet != null){
      return 5.730831
    }else{
      return null;
    }
  }

  getPatients(){
    const patients: PatientInterface[] = [];
    if(this.cabinet != null){
      this.cabinet.patientsNonAffectés.forEach( (patNnAf) => {patients.push(patNnAf)});
      this.cabinet.infirmiers.forEach( (inf) =>
        {
          inf.patients.forEach( (patNnAf) => {patients.push(patNnAf)});
        }
      );
      return patients;
    }else{
      return null;
    }
  }

  updateAdresse(){
    //{ adresse: Adresse; }[]
    if(this.cabinet != null){
      const adresses: { adresse: Adresse; }[] = [];
      this.patients = this.getPatients();
      this.patients.forEach( (pat) => adresses.push({ adresse : pat.adresse}));
      this.getInfirmiers().forEach( (inf) => adresses.push({ adresse : inf.adresse}));
      this.getLatLngFor(adresses);
    }
  }

  mapReady(map: google.maps.Map) {
    console.log("mapReady", map);
    map.addListener("click", evt => {
      this.getAdresseFromLatLng( evt.latLng );
    });
  }


  async getAdresseFromLatLng(latLng: google.maps.LatLng): Promise<Adresse> {
    function getCompValue(comps: google.maps.GeocoderAddressComponent[], name: string): string {
      const comp = comps.find( c => c.types.indexOf(name) >= 0 );
      return comp ? comp.long_name : "";
    }

    await this.Pgapi;
    return new Promise<Adresse>( (resolve, reject) => {
      this.geocoder.geocode( {location: latLng}, (res, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          const comps: google.maps.GeocoderAddressComponent[] = res[0].address_components;
          const ad: Adresse = {
            ville: getCompValue(comps, "locality"),
            codePostal: parseInt( getCompValue(comps, "postal_code"), 10),
            rue: getCompValue(comps, "route"),
            numéro: getCompValue(comps, "street_number"),
            étage: "",
            lat: latLng.lat(),
            lng: latLng.lng()
          };
          resolve(ad);
        } else {reject(status);}
      });
    });
  }


}

