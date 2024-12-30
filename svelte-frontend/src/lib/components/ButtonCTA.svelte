<script lang="ts">
  let {
    href,
    target = '_self',
    children
  }: {
    href: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    children: () => any;
  } = $props();
</script>

<a
  {href}
  {target}
  class="group flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 font-semibold shadow-lg transition-all hover:scale-105 hover:opacity-90"
>
  {@render children()}
</a>
