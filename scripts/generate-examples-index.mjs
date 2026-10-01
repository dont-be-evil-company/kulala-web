import { readFileSync } from 'node:fs';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getKulalaMdsvexShikiHighlighter } from '../src/lib/shiki/highlighter.ts';

const root = 'build/examples';
const baseUrl = '/examples';
const scriptDir = dirname(fileURLToPath(import.meta.url));
const shikiStyles = readFileSync(
	join(scriptDir, '../node_modules/@mistweaverco/mdsvex-shiki/styles.css'),
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

function isHttpSource(name) {
	return name.endsWith('.http') && !name.endsWith('.http.html');
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
			flex: 1 1 auto;
			min-height: 0;
			display: flex;
			padding: 0 0.6rem 0.6rem;
		}

		.mdsvex-shiki {
			flex: 1 1 auto;
			min-width: 0;
			min-height: 0;
			width: 100%;
			margin: 0;
			display: flex;
			flex-direction: column;
			box-sizing: border-box;
		}

		.mdsvex-shiki pre {
			flex: 1 1 auto;
			min-height: 0;
			margin: 0;
			overflow: auto;
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

async function generateHttpViewer(directory, relativePath, name) {
	const source = await readFile(join(directory, name), 'utf8');
	const childPath = relativePath ? `${relativePath}/${name}` : name;
	const highlighted = unescapeSvelte(highlighter(source, 'http', `path=${childPath}`));

	const html = renderViewer({
		title: name,
		highlighted,
		backHref: urlFor(relativePath),
		downloadHref: urlFor(childPath),
		downloadName: name
	});

	await writeFile(join(directory, `${name}.html`), html);
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
		if (!item.directory && isHttpSource(item.name)) {
			await generateHttpViewer(directory, relativePath, item.name);
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
		if (
			item.name.endsWith('.br') ||
			item.name.endsWith('.gz') ||
			item.name.endsWith('.http.html')
		) {
			continue;
		}

		const childPath = relativePath ? `${relativePath}/${item.name}` : item.name;
		const hrefPath = !item.directory && isHttpSource(item.name) ? `${childPath}.html` : childPath;

		rows.push(`
			<tr>
				<td>
					<a href="${urlFor(hrefPath)}">
						${item.directory ? `${escapeHtml(item.name)}/` : escapeHtml(item.name)}
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
