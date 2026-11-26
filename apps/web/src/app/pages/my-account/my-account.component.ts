import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { Cabecalho } from '../../shared/cabecalho';
import { iniciaisDe } from '../../core/iniciais';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-my-account',
    standalone: true,
    imports: [ButtonModule, Cabecalho],
    templateUrl: './my-account.component.html',
    styleUrl: './my-account.component.scss',
})
export class MyAccountComponent {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    readonly usuario = this.authService.usuario;
    readonly iniciais = computed(() => iniciaisDe(this.usuario()?.nome ?? ''));

    sair(): void {
        this.authService.sair();

        void this.router.navigateByUrl('/login');
    }
}
