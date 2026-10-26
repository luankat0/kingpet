import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-tutor-login',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        RouterLink,
        InputTextModule,
        PasswordModule,
        ButtonModule,
        MessageModule,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class TutorLoginComponent {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    readonly enviando = signal(false);
    readonly erro = signal('');

    readonly form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        senha: ['', Validators.required],
    });

    campoInvalido(campo: 'email' | 'senha'): boolean {
        const controle = this.form.controls[campo];

        return controle.invalid && (controle.touched || controle.dirty);
    }

    entrar(): void {
        this.erro.set('');
        this.form.markAllAsTouched();

        if (this.form.invalid || this.enviando()) {
            return;
        }

        this.enviando.set(true);

        const dados = this.form.getRawValue();

        this.authService
            .login({
                email: dados.email.trim().toLowerCase(),
                senha: dados.senha,
            })
            .pipe(
                finalize(() => {
                    this.enviando.set(false);
                }),
            )
            .subscribe({
                next: () => {
                    void this.router.navigateByUrl('/minha-conta');
                },
                error: (erro: HttpErrorResponse) => {
                    if (erro.status === 401) {
                        this.erro.set('E-mail ou senha inválidos.');
                    } else if (erro.status === 0) {
                        this.erro.set('Não foi possível conectar à API.');
                    } else {
                        this.erro.set('Não foi possível realizar o login.');
                    }
                },
            });
    }
}
