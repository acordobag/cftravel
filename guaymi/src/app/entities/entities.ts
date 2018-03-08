export enum shuttleType {
    PRIMARY = 0,
    SECONDARY = 1
}

export class Phone {
    id: number;
    code: string;
    number: string;

    constructor() {
        this.id = 0;
        this.code = "506";
        this.number = "";
    }
}

export class Company {
    name: string;
    phones: Array<Phone>;
    email: string;

    constructor() {
        this.name = "";
        this.phones = new Array<Phone>();
        this.email = "";
    }
}

export class Shuttle {
    date: Date;
    persons: number;
    message: string;
    departing: GmapPlace;
    destination: GmapPlace;
    distance: number;
    rate: number;
    constructor() {
        this.date = new Date();
        this.persons = 2;
        this.departing = new GmapPlace();
        this.destination =new GmapPlace();
        this.distance=0;
        this.rate=0;
    }
}

export class User {
    name: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    token: string;

    constructor() {
        this.name = "";
        this.phone = "";
        this.email = "";
        this.password = "";
        this.token = ""
    }
}

export class Message {
    name: string;
    phone: string;
    email: string;
    comment: string;

    constructor() {
        this.name = "";
        this.phone = "";
        this.email = "";
    }
}

export class Place {
    id: number;
    name: string;
    description: string;
    images: Array<Image>;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
        this.description = "";
        this.images = new Array();
    }

}

export class GmapPlace {
    place_id: string;
    name: string;   
    geometry:{
        location: {
            lat: number;
            lng: number;
        }
    }
    constructor(){
        this.place_id="",
        this.name="";
        this.geometry={
            location:{
                lat:1,
                lng:0
            }
        }
    }
}
export class Image{
    id: number;
    src: string;

    constructor(){
        this.id=0;
        this.src="";
    }
}

export class Reservation {
    user: User;
    message: String;
    shuttles: Array<Shuttle>;

    constructor() {
        this.user = new User();
        this.message = "";
        this.shuttles = new Array<Shuttle>();
    }
}

export class PriceObject{
    price: number;
    discount: number;
}

export const backEndUrl = 'http://localhost:8000/api'
