<script lang="ts">
	import { enhance } from '$app/forms';
	import * as RD from '../../count/[persist]/remotedata.js';
	import type { State } from '../../count/state.js';
	import type { PageData } from './$types.js';
	import { timer } from './timer.js';
	import type { ReloadLens } from './form.js';

	// this finally supports everything we care about. client+server mutations, load+reload status+errors,
	// TODO: move reusable stuff out from page.ts
	// TODO: it's so complex. anything we can do to simplify usage, without losing features?
	// TODO: docs
	const { data } = $props<{ data: PageData }>();
	const { incr, decr, reset } = $derived(data);
	let st = $state(RD.reloadable(data.state));
	let time: Date | null = $state(null);
	$effect(() => {
		timer((t) => (time = t));
	});
</script>

{#if st.status === 'loading'}
	loading...
{:else if st.status === 'failure'}
	error: {st.error}
{:else}
	{@const counter = st.value}
	{@const lens: ReloadLens<State> = {
		get: () => counter,
		set: (s: State) => (st = RD.success(s)),
		status: (r: RD.RemoteData<null>) => (st = RD.reload(st, r)),
	}}
	<form
		method="POST"
		action="?/incr"
		use:enhance={incr.enhancer(lens)}
		onsubmit={incr.onsubmit(lens)}
	>
		<button disabled={st.status !== 'success'}>+</button>
	</form>
	<form
		method="POST"
		action="?/decr"
		use:enhance={decr.enhancer(lens)}
		onsubmit={decr.onsubmit(lens)}
	>
		<button disabled={st.status !== 'success'}>-</button>
	</form>
	{counter.count}
	<form
		method="POST"
		action="?/reset"
		use:enhance={reset.enhancer(lens)}
		onsubmit={reset.onsubmit(lens)}
	>
		<button disabled={st.status !== 'success'}>reset</button>
	</form>
{/if}
<div>time: {time}</div>
{#if st.status === 'reload-loading'}
	reloading...
{:else if st.status === 'reload-failure'}
	reload failure: {st.error}
{/if}
