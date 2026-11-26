import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { Cabecalho } from '../../shared/cabecalho';
import {
    catalogo,
    exibir,
    linha,
    Linha,
    rotulos,
    tituloRegistro,
    tom,
} from '../../shared/catalogo';
import { REPOSITORIO } from '../../core/repository';
import { STATUS, Tipo, semAcentos } from '../../core/models';
import { Operacoes } from '../../core/operacoes';

@Component({
    imports: [
        RouterLink,
        FormsModule,
        ButtonModule,
        TableModule,
        InputTextModule,
        SelectModule,
        DatePickerModule,
        TagModule,
        Cabecalho,
    ],
    templateUrl: './lista.html',
})
export class Lista {
    readonly tipo = inject(ActivatedRoute).snapshot.data['tipo'] as Tipo;
    readonly meta = catalogo[this.tipo];
    readonly repo = inject(REPOSITORIO);
    readonly ops = inject(Operacoes);
    readonly labels = rotulos;
    readonly exibir = exibir;
    readonly tom = tom;
    readonly titulo = tituloRegistro;
    readonly busca = signal('');
    readonly filtros = signal<Record<string, string | null>>({});
    readonly inicio = signal<Date | null>(null);
    readonly fim = signal<Date | null>(null);
    readonly filtrosAtivos = computed(() =>
        Boolean(
            this.busca() ||
            this.inicio() ||
            this.fim() ||
            Object.values(this.filtros()).some(Boolean),
        ),
    );
    pagina = 0;
    readonly opcoes = computed(() => {
        const db = this.repo.dados();
        const simples = (lista: readonly string[]) => lista.map((v) => ({ nome: v, id: v }));
        const pets = db.pets.filter(
            (p) => !this.filtros()['tutorId'] || p.tutorId === this.filtros()['tutorId'],
        );
        const op: Record<string, { nome: string; id: string }[]> = {
            tutorId: db.tutores,
            petId: pets,
            servicoId: db.servicos,
            status: simples(STATUS),
            especie: simples([...new Set(db.pets.map((p) => p.especie))]),
            sexo: simples([...new Set(db.pets.map((p) => p.sexo))]),
            situacao: simples(['Em estoque', 'Estoque baixo', 'Sem estoque']),
        };
        return op;
    });
    readonly campos = {
        pets: ['especie', 'sexo', 'tutorId'],
        produtos: ['situacao'],
        agendamentos: ['tutorId', 'petId', 'servicoId', 'status'],
        tutores: [],
        servicos: [],
    }[this.tipo];
    readonly linhas = computed(() => {
        const db = this.repo.dados(),
            termo = semAcentos(this.busca());
        const inicio = this.inicio(),
            fim = this.fim();
        const limite = fim ? new Date(fim.getFullYear(), fim.getMonth(), fim.getDate() + 1) : null;
        return db[this.tipo]
            .map((r) => linha(r, db))
            .filter((r) => {
                const texto = this.meta.colunas.map((k) => exibir(k, r[k])).join(' ');
                if (!semAcentos(texto).includes(termo)) return false;
                if (Object.entries(this.filtros()).some(([k, v]) => v && r[k] !== v)) return false;
                const dt = new Date(r['dataHora']);
                return !((inicio && dt < inicio) || (limite && dt >= limite));
            });
    });
    filtrar(k: string, v: string | null) {
        this.pagina = 0;
        this.filtros.update((f) =>
            k === 'tutorId' ? { ...f, [k]: v, petId: null } : { ...f, [k]: v },
        );
    }
    limpar() {
        this.pagina = 0;
        this.filtros.set({});
        this.busca.set('');
        this.inicio.set(null);
        this.fim.set(null);
    }
    async excluir(r: Linha) {
        if (await this.ops.excluir(this.tipo, r.id, tituloRegistro(this.tipo, r))) this.pagina = 0;
    }
}
