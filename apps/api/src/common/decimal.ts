/**
 * Preço é DECIMAL no banco e o Prisma devolve um objeto Decimal, que vira
 * string no JSON. O front espera número, então convertemos na saída.
 */
export function comPrecoNumerico<T extends { preco: unknown }>(registro: T) {
    return { ...registro, preco: Number(registro.preco) };
}
