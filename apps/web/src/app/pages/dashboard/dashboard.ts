import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { Cabecalho } from '../../shared/cabecalho';
import { REPOSITORIO } from '../../core/repository';
import { STATUS, dia, hora, LIMITE_ESTOQUE, disponibilidade } from '../../core/models';
import { catalogo, linha, tom } from '../../shared/catalogo';
@Component({
    imports: [RouterLink, ButtonModule, MenuModule, TagModule, TableModule, Cabecalho],
    templateUrl: './dashboard.html',
})
export class Dashboard {
    readonly db = inject(REPOSITORIO).dados;
    readonly hoje = new Date();
    readonly tituloData = this.hoje.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    readonly selecao = signal(0);
    readonly semana = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(this.hoje);
        d.setDate(d.getDate() + i);
        return {
            data: d,
            semana: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
            dia: d.getDate(),
        };
    });
    readonly metricas = computed(() =>
        (['tutores', 'pets', 'servicos', 'produtos'] as const).map((tipo) => ({
            tipo,
            ...catalogo[tipo],
            valor: this.db()[tipo].length,
        })),
    );
    readonly agenda = computed(() =>
        this.db()
            .agendamentos.map((a) => linha(a, this.db()))
            .sort((a, b) => String(a['dataHora']).localeCompare(String(b['dataHora']))),
    );
    readonly doDia = computed(() =>
        this.agenda().filter(
            (a) => dia(String(a['dataHora'])) === dia(this.semana[this.selecao()].data),
        ),
    );
    readonly proximos = computed(() =>
        this.agenda()
            .filter(
                (a) =>
                    new Date(a['dataHora']) >= this.hoje &&
                    a['status'] !== 'Cancelado' &&
                    a['status'] !== 'Concluído',
            )
            .slice(0, 4),
    );
    readonly distribuicao = computed(() =>
        STATUS.map((s, i) => ({ s, n: this.agenda().filter((a) => a['status'] === s).length, i })),
    );
    readonly estoque = computed(() =>
        this.db()
            .produtos.filter((p) => p.estoque <= LIMITE_ESTOQUE)
            .sort((a, b) => a.estoque - b.estoque),
    );
    readonly acoes = [
        { label: 'Novo tutor', icon: 'pi pi-users', routerLink: '/tutores/novo' },
        { label: 'Novo pet', icon: 'pi pi-heart', routerLink: '/pets/novo' },
        { label: 'Novo produto', icon: 'pi pi-box', routerLink: '/produtos/novo' },
    ];
    readonly dia = dia;
    readonly hora = hora;
    readonly tom = tom;
    readonly disponibilidade = disponibilidade;
}
