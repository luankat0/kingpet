import { Injectable, signal } from '@angular/core';
import { ambiente } from '../config';
import { Sessao, Usuario } from '../models';

export const USUARIO: Usuario = {
    id: 'demo',
    nome: 'Alex Martins',
    email: 'equipe@kingpet.test',
    funcao: 'Administração',
};
@Injectable({ providedIn: 'root' })
export class AuthService {
    private restaurar(): Sessao | null {
        try {
            const s = JSON.parse(sessionStorage.getItem(ambiente.sessao) ?? 'null');
            return s?.usuarioId === USUARIO.id && Number.isFinite(Date.parse(s.inicio)) ? s : null;
        } catch {
            return null;
        }
    }
    readonly sessao = signal(this.restaurar());
    readonly usuario = USUARIO;
    async login(email: string, senha: string) {
        if (email.trim().toLowerCase() !== USUARIO.email || senha !== 'KingPet2026')
            throw Error('E-mail ou senha incorretos.');
        const s: Sessao = { usuarioId: USUARIO.id, inicio: new Date().toISOString() };
        try {
            sessionStorage.setItem(ambiente.sessao, JSON.stringify(s));
        } catch {
            throw Error('Habilite o armazenamento do navegador para iniciar a sessão.');
        }
        this.sessao.set(s);
    }
    sair() {
        sessionStorage.removeItem(ambiente.sessao);
        this.sessao.set(null);
    }
}
