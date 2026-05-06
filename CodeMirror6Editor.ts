import { GenericAbstractEditor, AbstractEditorOptions, wrapper, unwrapper } from "./AbstractEditor";

/* istanbul ignore next */
export class CodeMirror6Editor extends GenericAbstractEditor {

    static matches (e: HTMLElement) {
        let parent: HTMLElement | null = e;
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

    private elem: HTMLElement;
    constructor (e: HTMLElement, options: AbstractEditorOptions) {
        super(e, options);
        this.elem = e;
        // Get the topmost CodeMirror element
        let parent: HTMLElement | null = this.elem.parentElement;
        while (parent !== null && CodeMirror6Editor.matches(parent)) {
            this.elem = parent;
            parent = parent.parentElement;
        }
    }

    getContent = async (selector: string, wrap: wrapper, unwrap: unwrapper) => {
        const elem = unwrap(document.querySelector(selector) as any);
        const cm = elem.cmView || elem.cmTile;
        return wrap(cm.view.state.doc.toString());
    }

    getCursor = async (selector: string, wrap: wrapper, unwrap: unwrapper) => {
        const elem = unwrap(document.querySelector(selector) as any);
        const cm = elem.cmView || elem.cmTile;
        const state = cm.view.state;
        const head = state.selection.main.head;
        const line = state.doc.lineAt(head);
        return wrap([line.number, head - line.from]) as [number, number];
    }

    getElement = () => {
        return this.elem;
    }

    getLanguage = async (selector: string, wrap: wrapper, unwrap: unwrapper) => {
	const elem = document.querySelector(selector);
	return wrap(unwrap(elem).dataset.language);
    }

    setContent = async (selector: string, wrap: wrapper, unwrap: unwrapper, text: string) => {
        const elem = unwrap(document.querySelector(selector) as any);
        const cm = elem.cmView || elem.cmTile;
        let length = cm.view.state.doc.length;
        return wrap(cm.view.dispatch({changes: {from: 0, to: length, insert: text}}));
    }

    setCursor = async (selector: string, wrap: wrapper, unwrap: unwrapper, line: number, column: number) => {
        const elem = unwrap(document.querySelector(selector) as any);
        const cm = elem.cmView || elem.cmTile;
        return wrap(cm.view.dispatch({
            selection: {
                anchor: cm.view.doc.line(line) + column
            }
        }));
    }
}
