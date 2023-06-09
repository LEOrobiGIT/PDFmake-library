

import App from './App2.svelte';

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;