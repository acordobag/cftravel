import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  phones: Array<object>;
  mail: string;
  
  constructor() { }

  ngOnInit() {
    this.phones=[
      {code:"506",number:"8337-8382"},
      {code:"506",number:"8337-8384"}
    ]
    this.mail="info@guaymi.cr"
  }

}
