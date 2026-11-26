import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../core/services/auth.service';
import { Marca } from '../../shared/marca';

@Component({
    selector: 'app-tutor-login',
    imports: [
        ReactiveFormsModule,
        InputTextModule,
        PasswordModule,
        ButtonModule,
        MessageModule,
        Marca,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class TutorLoginComponent {
    private readonly fb = inject(FormBuilder);
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    readonly enviando = signal(false);
    readonly erro = signal('');
    readonly form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        senha: ['', Validators.required],
    });
    campoInvalido(campo: 'email' | 'senha') {
        const c = this.form.controls[campo];
        return c.invalid && (c.dirty || c.touched);
    }
    async entrar() {
        this.form.markAllAsTouched();
        if (this.form.invalid || this.enviando()) return;
        this.enviando.set(true);
        this.erro.set('');
        try {
            const { email, senha } = this.form.getRawValue();
            await this.auth.login(email, senha);
            const url = this.route.snapshot.queryParamMap.get('voltar');
            await this.router.navigateByUrl(
                url?.startsWith('/') && !url.startsWith('//') ? url : '/dashboard',
            );
        } catch (e) {
            this.erro.set(e instanceof Error ? e.message : 'Falha ao iniciar sessão.');
        } finally {
            this.enviando.set(false);
        }
    }
}
