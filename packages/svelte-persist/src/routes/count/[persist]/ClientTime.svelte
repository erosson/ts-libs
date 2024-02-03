<script lang="ts">
	let { clientTime } = $props<{ clientTime: Date | undefined }>();
	$effect(() => {
		function frame() {
			clientTime = new Date();
			requestAnimationFrame(frame);
		}
		frame();
	});
</script>
