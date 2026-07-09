import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PageContainerComponent } from './page-container.component';

type PlaceholderData = {
  eyebrow: string;
  title: string;
  description: string;
};

@Component({
  selector: 'app-placeholder-page',
  imports: [RouterLink, PageContainerComponent],
  template: `
    <app-page-container>
      <section class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-10">
        <span class="inline-flex rounded-full bg-shop-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-shop-primary">{{ content().eyebrow }}</span>
        <h1 class="mt-4 max-w-2xl text-3xl font-black tracking-tight text-shop-text lg:text-4xl">{{ content().title }}</h1>
        <p class="mt-4 max-w-2xl text-base leading-7 text-shop-text-muted">{{ content().description }}</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a routerLink="/" class="rounded-full bg-shop-primary px-5 py-3 text-sm font-bold text-shop-text-inverted transition hover:bg-shop-primary-hover">Voltar para home</a>
          <a routerLink="/login" class="rounded-full border border-shop-border px-5 py-3 text-sm font-bold text-shop-text">Revisar acesso</a>
        </div>
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly content = toSignal(this.route.data.pipe(map((data) => data as PlaceholderData)), {
    initialValue: {
      eyebrow: 'Shop API',
      title: 'Rota pronta para evolucao.',
      description: 'A estrutura inicial foi criada e esta pronta para receber os fluxos do backlog.',
    },
  });
}
