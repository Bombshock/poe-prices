import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StashListComponent } from './stash-list.component';

describe('StashListComponent', () => {
  let component: StashListComponent;
  let fixture: ComponentFixture<StashListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StashListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StashListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
