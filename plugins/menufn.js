import { toggleMark, lift, joinUp, selectParentNode, wrapIn, setBlockType } from "prosemirror-commands"
import { Plugin } from "prosemirror-state"
import { Decoration, DecorationSet } from "prosemirror-view"
import { wrapInList, liftListItem, sinkListItem } from "prosemirror-schema-list"
import { TextField, openPrompt } from "./prompt"

const SVG = "http://www.w3.org/2000/svg"

export class MenuItem {
    constructor(O) {
        this.O = O
    }
    render(view) {
        let O = this.O
        let dom = document.createElement("button")
        dom.className = "PMbtn"
        if (O.svg) {
            dom.appendChild(makeSVG(O.svg))
        } else if (O.label) {
            dom.appendChild(document.createTextNode(O.label))
        }
        if (O.title) dom.setAttribute("title", O.title)
        if (O.css) dom.style.cssText += O.css
        if (O.init) O.init(view)
        dom.addEventListener("mousedown", e => {
            e.preventDefault()
            if (!dom.classList.contains("PMbtn-disabled")) O.run(view.state, view.dispatch, view, e)
        })

        function update(state) {
            if (O.select) {
                let selected = O.select(state)
                dom.style.display = selected ? "" : "none"
                if (!selected) return false
            }
            let enabled = true
            if (O.enable) {
                enabled = O.enable(state) || false
                setClass(dom, "PMbtn-disabled", !enabled)
            }
            if (O.active) {
                let active = enabled && O.active(state) || false
                setClass(dom, "PMbtn-active", active)
            }
            return true
        }
        return { dom, update }
    }
}

export class Dropdown {
    constructor(items, O) {
        this.O = O || {}
        this.items = Array.isArray(items) ? items : [items]
    }
    render(view) {
        const O = this.O
        let items = renderDropdownItems(this.items, view)
        let dom = document.createElement("div")
        dom.className = "PMbtns"
        if (O.title) dom.setAttribute("title", O.title)
        let node = dom.appendChild(document.createElement("span"))
        node.className = "PMbtns-trigger"
        node = node.appendChild(document.createElement("button"))
        node.className = "PMbtn"
        if (O.svg) {
            node.appendChild(makeSVG(O.svg))
        } else {
            // node = node.appendChild(document.createElement("span"))
            if (O.label) node.appendChild(document.createTextNode(O.label))
        }
        node = dom.appendChild(document.createElement("div")) //, { class: "PMbtns-list " + (O.cx || "") }, items)
        node.className = "PMbtns-list"
        items.dom.forEach(a => node.appendChild(a))
        node = dom.firstChild.firstChild
        let open, listeningOnClose, updateItems
        let close = () => {
            if (open && open.close()) {
                open = null
                window.removeEventListener("mousedown", listeningOnClose)
            }
        }
        dom.addEventListener("mousedown", e => {
            e.preventDefault()
            markMenuEvent(e)
            if (open) {
                close()
            } else {
                if (node.classList.contains("PMbtn-disabled")) return
                if (updateItems) updateItems()
                open = this.expand(dom, node, items.dom)
                window.addEventListener("mousedown", listeningOnClose = () => {
                    if (!isMenuEvent(dom)) close()
                })
            }
        })

        function update(state) {
            if (O.enable) setClass(node, "PMbtn-disabled", !O.enable(state))
            if (node.classList.contains("PMbtn-disabled")) return true
            updateItems = () => items.update(state)
            return true
        }
        return { dom, update }
    }
    expand(dom, node, items) {
        node.classList.add("PMbtn-active")
        dom.lastChild.classList.add("PMbtns-list-active")

        function close() {
            dom.lastChild.classList.remove("PMbtns-list-active")
            node.classList.remove("PMbtn-active")
            return true
        }
        return { close }
    }
}

