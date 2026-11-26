/**
 * Rótulos de situação do agendamento. São os mesmos valores do STATUS do
 * front (apps/web/src/app/core/models.ts): a API grava e devolve o texto
 * exato que a tela mostra, sem tradução no meio do caminho.
 */
export const STATUS_AGENDAMENTO = [
    'Agendado',
    'Confirmado',
    'Em atendimento',
    'Concluído',
    'Cancelado',
] as const;

export type StatusAgendamento = (typeof STATUS_AGENDAMENTO)[number];
