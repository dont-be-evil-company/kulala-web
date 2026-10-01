<!-- Footer -->
<footer>
	<div class="max-w-3xl mx-auto p-2 m-2">
		<p>
			<a href="/">Back to home</a>
		</p>
		<p>
			Built by <a href="https://the-dont-be-evil-company.com">The Don't Be Evil Company</a> and only made possible by the 🌈 community</a> - Powered by
			<a class="powered-by-svelte" href="https://kit.svelte.dev/">SvelteKit</a>
			- &copy {new Date().getFullYear()}
		</p>
	</div>
</footer>

<style>
	footer {
		font-family: sans-serif;
		font-size: 0.8rem;
		background: #111111;
		color: #fff;
		text-align: right;
		border: 1px solid #111111;
		border-radius: 20px;
		margin: 1rem 0;
	}
	p {
		margin: 1rem;
	}
	footer a {
		color: #ee5396;
		text-decoration: none;
		border-bottom: 1px dashed #ee5396;
	}
	footer a:hover {
		color: #525252;
		border-bottom-color: #525252;
	}
	.powered-by-svelte::before {
		content: '';
		display: inline-block;
		background-image: url('/svelte-logo.svg');
		background-size: contain;
		background-repeat: no-repeat;
		width: 0.8rem;
		height: 0.8rem;
	}
</style>
