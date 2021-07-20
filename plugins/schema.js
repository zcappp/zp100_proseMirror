import { Schema } from "prosemirror-model"

const HEADING = [1, 2, 3, 4, 5, 6],
    blockquoteDOM = ["blockquote", 0],
    hrDOM = ["hr"],
    preDOM = ["pre", ["code", 0]],
    brDOM = ["br"]

export const nodes = {
    doc: { // The top level document node.
        content: "block+"
    },
    paragraph: {
        content: "inline*",
        group: "block",
        attrs: { class: { default: null }, style: { default: null } },
        parseDOM: [{
            tag: "p",
            getAttrs(dom) {
                return { class: dom.getAttribute("class"), style: dom.getAttribute("style") }
            }
        }],
        toDOM(node) {
            return ["p", { class: node.attrs.class, style: node.attrs.style }, 0]
        }
    },

    blockquote: {
        content: "block+",
        group: "block",
        defining: true,
        parseDOM: [{ tag: "blockquote" }],
        toDOM() { return blockquoteDOM }
    },
    hr: {
        group: "block",
        parseDOM: [{ tag: "hr" }],
        toDOM() { return hrDOM }
    },
    heading: {
        content: "inline*",
        group: "block",
        defining: true,
        attrs: { level: { default: 1 }, class: { default: null }, style: { default: null } },
        parseDOM: HEADING.map(a => {
            return { tag: "h" + a, attrs: { level: a } }
        }),
        toDOM(node) {
            return ["h" + node.attrs.level, { class: node.attrs.class, style: node.attrs.style }, 0]
        }
    },
    codeblock: {
        content: "text*",
        marks: "",
        group: "block",
        code: true,
        defining: true,
        attrs: { class: { default: null } },
        parseDOM: [{
            tag: "pre",
            getAttrs(dom) {
                return { class: dom.getAttribute("class") }
            },
            preserveWhitespace: "full"
        }],
        toDOM(node) {
            return ["pre", { class: node.attrs.class },
                ["code", 0]
            ]
        }
    },
    text: {
        group: "inline"
    },
    image: {
        inline: true,
        group: "inline",
        draggable: true,
        attrs: {
            src: {},
            alt: { default: null },
            title: { default: null },
            class: { default: null },
            style: { default: null }
        },
        parseDOM: [{
            tag: "img[src]",
            getAttrs(dom) {
                return {
                    src: dom.getAttribute("src"),
                    title: dom.getAttribute("title"),
                    alt: dom.getAttribute("alt"),
                    class: dom.getAttribute("class"),
                    style: dom.getAttribute("style")
                }
            }
        }],
        toDOM(node) {
            let { src, alt, title, style } = node.attrs
            return ["img", { src, alt, title, class: node.attrs.class, style }]
        }
    },
    video: {
        inline: true,
        group: "inline",
        draggable: true,
        attrs: {
            src: {},
            poster: { default: null },
            controls: { default: true },
            preload: { default: "metadata" },
            alt: { default: null },
            title: { default: null },
            class: { default: null },
            style: { default: null }
        },
        parseDOM: [{
            tag: "video[src]",
            getAttrs(dom) {
                return {
                    src: dom.getAttribute("src"),
                    poster: dom.getAttribute("poster"),
                    controls: dom.getAttribute("controls"),
                    preload: dom.getAttribute("preload"),
                    alt: dom.getAttribute("alt"),
                    title: dom.getAttribute("title"),
                    alt: dom.getAttribute("alt"),
                    class: dom.getAttribute("class"),
                    style: dom.getAttribute("style")
                }
            }
        }],
        toDOM(node) {
            let { src, poster, controls, preload, alt, title, style } = node.attrs
            return ["video", { src, poster, controls, preload, alt, title, class: node.attrs.class, style }]
        }
    },
    iframe: {
        group: "block",
        draggable: true,
        attrs: { src: {}, style: { default: null } },
        parseDOM: [{
            tag: "iframe[src]",
            getAttrs(dom) {
                return { src: dom.getAttribute("src"), style: dom.getAttribute("style") }
            }
        }],
        toDOM(node) {
            let { src, style } = node.attrs
            return ["iframe", { src, style, allow: "fullscreen" }]
        }
    },
    hard_break: {
        inline: true,
        group: "inline",
        selectable: false,
        parseDOM: [{ tag: "br" }],
        toDOM() { return brDOM }
    },
}

const emDOM = ["em", 0],
    strongDOM = ["strong", 0],
    codeDOM = ["code", 0],
    delDOM = ["del", 0],
    insDOM = ["ins", 0]

export const marks = {
    link: {
        attrs: { href: {}, title: { default: null } },
        inclusive: false,
        parseDOM: [{
            tag: "a[href]",
            getAttrs(dom) {
                return { href: dom.getAttribute("href"), title: dom.getAttribute("title") }
            }
        }],
        toDOM(node) { let { href, title } = node.attrs; return ["a", { href, title }, 0] }
    },
    em: { // emphasis, italic
        parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
        toDOM() { return emDOM }
    },
    strong: {
        parseDOM: [{ tag: "strong" }, { style: "font-weight", getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null }],
        toDOM() { return strongDOM }
    },
    code: {
        parseDOM: [{ tag: "code" }],
        toDOM() { return codeDOM }
    },
    del: {
        parseDOM: [{ tag: "del" }, { tag: "s" }, { style: "text-decoration=line-through" }],
        toDOM() { return delDOM }
    },
    ins: {
        parseDOM: [{ tag: "ins" }, { tag: "u" }, { style: "text-decoration=underline" }],
        toDOM() { return insDOM }
    },
    color: {
        attrs: { color: { default: "" } },
        parseDOM: [{
            tag: "span[color]",
            getAttrs(dom) {
                return { color: dom.style.color }
            }
        }],
        toDOM(node) {
            return ["span", { style: "color: " + node.attrs.color + ";", color: node.attrs.color }, 0]
        },
    },
    background: {
        attrs: { color: { default: "" } },
        parseDOM: [{
            tag: "span[background]",
            getAttrs(dom) {
                return { color: dom.style.background }
            }
        }],
        toDOM(node) {
            return ["span", { style: "background: " + node.attrs.color + ";", background: node.attrs.color }, 0]
        },
    },
}

export const schema = new Schema({ nodes, marks })