const COLORS = [
    ["#000000", "#262626", "#595959", "#8C8C8C", "#BFBFBF", "#D9D9D9", "#E9E9E9", "#F5F5F5", "#FAFAFA", "#FFFFFF"],
    ["#FFE8E6", "#FFECE0", "#FFEFD1", "#FCFCCA", "#E4F7D2", "#D3F5F0", "#D4EEFC", "#DEE8FC", "#EFE1FA", "#FAE1EB"],
    ["#FFA39E", "#FFBB96", "#FFD591", "#FFFB8F", "#B7EB8F", "#87E8DE", "#91D5FF", "#ADC6FF", "#D3ADF7", "#FFADD2"],
    ["#FF4D4F", "#FF7A45", "#FFA940", "#FFEC3D", "#73D13D", "#36CFC9", "#40A9FF", "#597EF7", "#9254DE", "#F759AB"],
    ["#F5222D", "#FA541C", "#FA8C16", "#FADB14", "#52C41A", "#13C2C2", "#1890FF", "#2F54EB", "#722ED1", "#EB2F96"],
    ["#CF1322", "#D4380D", "#D46B08", "#D4B106", "#389E0D", "#08979C", "#096DD9", "#1D39C4", "#531DAB", "#C41D7F"],
    ["#820014", "#871400", "#873800", "#614700", "#135200", "#00474F", "#003A8C", "#061178", "#22075E", "#780650"]
]
const CHECKS = ["#E9E9E9", "#F5F5F5", "#FAFAFA", "#FFFFFF", "#FFE8E6", "#FFECE0", "#FFEFD1", "#FCFCCA", "#E4F7D2", "#D3F5F0", "#D4EEFC", "#DEE8FC", "#EFE1FA", "#FAE1EB", "#FFFB8F", "#FFEC3D", "#FADB14"]

export class ColorDropdown {
    constructor(O) {
        this.O = O
    }
    render(view) {
        const O = this.O
        O.ref[O.title] = O.default
        let dom = document.createElement("div")
        dom.className = "PMbtns"
        if (O.title) dom.setAttribute("title", O.title)
        let set = dom.appendChild(document.createElement("span"))
        set.className = "PMbtns-trigger PMbtns-trigger-double"
        let btn1 = set.appendChild(document.createElement("button"))
        btn1.className = "PMbtn PMbtn-current"
        btn1.addEventListener("mousedown", e => {
            e.preventDefault()
            O.run(view.state, view.dispatch, O.ref[O.title])
        })
        btn1.appendChild(makeColorSVG(O))
        const rect = btn1.firstElementChild.firstElementChild
        let btn2 = set.appendChild(document.createElement("button"))
        btn2.className = "PMbtn PMbtn-dropdown"

        let pop = document.createElement("div")
        pop.className = "PMbtns-list PMbtns-list-colorboard"
        let board = pop.appendChild(document.createElement("div"))
        board.className = "lake-colorboard"
        COLORS.forEach(arr => {
            let grp = board.appendChild(document.createElement("span"))
            grp.className = "PMcolors"
            arr.forEach(color => {
                let n = grp.appendChild(document.createElement("span"))
                n.className = "PMcolor"
                n.addEventListener("mousedown", e => {
                    e.preventDefault()
                    O.run(view.state, view.dispatch, O.ref[O.title] === color ? undefined : color)
                    rect.setAttribute("fill", color)
                    O.ref[O.title] = color
                    let el = pop.querySelector(".PMcolor-active")
                    if (el) el.classList.remove("PMcolor-active")
                    e.target.classList.add("PMcolor-active")
                })
                n = n.appendChild(document.createElement("span"))
                n.style = "background-color:" + color
                n = n.appendChild(document.createElementNS(SVG, "svg"))
                n.setAttribute("viewBox", "0 0 18 18")
                n.setAttribute("fill", CHECKS.includes(color) ? "grey" : "white")
                n = n.appendChild(document.createElementNS(SVG, "path"))
                n.setAttribute("d", "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z")
            })
        })
        dom.appendChild(pop)

        let open, listeningOnClose, updateItems
        let close = () => {
            if (open && open.close()) {
                open = null
                window.removeEventListener("mousedown", listeningOnClose)
                set.classList.remove("PMbtns-trigger-double-active")
            }
        }
        btn2.addEventListener("mousedown", e => {
            e.preventDefault()
            markMenuEvent(e)
            if (open) {
                close()
            } else {
                set.classList.add("PMbtns-trigger-double-active")
                if (updateItems) updateItems()
                open = this.expand(btn2, pop)
                window.addEventListener("mousedown", listeningOnClose = () => {
                    if (!isMenuEvent(btn2)) close()
                })
            }
        })

        function update(state) {
            return true
        }
        return { dom, update }
    }
    expand(btn2, pop) {
        pop.classList.add("PMbtns-list-active")

        function close() {
            pop.classList.remove("PMbtns-list-active")
            return true
        }
        return { close }
    }
}

export function toggleSpan(markType, attrs) {
    return function(state, dispatch) {
        let { $cursor, ranges } = state.selection
        let tr = state.tr
        if ($cursor) {
            if (markType.isInSet(state.storedMarks || $cursor.marks())) dispatch(tr.removeStoredMark(markType))
            if (attrs) dispatch(tr.addStoredMark(markType.create(attrs)))
        } else {
            let has = false
            for (let i = 0; !has && i < ranges.length; i++) {
                let { $from, $to } = ranges[i]
                has = state.doc.rangeHasMark($from.pos, $to.pos, markType)
            }
            for (let i = 0; i < ranges.length; i++) {
                let { $from, $to } = ranges[i]
                if (has) tr.removeMark($from.pos, $to.pos, markType)
                if (attrs) tr.addMark($from.pos, $to.pos, markType.create(attrs))
            }
            dispatch(tr.scrollIntoView())
        }
        return true
    }
}

