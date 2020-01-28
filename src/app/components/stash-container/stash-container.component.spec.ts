import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StashContainerComponent } from './stash-container.component';

describe('StashContainerComponent', () => {
  let component: StashContainerComponent;
  let fixture: ComponentFixture<StashContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StashContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StashContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
