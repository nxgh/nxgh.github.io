import { EditorView, basicSetup } from 'codemirror'
import { EditorState, Compartment } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import type { Extension } from '@codemirror/state'

import { javascript } from '@codemirror/lang-javascript'

let language = new Compartment(),
  tabSize = new Compartment(),
  readOnly = new Compartment()

let state = doc =>
  EditorState.create({
    doc,
    extensions: [basicSetup, language.of(javascript()), tabSize.of(EditorState.tabSize.of(8)), readOnly.of(EditorState.readOnly.of(false))],
  })

export function toggleWith(key: string, extension: Extension) {
  let myCompartment = new Compartment()
  function toggle(view: EditorView) {
    let on = myCompartment.get(view.state) == extension
    view.dispatch({
      effects: myCompartment.reconfigure(on ? [] : extension),
    })
    return true
  }
  return [myCompartment.of([]), keymap.of([{ key, run: toggle }])]
}

export const setOptions = editor => {
  // editor.dispatch({
  //   effects: readOnly.reconfigure(EditorState.readOnly.of(true)),
  // })
  toggleWith(
    'Mod-o',
    EditorView.editorAttributes.of({
      style: 'background: yellow',
    })
  )
}

export const initEditor = (container, doc = 'console.log("hello world")') => {
  let editor = new EditorView({
    state: state(doc),
    parent: container,
  })

  // setOptions()
  // editor.state
  editor.dispatch(editor.state.update())
  return editor
}
