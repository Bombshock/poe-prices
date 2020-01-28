import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StashDetailsComponent } from './stash-details.component';

describe('StashDetailsComponent', () => {
  let component: StashDetailsComponent;
  let fixture: ComponentFixture<StashDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StashDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StashDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
