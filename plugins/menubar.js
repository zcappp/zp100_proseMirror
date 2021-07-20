import { NodeSelection, EditorState } from "prosemirror-state"
import { undo, redo } from "prosemirror-history"
import { toggleMark, lift, joinUp, selectParentNode, wrapIn, setBlockType } from "prosemirror-commands"
import { Dropdown, MenuItem, ColorDropdown, upload, toggleSpan, linkItem, markItem, wrapListItem, aligh } from "./menufn"
import { openPrompt, TextField, SelectField } from "./prompt"
import { tableMenu } from "./table"
const CODEBLOCKS = ["html", "css", "javascript", "json", "jsx", "java", "sql", "swift", "php", "py", "go"]
const ALIGHS = { left: "左", center: "居中", right: "右", justify: "两端" }

export function buildMenuBar(schema, ref) {
    const { strong, em, del, ins, code, link, color, background } = schema.marks
    const { paragraph, div, image, video, iframe, bullet_list, ordered_list, blockquote, codeblock, heading, hr } = schema.nodes
    let codeblocks = CODEBLOCKS.map(a => new MenuItem({
        label: a,
        run: (state, dispatch, view) => {
            dispatch(state.tr.replaceSelectionWith(codeblock.create({ class: "language-" + a })))
            view.focus()
        }
    }))
    return [
        [
            new MenuItem({ run: undo, enable: state => undo(state), title: "撤销: Ctrl-Z", svg: svg("M280 321v103.124c0 9.04-10.517 14.168-17.528 8.501L71.146 281.501c-5.528-4.318-5.528-12.684 0-17.002l191.326-151.124c7.146-5.667 17.528-.54 17.528 8.5V225h333c189.986 0 344 154.014 344 344S802.986 913 613 913H458.728a8 8 0 01-8-8v-80a8 8 0 018-8H613c136.967 0 248-111.033 248-248 0-136.967-111.033-248-248-248H280z") }),
            new MenuItem({ run: redo, enable: state => redo(state), title: "重做: Ctrl-Shift-Z", svg: svg("M744 321v103.124c0 9.04 10.517 14.168 17.528 8.501l191.326-151.124c5.528-4.318 5.528-12.684 0-17.002L761.528 113.375c-7.146-5.667-17.528-.54-17.528 8.5V225H411C221.014 225 67 379.014 67 569s154.014 344 344 344h154.272a8 8 0 008-8v-80a8 8 0 00-8-8H411c-136.967 0-248-111.033-248-248 0-136.967 111.033-248 248-248h333z") }),
        ],
        [
            new Dropdown(headings(paragraph, heading), { label: "正文", title: "正文" }),
            new ColorDropdown({ title: "字体颜色", run: (state, dispatch, _color) => toggleSpan(color, { color: _color })(state, dispatch), ref, default: "#F5222D", svg: "M5.29102819,11.25 L3.96365715,11.25 C3.87952002,11.25 3.8113134,11.1817934 3.8113134,11.0976562 C3.8113134,11.08076 3.81412419,11.0639814 3.81963067,11.0480076 L7.0756112,1.60269506 C7.09679504,1.5412426 7.15463644,1.5 7.21963767,1.5 L8.81868806,1.5 C8.883726,1.5 8.94159158,1.54128846 8.96274706,1.60278951 L12.2118,11.048102 C12.239168,11.1276636 12.1968568,11.2143472 12.1172952,11.2417152 C12.1013495,11.2472004 12.0846037,11.25 12.067741,11.25 L10.6761419,11.25 C10.6099165,11.25 10.5512771,11.2072154 10.531066,11.1441494 L9.69970662,8.55 L6.27433466,8.55 L5.43599205,11.1444975 C5.41567115,11.2073865 5.35711879,11.25 5.29102819,11.25 Z M8.02635163,3.18571429 L7.96199183,3.18571429 L6.63904023,7.30714286 L9.33500105,7.30714286 L8.02635163,3.18571429 Z" }),
            new ColorDropdown({ title: "背景颜色", run: (state, dispatch, _color) => toggleSpan(background, { color: _color })(state, dispatch), ref, default: "#FADB14", svg: "M2.86079849,6.64817222 L2.05713835,5.84451208 C2.00832281,5.79569655 2.00832281,5.71655092 2.05713835,5.66773539 L3.61029491,4.11457882 L3.11963835,3.62392225 C3.07082281,3.57510672 3.07082281,3.49596109 3.11963835,3.44714556 L6.47839556,0.0883883476 C6.52721109,0.0395728112 6.60635672,0.0395728112 6.65517225,0.0883883476 L11.5165314,4.94974747 C11.5653469,4.998563 11.5653469,5.07770863 11.5165314,5.12652416 L8.15777416,8.48528137 C8.10895863,8.53409691 8.029813,8.53409691 7.98099747,8.48528137 L7.38889678,7.89318068 L5.83574021,9.44633725 C5.78692467,9.49515278 5.70777905,9.49515278 5.65896351,9.44633725 L5.0267407,8.81411444 L4.48856529,9.35326519 C4.39477378,9.44720966 4.26747335,9.5 4.13472392,9.5 L0.608857988,9.5 C0.470786801,9.5 0.358857988,9.38807119 0.358857988,9.25 C0.358857988,9.18363253 0.385247413,9.11998865 0.432210608,9.07309408 L2.86079849,6.64817222 Z M6.56678391,1.67937861 L4.71062861,3.53553391 L8.06938582,6.89429112 L9.92554112,5.03813582 L6.56678391,1.67937861 Z M3.64812861,5.75612373 L5.74735186,7.85534699 L6.54284699,7.05985186 L4.44362373,4.96062861 L3.64812861,5.75612373 Z" }),
            new Dropdown(images(ref, upload, image), { title: "图片", enable: state => canInsert(state, image), svg: { width: 1024, height: 1024, path: "M256 220.16c-71.68 0-128 51.2-128 117.76S184.32 455.68 256 455.68s128-51.2 128-117.76S327.68 220.16 256 220.16z m0 174.08c-35.84 0-61.44-25.6-61.44-56.32S220.16 276.48 256 276.48s61.44 25.6 61.44 56.32S291.84 394.24 256 394.24zM896 102.4h-768C56.32 102.4 0 148.48 0 204.8v614.4c0 56.32 56.32 102.4 128 102.4h768c71.68 0 128-46.08 128-102.4V204.8c0-56.32-56.32-102.4-128-102.4z m-768 762.88c-35.84 0-61.44-20.48-61.44-51.2v-20.48L317.44 614.4l322.56 250.88h-512z m834.56-51.2c0 25.6-30.72 51.2-61.44 51.2h-163.84l-235.52-189.44L768 460.8l194.56 148.48v204.8z m0-276.48l-194.56-153.6-317.44 250.88-133.12-102.4-256 184.32V209.92c0-25.6 30.72-51.2 61.44-51.2h768c35.84 0 61.44 20.48 61.44 51.2v327.68h10.24z" } }),
            new Dropdown(videos(ref, upload, video), { title: "视频", enable: state => canInsert(state, video), svg: { width: 1024, height: 1024, path: "M1002.666667 106.666667v810.666666H21.333333V106.666667h981.333334zM106.666667 832h810.666666V192H106.666667v640z m106.666666-234.666667v-170.666666H64v-85.333334h149.333333V128h85.333334v768h-85.333334V682.666667H64v-85.333334h149.333333z m235.306667 129.792V299.904L797.589333 513.493333 448.64 727.125333z m85.333333-274.944v122.666667l100.181334-61.333333-100.181334-61.333334z" } }),
            new Dropdown(codeblocks, { title: "代码块", enable: state => canInsert(state, codeblock), svg: svg("M516 673c0 4.4 3.4 8 7.5 8h185c4.1 0 7.5-3.6 7.5-8v-48c0-4.4-3.4-8-7.5-8h-185c-4.1 0-7.5 3.6-7.5 8v48zm-194.9 6.1l192-161c3.8-3.2 3.8-9.1 0-12.3l-192-160.9c-5.2-4.4-13.1-.7-13.1 6.1v62.7c0 2.4 1 4.6 2.9 6.1L420.7 512l-109.8 92.2c-1.8 1.5-2.9 3.8-2.9 6.1V673c0 6.8 7.9 10.5 13.1 6.1zM880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z") }),
            new Dropdown(alighItems(), { svg: svg("M153.6 187.733333h471.04v76.8H153.6V187.733333z m0 382.293334h471.04v76.8H153.6v-76.8z m0-191.146667h716.8v76.8H153.6v-76.8z m0 380.586667h716.8V836.266667H153.6v-76.8z") }),
            tableMenu
        ],
        [
            linkItem(link),
            markItem(strong, { title: "粗体", svg: svg("M328 446h224.68C609.742 446 656 401.554 656 346.727v-9.454C656 282.446 609.742 238 552.68 238H328v208zm369.815 35.426C754.606 519.186 792 583.508 792 656.508v10.984C792 783.752 697.155 878 580.158 878h-318.67C245.202 878 232 864.798 232 848.512V169.39c0-15.127 12.263-27.39 27.39-27.39h295.9C663.93 142 752 229.267 752 336.915v10.17c0 52.073-20.609 99.378-54.185 134.341zM328 542.671V781.33h251.134c63.78 0 115.485-50.997 115.485-113.905v-10.848c0-62.908-51.705-113.905-115.485-113.905H328z") }),
            markItem(em, { title: "斜体", svg: svg("M634.702 256L487.888 768H658a8 8 0 018 8v80a8 8 0 01-8 8H226a8 8 0 01-8-8v-80a8 8 0 018-8h162.02l146.813-512H366a8 8 0 01-8-8v-80a8 8 0 018-8h432a8 8 0 018 8v80a8 8 0 01-8 8H634.702z") }),
            markItem(del, { title: "删除线", svg: svg("M552.545 560H72a8 8 0 01-8-8v-80a8 8 0 018-8h220.18c-9.49-9.775-17.235-20.379-23.392-31.965-11.614-21.98-17.273-46.945-17.273-76.485 0-34.512 6.75-65.842 20.251-92.895 13.203-26.556 32.958-49.332 58.57-67.732C376.199 162.102 441.32 144 513.588 144c79.02 0 144.339 21.284 188.713 61.665 31.667 28.644 52.315 66.837 59.661 110.3.695 3.88 1.29 9.25 1.985 16.013v.995c0 5.57-4.566 10.145-10.125 10.145h-72.765c-4.765 0-9.034-3.382-9.927-8.156-1.49-7.758-2.978-13.725-4.269-17.803-6.452-20.489-17.173-38.193-31.766-52.614-28.69-28.346-70.978-42.768-125.775-42.768-48.047 0-88.45 11.14-116.841 32.126-28.788 21.284-43.977 52.017-43.977 89.016 0 36.8 17.075 64.649 52.216 85.137 24.62 14.223 55.492 24.169 106.815 34.214 3.064.607 5.847 1.15 8.89 1.73H952a8 8 0 018 8v80a8 8 0 01-8 8H752.908a138.547 138.547 0 0113.323 20.826C778.242 603.8 784 630.356 784 662.184c0 33.617-6.651 64.45-19.655 91.502-12.906 26.855-32.065 50.128-57.08 69.025C657.827 860.208 587.246 880 503.064 880c-78.423 0-144.735-18.4-191.79-53.21-40.402-29.938-64.227-69.92-70.68-118.755-.198-1.492-.396-3.382-.595-5.67v-.994c0-5.57 4.566-10.145 10.126-10.145h79.713c4.468 0 8.538 3.083 9.729 7.46.993 3.779 1.886 6.763 2.68 8.95 10.523 29.74 30.575 53.212 59.661 69.523 29.484 16.51 66.511 24.964 110.19 24.964 54.897 0 100.065-12.532 130.54-36.402 28.094-21.98 43.58-53.51 43.58-88.817 0-39.784-17.472-68.826-53.308-89.016-14.593-8.156-32.164-15.019-55.194-21.484-7.736-2.163-15.797-4.223-25.172-6.404z") }),
            markItem(ins, { title: "下划线", svg: svg("M200 800h624c4.4 0 8 4.32 8 9.6v76.8c0 5.28-3.6 9.6-8 9.6H200c-4.4 0-8-4.32-8-9.6v-76.8c0-5.28 3.6-9.6 8-9.6zm312-72c-69.4 0-134.7-27-183.8-76.2C279.1 602.6 252 537.4 252 468V156c0-6.6 5.4-12 12-12h60c6.6 0 12 5.4 12 12v312c0 97 79 176 176 176s176-79 176-176V156c0-6.6 5.4-12 12-12h60c6.6 0 12 5.4 12 12v312c0 69.4-27 134.7-76.2 183.8C646.6 700.9 581.4 728 512 728z") }),
            markItem(code, { title: "行内代码", svg: svg("M553.363 163.663l62.602 13.307q7.825 1.663 6.162 9.488L479.915 855.511q-1.663 7.825-9.488 6.162l-62.602-13.307q-7.825-1.663-6.162-9.488l142.212-669.053q1.663-7.825 9.488-6.162zM712 334.415v81.297a8 8 0 003.07 6.3L830.062 512 715.07 601.988a8 8 0 00-3.07 6.3v81.297a8 8 0 0012.93 6.301l218.96-171.284c6.96-5.444 8.189-15.5 2.744-22.46a16 16 0 00-2.744-2.744L724.93 328.114a8 8 0 00-12.93 6.301zm-400 0v81.297a8 8 0 01-3.07 6.3L193.938 512l114.992 89.988a8 8 0 013.07 6.3v81.297a8 8 0 01-12.93 6.301L80.11 524.602c-6.96-5.444-8.189-15.5-2.744-22.46a16 16 0 012.744-2.744l218.96-171.284a8 8 0 0112.93 6.301z") }),
        ],
        [
            wrapListItem(bullet_list, { title: "无序列表", enable: true, svg: svg("M360 160h560a8 8 0 018 8v80a8 8 0 01-8 8H360a8 8 0 01-8-8v-80a8 8 0 018-8zm0 304h560a8 8 0 018 8v80a8 8 0 01-8 8H360a8 8 0 01-8-8v-80a8 8 0 018-8zm0 304h560a8 8 0 018 8v80a8 8 0 01-8 8H360a8 8 0 01-8-8v-80a8 8 0 018-8zM96 208a80 80 0 10160 0 80 80 0 10-160 0zM96 512a80 80 0 10160 0 80 80 0 10-160 0zM96 816a80 80 0 10160 0 80 80 0 10-160 0z") }),
            wrapListItem(ordered_list, { title: "有序列表", enable: true, svg: svg("M359.68 764h560.64c4.224 0 7.68 4.8 7.68 10.667v74.666c0 5.867-3.456 10.667-7.68 10.667H359.68c-4.224 0-7.68-4.8-7.68-10.667v-74.666c0-5.867 3.456-10.667 7.68-10.667zm0-600h560.64c4.224 0 7.68 4.8 7.68 10.667v74.666c0 5.867-3.456 10.667-7.68 10.667H359.68c-4.224 0-7.68-4.8-7.68-10.667v-74.666c0-5.867 3.456-10.667 7.68-10.667zm0 300h560.64c4.224 0 7.68 4.8 7.68 10.667v74.666c0 5.867-3.456 10.667-7.68 10.667H359.68c-4.224 0-7.68-4.8-7.68-10.667v-74.666c0-5.867 3.456-10.667 7.68-10.667zM172.384 728H99.968c-2.182 0-3.968 1.8-3.968 4v34c0 2.2 1.786 4 3.968 4h72.416v20.5h-35.712c-2.182 0-3.968 1.8-3.968 4v34c0 2.2 1.786 4 3.968 4h35.712V854H99.968c-2.182 0-3.968 1.8-3.968 4v34c0 2.2 1.786 4 3.968 4h116.064c2.182 0 3.968-1.8 3.968-4V732c0-2.2-1.786-4-3.968-4h-43.648zM142 296h40c2.2 0 4-1.8 4-4V136a8 8 0 00-8-8h-78c-2.2 0-4 1.8-4 4v36c0 2.2 1.8 4 4 4h38v120c0 2.2 1.8 4 4 4zm74.032 256h-68.448l70.333-77.7c1.29-1.5 2.083-3.4 2.083-5.4V432c0-2.2-1.786-4-3.968-4H99.968c-2.182 0-3.968 1.8-3.968 4v36c0 2.2 1.786 4 3.968 4h68.448l-70.333 77.7c-1.29 1.5-2.083 3.4-2.083 5.4V592c0 2.2 1.786 4 3.968 4h116.064c2.182 0 3.968-1.8 3.968-4v-36c0-2.2-1.786-4-3.968-4z") }),
            wrapItem(blockquote, { title: "引用", svg: svg("M412 205.133c-4.348.158-7.873.343-10.556.554C254.344 217.24 140 340.351 140 488.805v279.04c0 28.72 23.281 52 52 52h168c28.719 0 52-23.28 52-52v-168c0-28.718-23.281-52-52-52H244v-59.04c0-89.924 66.33-165.709 154.528-178.21 3.508-.497 7.982-.907 13.472-1.24V205.132zm472 0c-4.348.158-7.873.343-10.556.554C726.344 217.24 612 340.351 612 488.805v279.04c0 28.72 23.281 52 52 52h168c28.719 0 52-23.28 52-52v-168c0-28.718-23.281-52-52-52H716v-59.04c0-89.924 66.33-165.709 154.528-178.21 3.508-.497 7.982-.907 13.472-1.24V205.132z") }),
            new MenuItem({ title: "插入分隔线", run(state, dispatch) { dispatch(state.tr.replaceSelectionWith(hr.create())) }, enable(state) { return canInsert(state, hr) }, svg: svg("M912 472v80a8 8 0 01-8 8H120a8 8 0 01-8-8v-80a8 8 0 018-8h784a8 8 0 018 8z") }),
            new MenuItem({ title: "全屏", run: (state, dispatch, view, e) => { e.currentTarget.parentNode.parentNode.classList.toggle("fullscreen") }, svg: svg("M78.769231 367.497846h72.270769V151.000615H367.064615V78.769231H78.769231v288.728615zM656.108308 78.769231v72.231384h216.851692v216.497231H945.230769V78.769231h-289.122461z m216.851692 794.230154H656.147692V945.230769H945.230769v-288.728615h-72.270769v216.497231z m-721.92-216.497231H78.769231V945.230769h288.295384v-72.231384H151.079385v-216.497231z") }),
            new MenuItem({ title: "退出全屏", run: (state, dispatch, view, e) => { e.currentTarget.parentNode.parentNode.classList.toggle("fullscreen") }, svg: svg("M319.509333 640a64 64 0 0 1 64 64v192h-64v-192h-192v-64h192z m576.981334 0v64h-192v192h-64v-192a64 64 0 0 1 64-64h192zM383.509333 128v192a64 64 0 0 1-64 64h-192v-64h192V128h64z m320.981334 0v192h192v64h-192a64 64 0 0 1-64-64V128h64z") }),
        ],
    ]
}

