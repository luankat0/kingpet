import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import pt from '@angular/common/locales/pt';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
registerLocaleData(pt);
const preset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#effaf5',
            100: '#d7f2e5',
            200: '#ade4ce',
            300: '#82d1b6',
            400: '#51ae92',
            500: '#308a72',
            600: '#216f5d',
            700: '#195d50',
            800: '#184c43',
            900: '#163f39',
            950: '#0c2825',
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{primary.700}',
                    hoverColor: '{primary.800}',
                    activeColor: '{primary.900}',
                },
            },
            dark: { primary: { color: '{primary.300}', inverseColor: '{primary.950}' } },
        },
    },
});
const meses =
    'janeiro fevereiro março abril maio junho julho agosto setembro outubro novembro dezembro'.split(
        ' ',
    );
const dias = 'domingo segunda-feira terça-feira quarta-feira quinta-feira sexta-feira sábado'.split(
    ' ',
);
export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(withInterceptors([authInterceptor])),
        { provide: LOCALE_ID, useValue: 'pt-BR' },
        MessageService,
        ConfirmationService,
        providePrimeNG({
            theme: { preset, options: { darkModeSelector: '.escuro' } },
            translation: {
                dateFormat: 'dd/mm/yy',
                firstDayOfWeek: 0,
                monthNames: meses,
                monthNamesShort: meses.map((m) => m.slice(0, 3)),
                dayNames: dias,
                dayNamesShort: dias.map((d) => d.slice(0, 3)),
                dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
                today: 'Hoje',
                clear: 'Limpar',
                accept: 'Confirmar',
                reject: 'Cancelar',
                emptyMessage: 'Nenhum registro',
                emptyFilterMessage: 'Nenhum resultado',
                searchMessage: '{0} resultados',
                selectionMessage: '{0} selecionado(s)',
                emptySelectionMessage: 'Nenhuma seleção',
                emptySearchMessage: 'Nenhum resultado',
                weak: 'Fraca',
                medium: 'Média',
                strong: 'Forte',
                passwordPrompt: 'Digite a senha',
                choose: 'Selecionar',
                aria: {
                    firstPageLabel: 'Primeira página',
                    lastPageLabel: 'Última página',
                    nextPageLabel: 'Próxima página',
                    previousPageLabel: 'Página anterior',
                    pageLabel: 'Página {page}',
                    rowsPerPageLabel: 'Registros por página',
                    navigation: 'Navegação',
                    next: 'Próximo',
                    previous: 'Anterior',
                    close: 'Fechar',
                    showFilterMenu: 'Mostrar filtros',
                    hideFilterMenu: 'Ocultar filtros',
                    selectRow: 'Selecionar linha',
                    unselectRow: 'Remover seleção',
                },
                chooseDate: 'Escolher data',
                chooseMonth: 'Escolher mês',
                chooseYear: 'Escolher ano',
                prevMonth: 'Mês anterior',
                nextMonth: 'Próximo mês',
                prevYear: 'Ano anterior',
                nextYear: 'Próximo ano',
                prevHour: 'Hora anterior',
                nextHour: 'Próxima hora',
                prevMinute: 'Minuto anterior',
                nextMinute: 'Próximo minuto',
            },
        }),
    ],
};
