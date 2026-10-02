<script>
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import '$lib/global.css';
	import { copyAction } from '@dont-be-evil-company/mdsvex-shiki/copyAction';
	import '@dont-be-evil-company/mdsvex-shiki/styles.css';
	import Footer from '$lib/Footer.svelte';
</script>

<div class="non-landing-page">
	<div class="max-w-3xl mx-auto">
		<main use:copyAction>
			<article class="prose">
				<slot />
			</article>
		</main>
		<Footer/>
	</div>
</div>
