<script lang="ts">
  import { onMount, afterUpdate, tick } from 'svelte'
  import { fetchData } from './index.api'
  import Iframe from './iframe.svelte'
  let files = []

  let scriptSrc = `https://cdn.bootcdn.net/ajax/libs/highlight.js/11.5.1/highlight.min.js`
  const baseURL = `https://cdn.bootcdn.net/ajax/libs/highlight.js/11.5.1/`
  const baseStyleURL = theme => `${baseURL}styles/base16/${theme}.min.css`
  const baseScriptURL = `${baseURL}highlight.min.js`
  let theme = baseStyleURL`default-dark`

  const lastArr = arr => arr[arr.length - 1]
  const sortFiles = files =>
    files.reduce((arr, item) => {
      item.filename.endsWith('.html') ? (arr[0]?.filename === 'index.html' ? arr.splice(1, 0, item) : arr.unshift(item)) : arr.push(item)
      return arr
    }, [])

  const useTheme = {
    init: theme => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.id = 'hightlight-style'
      link.href = baseStyleURL(theme)
      document.head.append(link)
    },
    set: theme => {
      const link = document.querySelector('#hightlight-style') as HTMLLinkElement
      link.href = baseStyleURL(theme)
    },
  }

  const _fetchFiles = async () => {
    const gistId = new URLSearchParams(document.location.search).get('id') || '1fd2d75680d0d9d185e8dee728f9e4d7'
    const resp = await fetchData(gistId)

    const f = sortFiles(Object.values(resp.files))

    files = f

    return f
  }
  const changeTheme = t => {
    useTheme.set(t)
  }
  onMount(async () => {
    useTheme.init('default-dark')
    // @ts-ignore
    ;(document.querySelector('script#highlight') as HTMLScriptElement).onload = () => hljs && hljs.highlightAll()
  })
</script>

<svelte:head>
  <script id="highlight" src="https://cdn.bootcdn.net/ajax/libs/highlight.js/11.5.1/highlight.min.js"></script>
</svelte:head>

<div class="w-full">
  <button on:click={() => changeTheme('edge-dark')}>edge-dark</button>
  <button on:click={() => changeTheme('atelier-dune-light')}>atelier-dune-light</button>

  {#await _fetchFiles()}
    <p>loading</p>
  {:then name}
    {#each files as f}
      <div class="flex mb-10">
        <div class="w-2/4 mr-3">
          <div class="bg-gray-100 flex justify-between px-3 py-1">
            <pre>{f.filename}</pre>
            <a class="" href={f.raw_url}>Raw</a>
          </div>
          {#if f.type.split('/')[0] === 'text'}
            <pre><code class={`${lastArr(f.filename.split('.'))} "overflow-scroll`}>{f.content}</code></pre>
          {/if}
        </div>
        <div id="gist-preview" class="w-2/4 bg-white border border-gray-300 rounded">
          <Iframe file={f} />
        </div>
      </div>
    {/each}
    <script>
      hljs && hljs.highlightAll()
    </script>
  {/await}
</div>
