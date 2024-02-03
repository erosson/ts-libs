<script lang="ts">
	import type { PageData } from './$types.js';
	import ClientTime from './ClientTime.svelte';

	// TODO every mutation re-reads the state from persistence. write -> read. instead, use what we wrote without re-reading
	// TODO same thing for the server, where it actually matters - client-side prediction!
	// TODO parsing data in the success case's `else` block sort of works; it gets the nulls right. it fails for svelte stores though - can't use $state!
	//      solution: `state: Readable<null | T>`, instead of `state: null | Readable<T>`? maybe wrap all of `data` in a top-level store?
	//      oops, spent all afternoon working on a custom store - but svelte 5 kills stores (sort of)!

	const { data } = $props<{ data: PageData }>();
	const { persist } = $derived(data);
	let clientTime = $state<Date>();
	let { state: st } = $derived(data);
</script>

<div class="hidden">
	<!-- looks like the way to do complex interactivity now is either component bind props, or events? -->
	<ClientTime bind:clientTime />
</div>

<div>count/{persist}: {$st.status}</div>
<div>time: {clientTime}</div>

{#if $st.status === 'failure'}
	<div>{$st.error}</div>
{:else if $st.status === 'loading'}
	<div>...</div>
{:else}
	{@const { incr, decr } = data}
	<form method="POST" action="?/incr" use:incr><button>+</button></form>
	{$st.value.count}
	<form method="POST" action="?/decr" use:decr><button>-</button></form>
{/if}
