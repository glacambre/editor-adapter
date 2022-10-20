export class GenericAbstractEditor {
    constructor(_e, _options) { }
    ;
    static matches(_) {
        throw new Error("Matches function not overriden");
    }
    ;
}
/* istanbul ignore next */
export class AceEditor extends GenericAbstractEditor {
    constructor(e, _options) {
        super(e, _options);
        // This function will be stringified and inserted in page context so we
        // can't instrument it.
        /* istanbul ignore next */
        this.getAce = (selec) => {
        };
        this.getContent = async (selector, wrap, unwrap) => {
            const elem = document.querySelector(selector);
            const ace = elem.aceEditor || unwrap(window).ace.edit(elem);
            return wrap(ace.getValue());
        };
        this.getCursor = async (selector, wrap, unwrap) => {
            let position;
            const elem = document.querySelector(selector);
            const ace = elem.aceEditor || unwrap(window).ace.edit(elem);
            if (ace.getCursorPosition !== undefined) {
                position = ace.getCursorPosition();
            }
            else {
                position = ace.selection.cursor;
            }
            return [wrap(position.row) + 1, wrap(position.column)];
        };
        this.getElement = () => {
            return this.elem;
        };
        this.getLanguage = async (selector, wrap, unwrap) => {
            const elem = document.querySelector(selector);
            const ace = elem.aceEditor || unwrap(window).ace.edit(elem);
            return wrap(ace.session.$modeId).split("/").slice(-1)[0];
        };
        this.setContent = async (selector, wrap, unwrap, text) => {
            const elem = document.querySelector(selector);
            const ace = elem.aceEditor || unwrap(window).ace.edit(elem);
            return wrap(ace.setValue(text, 1));
        };
        this.setCursor = async (selector, wrap, unwrap, line, column) => {
            const elem = document.querySelector(selector);
            const ace = elem.aceEditor || unwrap(window).ace.edit(elem);
            const selection = ace.getSelection();
            return wrap(selection.moveCursorTo(line - 1, column, false));
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
}
/* istanbul ignore next */
export class CodeMirror6Editor extends GenericAbstractEditor {
    constructor(e, options) {
        super(e, options);
        this.getContent = async (selector, wrap, unwrap) => {
            const elem = document.querySelector(selector);
            return wrap(unwrap(elem).cmView.view.state.doc.toString());
        };
        this.getCursor = async (selector, wrap, unwrap) => {
            const elem = document.querySelector(selector);
            const position = unwrap(elem).cmView.view.state.selection.main.head;
            return [wrap(position.line), wrap(position.ch)];
        };
        this.getElement = () => {
            return this.elem;
        };
        this.getLanguage = async (selector, wrap, unwrap) => {
            return Promise.resolve(undefined);
        };
        this.setContent = async (selector, wrap, unwrap, text) => {
            const elem = unwrap(document.querySelector(selector));
            let length = elem.cmView.view.state.doc.length;
            return wrap(elem.cmView.view.dispatch({ changes: { from: 0, to: length, insert: text } }));
        };
        this.setCursor = async (selector, wrap, unwrap, line, column) => {
            const elem = unwrap(document.querySelector(selector));
            return wrap(elem.vmView.view.dispatch({
                selection: {
                    anchor: elem.cmView.view.doc.line(line) + column
                }
            }));
        };
        this.elem = e;
        // Get the topmost CodeMirror element
        let parent = this.elem.parentElement;
        while (CodeMirror6Editor.matches(parent)) {
            this.elem = parent;
            parent = parent.parentElement;
        }
    }
    static matches(e) {
        let parent = e;
        for (let i = 0; i < 3; ++i) {
            if (parent !== undefined && parent !== null) {
                if ((/^(.* )?cm-content/gi).test(parent.className)) {
                    return true;
                }
                parent = parent.parentElement;
            }
        }
        return false;
    }
}
/* istanbul ignore next */
export class CodeMirrorEditor extends GenericAbstractEditor {
    constructor(e, options) {
        super(e, options);
        this.getContent = async (selector, wrap, unwrap) => {
            const elem = document.querySelector(selector);
            return wrap(unwrap(elem).CodeMirror.getValue());
        };
        this.getCursor = async (selector, wrap, unwrap) => {
            const elem = document.querySelector(selector);
            const position = unwrap(elem).CodeMirror.getCursor();
            return [wrap(position.line) + 1, wrap(position.ch)];
        };
        this.getElement = () => {
            return this.elem;
        };
        this.getLanguage = async (selector, wrap, unwrap) => {
            const elem = document.querySelector(selector);
            return wrap(unwrap(elem).CodeMirror.getMode().name);
        };
        this.setContent = async (selector, wrap, unwrap, text) => {
            const elem = document.querySelector(selector);
            return wrap(unwrap(elem).CodeMirror.setValue(text));
        };
        this.setCursor = async (selector, wrap, unwrap, line, column) => {
            const elem = document.querySelector(selector);
            return wrap(unwrap(elem).CodeMirror.setCursor({ line: line - 1, ch: column }));
        };
        this.elem = e;
        // Get the topmost CodeMirror element
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
}
/* istanbul ignore next */
export class MonacoEditor extends GenericAbstractEditor {
    constructor(e, options) {
        super(e, options);
        this.getContent = async (selector, wrap, unwrap) => {
            const elem = document.querySelector(selector);
            const uri = elem.getAttribute("data-uri");
            const model = unwrap(window).monaco.editor.getModel(uri);
            return wrap(model.getValue());
        };
        // It's impossible to get Monaco's cursor position:
        // https://github.com/Microsoft/monaco-editor/issues/258
        this.getCursor = async (selector, wrap, unwrap) => {
            return [1, 0];
        };
        this.getElement = () => {
            return this.elem;
        };
        this.getLanguage = async (selector, wrap, unwrap) => {
            const elem = document.querySelector(selector);
            const uri = elem.getAttribute("data-uri");
            const model = unwrap(window).monaco.editor.getModel(uri);
            return wrap(model.getModeId());
        };
        this.setContent = async (selector, wrap, unwrap, text) => {
            const elem = document.querySelector(selector);
            const uri = elem.getAttribute("data-uri");
            const model = unwrap(window).monaco.editor.getModel(uri);
            return wrap(model.setValue(text));
        };
        // It's impossible to set Monaco's cursor position:
        // https://github.com/Microsoft/monaco-editor/issues/258
        this.setCursor = async (_selector, _wrap, _unwrap, _line, _column) => {
            return undefined;
        };
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
}
// TextareaEditor sort of works for contentEditable elements but there should
// really be a contenteditable-specific editor.
/* istanbul ignore next */
export class TextareaEditor {
    constructor(e, options) {
        this.getContent = async () => {
            if (this.elem.value !== undefined) {
                return Promise.resolve(this.elem.value);
            }
            if (this.options.preferHTML) {
                return Promise.resolve(this.elem.innerHTML);
            }
            else {
                return Promise.resolve(this.elem.innerText);
            }
        };
        this.getCursor = async () => {
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
        };
        this.getElement = () => {
            return this.elem;
        };
        this.getLanguage = async () => {
            if (this.options.preferHTML) {
                return Promise.resolve('html');
            }
            return Promise.resolve(undefined);
        };
        this.setContent = async (text) => {
            if (this.elem.value !== undefined) {
                this.elem.value = text;
            }
            else {
                if (this.options.preferHTML) {
                    this.elem.innerHTML = text;
                }
                else {
                    this.elem.innerText = text;
                }
            }
            return Promise.resolve();
        };
        this.setCursor = async (line, column) => {
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
                return undefined;
            });
        };
        this.options = options;
        this.elem = e;
    }
    static matches(_) {
        return true;
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
/* istanbul ignore next */
export function executeInPage(code) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        const eventId = `${Math.random()}`;
        script.innerHTML = `(async (evId) => {
            try {
                let unwrap = x => x;
                let wrap = x => x;
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
export function unwrap(x) {
    if (window.wrappedJSObject) {
        return x.wrappedJSObject;
    }
    return x;
}
export function wrap(x) {
    if (window.XPCNativeWrapper) {
        return window.XPCNativeWrapper(x);
    }
    return x;
}
;
/* WARNING: codeMirror6 only works in chrome based browsers for now. Leave it
 * to false or undefined in Firefox. */
export function getEditor(elem, options) {
    let editor;
    let classes = [AceEditor, CodeMirrorEditor, MonacoEditor];
    if (options.codeMirror6Enabled) {
        classes.push(CodeMirror6Editor);
    }
    for (let clazz of classes) {
        if (clazz.matches(elem)) {
            editor = clazz;
            break;
        }
    }
    if (editor === undefined) {
        return new TextareaEditor(elem, options);
    }
    let ed = new editor(elem, options);
    let result;
    if (window.wrappedJSObject) {
        result = new Proxy(ed, {
            get: (target, prop) => (...args) => {
                return target[prop](computeSelector(target.getElement()), wrap, unwrap, ...args);
            }
        });
    }
    else {
        result = new Proxy(ed, {
            get: (target, prop) => {
                if (prop === "getElement") {
                    return target[prop];
                }
                return (...args) => {
                    /* istanbul ignore next */
                    return executeInPage(`(${target[prop]})(${JSON.stringify(computeSelector(target.getElement()))}, x => x, x => x, ...${JSON.stringify(args)})`);
                };
            }
        });
    }
    return result;
}
