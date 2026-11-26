import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
    selector: 'kp-ausente',
    imports: [RouterLink],
    template: `<main class="painel ausente">
        <i class="pi pi-search"></i>
        <h1>{{ titulo() }}</h1>
        <p>Confira o endereço ou volte para continuar.</p>
        <a class="botao" [routerLink]="voltar()">Voltar para {{ destino() }}</a>
    </main>`,
})
export class Ausente {
    readonly titulo = input('Página não encontrada');
    readonly voltar = input('/dashboard');
    readonly destino = input('o dashboard');
}
