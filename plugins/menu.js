import { Plugin } from "prosemirror-state"
import { buildMenuBar } from "./menubar"
import { combineUpdates } from "./menufn"

export function menuBar(schema, ref) {
    return new Plugin({
        view(editorView) { return new MenuBarView(editorView, schema, ref) }
    })
}

class MenuBarView {
    constructor(view, schema, ref) {
        this.view = view
        const menuBar = buildMenuBar(schema, ref)
        let { dom, update } = renderGrouped(view, menuBar)
        this.menu = document.createElement("div")
        this.menu.className = "PMmenubar"
        this.menu.appendChild(dom)
        view.dom.parentNode.insertBefore(this.menu, view.dom)
        this.contentUpdate = update
        this.update()
    }
    update() {
        this.contentUpdate(this.view.state)
    }
}


// :: (EditorView, [union<MenuElement, [MenuElement]>]) → {dom: ?dom.DocumentFragment, update: (EditorState) → bool}
// Render the given, possibly nested, array of menu elements into a document fragment, placing separators between them (and ensuring no
// superfluous separators appear when some of the groups turn out to be empty).
export function renderGrouped(view, content) {
    let result = document.createDocumentFragment()
    let updates = [],
        separators = []
    for (let i = 0; i < content.length; i++) {
        let items = content[i],
            localUpdates = [],
            localNodes = []
        for (let j = 0; j < items.length; j++) {
            let { dom, update } = items[j].render(view)
            result.appendChild(dom)
            localNodes.push(dom)
            localUpdates.push(update)
        }
        if (localUpdates.length) {
            updates.push(combineUpdates(localUpdates, localNodes))
            if (i < content.length - 1) separators.push(result.appendChild(separator()))
        }
    }

    function update(state) {
        let something = false,
            needSep = false
        for (let i = 0; i < updates.length; i++) {
            let hasContent = updates[i](state)
            if (i) separators[i - 1].style.display = needSep && hasContent ? "" : "none"
            needSep = hasContent
            if (hasContent) something = true
        }
        return something
    }
    return { dom: result, update }
}

function separator() {
    let el = document.createElement("span")
    el.className = "PMMseparator"
    return el
}