function svg(path) {
    return { width: 1024, height: 1024, path }
}

function canInsert(state, type) {
    let $from = state.selection.$from
    for (let d = $from.depth; d >= 0; d--) {
        let index = $from.index(d)
        if ($from.node(d).canReplaceWith(index, index, type)) return true
    }
    return false
}

function wrapItem(type, O) {
    let o = {
        run(state, dispatch) {
            return wrapIn(type, O.attrs)(state, dispatch)
        },
        select(state) {
            return wrapIn(type, O.attrs instanceof Function ? null : O.attrs)(state)
        }
    }
    for (let prop in O) o[prop] = O[prop]
    return new MenuItem(o)
}

function headings(paragraph, heading) {
    let arr = [new MenuItem({
        run: (state, dispatch) => setBlockType(paragraph, {})(state, dispatch),
        label: "正文"
    })]
    for (let i = 1; i <= 6; i++) arr.push(new MenuItem({
        run: (state, dispatch) => setBlockType(heading, { level: i })(state, dispatch),
        label: "H" + i
    }))
    return arr
}

function alighItems() {
    return Object.keys(ALIGHS).map(a =>
        new MenuItem({
            run: aligh(a),
            label: ALIGHS[a] + "对齐",
            attrs: { style: "text-align: " + a + ";" }
        }))
}

