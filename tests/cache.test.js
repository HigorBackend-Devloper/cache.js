import { describe, test, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { Cache } from '../src/index.js';

describe('Cache', () => {
    let cache;

    beforeEach(() => {
        mock.timers.enable({ apis: ['Date'], now: 0 });
        cache = new Cache();
    });

    afterEach(() => {
        mock.timers.reset();
    });

    describe('set e get', () => {
        test('retorna o valor armazenado', () => {
            cache.set('nome', 'Higor');
            assert.equal(cache.get('nome'), 'Higor');
        });

        test('retorna undefined para chave inexistente', () => {
            assert.equal(cache.get('nao-existe'), undefined);
        });

        test('sobrescreve o valor de uma chave existente', () => {
            cache.set('chave', 1);
            cache.set('chave', 2);
            assert.equal(cache.get('chave'), 2);
        });

        test('armazena valores falsy', () => {
            cache.set('zero', 0);
            cache.set('vazio', '');
            cache.set('falso', false);
            cache.set('nulo', null);

            assert.equal(cache.get('zero'), 0);
            assert.equal(cache.get('vazio'), '');
            assert.equal(cache.get('falso'), false);
            assert.equal(cache.get('nulo'), null);
        });

        test('retorna a mesma referência para objetos', () => {
            const usuario = { id: 1 };
            cache.set('usuario', usuario);
            assert.equal(cache.get('usuario'), usuario);
        });

        test('aceita chaves que não são strings', () => {
            const chaveObjeto = {};
            cache.set(chaveObjeto, 'objeto');
            cache.set(42, 'numero');

            assert.equal(cache.get(chaveObjeto), 'objeto');
            assert.equal(cache.get(42), 'numero');
        });
    });

    describe('expiração', () => {
        test('usa TTL padrão de 5 minutos', () => {
            cache.set('chave', 'valor');

            mock.timers.tick(300000);
            assert.equal(cache.get('chave'), 'valor');

            mock.timers.tick(1);
            assert.equal(cache.get('chave'), undefined);
        });

        test('respeita TTL personalizado', () => {
            cache.set('chave', 'valor', 1000);

            mock.timers.tick(1000);
            assert.equal(cache.get('chave'), 'valor');

            mock.timers.tick(1);
            assert.equal(cache.get('chave'), undefined);
        });

        test('remove o item expirado ao tentar lê-lo', () => {
            cache.set('chave', 'valor', 1000);
            mock.timers.tick(1001);

            cache.get('chave');
            assert.equal(cache.dados.has('chave'), false);
        });

        test('cada chave expira de forma independente', () => {
            cache.set('curta', 'a', 1000);
            cache.set('longa', 'b', 5000);

            mock.timers.tick(2000);
            assert.equal(cache.get('curta'), undefined);
            assert.equal(cache.get('longa'), 'b');
        });

        test('sobrescrever uma chave renova a expiração', () => {
            cache.set('chave', 'v1', 1000);
            mock.timers.tick(800);

            cache.set('chave', 'v2', 1000);
            mock.timers.tick(800);

            assert.equal(cache.get('chave'), 'v2');
        });
    });
});
