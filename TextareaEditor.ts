import { AbstractEditor, AbstractEditorOptions, wrapper, unwrapper } from "./AbstractEditor";

// TextareaEditor sort of works for contentEditable elements but there should
// really be a contenteditable-specific editor.
/* istanbul ignore next */
export class TextareaEditor implements AbstractEditor {

    private elem: HTMLElement;
    private options: AbstractEditorOptions;
    constructor (e: HTMLElement, options: AbstractEditorOptions) {
        this.options = options;
        this.elem = e;
    }

    static matches (_: HTMLElement) {
        return true;
    }

    getContent = async () => {
        if ((this.elem as any).value !== undefined) {
            return Promise.resolve((this.elem as any).value);
        }
        if (this.options.preferHTML){
            return Promise.resolve(this.elem.innerHTML);
        } else {
            return Promise.resolve(this.elem.innerText);
        }
    }

    getCursor = async () => {
        return this.getContent().then(text => {
            let line = 1;
            let column = 0;
            const selectionStart = (this.elem as any).selectionStart !== undefined
                ? (this.elem as any).selectionStart
                : 0;
            // Sift through the text, counting columns and new lines
            for (let cursor = 0; cursor < selectionStart; ++cursor) {
                column += text.charCodeAt(cursor) < 0x7F ? 1 : 2;
                if (text[cursor] === "\n") {
                    line += 1;
                    column = 0;
                }
            }
            return [line, column] as [number, number];
        });
    }

    getElement = () => {
        return this.elem;
    }

    getLanguage = async () => {
        if (this.options.preferHTML) {
            return Promise.resolve('html');
        }

        return Promise.resolve(undefined);
    }

    setContent = async (text: string) => {
        if ((this.elem as any).value !== undefined) {
            (this.elem as any).value = text;
        } else {
            if (this.options.preferHTML){
                this.elem.innerHTML = text;
            } else {
                this.elem.innerText = text;
            }
        }
        return Promise.resolve();
    }

    setCursor = async (line: number, column: number) => {
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
                } else if (code <= 0x7ff) {
                  column -= 2;
                } else if (code >= 0xd800 && code <= 0xdfff) {
                  column -= 4; character++;
                } else if (code < 0xffff) {
                  column -= 3;
                } else {
                  column -= 4;
                }
                character += 1;
            }
            if ((this.elem as any).setSelectionRange !== undefined) {
                (this.elem as any).setSelectionRange(character, character);
            }
            return undefined;
        });
    }
}