const images = (ref, upload, image) => {
    return [
        new MenuItem({
            label: "图库",
            run: (state, dispatch, view) => {
                document.querySelector("#" + ref.id + "_0 > a").click()
                ref.insertImage = url => {
                    dispatch(state.tr.replaceSelectionWith(image.createAndFill({ src: url })))
                    view.focus()
                }
            }
        }),
        new MenuItem({ label: "上传", run: upload(ref, image, true) }),
        new MenuItem({
            label: "插入",
            run: (state, dispatch, view) => openPrompt({
                title: "插入图片",
                fields: { src: new TextField({ label: "URL", required: true }) },
                cb(O) {
                    dispatch(state.tr.replaceSelectionWith(image.create(O)))
                    view.focus()
                }
            })
        })
    ]
}

const videos = (ref, upload, video) => {
    return [
        new MenuItem({
            label: "视频库",
            run: (state, dispatch, view) => {
                document.querySelector("#" + ref.id + "_1 > a").click()
                ref.insertVideo = url => {
                    dispatch(state.tr.replaceSelectionWith(video.createAndFill({ src: url })))
                    view.focus()
                }
            }
        }),
        new MenuItem({ label: "上传", run: upload(ref, video) }),
        new MenuItem({
            label: "插入",
            run: (state, dispatch, view) => openPrompt({
                title: "插入视频",
                fields: { src: new TextField({ label: "URL", required: true }) },
                cb(O) {
                    dispatch(state.tr.replaceSelectionWith(video.create(O)))
                    view.focus()
                }
            })
        })
    ]
}


/*
 new MenuItem({
     run: (state, dispatch, view) => {
         let node = state.schema.nodeFromJSON({ "type": "heading", "attrs": { "level": 5 }, "content": [{ "type": "text", "text": "插入" }] })
         dispatch(state.tr.insert(state.selection.$anchor.pos, node))
     },
     label: "插入"
 }),

const setStyle = (k, v) => {
    return (state, dispatch, view) => {
        let attrs = { ...state.selection.node.attrs }
        attrs.style += " float:left;"
        dispatch(state.tr.setNodeMarkup(state.selection.$anchor.pos, null, attrs))
    }
}

function isImg(state) {
    return state.selection.node && state.selection.node.type.name === "image"
}

*/