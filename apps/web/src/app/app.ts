import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Tema } from './core/theme';
@Component({ selector: 'app-root', imports: [RouterOutlet], templateUrl: './app.html' })
export class App {
    readonly tema = inject(Tema);
}
