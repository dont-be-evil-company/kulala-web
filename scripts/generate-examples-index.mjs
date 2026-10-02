import { readFileSync } from 'node:fs';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getKulalaMdsvexShikiHighlighter } from '../src/lib/shiki/highlighter.ts';

const root = 'build/examples';
const baseUrl = '/examples';
const scriptDir = dirname(fileURLToPath(import.meta.url));
const shikiStyles = readFileSync(
	join(scriptDir, '../node_modules/@dont-be-evil-company/mdsvex-shiki/styles.css'),
	'utf8'
);

const highlighter = await getKulalaMdsvexShikiHighlighter({
	displayPath: true,
	displayLanguage: true
});

function formatSize(bytes) {
	if (bytes < 1024) {
		return `${bytes} B`;
	}

	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}

	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function escapeHtml(value) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

/** The highlighter escapes braces and backticks for Svelte; standalone HTML needs the characters back. */
function unescapeSvelte(html) {
	return html.replaceAll('&lbrace;', '{').replaceAll('&rbrace;', '}').replaceAll('&#96;', '`');
}

function urlFor(relativePath = '') {
	if (!relativePath) {
		return baseUrl;
	}

	const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/');

	return `${baseUrl}/${encodedPath}`;
}

const LANGUAGES = new Map([
	['http', 'http'],
	['json', 'json'],
	['xml', 'xml'],
	['graphql', 'graphql'],
	['js', 'javascript'],
	['ts', 'typescript'],
	['sh', 'bash'],
	['txt', 'plaintext']
]);

/**
 * Returns true if the file is a source file that should be rendered in the viewer, and the language to use for highlighting
 * @param {string} name The actual file name, e.g. `example.http` or `example.http.html`
 * @returns {[boolean, string|null]} A tuple where the first element is true if the file is a source file, and the second element is the language to use for highlighting (or null if not a source file)
 */
function isViewerSource(name) {
	const language = LANGUAGES.get(name.split('.').pop());
	if (language && !name.endsWith(`.${language}.html`)) {
		return [true, language];
	}
	return [false, null];
}

function shouldSkipIndexRendering(name) {
	if (name === 'index.html') {
		return true;
	}
	if (name.endsWith('.br') || name.endsWith('.gz')) {
		return true;
	}
	if (name.startsWith('.')) {
		return true;
	}
	return false;
}

function renderViewer({ title, highlighted, backHref, downloadHref, downloadName }) {
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<title>${escapeHtml(title)}</title>

	<style>
		${shikiStyles}

		:root {
			color-scheme: light dark;
		}

		html,
		body {
			height: 100%;
		}

		body {
			margin: 0;
			min-height: 100vh;
			display: flex;
			flex-direction: column;
			font-family:
				ui-monospace,
				SFMono-Regular,
				Menlo,
				Monaco,
				Consolas,
				"Liberation Mono",
				"Courier New",
				monospace;
			line-height: 1.5;
		}

		.toolbar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 1rem;
			flex: 0 0 auto;
			padding: 0.6rem 0.9rem;
		}

		.toolbar a {
			color: inherit;
			text-decoration: none;
			white-space: nowrap;
		}

		.toolbar a:hover {
			text-decoration: underline;
		}

		.toolbar .name {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			opacity: 0.8;
		}

		.stage {
			display: block;
			padding: 0 0.6rem 0.6rem;
		}

		@media (max-width: 640px) {
			.toolbar {
				flex-wrap: wrap;
			}

			.toolbar .name {
				order: -1;
				flex: 1 0 100%;
			}
		}
	</style>
</head>

<body>
	<header class="toolbar">
		<a href="${backHref}">Back</a>
		<span class="name">${escapeHtml(title)}</span>
		<a href="${downloadHref}" download="${escapeHtml(downloadName)}">Download</a>
	</header>

	<main class="stage">
		${highlighted}
	</main>

	<script>
		document.addEventListener('click', (event) => {
			const target = event.target;
			if (!(target instanceof Element)) {
				return;
			}

			const button = target.closest('button.copy');
			if (!button) {
				return;
			}

			const markCopied = () => {
				button.classList.add('copied');
				setTimeout(() => {
					button.classList.remove('copied');
				}, 2000);
			};

			const write = (text) => {
				navigator.clipboard.writeText(text).then(markCopied).catch((err) => {
					console.error('Failed to copy code:', err);
				});
			};

			const codeText = button.getAttribute('data-code');
			if (codeText) {
				write(codeText);
				return;
			}

			const codeBlock = button.closest('.mdsvex-shiki')?.querySelector('code');
			if (codeBlock) {
				write(codeBlock.textContent || '');
			}
		});
	</script>
