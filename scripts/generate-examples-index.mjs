import { readdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = 'build/examples';
const baseUrl = '/examples';

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

function urlFor(relativePath = '') {
	if (!relativePath) {
		return baseUrl;
	}

	const encodedPath = relativePath
		.split('/')
		.map(encodeURIComponent)
		.join('/');

	return `${baseUrl}/${encodedPath}`;
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

	const rows = [];

	if (relativePath) {
		const parentPath = relativePath
			.split('/')
			.slice(0, -1)
			.join('/');

		rows.push(`
			<tr>
				<td>
					<a href="${urlFor(parentPath)}">../</a>
				</td>
				<td>—</td>
			</tr>
		`);
	}

	for (const item of items) {
    if (item.name.endsWith('.br') || item.name.endsWith('.gz')) {
      continue;
    }
		const childPath = relativePath
			? `${relativePath}/${item.name}`
			: item.name;

		rows.push(`
			<tr>
				<td>
					<a href="${urlFor(childPath)}">
						${item.directory ? `${escapeHtml(item.name)}/` : escapeHtml(item.name)}
					</a>
				</td>
				<td>
					${item.directory ? '—' : formatSize(item.size)}
				</td>
			</tr>
		`);
	}

	const displayPath = relativePath
		? `${baseUrl}/${relativePath}`
		: baseUrl;

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

		const childRelativePath = relativePath
			? `${relativePath}/${item.name}`
			: item.name;

		await generateIndex(
			join(directory, item.name),
			childRelativePath
		);
	}
}

await generateIndex(root);
