import { wrapIn, setBlockType, chainCommands, toggleMark, exitCode, joinUp, joinDown, lift, selectParentNode } from "prosemirror-commands"
import { wrapInList, splitListItem, liftListItem, sinkListItem } from "prosemirror-schema-list"
import { undo, redo } from "prosemirror-history"
import { undoInputRule } from "prosemirror-inputrules"
import { aligh } from "./menufn"

const mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform) : false

export function buildKeymap(schema) {
    const { strong, em, del, code } = schema.marks
    const { blockquote, hr, list_item, paragraph, heading, bullet_list, ordered_list, hard_break } = schema.nodes
    let keys = {}

    function bind(key, cmd) {
        keys[key] = cmd
    }

    bind("Mod-z", undo)
    bind("Shift-Mod-z", redo)
    bind("Backspace", undoInputRule)
    if (!mac) bind("Mod-y", redo)

    bind("Alt-ArrowUp", joinUp)
    bind("Alt-ArrowDown", joinDown)
    bind("Mod-BracketLeft", lift)
    bind("Escape", selectParentNode)

    bind("Mod-b", toggleMark(strong))
    bind("Mod-B", toggleMark(strong))
    bind("Mod-i", toggleMark(em))
    bind("Mod-I", toggleMark(em))
    bind("Ctrl-Alt-x", toggleMark(del))
    bind("Mod-`", toggleMark(code))
    bind("Ctrl->", wrapIn(blockquote)) // Ctrl-Shift-> ?
    bind("Ctrl-Alt-q", wrapIn(blockquote))
    bind("Ctrl-Alt--", (state, dispatch) => {
        dispatch(state.tr.replaceSelectionWith(hr.create()).scrollIntoView())
        return true
    })
    bind("Enter", splitListItem(list_item))
    bind("Mod-[", liftListItem(list_item))
    bind("Mod-]", sinkListItem(list_item))
    bind("Ctrl-Alt-0", setBlockType(paragraph))
    for (let i = 1; i <= 6; i++) bind("Ctrl-Alt-" + i, setBlockType(heading, { level: i }))
    bind("Ctrl-Alt-8", wrapInList(bullet_list))
    bind("Ctrl-Alt-9", wrapInList(ordered_list))
    bind("Ctrl-Alt-l", aligh("left"))
    bind("Ctrl-Alt-r", aligh("right"))
    bind("Ctrl-Alt-c", aligh("center"))
    bind("Ctrl-Alt-j", aligh("justify"))

    let br = chainCommands(exitCode, (state, dispatch) => {
        dispatch(state.tr.replaceSelectionWith(hard_break.create()).scrollIntoView())
        return true
    })
    bind("Mod-Enter", br)
    bind("Shift-Enter", br)
    if (mac) bind("Ctrl-Enter", br)

    return keys
}