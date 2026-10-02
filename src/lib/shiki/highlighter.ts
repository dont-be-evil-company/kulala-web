import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	getMdsvexShikiHighlighter,
	type HighlighterOptions
} from '@dont-be-evil-company/mdsvex-shiki';
import { bundledLanguages, type BundledLanguage } from 'shiki';

const kulalaHttpGrammar = JSON.parse(
	readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'kulala-http.tmLanguage.json'), 'utf8')
);

/** Bundled Shiki languages with the stock `http` grammar replaced by Kulala's. */
export const kulalaShikiLangs = [
	...(Object.keys(bundledLanguages) as BundledLanguage[]).filter((lang) => lang !== 'http'),
	kulalaHttpGrammar
] as const;

export const getKulalaMdsvexShikiHighlighter = (config: HighlighterOptions = {}) =>
	getMdsvexShikiHighlighter({
		...config,
		shikiOptions: {
			...config.shikiOptions,
			langs: kulalaShikiLangs as unknown as BundledLanguage[]
		}
	});
