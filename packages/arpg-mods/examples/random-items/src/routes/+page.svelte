<script lang="ts">
	import type { AffixClass, AffixFamily } from '../../../../src/affix';
	import { toArpgMods } from '../../../../src/reader-poe';
	import * as MU from '../../../../src/util/map';
	const { data } = $props<{ data: { mods: ReturnType<typeof toArpgMods> } }>();
	const { mods } = data;
	const format = new Intl.NumberFormat();

	let search = $state('');

	const subjects = $state(
		Object.fromEntries(mods.flatMap((m) => m.weight.map((w) => [w.subject, false])))
	);
	const numSubjects = $derived(Object.values(subjects).filter((s) => !!s).length);

	const stats = $state(
		Object.fromEntries(mods.flatMap((m) => m.stats.map((s) => [s.statId, false])))
	);
	const numStats = $derived(Object.values(stats).filter((s) => !!s).length);

	const families = $state(Object.fromEntries(mods.map((m) => [familiesSlug(m.families), false])));

	const visibleMods = $derived(mods.filter(isMatch));
	const visibleModsByFamily = $derived(MU.groupBy(visibleMods, (m) => familiesSlug(m.families)));

	const limit = 1000;
	function isMatch(mod: AffixClass): boolean {
		const re = new RegExp(search, 'i');
		const matchRe =
			re.test(mod.affixId) ||
			mod.families.some((f) => re.test(f)) ||
			mod.weight.some((w) => re.test(w.subject)) ||
			mod.stats.some((s) => re.test(s.statId));
		const matchSubj = numSubjects === 0 || mod.weight.some((w) => subjects[w.subject]);
		const matchStats = numStats === 0 || mod.stats.some((s) => stats[s.statId]);
		return matchSubj && matchStats && matchRe;
	}
	function familiesSlug(fs: readonly AffixFamily[]): string {
		return fs.toSorted().join(', ');
	}
</script>

<h1>affix tables</h1>

<input bind:value={search} />
<!-- {search} -->
{format.format(visibleMods.length)} matches
{#if visibleMods.length > limit}
	({format.format(limit)} visible)
{/if}

<details open>
	<summary>{format.format(numSubjects)} spawn subjects</summary>
	{#each Object.keys(subjects) as subj}
		<label>
			<input type="checkbox" value={subj} bind:checked={subjects[subj]} />{subj}
		</label>
	{/each}
</details>

<details open={false}>
	<summary>{format.format(Object.keys(stats).length)} stats</summary>
	{#each Object.keys(stats) as stat}
		<label>
			<input type="checkbox" value={stat} bind:checked={stats[stat]} />{stat}
		</label>
	{/each}
</details>

<details open>
	<summary>
		{format.format(mods.length)} affixes,
		{format.format(visibleMods.length)} visible in
		{format.format(visibleModsByFamily.size)} families
	</summary>
	<table>
		<thead>
			<tr>
				<th>Families</th>
				<th>AffixID</th>
				<th>Level</th>
				<th>Spawn weight</th>
				<th>Stats</th>
			</tr>
		</thead>
		<tbody>
			{#each visibleModsByFamily.entries() as [key, affixes]}
				{@const levels = affixes.map((a) => a.level)}
				{@const weights = Array.from(
					MU.map(
						MU.groupBy(
							affixes.flatMap((a) => a.weight),
							(w) => w.subject
						),
						(ws) => ({
							subject: ws[0].subject,
							weight: ws.reduce((accum, w) => accum + w.weight, 0)
						})
					).values()
				)}
				{@const stats = Array.from(
					MU.map(
						MU.groupBy(
							affixes.flatMap((a) => a.stats),
							(s) => s.statId
						),
						(ss) => ({
							statId: ss[0].statId,
							min: Math.min(...ss.map((s) => s.min)),
							max: Math.max(...ss.map((s) => s.max))
						})
					).values()
				)}
				<tr>
					<td
						on:click={() => {
							families[key] = !families[key];
						}}
					>
						<input type="checkbox" readonly={true} checked={families[key]} />
						{key} (x{affixes.length})
						{families[key]}
					</td>
					<td></td>
					<td>{Math.min(...levels)}-{Math.max(...levels)}</td>
					<td>{weights.map((w) => `${w.subject}: ${w.weight}`).join(', ')}</td>
					<td>
						{stats
							.map((s) => `${s.statId}: ${s.min === s.max ? `${s.min}` : `${s.min}-${s.max}`}`)
							.join(', ')}
					</td>
				</tr>
				{#if families[key]}
					{#each affixes as mod}
						<tr>
							<td></td>
							<td>{mod.affixId}</td>
							<td>{mod.level}</td>
							<td>{mod.weight.map((w) => `${w.subject}: ${w.weight}`).join(', ')}</td>
							<td>
								{mod.stats
									.map((s) => `${s.statId}: ${s.min === s.max ? `${s.min}` : `${s.min}-${s.max}`}`)
									.join(', ')}
							</td>
						</tr>
					{/each}
				{/if}
			{/each}
		</tbody>
	</table>
</details>

<style>
	table,
	thead,
	tr,
	th,
	td {
		border: 1px solid black;
	}
	table {
		border-collapse: collapse;
		table-layout: fixed;
	}
	tr:hover {
		background-color: yellow;
	}
	thead {
		position: sticky;
		top: 0;
		background-color: white;
	}
</style>
