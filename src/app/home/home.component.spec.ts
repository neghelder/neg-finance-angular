import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

@Component({ selector: 'app-header', standalone: true, template: '' })
class MockHeaderComponent { @Output() hideSidebar = new EventEmitter(); }
@Component({ selector: 'app-footer', standalone: true, template: '' })
class MockFooterComponent {}
@Component({ selector: 'app-side-bar', standalone: true, template: '' })
class MockSideBarComponent {}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule],
    })
    .overrideComponent(HomeComponent, {
      set: {
        imports: [RouterTestingModule, MockHeaderComponent, MockFooterComponent, MockSideBarComponent]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
