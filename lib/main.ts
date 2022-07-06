import './style.css'
import { GistResponse } from './response'
const $ = (selector: string) => document.querySelector(selector)

const createElement = (tagName: string, options: { [key in string]: any }) => {
  let tag: { [key in string]: any } = document.createElement(tagName)
  Object.entries(options).forEach(([k, v]) => {
    tag[k] = v
  })
  return tag as HTMLElement
}

const getSearchParams = (key: string) => {
  const searchParams = new URLSearchParams(document.location.search)
  return searchParams.get(key)
}

const fetchData = async (gistId: string | null): Promise<GistResponse | null> => {
  if (!gistId) return null
  const response = await fetch(`https://api.github.com/gists/${gistId}`)
  const json = await response.json()
  return json
}

const appendScript = (id: string) => {
  const scriptSrc = id !== '' ? `https://gist.github.com/${id}.js` : ''
  const script = document.createElement('script')
  script.src = scriptSrc
  document.body.append(script)

  return script
}

const createIframe = (id: string) => {
  const template = `
      <div class="preview-meta"> </div>
      <iframe id="${id}" class="gist-preview"></iframe> 
  `
  const emp = createElement('div', { className: 'gist-preview' })
  emp.innerHTML = template
  return emp
}

const reverseDataAndMeta = (gistFiles: NodeListOf<Element>) => {
  const div = document.createDocumentFragment()
  Array.from(gistFiles)
    .map(gistFile => {
      const gistContainer = createElement('div', { className: 'gist-container' })
      const gistData = gistFile.querySelector('.gist-data')

      gistData && gistData.remove
      gistData && gistFile.append(gistData)
      gistContainer.append(gistFile)

      const filename = gistFile.querySelector('.gist-meta')!.querySelectorAll('a')?.[1]?.innerHTML?.trim()
      const iframe = filename.endsWith('.html') && createIframe(filename)

      iframe && gistContainer.append(iframe)
      return [gistContainer, filename]
    })
    .forEach(([gistContainer, filename]) => {
      if ((filename as string).endsWith('.html')) {
        div.prepend(gistContainer)
        return
      }

      if (filename === 'index.html') {
        div.prepend(gistContainer)
        return
      }
      div.append(gistContainer)
    })
  return div
}

document.write = elementText => {
  const element = createElement('div', { innerHTML: elementText }).firstChild as HTMLElement
  if (new RegExp('<link rel="stylesheet" href="https://github.githubassets.com/assets/.*?">').test(elementText) && element) {
    $('head')!.append(element)
    return
  }
  if (new RegExp('<div id="gist.*?" class="gist">.*?').test(elementText)) {
    const gistFile = element?.querySelectorAll('.gist-file')
    $('#app')!.append(reverseDataAndMeta(gistFile))
  }
  document.body.append(element)
}

;(async () => {
  const gistId = getSearchParams('id')
  const resp = await fetchData(gistId)

  if (!resp) return

  const script = appendScript(`${resp!.owner.login}/${gistId}`)
  script.onload = () => {
    // writeToIframe(resp!)
    Object.values(resp.files).forEach(item => {
      const iframe = $(`#${item.filename}`.replaceAll('.', '\\.')) as HTMLIFrameElement
      iframe?.contentDocument?.write(item.content)
    })
  }
})()
