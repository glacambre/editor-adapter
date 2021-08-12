export class AbstractEditor {
}
export class AceEditor extends AbstractEditor {
    constructor(e) {
        super();
        // This function will be stringified and inserted in page context so we
        // can't instrument it.
        /* istanbul ignore next */
        this.getAce = (selec) => {
            const elem = document.querySelector(selec);
            const win_ace = window.ace;
            if (win_ace !== undefined) {
                return win_ace.edit(elem);
            }
            else if (Object.prototype.hasOwnProperty.call(elem, 'aceEditor')) {
                return elem.aceEditor;
            }
            else {
                throw new Error("Couldn't find AceEditor instance");
            }
        };
        this.elem = e;
        // Get the topmost ace element
        let parent = this.elem.parentElement;
        while (AceEditor.matches(parent)) {
            this.elem = parent;
            parent = parent.parentElement;
        }
    }
    static matches(e) {
        let parent = e;
        for (let i = 0; i < 3; ++i) {
            if (parent !== undefined && parent !== null) {
                if ((/ace_editor/gi).test(parent.className)) {
                    return true;
                }
                parent = parent.parentElement;
            }
        }
        return false;
    }
    getContent() {
        return executeInPage(`(${ /* istanbul ignore next */(getAce, selec) => {
            return getAce(selec).getValue();
        }})(${this.getAce}, ${JSON.stringify(computeSelector(this.elem))})`);
    }
    getCursor() {
        return executeInPage(`(${ /* istanbul ignore next */(getAce, selec) => {
            let position;
            const ace = getAce(selec);
            if (ace.getCursorPosition !== undefined) {
                position = ace.getCursorPosition();
            }
            else {
                position = ace.selection.cursor;
            }
            return [position.row + 1, position.column];
        }})(${this.getAce}, ${JSON.stringify(computeSelector(this.elem))})`);
    }
    getElement() {
        return this.elem;
    }
    getLanguage() {
        return executeInPage(`(${ /* istanbul ignore next */(getAce, selec) => {
            const ace = getAce(selec);
            return ace.session.$modeId.split("/").slice(-1)[0];
        }})(${this.getAce}, ${JSON.stringify(computeSelector(this.elem))})`);
    }
    setContent(text) {
        return executeInPage(`(${ /* istanbul ignore next */(getAce, selec, str) => {
            return getAce(selec).setValue(str, 1);
        }})(${this.getAce}, ${JSON.stringify(computeSelector(this.elem))}, ${JSON.stringify(text)})`);
    }
    setCursor(line, column) {
        return executeInPage(`(${ /* istanbul ignore next */(getAce, selec, l, c) => {
            const selection = getAce(selec).getSelection();
            return selection.moveCursorTo(l - 1, c, false);
        }})(${this.getAce}, ${JSON.stringify(computeSelector(this.elem))}, ${line}, ${column})`);
    }
}
export class CodeMirrorEditor extends AbstractEditor {
    constructor(e) {
        super();
        this.elem = e;
        // Get the topmost ace element
        let parent = this.elem.parentElement;
        while (CodeMirrorEditor.matches(parent)) {
            this.elem = parent;
            parent = parent.parentElement;
        }
    }
    static matches(e) {
        let parent = e;
        for (let i = 0; i < 3; ++i) {
            if (parent !== undefined && parent !== null) {
                if ((/^(.* )?CodeMirror/gi).test(parent.className)) {
                    return true;
                }
                parent = parent.parentElement;
            }
        }
        return false;
    }
    getContent() {
        return executeInPage(`(${ /* istanbul ignore next */(selec) => {
            const elem = document.querySelector(selec);
            return elem.CodeMirror.getValue();
        }})(${JSON.stringify(computeSelector(this.elem))})`);
    }
    getCursor() {
        return executeInPage(`(${ /* istanbul ignore next */(selec) => {
            const elem = document.querySelector(selec);
            const position = elem.CodeMirror.getCursor();
            return [position.line + 1, position.ch];
        }})(${JSON.stringify(computeSelector(this.elem))})`);
    }
    getElement() {
        return this.elem;
    }
    getLanguage() {
        return executeInPage(`(${ /* istanbul ignore next */(selec) => {
            const elem = document.querySelector(selec);
            return elem.CodeMirror.getMode().name;
        }})(${JSON.stringify(computeSelector(this.elem))})`);
    }
    setContent(text) {
        return executeInPage(`(${ /* istanbul ignore next */(selec, str) => {
            const elem = document.querySelector(selec);
            return elem.CodeMirror.setValue(str);
        }})(${JSON.stringify(computeSelector(this.elem))}, ${JSON.stringify(text)})`);
    }
    setCursor(line, column) {
        return executeInPage(`(${ /* istanbul ignore next */(selec, l, c) => {
            const elem = document.querySelector(selec);
            return elem.CodeMirror.getCursor(l - 1, c);
        }})(${JSON.stringify(computeSelector(this.elem))}, ${line}, ${column})`);
    }
}
export class MonacoEditor extends AbstractEditor {
    constructor(e) {
        super();
        this.elem = e;
        // Find the monaco element that holds the data
        let parent = this.elem.parentElement;
        while (!(this.elem.className.match(/monaco-editor/gi)
            && this.elem.getAttribute("data-uri").match("file://|inmemory://|gitlab:"))) {
            this.elem = parent;
            parent = parent.parentElement;
        }
    }
    static matches(e) {
        let parent = e;
        for (let i = 0; i < 4; ++i) {
            if (parent !== undefined && parent !== null) {
                if ((/monaco-editor/gi).test(parent.className)) {
                    return true;
                }
                parent = parent.parentElement;
            }
        }
        return false;
    }
    getContent() {
        return executeInPage(`(${ /* istanbul ignore next */(selec) => {
            const elem = document.querySelector(selec);
            const uri = elem.getAttribute("data-uri");
            const model = window.monaco.editor.getModel(uri);
            return model.getValue();
        }})(${JSON.stringify(computeSelector(this.elem))})`);
    }
    // It's impossible to get Monaco's cursor position:
    // https://github.com/Microsoft/monaco-editor/issues/258
    getCursor() {
        return Promise.resolve([1, 0]);
    }
    getElement() {
        return this.elem;
    }
    getLanguage() {
        return executeInPage(`(${ /* istanbul ignore next */(selec) => {
            const elem = document.querySelector(selec);
            const uri = elem.getAttribute("data-uri");
            const model = window.monaco.editor.getModel(uri);
            return model.getModeId();
        }})(${JSON.stringify(computeSelector(this.elem))})`);
    }
    setContent(text) {
        return executeInPage(`(${ /* istanbul ignore next */(selec, str) => {
            const elem = document.querySelector(selec);
            const uri = elem.getAttribute("data-uri");
            const model = window.monaco.editor.getModel(uri);
            return model.setValue(str);
        }})(${JSON.stringify(computeSelector(this.elem))}, ${JSON.stringify(text)})`);
    }
    // It's impossible to set Monaco's cursor position:
    // https://github.com/Microsoft/monaco-editor/issues/258
    setCursor(_line, _column) {
        return Promise.resolve();
    }
}
// TextareaEditor sort of works for contentEditable elements but there should
// really be a contenteditable-specific editor.
export class TextareaEditor extends AbstractEditor {
    constructor(e, preferHTML = false) {
        super();
        this.preferHTML = preferHTML;
        this.elem = e;
    }
    getContent() {
        if (this.elem.value !== undefined) {
            return Promise.resolve(this.elem.value);
        }
        if (this.preferHTML) {
            return Promise.resolve(this.elem.innerHTML);
        }
        else {
            return Promise.resolve(this.elem.innerText);
        }
    }
    getCursor() {
        return this.getContent().then(text => {
            let line = 1;
            let column = 0;
            const selectionStart = this.elem.selectionStart !== undefined
                ? this.elem.selectionStart
                : 0;
            // Sift through the text, counting columns and new lines
            for (let cursor = 0; cursor < selectionStart; ++cursor) {
                column += text.charCodeAt(cursor) < 0x7F ? 1 : 2;
                if (text[cursor] === "\n") {
                    line += 1;
                    column = 0;
                }
            }
            return [line, column];
        });
    }
    getElement() {
        return this.elem;
    }
    getLanguage() {
        if (this.preferHTML) {
            return Promise.resolve('html');
        }
        return Promise.resolve(undefined);
    }
    setContent(text) {
        if (this.elem.value !== undefined) {
            this.elem.value = text;
        }
        else {
            if (this.preferHTML) {
                this.elem.innerHTML = text;
            }
            else {
                this.elem.innerText = text;
            }
        }
        return Promise.resolve();
    }
    setCursor(line, column) {
        return this.getContent().then(text => {
            let character = 0;
            // Try to find the line the cursor should be put on
            while (line > 1 && character < text.length) {
                if (text[character] === "\n") {
                    line -= 1;
                }
                character += 1;
            }
            // Try to find the character after which the cursor should be moved
            // Note: we don't do column = columnn + character because column
            // might be larger than actual line length and it's better to be on
            // the right line but on the wrong column than on the wrong line
            // and wrong column.
            // Moreover, column is a number of UTF-8 bytes from the beginning
            // of the line to the cursor. However, javascript uses UTF-16,
            // which is 2 bytes per non-ascii character. So when we find a
            // character that is more than 1 byte long, we have to remove that
            // amount from column, but only two characters from CHARACTER!
            while (column > 0 && character < text.length) {
                // Can't happen, but better be safe than sorry
                /* istanbul ignore next */
                if (text[character] === "\n") {
                    break;
                }
                const code = text.charCodeAt(character);
                if (code <= 0x7f) {
                    column -= 1;
                }
                else if (code <= 0x7ff) {
                    column -= 2;
                }
                else if (code >= 0xd800 && code <= 0xdfff) {
                    column -= 4;
                    character++;
                }
                else if (code < 0xffff) {
                    column -= 3;
                }
                else {
                    column -= 4;
                }
                character += 1;
            }
            if (this.elem.setSelectionRange !== undefined) {
                this.elem.setSelectionRange(character, character);
            }
        });
    }
}
export function getEditor(elem, { preferHTML }) {
    switch (true) {
        case AceEditor.matches(elem): return new AceEditor(elem);
        case CodeMirrorEditor.matches(elem): return new CodeMirrorEditor(elem);
        case MonacoEditor.matches(elem): return new MonacoEditor(elem);
        default: return new TextareaEditor(elem, preferHTML);
    }
}
// Computes a unique selector for its argument.
export function computeSelector(element) {
    function uniqueSelector(e) {
        // Only matching alphanumeric selectors because others chars might have special meaning in CSS
        if (e.id && e.id.match("^[a-zA-Z0-9_-]+$")) {
            const id = e.tagName + `[id="${e.id}"]`;
            if (document.querySelectorAll(id).length === 1) {
                return id;
            }
        }
        // If we reached the top of the document
        if (!e.parentElement) {
            return "HTML";
        }
        // Compute the position of the element
        const index = Array.from(e.parentElement.children)
            .filter(child => child.tagName === e.tagName)
            .indexOf(e) + 1;
        return `${uniqueSelector(e.parentElement)} > ${e.tagName}:nth-of-type(${index})`;
    }
    return uniqueSelector(element);
}
// Runs CODE in the page's context by setting up a custom event listener,
// embedding a script element that runs the piece of code and emits its result
// as an event.
export function executeInPage(code) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        const eventId = `${Math.random()}`;
        script.innerHTML = `(async (evId) => {
            try {
                let result;
                result = await ${code};
                window.dispatchEvent(new CustomEvent(evId, {
                    detail: {
                        success: true,
                        result,
                    }
                }));
            } catch (e) {
                window.dispatchEvent(new CustomEvent(evId, {
                    detail: { success: false, reason: e },
                }));
            }
        })(${JSON.stringify(eventId)})`;
        window.addEventListener(eventId, ({ detail }) => {
            script.parentNode.removeChild(script);
            if (detail.success) {
                return resolve(detail.result);
            }
            return reject(detail.reason);
        }, { once: true });
        document.head.appendChild(script);
    });
}
