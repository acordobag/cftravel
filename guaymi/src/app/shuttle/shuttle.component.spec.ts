import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShuttleComponent } from './shuttle.component';

describe('ShuttleComponent', () => {
  let component: ShuttleComponent;
  let fixture: ComponentFixture<ShuttleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShuttleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShuttleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
