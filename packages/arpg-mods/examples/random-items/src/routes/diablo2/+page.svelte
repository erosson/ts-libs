<script lang="ts">
	import AffixTable from '../AffixTable.svelte';
	import type { PageServerData } from './$types';
	const { data } = $props<{ data: PageServerData }>();
	const { mods } = data;
</script>

<h1>Diablo 2 affix data</h1>
<AffixTable {mods} />