function cmdItem(cmd, O) {
    let passedOptions = { run: cmd }
    for (let prop in O) passedOptions[prop] = O[prop]
    if ((!O.enable || O.enable === true) && !O.select) passedOptions[O.enable ? "enable" : "select"] = state => cmd(state)
    return new MenuItem(passedOptions)
}

function markActive(state, type) {
    let { from, $from, to, empty } = state.selection
    if (empty && type) return type.isInSet(state.storedMarks || $from.marks())
    else return state.doc.rangeHasMark(from, to, type)
}

export function markItem(markType, O) {
    let passedOptions = {
        active(state) { return markActive(state, markType) },
        enable: true
    }
    for (let prop in O) passedOptions[prop] = O[prop]
    return cmdItem(toggleMark(markType), passedOptions)
}

export function wrapListItem(nodeType, O) {
    return cmdItem(wrapInList(nodeType, O.attrs), O)
}

export function linkItem(markType) {
    return new MenuItem({
        title: "链接",
        svg: { width: 1024, height: 1024, path: "M575.414 663.972l39.671 39.671c3.887 3.887 3.887 10.263 0 14.15L498.877 834c-85.333 85.332-223.545 85.332-308.878 0-85.332-85.333-85.332-223.545 0-308.878l116.209-116.208c3.886-3.887 10.262-3.887 14.149 0l39.77 39.771c3.888 3.887 3.888 10.262 0 14.149L243.92 579.043c-26.219 26.219-41.191 61.703-41.904 98.466-.735 37.95 13.674 74.442 41.905 102.673 28.178 28.226 64.667 42.637 102.632 41.902 36.78-.713 72.289-15.688 98.504-41.903l116.208-116.209c3.887-3.886 10.262-3.886 14.149 0zM448.586 360.028l-39.671-39.671c-3.887-3.887-3.887-10.263 0-14.15L525.123 190c85.333-85.332 223.545-85.332 308.878 0 85.332 85.333 85.332 223.545 0 308.878L717.792 615.085c-3.886 3.887-10.262 3.887-14.149 0l-39.77-39.771c-3.888-3.887-3.888-10.262 0-14.149L780.08 444.957c26.219-26.219 41.191-61.703 41.904-98.466.735-37.95-13.674-74.442-41.905-102.673-28.178-28.226-64.667-42.637-102.632-41.902-36.78.713-72.289 15.688-98.504 41.903L462.735 360.028c-3.887 3.886-10.262 3.886-14.149 0zm-77.674 237.304l226.42-226.42c3.883-3.883 10.252-3.883 14.135 0l39.621 39.621c3.883 3.883 3.883 10.252 0 14.135l-226.42 226.42c-3.883 3.883-10.252 3.883-14.135 0l-39.621-39.621c-3.883-3.883-3.883-10.252 0-14.135z" },
        active(state) { return markActive(state, markType) },
        enable(state) { return !state.selection.empty },
        run(state, dispatch, view) {
            if (markActive(state, markType)) {
                toggleMark(markType)(state, dispatch)
                return true
            }
            openPrompt({
                title: "链接",
                fields: {
                    href: new TextField({ label: "URL", required: true }),
                    title: new TextField({})
                },
                cb(attrs) {
                    toggleMark(markType, attrs)(view.state, view.dispatch)
                    view.focus()
                }
            })
        }
    })
}


export const placeholderPlugin = new Plugin({
    state: {
        init: function init() {
            return DecorationSet.empty
        },
        apply: function apply(tr, set) {
            set = set.map(tr.mapping, tr.doc)
            let action = tr.getMeta(this)
            if (action) {
                if (action.add) {
                    let widget = document.createElement("placeholder")
                    if (action.add.class) widget.className = action.add.class
                    if (action.add.style) widget.style = action.add.style
                    let deco = Decoration.widget(action.add.pos, widget, { id: action.add.id })
                    set = set.add(tr.doc, [deco])
                } else if (action.remove) {
                    set = set.remove(set.find(null, null, function(spec) { return spec.id == action.remove.id }))
                }
            }
            return set
        }
    },
    props: {
        decorations: function decorations(state) { return this.getState(state) }
    }
})

function findPlaceholder(state, id) {
    const decos = placeholderPlugin.getState(state);
    const found = decos.find(null, null, function(spec) { return spec.id == id; });
    return found.length ? found[0].from : null
}

