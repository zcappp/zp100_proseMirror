import React from "react"
import css from "./zp100_proseMirror.css"
import proseMirror from "./proseMirror"
import { DOMSerializer, DOMParser } from "prosemirror-model"
import { EditorState } from "prosemirror-state"

let 图库, 视频库

function render(ref) {
    return [图库, 视频库]
}

function init(ref) {
    const { container, id } = ref
    const view = proseMirror(ref)
    // container.getView = () => { return view }
    // container.getDoc = () => { return view.state.toJSON().doc.content }
    container.getHTML = () => { return getHTML(view.state) || "" }
    container.setHTML = html => {
        view.updateState(EditorState.create({ doc: DOMParser.fromSchema(view.state.schema).parse(new window.DOMParser().parseFromString(html, "text/html")) }))
    }
    container.insertImage = url => ref.insertImage(url)
    container.insertVideo = url => ref.insertVideo(url)
    图库 = ref.render({ t: "Plugin", p: { ID: "zp101", P: { mineOnly: true, onSelect: '$("' + "#" + id + '").insertImage(url)', type: "i" } } }, id + "_0")
    视频库 = ref.render({ t: "Plugin", p: { ID: "zp101", P: { mineOnly: true, onSelect: '$("' + "#" + id + '").insertVideo(url)', type: "v" } } }, id + "_1")
    if (ref.props.html === undefined) setTimeout(() => {
        if (ref.props.html) {
            if (!container.getHTML()) container.setHTML(ref.props.html)
        } else setTimeout(() => {
            if (ref.props.html && !container.getHTML()) container.setHTML(ref.props.html)
        }, 800)
    }, 200)
}

function getHTML(state) {
    const div = document.createElement("div")
    div.appendChild(DOMSerializer.fromSchema(state.schema).serializeFragment(state.doc.content))
    let h = div.innerHTML
    if (h.length > 20 || h.replaceAll(" ", "") !== "<p></p>") return h
}

$plugin({
    id: "zp100",
    props: [{
        prop: "html",
        type: "exp",
        label: "html",
        ph: "初始内容"
    }],
    render,
    init,
    css
})

/*
https://discuss.prosemirror.net/t/node-fromjson-and-custom-marks-with-attributes/2979

https://github.com/Leecason/element-tiptap   https://bwlnj.csb.app/
https://github.com/ueberdosis/tiptap   https://tiptap.dev/tables
https://www.yuque.com/u210170/kb/kt06oy/edit


*/