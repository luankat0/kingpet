import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { DrawerModule } from 'primeng/drawer';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../core/services/auth.service';
import { Tema } from '../core/theme';
import { REPOSITORIO } from '../core/repository';
import { catalogo } from '../shared/catalogo';
import { Marca } from '../shared/marca';
import { Tipo } from '../core/models';
import { iniciaisDe } from '../core/iniciais';

@Component({
    imports: [
        ToastModule,
        ConfirmDialogModule,
        RouterLink,
        RouterLinkActive,
        RouterOutlet,
        NgTemplateOutlet,
        DrawerModule,
        BreadcrumbModule,
        MenuModule,
        ButtonModule,
        MessageModule,
        ProgressSpinnerModule,
        Marca,
    ],
    templateUrl: './shell.html',
})
export class Shell {
    readonly repo = inject(REPOSITORIO);
    readonly auth = inject(AuthService);
    readonly tema = inject(Tema);
    readonly router = inject(Router);
    readonly recolhido = signal(false);
    readonly nomeUsuario = computed(() => this.auth.usuario()?.nome ?? 'Minha conta');
    readonly iniciais = computed(() => iniciaisDe(this.nomeUsuario()));
    mobile = false;
    readonly grupos = [
        {
            titulo: 'Visão geral',
            itens: [{ rota: 'dashboard', nome: 'Dashboard', icone: 'th-large' }],
        },
        { titulo: 'Operações', itens: [{ rota: 'agendamentos', ...catalogo.agendamentos }] },
        {
            titulo: 'Cadastros',
            itens: (['tutores', 'pets', 'servicos', 'produtos'] as Tipo[]).map((rota) => ({
                rota,
                ...catalogo[rota],
            })),
        },
        { titulo: 'Conta', itens: [{ rota: 'perfil', nome: 'Meu perfil', icone: 'user' }] },
    ];
    readonly usuarioMenu = [
        { label: 'Meu perfil', icon: 'pi pi-user', routerLink: '/perfil' },
        { label: 'Sair', icon: 'pi pi-sign-out', command: () => this.sair() },
    ];
    private readonly url = toSignal(
        this.router.events.pipe(
            filter((e) => e instanceof NavigationEnd),
            map((e) => e.urlAfterRedirects),
        ),
        { initialValue: this.router.url },
    );
    readonly migalhas = computed(() => {
        const [rota, id, modo] = this.url().split(/[?#]/)[0].split('/').filter(Boolean);
        const nome =
            this.grupos.flatMap((g) => g.itens).find((i) => i.rota === rota)?.nome ?? 'Página';
        const crumbs = [{ label: nome, routerLink: '/' + rota }];
        if (id)
            crumbs.push({
                label: id === 'novo' ? 'Cadastro' : 'Consulta',
                routerLink: '/' + rota + '/' + id,
            });
        if (modo) crumbs.push({ label: 'Edição', routerLink: '/' + rota + '/' + id + '/' + modo });
        return crumbs;
    });
    alternarMenu() {
        if (matchMedia('(max-width: 850px)').matches) this.mobile = !this.mobile;
        else this.recolhido.update((v) => !v);
    }
    async sair() {
        if (await this.router.navigateByUrl('/login')) this.auth.sair();
    }
}
