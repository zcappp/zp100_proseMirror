import { Fragment } from "prosemirror-model"
import { keymap } from "prosemirror-keymap"
import { tableEditing, columnResizing, tableNodes as tableNodes_, fixTables, addColumnAfter, addColumnBefore, deleteColumn, addRowAfter, addRowBefore, deleteRow, mergeCells, splitCell, setCellAttr, toggleHeaderRow, toggleHeaderColumn, toggleHeaderCell, goToNextCell, deleteTable } from "prosemirror-tables"
import { Dropdown, DropdownSubmenu, MenuItem, upload, toggleSpan, linkItem, markItem, wrapListItem } from "./menufn"

export const tableNodes = tableNodes_({
    tableGroup: "block",
    cellContent: "block+",
    cellAttributes: {
        background: {
            default: null,
            getFromDOM(dom) { return dom.style.backgroundColor || null },
            setDOMAttr(value, attrs) { if (value) attrs.style = (attrs.style || "") + `background-color: ${value};` }
        }
    }
})

export const tablePlugins = [
    columnResizing(),
    tableEditing(),
    keymap({
        "Tab": goToNextCell(1),
        "Shift-Tab": goToNextCell(-1)
    })
]

function tMenu(cmd, label) {
    return new MenuItem({ run: cmd, enable: cmd, label })
}

function insertTable(state, dispatch) {
    const tr = state.tr.replaceSelectionWith(
        state.schema.nodes.table.create(
            undefined,
            Fragment.fromArray([
                state.schema.nodes.table_row.create(undefined, Fragment.fromArray([state.schema.nodes.table_cell.createAndFill(), state.schema.nodes.table_cell.createAndFill()])),
                state.schema.nodes.table_row.create(undefined, Fragment.fromArray([state.schema.nodes.table_cell.createAndFill(), state.schema.nodes.table_cell.createAndFill()]))
            ])
        )
    )
    if (dispatch) dispatch(tr)
    return true
}

export const tableMenu = new Dropdown([
    new MenuItem({ run: insertTable, label: "插入表格" }),
    tMenu(deleteTable, "删除表格"),
    tMenu(addRowBefore, "上方插入行"),
    tMenu(addRowAfter, "下方插入行"),
    tMenu(addColumnBefore, "左边插入列"),
    tMenu(addColumnAfter, "右边插入列"),
    tMenu(deleteRow, "删除选中行"),
    tMenu(deleteColumn, "删除选中列"),
    tMenu(mergeCells, "合并单元格"),
    tMenu(splitCell, "拆分单元格"),
    tMenu(toggleHeaderColumn, "表头切换(列)"),
    tMenu(toggleHeaderRow, "表头切换(行)"),
    tMenu(toggleHeaderCell, "表头切换(单元格)"),
    // new MenuItem({ run: () => setCellAttr("background", "#dfd"), label: "单元格颜色" }),
], { title: "表格", svg: { width: 1024, height: 1024, path: "M928 64H96C42.98 64 0 106.98 0 160v704c0 53.02 42.98 96 96 96h832c53.02 0 96-42.98 96-96V160c0-53.02-42.98-96-96-96zM320 896H96c-17.674 0-32-14.326-32-32v-160h256v192z m0-256H64v-192h256v192z m0-256H64V192h256v192z m320 512H384v-192h256v192z m0-256H384v-192h256v192z m0-256H384V192h256v192z m320 320v160c0 17.674-14.326 32-32 32H704v-192h256z m0-64H704v-192h256v192z m0-256H704V192h256v192z" } })


document.execCommand("enableObjectResizing", false, false)
document.execCommand("enableInlineTableEditing", false, false)