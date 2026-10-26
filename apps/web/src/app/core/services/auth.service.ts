import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly http = inject(HttpClient);

    // Endereço temporário
    // TODO: Dockerizar o frontend
    private readonly apiUrl = 'http://localhost:3000/auth';

    cadastrarTutor(dados: CadastrarTutorRequest) {
        return this.http.post<CadastrarTutorResponse>(`${this.apiUrl}/register`, dados);
    }
}
