import { Injectable, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { REPOSITORIO } from './repository';
import { Tipo } from './models';
@Injectable({ providedIn: 'root' })
export class Operacoes {
    private readonly repo = inject(REPOSITORIO);
    private readonly avisos = inject(MessageService);
    private readonly dialogo = inject(ConfirmationService);
    sucesso(detail: string) {
        this.avisos.add({ severity: 'success', summary: 'Concluído', detail, life: 3500 });
    }
    falha(e: unknown) {
        this.avisos.add({
            severity: 'error',
            summary: 'Operação não concluída',
            detail: e instanceof Error ? e.message : 'Tente novamente.',
            life: 6500,
        });
    }
    confirmar(header: string, message: string, acao: string) {
        return new Promise<boolean>((resolve) =>
            this.dialogo.confirm({
                header,
                message,
                icon: 'pi pi-exclamation-circle',
                acceptLabel: acao,
                rejectLabel: 'Voltar',
                defaultFocus: 'reject',
                accept: () => resolve(true),
                reject: () => resolve(false),
            }),
        );
    }
    async excluir(tipo: Tipo, id: string, nome: string) {
        if (
            !(await this.confirmar('Excluir registro', 'Deseja excluir “' + nome + '”?', 'Excluir'))
        )
            return false;
        try {
            await this.repo.excluir(tipo, id);
            this.sucesso('Registro excluído.');
            return true;
        } catch (e) {
            this.falha(e);
            return false;
        }
    }
}
