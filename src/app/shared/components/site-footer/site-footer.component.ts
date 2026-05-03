import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooterComponent {
  readonly currentYear = new Date().getFullYear();

  readonly footerLinks = [
    {
      title: 'Institucional',
      links: ['Sobre nós', 'Carreiras', 'Imprensa', 'Contato'],
    },
    {
      title: 'Ajuda',
      links: ['Central de Ajuda', 'Conta', 'Pagamentos', 'Acessibilidade'],
    },
    {
      title: 'Legal',
      links: ['Privacidade', 'Termos de Uso', 'Cookies', 'Conformidade'],
    },
    {
      title: 'Redes Sociais',
      links: ['Instagram', 'YouTube', 'X (Twitter)', 'Facebook'],
    },
  ];
}
