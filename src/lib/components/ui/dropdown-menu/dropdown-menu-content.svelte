<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	type $$Props = {
		class?: string;
		sideOffset?: number;
		children?: any;
	};

	let {
		class: className,
		sideOffset = 4,
		children,
		...restProps
	}: $$Props = $props();
</script>

<DropdownMenuPrimitive.Content
	{sideOffset}
	class={cn(
		"z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</DropdownMenuPrimitive.Content>