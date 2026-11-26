import { Component, input } from '@angular/core';
@Component({
    selector: 'kp-cabecalho',
    template: `
        <header class="cabecalho">
            <div>
                <h1>{{ titulo() }}</h1>
                @if (descricao()) {
                    <p>{{ descricao() }}</p>
                }
            </div>
            <div class="acoes"><ng-content /></div>
        </header>
    `,
})
export class Cabecalho {
    readonly titulo = input.required<string>();
    readonly descricao = input('');
}
