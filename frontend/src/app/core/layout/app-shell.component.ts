import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '@shared/layout/footer.component';
import { HeaderComponent } from '@shared/layout/header.component';
import { MobileBottomNavigationComponent } from '@shared/layout/mobile-bottom-navigation.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, HeaderComponent, MobileBottomNavigationComponent, FooterComponent],
  template: `
    <div class="min-h-screen bg-shop-background text-shop-text">
      <app-header />

      <main class="pb-24 lg:pb-0">
        <router-outlet />
      </main>

      <app-footer />
      <app-mobile-bottom-navigation />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {}
