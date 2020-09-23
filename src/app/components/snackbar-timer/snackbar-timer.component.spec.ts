import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackbarTimerComponent } from './snackbar-timer.component';

describe('SnackbarTimerComponent', () => {
  let component: SnackbarTimerComponent;
  let fixture: ComponentFixture<SnackbarTimerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnackbarTimerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnackbarTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
