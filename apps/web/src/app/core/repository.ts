import { Injectable, InjectionToken, Signal, inject, signal } from '@angular/core';
import { ambiente } from './config';
import { Dados, Entidades, Tipo } from './models';
import { demonstracao } from './seed';
import { conferirDados, validar } from './validation';

export interface Repositorio {
    dados: Signal<Dados>;
    carregando: Signal<boolean>;
    erro: Signal<string>;
    carregar(): Promise<void>;
    salvar<K extends Tipo>(tipo: K, valor: Omit<Entidades[K], 'id'>, id?: string): Promise<string>;
    excluir(tipo: Tipo, id: string): Promise<void>;
}
const vazio: Dados = { tutores: [], pets: [], servicos: [], produtos: [], agendamentos: [] };

@Injectable({ providedIn: 'root' })
export class RepositorioLocal implements Repositorio {
    private readonly estado = signal<Dados>(vazio);
    readonly dados = this.estado.asReadonly();
    readonly carregando = signal(true);
    readonly erro = signal('');
    constructor() {
        void this.carregar();
        window.addEventListener('storage', (e) => {
            if (e.key === ambiente.dados || !e.key) void this.carregar();
        });
    }
    private ler(): Dados {
        const raw = localStorage.getItem(ambiente.dados);
        if (raw === null) {
            const inicial = demonstracao();
            localStorage.setItem(ambiente.dados, JSON.stringify(inicial));
            return inicial;
        }
        const value: unknown = JSON.parse(raw);
        conferirDados(value);
        return value;
    }
    private async exclusivo<T>(acao: () => T): Promise<T> {
        return navigator.locks ? navigator.locks.request(ambiente.dados, acao) : acao();
    }
    async carregar() {
        this.carregando.set(true);
        try {
            this.estado.set(await this.exclusivo(() => this.ler()));
            this.erro.set('');
        } catch {
            this.erro.set(
                'Não foi possível ler os dados locais. Confira o armazenamento do navegador e as instruções de recuperação no README.',
            );
        } finally {
            this.carregando.set(false);
        }
    }
    private async alterar<T>(acao: (db: Dados) => T): Promise<T> {
        return this.exclusivo(() => {
            const db = this.ler();
            const result = acao(db);
            conferirDados(db);
            try {
                localStorage.setItem(ambiente.dados, JSON.stringify(db));
            } catch {
                throw Error('Falha ao gravar no navegador. Verifique o espaço e as permissões.');
            }
            this.estado.set(db);
            return result;
        });
    }
    async salvar<K extends Tipo>(tipo: K, valor: Omit<Entidades[K], 'id'>, id?: string) {
        return this.alterar((db) => {
            const rows: Entidades[K][] = db[tipo];
            const index = rows.findIndex((r) => r.id === id);
            if (id && index < 0) throw Error('Este registro já foi excluído.');
            const row = { ...valor, id: id ?? crypto.randomUUID() } as Entidades[K];
            validar(tipo, row, db);
            if (
                tipo === 'pets' &&
                'tutorId' in row &&
                db.agendamentos.some((a) => a.petId === id && a.tutorId !== row.tutorId)
            )
                throw Error(
                    'O pet possui agendamentos vinculados. Mantenha o tutor desses registros.',
                );
            if (id) rows[index] = row;
            else rows.push(row);
            return row.id;
        });
    }
    async excluir(tipo: Tipo, id: string) {
        await this.alterar((db) => {
            if (
                tipo === 'tutores' &&
                (db.pets.some((p) => p.tutorId === id) ||
                    db.agendamentos.some((a) => a.tutorId === id))
            )
                throw Error('Este tutor possui pets ou agendamentos vinculados.');
            if (
                db.agendamentos.some(
                    (a) =>
                        (tipo === 'pets' && a.petId === id) ||
                        (tipo === 'servicos' && a.servicoId === id),
                )
            )
                throw Error('Este registro possui agendamentos vinculados.');
            const index = db[tipo].findIndex((r) => r.id === id);
            if (index < 0) throw Error('O registro já foi excluído.');
            db[tipo].splice(index, 1);
        });
    }
}
export const REPOSITORIO = new InjectionToken<Repositorio>('Repositório KingPet', {
    providedIn: 'root',
    factory: () => inject(RepositorioLocal),
});
