<script lang="ts">
	import AffixTable from '../AffixTable.svelte';
	import type { PageServerData } from './$types';
	const { data } = $props<{ data: PageServerData }>();
	const { mods } = data;
</script>

<h1>Path of Exile affix data</h1>
<AffixTable {mods} />
