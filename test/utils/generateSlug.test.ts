import { it, expect, describe } from 'vitest';
import { decodeSlug, generateSlug } from '../../src/utils/generateSlug.js';

describe('Geração de slug', () => {
	it('Deve retornar shortcode com 5 caracteres', () => {
		const slug = generateSlug(1121212);
		expect(slug).toHaveLength(5);
	});

	it('Deve retornar o shortcode igual ao counter utilizado', () => {
		const slug = generateSlug(1121212);
		expect(decodeSlug(slug)).toBe(1121212);
	});

	it('Deve gerar slugs diferentes para counters diferentes', () => {
		const slug1 = generateSlug(1);
		const slug2 = generateSlug(2);
		expect(slug1).not.toBe(slug2);
	});

	it('Deve funcionar com counter baixo (1)', () => {
		const slug = generateSlug(1);
		expect(slug).toHaveLength(5);
		expect(decodeSlug(slug)).toBe(1);
	});
});
