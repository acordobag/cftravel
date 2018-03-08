import { Component, OnInit } from '@angular/core';
import { NgxCarousel } from 'ngx-carousel';
import { forEach } from '@angular/router/src/utils/collection';
import { debuglog } from 'util';
import { CarouselConfig } from 'ngx-bootstrap';
import { Place } from '../entities/entities';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [
    { provide: CarouselConfig, useValue: { interval: 4000, noPause: true, showIndicators: true } }
  ]
})
export class HomeComponent implements OnInit {

  public carouselOne: NgxCarousel;
  public active: number;
  public destinations: Place[];
  constructor() { }

  public images;

  ngOnInit() {
    this.active = 0;
    this.destinations = [
      {
        id: 0,
        name: "Arenal Volcano",
        description: "El volcán Arenal de Costa Rica está situado en el distrito de La Fortuna, cantón de San Carlos, en la provincia de Alajuela. Tiene una altura de 1.670 msnm. El volcán se encuentra dentro del Parque nacional Volcán Arenal. Inició su último y actual período de actividad en el año 1968, el día 29 de julio a las 7:30. Desde esa fecha emite en forma constante gases y vapores de agua, con algunas explosiones con emisión de materiales piroclásticos y en ocasiones fuertes retumbos. Por esto y su frecuente actividad, hacen de este volcán el más activo de Costa Rica. El Arenal es un estratovolcán de forma cónica, ubicado a unos 8 km de La Fortuna. Posee un área de 33 km2. Es distinguible desde considerable distancia. Se le puede ver desde distintos poblados del cantón de San Carlos como Aguas Zarcas, Pocosol, La Fortuna, La Palmera, Cutris, Venado, Florencia e incluso Ciudad Quesada, y cantones como Guatuso y Los Chiles. Geológicamente pertenece a la Sierra de Tilarán y se considera al cercano volcán Chato como su hermano. Es uno de los volcanes de Costa Rica más conocidos nacional e internacionalmente y uno de los más visitados.",
        images: [{ id: 0, src: "../assets/images/arenal.jpg" }]
      },
      {
        id: 0,
        name: "Arenal Volcano",
        description: "El volcán Arenal de Costa Rica está situado en el distrito de La Fortuna, cantón de San Carlos, en la provincia de Alajuela. Tiene una altura de 1.670 msnm. El volcán se encuentra dentro del Parque nacional Volcán Arenal. Inició su último y actual período de actividad en el año 1968, el día 29 de julio a las 7:30. Desde esa fecha emite en forma constante gases y vapores de agua, con algunas explosiones con emisión de materiales piroclásticos y en ocasiones fuertes retumbos. Por esto y su frecuente actividad, hacen de este volcán el más activo de Costa Rica. El Arenal es un estratovolcán de forma cónica, ubicado a unos 8 km de La Fortuna. Posee un área de 33 km2. Es distinguible desde considerable distancia. Se le puede ver desde distintos poblados del cantón de San Carlos como Aguas Zarcas, Pocosol, La Fortuna, La Palmera, Cutris, Venado, Florencia e incluso Ciudad Quesada, y cantones como Guatuso y Los Chiles. Geológicamente pertenece a la Sierra de Tilarán y se considera al cercano volcán Chato como su hermano. Es uno de los volcanes de Costa Rica más conocidos nacional e internacionalmente y uno de los más visitados.",
        images: [{ id: 0, src: "../assets/images/arenal.jpg" }]
      },
      {
        id: 0,
        name: "Arenal Volcano",
        description: "El volcán Arenal de Costa Rica está situado en el distrito de La Fortuna, cantón de San Carlos, en la provincia de Alajuela. Tiene una altura de 1.670 msnm. El volcán se encuentra dentro del Parque nacional Volcán Arenal. Inició su último y actual período de actividad en el año 1968, el día 29 de julio a las 7:30. Desde esa fecha emite en forma constante gases y vapores de agua, con algunas explosiones con emisión de materiales piroclásticos y en ocasiones fuertes retumbos. Por esto y su frecuente actividad, hacen de este volcán el más activo de Costa Rica. El Arenal es un estratovolcán de forma cónica, ubicado a unos 8 km de La Fortuna. Posee un área de 33 km2. Es distinguible desde considerable distancia. Se le puede ver desde distintos poblados del cantón de San Carlos como Aguas Zarcas, Pocosol, La Fortuna, La Palmera, Cutris, Venado, Florencia e incluso Ciudad Quesada, y cantones como Guatuso y Los Chiles. Geológicamente pertenece a la Sierra de Tilarán y se considera al cercano volcán Chato como su hermano. Es uno de los volcanes de Costa Rica más conocidos nacional e internacionalmente y uno de los más visitados.",
        images: [{ id: 0, src: "../assets/images/arenal.jpg" }]
      }
    ];

    this.images = [
      { state: true, id: 0, src: "assets/images/banner_0.jpg" },
      { state: false, id: 1, src: "assets/images/banner_1.png" }
    ]

  }

}
