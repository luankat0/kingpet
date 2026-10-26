import { Component, inject, signal } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { AuthService } from '../../core/services/auth.service';

const validarSenhas: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
    const senha = grupo.get('senha')?.value;
    const confirmacao = grupo.get('confirmarSenha')?.value;

    return senha === confirmacao ? null : { senhasDiferentes: true };
};

type CampoCadastro = 'nome' | 'email' | 'telefone' | 'endereco' | 'senha' | 'confirmarSenha';

@Component({
    selector: 'app-tutor-register',
    standalone: true,
    imports: [ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, MessageModule],
    templateUrl: './tutor-register.component.html',
    styleUrl: './tutor-register.component.scss',
})
export class TutorRegisterComponent {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);

    readonly enviando = signal(false);
    readonly erro = signal('');
    readonly sucesso = signal('');

    readonly form = this.fb.nonNullable.group(
        {
            nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
            email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
            telefone: [
                '',
                [Validators.required, Validators.pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/)],
            ],
            endereco: ['', Validators.maxLength(255)],
            senha: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(72)]],
            confirmarSenha: ['', Validators.required],
        },
        { validators: validarSenhas },
    );

    invalido(campo: CampoCadastro): boolean {
        const controle = this.form.controls[campo];

        return controle.invalid && (controle.dirty || controle.touched);
    }

    cadastrar(): void {
        this.erro.set('');
        this.sucesso.set('');
        this.form.markAllAsTouched();

        if (this.form.invalid || this.enviando()) {
            return;
        }

        this.enviando.set(true);

        const dados = this.form.getRawValue();

        this.authService
            .cadastrarTutor({
                nome: dados.nome.trim(),
                email: dados.email.trim().toLowerCase(),
                telefone: dados.telefone.replace(/\D/g, ''),
                ...(dados.endereco.trim() ? { endereco: dados.endereco.trim() } : {}),
                senha: dados.senha,
            })
            .subscribe({
                next: () => {
                    this.enviando.set(false);
                    this.sucesso.set('Cadastro realizado com sucesso!');
                    this.form.reset();
                },
                error: (erro: HttpErrorResponse) => {
                    this.enviando.set(false);

                    if (erro.status === 409) {
                        this.erro.set('Este e-mail já está cadastrado.');
                    } else if (erro.status === 400) {
                        this.erro.set('Revise os dados informados.');
                    } else if (erro.status === 0) {
                        this.erro.set('Não foi possível conectar à API.');
                    } else {
                        this.erro.set('Erro ao realizar o cadastro.');
                    }
                },
            });
    }
}
