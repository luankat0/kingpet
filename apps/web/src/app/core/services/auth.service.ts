import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

export interface CadastrarTutorRequest {
    nome: string;
    email: string;
    telefone: string;
    endereco?: string;
    senha: string;
}

export interface CadastrarTutorResponse {
    id: string;
    email: string;
    tutor: {
        id: string;
        nome: string;
        telefone: string;
        endereco: string | null;
    };
}

export interface LoginRequest {
    email: string;
    senha: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export interface UsuarioAutenticado {
    id: string;
    email: string;
    tutor: {
        id: string;
        nome: string;
        telefone: string;
        endereco: string | null;
    } | null;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = 'http://localhost:3000/auth';

    private readonly tokenState = signal<string | null>(null);

    readonly usuario = signal<UsuarioAutenticado | null>(null);

    cadastrarTutor(dados: CadastrarTutorRequest) {
        return this.http.post<CadastrarTutorResponse>(`${this.apiUrl}/register`, dados);
    }

    login(dados: LoginRequest) {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, dados).pipe(
            tap((resposta) => {
                this.tokenState.set(resposta.access_token);
                this.usuario.set(null);
            }),
        );
    }

    obterToken(): string | null {
        return this.tokenState();
    }

    me() {
        return this.http.get<UsuarioAutenticado>(`${this.apiUrl}/me`).pipe(
            tap((usuario) => {
                this.usuario.set(usuario);
            }),
        );
    }

    sair(): void {
        this.tokenState.set(null);
        this.usuario.set(null);
    }
}
