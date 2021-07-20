import { keymap } from "prosemirror-keymap"
import { history } from "prosemirror-history"
import { baseKeymap, setBlockType } from "prosemirror-commands"
import { EditorState, Plugin } from "prosemirror-state"
import { dropCursor } from "prosemirror-dropcursor"
import { gapCursor } from "prosemirror-gapcursor"
import { EditorView } from "prosemirror-view"
import { Schema, DOMParser, Node } from "prosemirror-model"
import { addListNodes } from "prosemirror-schema-list"
import { fixTables } from "prosemirror-tables"

import { schema } from "./schema"
import { menuBar } from "./menu"
import { buildKeymap } from "./keymap"
import { buildInputRules } from "./inputrules"
import { placeholderPlugin } from "./menufn"
import { tableNodes, tablePlugins } from "./table"
import { openPrompt, TextField, SelectField } from "./prompt"

export default ref => {
    const { props, container } = ref
    let nodes = addListNodes(schema.spec.nodes, "paragraph block*", "block")
    nodes = nodes.append(tableNodes)
    const mySchema = new Schema({ nodes, marks: schema.spec.marks })
    let plugins = [
        buildInputRules(mySchema),
        keymap(buildKeymap(mySchema)),
        keymap(baseKeymap),
        dropCursor(),
        gapCursor(),
        placeholderPlugin,
        menuBar(mySchema, ref),
        history()
    ]
    plugins = plugins.concat(tablePlugins)
    let state = EditorState.create({
        doc: props.html ? DOMParser.fromSchema(mySchema).parse(new window.DOMParser().parseFromString(props.html, "text/html")) : undefined,
        schema: mySchema,
        plugins
    })
    let fix = fixTables(state)
    if (fix) state = state.apply(fix.setMeta("addToHistory", false))
    const view = new EditorView(container, { state })
    container.children[1].addEventListener("contextmenu", e => popup(view, e.target, e))
    container.children[1].addEventListener("dblclick", e => popup(view, e.target, e))
    return view
}

function popup(view, n, e) {
    if (n.nodeName === "IMG") {
        e.preventDefault()
        openPrompt({
            title: "图片",
            fields: {
                src: new TextField({ value: n.src, required: true }),
                alt: new TextField({ value: n.alt }),
                title: new TextField({ value: n.title }),
                class: new TextField({ value: n.className }),
                width: new TextField({ value: n.style.width }),
                display: new SelectField({ value: n.style.display, arr: [{ label: "block", value: "block" }, { label: "inline", value: "" }] }),
                float: new SelectField({ value: n.style.float, arr: [{ label: "none", value: "" }, { label: "right", value: "right" }, { label: "left", value: "left" }] })
            },
            cb(O) {
                O.style = ""
                if (O.display) {
                    O.style += "display:" + O.display + ";"
                    delete O.display
                }
                if (O.float) {
                    O.style += "float:" + O.float + ";"
                    delete O.float
                }
                if (O.width) {
                    O.style += "width:" + O.width + (O.width.includes("px") || O.width.includes("%") ? ";" : "px;")
                    delete O.width
                }
                view.dispatch(view.state.tr.setNodeMarkup(view.state.selection.$anchor.pos, null, O))
                view.focus()
            }
        })
    } else if (n.nodeName === "VIDEO") {
        e.preventDefault()
        openPrompt({
            title: "视频",
            fields: {
                src: new TextField({ value: n.src, required: true }),
                poster: new TextField({ value: n.poster, label: "封面图地址" }),
                alt: new TextField({ value: n.alt }),
                title: new TextField({ value: n.title }),
                class: new TextField({ value: n.className }),
                width: new TextField({ value: n.style.width }),
                preload: new SelectField({ value: n.style.display, arr: [{ label: "不预加载", value: "none" }, { label: "加载元数据", value: "metadata" }, { label: "自动加载", value: "auto" }] }),
                display: new SelectField({ value: n.style.display, arr: [{ label: "block", value: "block" }, { label: "inline", value: "" }] }),
                float: new SelectField({ value: n.style.float, arr: [{ label: "none", value: "" }, { label: "right", value: "right" }, { label: "left", value: "left" }] })
            },
            cb(O) {
                O.style = ""
                if (O.display) {
                    O.style += "display:" + O.display + ";"
                    delete O.display
                }
                if (O.float) {
                    O.style += "float:" + O.float + ";"
                    delete O.float
                }
                if (O.width) {
                    O.style += "width:" + O.width + (O.width.includes("px") || O.width.includes("%") ? ";" : "px;")
                    delete O.width
                }
                view.dispatch(view.state.tr.setNodeMarkup(view.state.selection.$anchor.pos, null, O))
                view.focus()
            }
        })
    } else if (n.nodeName === "A") {
        e.preventDefault()
        openPrompt({
            title: "链接",
            fields: {
                href: new TextField({ label: "URL", value: n.href, required: true }),
                title: new TextField({})
            },
            cb(O) {
                const { $from, $to } = view.state.selection
                view.dispatch(view.state.tr.removeMark($from.pos, $to.pos))
                view.dispatch(view.state.tr.addMark($from.pos, $to.pos, schema.marks.link.create(O)))
                view.focus()
            }
        })
    }
}