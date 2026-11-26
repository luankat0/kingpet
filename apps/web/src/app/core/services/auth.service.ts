import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ambiente } from '../config';
import { Sessao, Usuario } from '../models';

interface RespostaLogin {
    access_token: string;
    token_type: string;
    expires_in: number;
    usuario: Usuario;
}

function mensagem(e: unknown, padrao: string) {
    if (e instanceof HttpErrorResponse) {
        if (e.status === 0) return 'Não foi possível conectar à API.';
        const corpo = e.error as { message?: string | string[] } | null;
        const detalhe = Array.isArray(corpo?.message) ? corpo?.message[0] : corpo?.message;
        if (detalhe) return detalhe;
    }
    return e instanceof Error ? e.message : padrao;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    /** O token fica na sessão da aba: fechou a aba, encerrou o acesso. */
    private readonly token = signal<string | null>(sessionStorage.getItem(ambiente.sessao));
    private readonly inicio = signal<string>(new Date().toISOString());
    readonly usuario = signal<Usuario | null>(null);
    readonly sessao = computed<Sessao | null>(() => {
        const usuario = this.usuario();
        return this.token() && usuario
            ? { usuarioId: usuario.id, inicio: this.inicio() }
            : null;
    });

    obterToken() {
        return this.token();
    }

    private guardar(token: string) {
        try {
            sessionStorage.setItem(ambiente.sessao, token);
        } catch {
            throw Error('Habilite o armazenamento do navegador para iniciar a sessão.');
        }
        this.token.set(token);
        this.inicio.set(new Date().toISOString());
    }

    async login(email: string, senha: string) {
        let resposta: RespostaLogin;
        try {
            resposta = await firstValueFrom(
                this.http.post<RespostaLogin>(ambiente.apiBase + '/auth/login', {
                    email: email.trim().toLowerCase(),
                    senha,
                }),
            );
        } catch (e) {
            throw Error(mensagem(e, 'E-mail ou senha incorretos.'));
        }
        this.guardar(resposta.access_token);
        this.usuario.set(resposta.usuario);
    }

    /** Confere o token guardado e recupera o usuário dono dele. */
    async restaurar() {
        if (!this.token()) return false;
        if (this.usuario()) return true;
        try {
            const usuario = await firstValueFrom(
                this.http.get<Usuario>(ambiente.apiBase + '/auth/me'),
            );
            this.usuario.set(usuario);
            return true;
        } catch {
            this.sair();
            return false;
        }
    }

    sair() {
        sessionStorage.removeItem(ambiente.sessao);
        this.token.set(null);
        this.usuario.set(null);
    }
}
