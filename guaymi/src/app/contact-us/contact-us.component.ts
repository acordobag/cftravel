import { Component, OnInit } from '@angular/core';
import { Message, Company } from '../entities/entities'

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})

export class ContactUsComponent implements OnInit {

  company: Company;
  message: Message;

  constructor() { }

  ngOnInit() {
    this.company = new Company();
    this.message = { name: "", phone: "", email: "", comment: "" };
    this.company.phones = [
      { id: 1, code: "506", number: "8337-8382" },
      { id: 2, code: "506", number: "8337-8384" }
    ]
    this.company.email = "info@guaymi.cr";
  }

}
