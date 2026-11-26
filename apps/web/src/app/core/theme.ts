import { Injectable, signal } from '@angular/core';
import { ambiente } from './config';
@Injectable({ providedIn: 'root' })
export class Tema {
    readonly escuro = signal(false);
    constructor() {
        try {
            this.aplicar(localStorage.getItem(ambiente.tema) === 'escuro');
        } catch {
            this.aplicar(false);
        }
    }
    private aplicar(v: boolean) {
        this.escuro.set(v);
        document.documentElement.classList.toggle('escuro', v);
    }
    alternar() {
        this.aplicar(!this.escuro());
        try {
            localStorage.setItem(ambiente.tema, this.escuro() ? 'escuro' : 'claro');
        } catch {
            /* A preferência vale para a aba atual. */
        }
    }
}
