<script lang="ts">
  import { onMount } from 'svelte'
  export let file

  onMount(() => {
    const iframe = (document.querySelector(`iframe#preview-${file.filename.replaceAll('.', '\\.')}`) as HTMLIFrameElement) || null
    console.log(iframe, file)

    if (iframe) {
      // console.log(file.content);

      const d = iframe.contentDocument
      d.querySelector('html').remove()
      d.write(file.content)
    }
  })
</script>

{#if file.filename.endsWith('.html')}
  <iframe title="" class="w-full h-full" id={`preview-${file.filename}`} frameborder="0" />
{/if}
