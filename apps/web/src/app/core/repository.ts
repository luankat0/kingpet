import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, InjectionToken, Signal, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ambiente } from './config';
import {
    Agendamento,
    Dados,
    Entidades,
    Pet,
    Produto,
    Servico,
    Tipo,
    Tutor,
} from './models';
import { conferirDados } from './validation';

export interface Repositorio {
    dados: Signal<Dados>;
    carregando: Signal<boolean>;
    erro: Signal<string>;
    carregar(): Promise<void>;
    salvar<K extends Tipo>(tipo: K, valor: Omit<Entidades[K], 'id'>, id?: string): Promise<string>;
    excluir(tipo: Tipo, id: string): Promise<void>;
}
const vazio: Dados = { tutores: [], pets: [], servicos: [], produtos: [], agendamentos: [] };

/** Transforma o erro HTTP na mensagem que a tela mostra ao usuário. */
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
export class RepositorioApi implements Repositorio {
    private readonly http = inject(HttpClient);
    private readonly estado = signal<Dados>(vazio);
    readonly dados = this.estado.asReadonly();
    readonly carregando = signal(true);
    readonly erro = signal('');
    constructor() {
        void this.carregar();
    }
    private url(tipo: Tipo, id?: string) {
        return ambiente.apiBase + '/' + tipo + (id ? '/' + id : '');
    }
    private buscar<T>(tipo: Tipo) {
        return firstValueFrom(this.http.get<T[]>(this.url(tipo)));
    }
    async carregar() {
        this.carregando.set(true);
        try {
            // Uma chamada por coleção, todas em paralelo.
            const [tutores, pets, servicos, produtos, agendamentos] = await Promise.all([
                this.buscar<Tutor>('tutores'),
                this.buscar<Pet>('pets'),
                this.buscar<Servico>('servicos'),
                this.buscar<Produto>('produtos'),
                this.buscar<Agendamento>('agendamentos'),
            ]);
            const db: Dados = { tutores, pets, servicos, produtos, agendamentos };
            conferirDados(db);
            this.estado.set(db);
            this.erro.set('');
        } catch (e) {
            this.erro.set(mensagem(e, 'Não foi possível carregar os dados da API.'));
        } finally {
            this.carregando.set(false);
        }
    }
    async salvar<K extends Tipo>(tipo: K, valor: Omit<Entidades[K], 'id'>, id?: string) {
        let salvo: Entidades[K];
        try {
            salvo = await firstValueFrom(
                id
                    ? this.http.patch<Entidades[K]>(this.url(tipo, id), valor)
                    : this.http.post<Entidades[K]>(this.url(tipo), valor),
            );
        } catch (e) {
            throw Error(mensagem(e, 'Não foi possível salvar o registro.'));
        }
        // Recarrega para a tela refletir o que o servidor realmente gravou.
        await this.carregar();
        return salvo.id;
    }
    async excluir(tipo: Tipo, id: string) {
        try {
            await firstValueFrom(this.http.delete<void>(this.url(tipo, id)));
        } catch (e) {
            throw Error(mensagem(e, 'Não foi possível excluir o registro.'));
        }
        await this.carregar();
    }
}
export const REPOSITORIO = new InjectionToken<Repositorio>('Repositório KingPet', {
    providedIn: 'root',
    factory: () => inject(RepositorioApi),
});
