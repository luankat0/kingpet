import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-my-account',
    standalone: true,
    imports: [ButtonModule],
    templateUrl: './my-account.component.html',
    styleUrl: './my-account.component.scss',
})
export class MyAccountComponent {
    readonly authService = inject(AuthService);

    private readonly router = inject(Router);

    sair(): void {
        this.authService.sair();

        void this.router.navigateByUrl('/login');
    }
}
