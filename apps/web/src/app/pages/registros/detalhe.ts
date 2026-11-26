import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { FormsModule, NgModel } from '@angular/forms';
import { Cabecalho } from '../../shared/cabecalho';
import { Ausente } from '../../shared/ausente';
import { catalogo, exibir, linha, rotulos, tituloRegistro, tom } from '../../shared/catalogo';
import { REPOSITORIO } from '../../core/repository';
import { Operacoes } from '../../core/operacoes';
import { STATUS, Status, Tipo } from '../../core/models';
@Component({
    imports: [RouterLink, ButtonModule, TagModule, SelectModule, FormsModule, Cabecalho, Ausente],
    templateUrl: './detalhe.html',
})
export class Detalhe {
    readonly route = inject(ActivatedRoute);
    readonly router = inject(Router);
    readonly repo = inject(REPOSITORIO);
    readonly ops = inject(Operacoes);
    readonly tipo = this.route.snapshot.data['tipo'] as Tipo;
    readonly meta = catalogo[this.tipo];
    readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
    readonly id = computed(() => this.params().get('id')!);
    readonly row = computed(() => {
        const db = this.repo.dados(),
            r = db[this.tipo].find((v) => v.id === this.id());
        return r ? linha(r, db) : null;
    });
    readonly campos = {
        tutores: ['nome', 'contato', 'telefone', 'endereco'],
        pets: ['nome', 'especie', 'raca', 'sexo', 'tutor'],
        servicos: ['nome', 'descricao', 'preco'],
        produtos: ['nome', 'descricao', 'preco', 'estoque', 'situacao'],
        agendamentos: ['pet', 'tutor', 'servico', 'dataHora', 'status'],
    }[this.tipo];
    readonly pets = computed(() => this.repo.dados().pets.filter((p) => p.tutorId === this.id()));
    readonly agenda = computed(() => {
        const db = this.repo.dados();
        return db.agendamentos
            .filter((a) =>
                this.tipo === 'pets'
                    ? a.petId === this.id()
                    : this.tipo === 'tutores'
                      ? a.tutorId === this.id()
                      : a.servicoId === this.id(),
            )
            .sort((a, b) => a.dataHora.localeCompare(b.dataHora))
            .map((a) => linha(a, db));
    });
    readonly vinculos: Record<string, string> = {
        pet: 'pets',
        tutor: 'tutores',
        servico: 'servicos',
    };
    readonly labels = rotulos;
    readonly exibir = exibir;
    readonly titulo = tituloRegistro;
    readonly tom = tom;
    readonly status = [...STATUS];
    readonly ocupado = signal(false);
    async excluir() {
        const r = this.row();
        if (r && (await this.ops.excluir(this.tipo, r.id, tituloRegistro(this.tipo, r))))
            await this.router.navigate(['/', this.tipo]);
    }
    async alterar(status: Status, controle: NgModel) {
        const a = this.repo.dados().agendamentos.find((v) => v.id === this.id());
        if (!a || status === a.status || this.ocupado()) return;
        this.ocupado.set(true);
        try {
            if (
                status === 'Cancelado' &&
                !(await this.ops.confirmar(
                    'Cancelar agendamento?',
                    'O atendimento ficará no histórico como cancelado.',
                    'Cancelar agendamento',
                ))
            )
                return;
            await this.repo.salvar('agendamentos', { ...a, status }, a.id);
            this.ops.sucesso('Status atualizado.');
        } catch (e) {
            this.ops.falha(e);
        } finally {
            controle.control.setValue(this.row()?.['status']);
            this.ocupado.set(false);
        }
    }
}
