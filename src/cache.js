export class Cache {
    constructor() {
        this.dados = new Map();
        this.ttlPadrao = 300000;
    }

    set(chave, valor, ttl = this.ttlPadrao) {
        const expiracao = Date.now() + ttl;
        this.dados.set(chave, { valor, expiracao });
    }

    get(chave) {
        const item = this.dados.get(chave);

        if (!item) {
            return undefined;
        }

        if (Date.now() > item.expiracao) {
            this.dados.delete(chave);
            return undefined;
        }

        return item.valor;
    }
}