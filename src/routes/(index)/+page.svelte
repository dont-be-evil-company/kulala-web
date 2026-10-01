<script lang="ts">
	import HeadComponent from '$lib/HeadComponent.svelte';
	import { smoothScrollToAnchor } from '$lib/utils';
	let kulalaFeaturesToggle: boolean = false;
</script>

<HeadComponent
	data={{
		title: 'Kulala',
		description:
			'A fully-featured set of tools 🐼 for working with HTTP, GraphQL, gRPC and Websocket connections.'
	}}
/>

<div id="start" class="hero bg-base-300 min-h-screen">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<img src="/logo.svg" alt="Kulala logo" class="m-5 mx-auto w-64" />
			<h1 class="text-5xl font-bold">Kulala</h1>
			<div class="collapse bg-base-100 border border-base-300 mt-6 mb-6 border-rounded rounded-lg">
				<input type="checkbox" checked={kulalaFeaturesToggle} name="intro-kulala-features" onchange={() => (kulalaFeaturesToggle = !kulalaFeaturesToggle)} />
				<div
					class="collapse-title font-semibold text-lg bg-info text-info-content text-center"
					style="padding-inline-end: unset;"
				>
					A fully-featured set of tools 🐼 for working with HTTP, GraphQL, gRPC and Websocket connections.
					<div class="text-center">
						<i class="fa-solid {kulalaFeaturesToggle ? 'fa-caret-up' : 'fa-caret-down'}"></i>
					</div>
				</div>
				<div class="collapse-content text-center border border-info rounded-b-lg">
					<p class="mt-6 mb-2 text-2xl text-info">Features ✨</p>
					<p class="text-info text-l mt-6 mb-6">
						Kulala supports Neovim, Code, Zed and is also available as a standalone desktop app.
						Our integrations support the Jetbrains .http spec (with full scripting support).
					</p>
				</div>
			</div>
			<a href="#apps" onclick={smoothScrollToAnchor}
				><button class="btn btn-primary">Apps</button></a
			>
		</div>
	</div>
</div>

<a id="apps" aria-label="Apps section anchor"></a>
<div class="hero bg-base-200 min-h-screen">
	<div class="hero-content text-center grid">
		<div class="bg-base-300 border border-base-300 mt-6 mb-6 border-rounded rounded-lg max-w-3xl p-10">
			<h1 class="text-5xl font-bold">Apps 📦</h1>
			<p class="py-6">Kulala apps (in no particular order):</p>
			<ul>
				<li>
					<div class="tooltip" data-tip="Neovim plugin">
						<a class="link link-primary" href="https://github.com/dont-be-evil-company/kulala.nvim">Kulala.nvim</a>
					</div>
				</li>
				<li>
					<div class="tooltip" data-tip="Code extension">
						<a class="link link-primary" href="https://github.com/dont-be-evil-company/kulala.vscode">Kulala.vscode</a>
					</div>
				</li>
				<li>
					<div class="tooltip" data-tip="Standalone desktop app">
					<a class="link link-primary" href="https://github.com/dont-be-evil-company/kulala-desktop">Kulala Desktop</a>
					</div>
				</li>
				<li>
					<div class="tooltip" data-tip="CLI for formatting .http files, importing from/exporting to Postman collections and .bru files, and more!">
						<a class="link link-primary" href="https://github.com/dont-be-evil-company/kulala-fmt">Kulala FMT</a>
					</div>
				</li>
				<li>
					<div class="tooltip" data-tip="Like kulala.nvim, but completely CLI focused and editor-agnostic!">
						<a class="link link-primary" href="https://github.com/dont-be-evil-company/kulala-cli">Kulala CLI</a>
					</div>
				</li>
			</ul>
		</div>
		<a href="#usage" onclick={smoothScrollToAnchor}
			><button class="btn btn-primary">Usage</button></a
		>
		<div>
		</div>
	</div>
</div>

<a id="usage" aria-label="Usage section anchor"></a>
<div class="hero bg-base-300 min-h-screen">
	<div class="hero-content text-center grid">
		<div class="bg-base-200 border border-base-300 mt-6 mb-6 border-rounded rounded-lg max-w-3xl p-10">
			<h1 class="text-5xl font-bold mb-5">Usage 🧑‍💻</h1>
      <div class="tooltip" data-tip="Real life examples of how to use Kulala apps and the Kulala CLI">
        <div class="badge badge-outline badge-accent">
          <a href="/examples" data-sveltekit-preload-data={false}>examples</a>
        </div>
      </div>
			<div class="badge badge-outline badge-info">
				<a href="/usage">Usage overview</a>
			</div>
			<div class="badge badge-outline badge-info">
				<a href="/usage/getting-started">Getting started</a>
			</div>
		</div>
		<a href="#get-involved" onclick={smoothScrollToAnchor}
			><button class="btn btn-primary">Get involved</button></a
		>
		<div>
		</div>
	</div>
</div>

<a id="get-involved" aria-label="Get involved section anchor"></a>
<div class="hero bg-base-300 min-h-screen">
	<div class="hero-content text-center">
		<div class="max-w-3xl">
			<h1 class="text-5xl font-bold">Get involved ❤️</h1>
			<p class="py-6">All Kulala clients are open-source and we welcome contributions.</p>
			<p>
				View the <a class="text-primary" href="https://github.com/search?q=user%3Adont-be-evil-company+kulala&type=repositories&sort=stargazers">code.</a>
			</p>
		</div>
	</div>
</div>