export const upload = (ref, type, i) => {
    return (state, dispatch, view) => {
        let el = document.createElement("input")
        el.type = "file"
        el.accept = i ? "image/*" : "video/*"
        el.addEventListener("change", e => {
            const file = e.target.files[0]
            if (!file) return warn(i ? "未选择图片" : "未选择视频")
            let id = {}
            let tr = view.state.tr
            if (!tr.selection.empty) tr.deleteSelection()
            const x = URL.createObjectURL(file)
            const attrs = { id, pos: tr.selection.from, class: "uploading" }
            tr.setMeta(placeholderPlugin, { add: attrs })
            view.dispatch(tr)
            const node = $("#" + ref.id + " .uploading")
            node.innerHTML = (i ? '<img src="' : '<video src="') + x + '"/>'
            node.appendChild(document.createElement("div"))
            ref.exc('upload(file, option)', {
                file,
                option: {
                    onProgress: r => {
                        node.lastChild.innerHTML = r.percent + "%"
                    },
                    onSuccess: r => {
                        let n = document.createElement(i ? "img" : "video")
                        n.src = r.url
                        n[i ? "onload" : "onloadstart"] = e => {
                            e.target[i ? "onload" : "onloadstart"] = null
                            let pos = findPlaceholder(view.state, id);
                            if (pos == null) { return }
                            view.dispatch(view.state.tr.replaceWith(pos, pos, type.create({ src: r.url })).setMeta(placeholderPlugin, { remove: { id } }));
                            URL.revokeObjectURL(x)
                        }
                    },
                    onError: r => {
                        ref.exc(`alert("上传出错了", r.error)`, { r })
                        view.dispatch(tr.setMeta(placeholderPlugin, { remove: { id } }))
                        URL.revokeObjectURL(x)
                    }
                }
            })
        }, false)
        el.click()
    }
}

export function aligh(v) {
    return (state, dispatch, view) => {
        const nodeRange = view.state.selection.$from.blockRange(view.state.selection.$to)
        const parent = nodeRange.parent
        let tr
        parent.nodesBetween(nodeRange.start, nodeRange.end, (node, pos, parent, index) => {
            if (node.type.name === "paragraph" || node.type.name === "heading") {
                tr = state.tr.setNodeMarkup(pos, undefined, Object.assign({}, node.attrs, { style: "text-align: " + v }))
            }
        })
        if (tr) view.dispatch(tr)
        view.focus()
    }
}

export function combineUpdates(updates, nodes) {
    return state => {
        let something = false
        for (let i = 0; i < updates.length; i++) {
            let up = updates[i](state)
            nodes[i].style.display = up ? "" : "none"
            if (up) something = true
        }
        return something
    }
}

function makeSVG(O) {
    const svg = document.createElementNS(SVG, "svg")
    svg.setAttribute("viewBox", "0 0 " + O.width + " " + O.height)
    const p = document.createElementNS(SVG, "path")
    p.setAttribute("d", O.path)
    svg.appendChild(p)
    return svg
}

function makeColorSVG(O) {
    const svg = document.createElementNS(SVG, "svg")
    svg.setAttribute("viewBox", "0 0 16 16")
    svg.setAttribute("width", "16px")
    svg.setAttribute("height", "16px")
    const r = document.createElementNS(SVG, "rect")
    r.setAttribute("fill", O.default)
    r.setAttribute("x", "2")
    r.setAttribute("y", "12.75")
    r.setAttribute("width", "12px")
    r.setAttribute("height", "1.5px")
    svg.appendChild(r)
    const p = document.createElementNS(SVG, "path")
    p.setAttribute("d", O.svg)
    if (O.title === "背景颜色") p.setAttribute("transform", "translate(2.781250, 1.375000)")
    svg.appendChild(p)
    return svg
}

function setClass(dom, cls, on) { // Work around classList.toggle being broken in IE11
    on ? dom.classList.add(cls) : dom.classList.remove(cls)
}

function renderDropdownItems(items, view) {
    let rendered = [],
        updates = [],
        item
    for (let i = 0; i < items.length; i++) {
        let { dom, update } = items[i].render(view)
        item = document.createElement("div")
        item.className = "PMMdropdownitem" // ProseMirror Menu
        item.appendChild(dom)
        rendered.push(item)
        updates.push(update)
    }
    return { dom: rendered, update: combineUpdates(updates, rendered) }
}

let lastMenuEvent = { time: 0, node: null }

function markMenuEvent(e) {
    lastMenuEvent.time = Date.now()
    lastMenuEvent.node = e.target
}

function isMenuEvent(wrapper) {
    return Date.now() - 100 < lastMenuEvent.time && lastMenuEvent.node && wrapper.contains(lastMenuEvent.node)
}