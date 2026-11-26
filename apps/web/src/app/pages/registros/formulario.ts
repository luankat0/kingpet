import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { Cabecalho } from '../../shared/cabecalho';
import { Ausente } from '../../shared/ausente';
import { catalogo, rotulos } from '../../shared/catalogo';
import { REPOSITORIO } from '../../core/repository';
import { Operacoes } from '../../core/operacoes';
import { STATUS, Status, Tipo, moeda } from '../../core/models';

const campos = {
    tutores: ['nome', 'contato', 'telefone', 'endereco'],
    pets: ['nome', 'especie', 'raca', 'sexo', 'tutorId'],
    servicos: ['nome', 'descricao', 'preco'],
    produtos: ['nome', 'descricao', 'preco', 'estoque'],
    agendamentos: ['tutorId', 'petId', 'servicoId', 'dataHora', 'status'],
} as const;
@Component({
    imports: [
        RouterLink,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        TextareaModule,
        SelectModule,
        DatePickerModule,
        MessageModule,
        Cabecalho,
        Ausente,
    ],
    templateUrl: './formulario.html',
})
export class Formulario {
    readonly route = inject(ActivatedRoute);
    readonly router = inject(Router);
    readonly repo = inject(REPOSITORIO);
    readonly ops = inject(Operacoes);
    readonly fb = inject(FormBuilder);
    readonly tipo = this.route.snapshot.data['tipo'] as Tipo;
    readonly id = this.route.snapshot.paramMap.get('id') ?? undefined;
    readonly meta = catalogo[this.tipo];
    readonly campos = campos[this.tipo];
    readonly labels = rotulos;
    readonly registro = this.repo.dados()[this.tipo].find((r) => r.id === this.id);
    readonly form = this.fb.group({
        nome: '',
        contato: '',
        telefone: '',
        endereco: '',
        especie: '',
        raca: '',
        sexo: '',
        tutorId: '',
        descricao: '',
        preco: this.fb.control<number | null>(null),
        estoque: this.fb.control<number | null>(null),
        petId: '',
        servicoId: '',
        dataHora: this.fb.control<Date | null>(null),
        status: this.fb.control<Status>('Agendado'),
    });
    readonly enviando = signal(false);
    readonly erro = signal('');
    readonly tutor = toSignal(this.form.controls.tutorId.valueChanges);
    readonly servico = toSignal(this.form.controls.servicoId.valueChanges);
    readonly opcoes = computed(() => {
        const db = this.repo.dados();
        const simples = (v: readonly string[]) => v.map((id) => ({ id, nome: id }));
        return {
            especie: simples([
                ...new Set([
                    'Cão',
                    'Gato',
                    'Coelho',
                    'Ave',
                    'Outro',
                    ...db.pets.map((p) => p.especie),
                ]),
            ]),
            sexo: simples(['Fêmea', 'Macho', 'Não informado']),
            tutorId: db.tutores,
            petId: db.pets.filter((p) => p.tutorId === this.tutor()),
            servicoId: db.servicos,
            status: simples(STATUS),
        };
    });
    readonly precoServico = computed(() => {
        const s = this.repo.dados().servicos.find((v) => v.id === this.servico());
        return s ? moeda(s.preco) : '';
    });
    constructor() {
        for (const k of this.campos) {
            const c = this.form.controls[k];
            c.addValidators(Validators.required);
            if (k === 'preco' || k === 'estoque') c.addValidators(Validators.min(0));
            if (k === 'estoque') c.addValidators(Validators.pattern(/^\d+$/));
            if (k === 'telefone') c.addValidators(Validators.pattern(/^\(\d{2}\) \d{4,5}-?\d{4}$/));
            if (['nome', 'contato', 'endereco', 'raca', 'descricao'].includes(k))
                c.addValidators(Validators.pattern(/\S/));
            c.updateValueAndValidity();
        }
        const q = this.route.snapshot.queryParamMap;
        const r = this.registro;
        if (r) {
            const { dataHora, ...resto } = { dataHora: undefined as string | undefined, ...r };
            this.form.patchValue({ ...resto, dataHora: dataHora ? new Date(dataHora) : null });
        } else {
            const pet = this.repo.dados().pets.find((p) => p.id === q.get('petId'));
            this.form.patchValue({
                tutorId: pet?.tutorId ?? q.get('tutorId') ?? '',
                petId: pet?.id ?? '',
                servicoId: q.get('servicoId') ?? '',
            });
        }
    }
    telefone(event: Event) {
        const input = event.target as HTMLInputElement;
        const digits = input.value.replace(/\D/g, '').slice(0, 11);
        const ddd = digits.slice(0, 2),
            numero = digits.slice(2),
            corte = numero.length > 8 ? 5 : 4;
        const formatado =
            digits.length < 3
                ? digits
                : '(' +
                  ddd +
                  ') ' +
                  numero.slice(0, corte) +
                  (numero.length > corte ? '-' + numero.slice(corte) : '');
        this.form.controls.telefone.setValue(formatado);
    }
    trocarTutor() {
        this.form.controls.petId.reset('');
    }
    pendente() {
        return (
            !this.form.dirty ||
            this.ops.confirmar(
                'Descartar alterações?',
                'Os dados deste formulário ainda não foram salvos.',
                'Descartar',
            )
        );
    }
    @HostListener('window:beforeunload', ['$event']) sairDaAba(e: BeforeUnloadEvent) {
        if (this.form.dirty) {
            e.preventDefault();
            e.returnValue = '';
        }
    }
    async salvar() {
        this.form.markAllAsTouched();
        if (this.form.invalid || this.enviando()) return;
        this.enviando.set(true);
        this.erro.set('');
        const v = this.form.getRawValue(),
            nome = v.nome?.trim() ?? '',
            descricao = v.descricao?.trim() ?? '',
            preco = v.preco ?? 0;
        try {
            let id: string;
            switch (this.tipo) {
                case 'tutores':
                    id = await this.repo.salvar(
                        'tutores',
                        {
                            nome,
                            contato: v.contato!.trim(),
                            telefone: v.telefone!,
                            endereco: v.endereco!.trim(),
                        },
                        this.id,
                    );
                    break;
                case 'pets':
                    id = await this.repo.salvar(
                        'pets',
                        {
                            nome,
                            especie: v.especie!,
                            raca: v.raca!.trim(),
                            sexo: v.sexo!,
                            tutorId: v.tutorId!,
                        },
                        this.id,
                    );
                    break;
                case 'servicos':
                    id = await this.repo.salvar('servicos', { nome, descricao, preco }, this.id);
                    break;
                case 'produtos':
                    id = await this.repo.salvar(
                        'produtos',
                        { nome, descricao, preco, estoque: v.estoque! },
                        this.id,
                    );
                    break;
                case 'agendamentos':
                    id = await this.repo.salvar(
                        'agendamentos',
                        {
                            tutorId: v.tutorId!,
                            petId: v.petId!,
                            servicoId: v.servicoId!,
                            dataHora: v.dataHora!.toISOString(),
                            status: v.status!,
                        },
                        this.id,
                    );
                    break;
            }
            this.form.markAsPristine();
            this.ops.sucesso('Registro salvo.');
            await this.router.navigate(['/', this.tipo, id]);
        } catch (e) {
            this.erro.set(e instanceof Error ? e.message : 'Não foi possível salvar.');
        } finally {
            this.enviando.set(false);
        }
    }
}
