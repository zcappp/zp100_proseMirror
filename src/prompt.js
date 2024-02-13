export function openPrompt(O) {
    let wrapper = document.body.appendChild(document.createElement("div"))
    wrapper.className = "PMprompt"

    let mouseOutside = e => { if (!wrapper.contains(e.target)) close() }
    setTimeout(() => window.addEventListener("mousedown", mouseOutside), 50)
    let close = () => {
        window.removeEventListener("mousedown", mouseOutside)
        if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper)
    }

    let form = wrapper.appendChild(document.createElement("form"))
    if (O.title) form.appendChild(document.createElement("h3")).textContent = O.title

    let domFields = []
    for (let name in O.fields) {
        let label = document.createElement("label")
        label.appendChild(document.createElement("span")).textContent = name
        let field = label.appendChild(O.fields[name].render())
        domFields.push(field)
        form.appendChild(document.createElement("div")).appendChild(label)
    }

    let submitBtn = document.createElement("button")
    submitBtn.type = "submit"
    submitBtn.className = "zbtn zprimary"
    submitBtn.textContent = "确定"
    let cancelBtn = document.createElement("button")
    cancelBtn.type = "button"
    cancelBtn.className = "zbtn"
    cancelBtn.textContent = "取消"
    cancelBtn.addEventListener("click", close)

    let zbtns = form.appendChild(document.createElement("div"))
    zbtns.className = "zbtns"
    zbtns.appendChild(cancelBtn)
    zbtns.appendChild(document.createTextNode(" "))
    zbtns.appendChild(submitBtn)

    let box = wrapper.getBoundingClientRect()
    wrapper.style.top = ((window.innerHeight - box.height) / 2) + "px"
    wrapper.style.left = ((window.innerWidth - box.width) / 2) + "px"

    let submit = () => {
        let params = getValues(O.fields, domFields)
        if (params) {
            close()
            O.cb(params)
        }
    }
    form.addEventListener("submit", e => {
        e.preventDefault()
        submit()
    })
    form.addEventListener("keydown", e => {
        if (e.keyCode == 27) {
            e.preventDefault()
            close()
        } else if (e.keyCode == 13 && !(e.ctrlKey || e.metaKey || e.shiftKey)) {
            e.preventDefault()
            submit()
        } else if (e.keyCode == 9) {
            window.setTimeout(() => {
                if (!wrapper.contains(document.activeElement)) close()
            }, 500)
        }
    })
    let input = form.elements[0]
    if (input) input.focus()
}

function getValues(fields, domFields) {
    let result = Object.create(null),
        i = 0
    for (let name in fields) {
        let field = fields[name],
            dom = domFields[i++]
        let value = field.read(dom),
            bad = field.validate(value)
        if (bad) {
            reportInvalid(dom, bad)
            return null
        }
        result[name] = field.clean(value)
    }
    return result
}

function reportInvalid(dom, message) {
    let parent = dom.parentNode
    let msg = parent.appendChild(document.createElement("div"))
    msg.style.left = (dom.offsetLeft + dom.offsetWidth + 2) + "px"
    msg.style.top = (dom.offsetTop - 5) + "px"
    msg.className = "PMinvalid"
    msg.textContent = message
    setTimeout(() => parent.removeChild(msg), 1500)
}

export class Field {
    // value: The starting value for the field.
    // label: The label for the field.
    // required: Whether the field is required.
    // validate: A function to validate the given value. Should return an error message if it is not valid.
    constructor(O) { this.O = O }
    // render:: (state: EditorState, props: Object) → dom.Node,  Render the field to the DOM. Should be implemented by all subclasses.
    read(dom) { return dom.value } // Read the field's value from its DOM node.
    validateType(_value) {} // A field-type-specific validation function.
    validate(value) {
        if (!value && this.O.required) return "Required field"
        return this.validateType(value) || (this.O.validate && this.O.validate(value))
    }
    clean(value) {
        return this.O.clean ? this.O.clean(value) : value
    }
}

export class TextField extends Field {
    render() {
        let n = document.createElement("input")
        n.type = "text"
        n.className = "zinput"
        if (this.O.label) n.placeholder = this.O.label
        n.value = this.O.value || ""
        n.autocomplete = "off"
        return n
    }
}

export class SelectField extends Field {
    render() {
        let n = document.createElement("select")
        n.className = "zinput"
        this.O.arr.forEach(o => { // { label: string, value: string }
            let opt = n.appendChild(document.createElement("option"))
            opt.value = o.value
            opt.selected = o.value == this.O.value
            opt.label = o.label
        })
        return n
    }
}