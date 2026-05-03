import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="error-container" role="alert">
      <svg class="error-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p class="error-text">{{ message }}</p>
      @if (showRetry) {
        <button class="error-retry" type="button" (click)="retry.emit()">
          Tentar novamente
        </button>
      }
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
      gap: 16px;
      text-align: center;
    }

    .error-icon {
      color: var(--color-text-muted);
      opacity: 0.6;
    }

    .error-text {
      font-size: 0.95rem;
      color: var(--color-text-secondary);
      max-width: 400px;
      line-height: 1.6;
    }

    .error-retry {
      margin-top: 8px;
      padding: 10px 24px;
      background: var(--color-primary);
      color: var(--color-background);
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: opacity 0.2s ease;

      &:hover { opacity: 0.85; }
    }
  `],
})
export class ErrorMessageComponent {
  @Input() message = 'Algo deu errado. Por favor, tente novamente.';
  @Input() showRetry = true;
  @Output() retry = new EventEmitter<void>();
}