</body>
</html>
`;
}

const HTML_EXTENSION = 'html';

async function generateViewer(directory, relativePath, name, language) {
	const source = await readFile(join(directory, name), 'utf8');
	const childPath = relativePath ? `${relativePath}/${name}` : name;
	const highlighted = unescapeSvelte(highlighter(source, language, `path=${childPath}`));

	const html = renderViewer({
		title: name,
		highlighted,
		backHref: urlFor(relativePath),
		downloadHref: urlFor(childPath),
		downloadName: name
	});

	const htmlFileName = `${name}.${HTML_EXTENSION}`;
	await writeFile(join(directory, htmlFileName), html);
	return htmlFileName;
}

/**
 * Viewer pages are `{source}.html`. Show the source name for those, and keep
 * every other filename as it is on disk.
 * @param {string} name
 */
function getFileNameForUI(name) {
	const htmlSuffix = `.${HTML_EXTENSION}`;
	if (!name.endsWith(htmlSuffix)) {
		return name;
	}

	const sourceName = name.slice(0, -htmlSuffix.length);
	const [isSource] = isViewerSource(sourceName);
	return isSource ? sourceName : name;
}

async function generateIndex(directory, relativePath = '') {
	const entries = await readdir(directory, {
		withFileTypes: true
	});

	const items = await Promise.all(
		entries
			.filter((entry) => entry.name !== 'index.html')
			.map(async (entry) => {
				const path = join(directory, entry.name);
				const info = await stat(path);

				return {
					name: entry.name,
					directory: entry.isDirectory(),
					size: info.size
				};
			})
	);

	items.sort((a, b) => {
		if (a.directory !== b.directory) {
			return a.directory ? -1 : 1;
		}

		return a.name.localeCompare(b.name);
	});

	for (const item of items) {
		const [isSource, language] = isViewerSource(item.name);
		if (!item.directory && isSource) {
			item.name = await generateViewer(directory, relativePath, item.name, language);
		}
	}

	const rows = [];

	if (relativePath) {
		const parentPath = relativePath.split('/').slice(0, -1).join('/');

		rows.push(`
			<tr>
				<td>
					<a href="${urlFor(parentPath)}">../</a>
				</td>
				<td>-</td>
			</tr>
		`);
	}

	for (const item of items) {
		if (shouldSkipIndexRendering(item.name)) continue;

		const childPath = relativePath ? `${relativePath}/${item.name}` : item.name;
		const hrefPath = childPath;

		rows.push(`
			<tr>
				<td>
					<a href="${urlFor(hrefPath)}">
						${item.directory ? `${escapeHtml(item.name)}/` : escapeHtml(getFileNameForUI(item.name))}
					</a>
				</td>
				<td>
					${item.directory ? '-' : formatSize(item.size)}
				</td>
			</tr>
		`);
	}

	const displayPath = relativePath ? `${baseUrl}/${relativePath}` : baseUrl;

	const html = `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<title>Index of ${escapeHtml(displayPath)}</title>

	<style>
		:root {
			color-scheme: light dark;
		}

		body {
			font-family:
				ui-monospace,
				SFMono-Regular,
				Menlo,
				Monaco,
				Consolas,
				"Liberation Mono",
				"Courier New",
				monospace;

			max-width: 960px;
			margin: 3rem auto;
			padding: 0 1rem;
			line-height: 1.5;
		}

		h1 {
			font-size: 1.4rem;
			margin-bottom: 1.5rem;
		}

		table {
			width: 100%;
			border-collapse: collapse;
		}

		th,
		td {
			padding: 0.4rem 0.75rem;
			text-align: left;
			border-bottom: 1px solid color-mix(in srgb, currentColor 20%, transparent);
		}

		th:last-child,
		td:last-child {
			text-align: right;
			white-space: nowrap;
		}

		a {
			color: inherit;
			text-decoration: none;
		}

		a:hover {
			text-decoration: underline;
		}
	</style>
</head>

<body>
	<h1>Index of ${escapeHtml(displayPath)}</h1>

	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Size</th>
			</tr>
		</thead>

		<tbody>
			${rows.join('')}
		</tbody>
	</table>
</body>
</html>
`;

	await writeFile(join(directory, 'index.html'), html);

	for (const item of items) {
		if (!item.directory) {
			continue;
		}

		const childRelativePath = relativePath ? `${relativePath}/${item.name}` : item.name;

		await generateIndex(join(directory, item.name), childRelativePath);
	}
}

await generateIndex(root);
