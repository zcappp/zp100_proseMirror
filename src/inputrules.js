import { inputRules, wrappingInputRule, textblockTypeInputRule, smartQuotes, emDash, ellipsis } from "prosemirror-inputrules"

// > blockquote引用
export function blockQuoteRule(nodeType) {
    return wrappingInputRule(/^\s*>\s$/, nodeType)
}

// 1. 有序列表   
export function orderedListRule(nodeType) {
    return wrappingInputRule(/^(\d+)\.\s$/, nodeType, match => ({ order: +match[1] }), (match, node) => node.childCount + node.attrs.order == +match[1])
}

// * 无序列表,  - 无序列表,  + 无序列表
export function bulletListRule(nodeType) {
    return wrappingInputRule(/^\s*([-+*])\s$/, nodeType)
}

// # 一级标题,  ## 二级标题,  ### 三级标题
export function headingRule(nodeType, maxLevel) {
    return textblockTypeInputRule(new RegExp("^(#{1," + maxLevel + "})\\s$"), nodeType, match => ({ level: match[1].length }))
}

export function buildInputRules(schema, props) {
    let rules = [
        emDash,
        ellipsis,
        blockQuoteRule(schema.nodes.blockquote),
        orderedListRule(schema.nodes.ordered_list),
        bulletListRule(schema.nodes.bullet_list),
        headingRule(schema.nodes.heading, 6),
    ].concat(smartQuotes)
    return inputRules({ rules })
}