import React, {useCallback, useEffect} from "react";
import {Editable, Slate, withReact} from "slate-react";
import {createEditor, Node, Transforms} from "slate";
import Styles from "./TranslationSlateEditor.module.css";
import Placeholders from "./Placeholders";
import {useTranslation} from "react-i18next";
import {diffWords} from "diff";
import {useLocation, useParams} from "react-router-dom";
import {useTabIndex} from "react-tabindex";
import KeyboardShortcut from "../../../../../../components/KeyboardShortcut";
import {KeyboardShortcuts} from "./KeyboardShortcuts";

function Placeholder({attributes, direction, hasFocus, preview, children}) {
    let contents = children;
    if (!hasFocus && preview) {
        contents = <>
            <span contentEditable={false}>{preview}</span>
            <span className={Styles.hidden}>{children}</span>
        </>
    }
    return <span {...attributes}>
            <span dir={direction} className={Styles.placeholder}>
                {contents}
            </span>
        </span>
}

function Leaf({attributes, children, leaf}) {
    const {t} = useTranslation();

    switch (leaf.decoration) {
        case "placeholder":
            return <>
                <Placeholder attributes={attributes} direction={leaf.direction} hasFocus={leaf.hasFocus}
                             preview={leaf.preview}>
                    {children}
                </Placeholder>
                {leaf.showPlaceholders && leaf?.placeholderNumber < 10 &&
                    <KeyboardShortcut shortcut={KeyboardShortcuts.CopyPlaceholder[leaf.placeholderNumber]}/>}
            </>
        default:
            return <span {...attributes}>{children}</span>
    }
}

class TranslationSlateEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editor: withReact(createEditor()),
            currentKey: null
        }
    }

    setCurrentKey(currentKey) {
        this.setState({
            currentKey
        });
    }

    setContents(text) {
        while (this.state.editor.children.length !== 1) {
            Transforms.removeNodes(this.state.editor, {
                at: [0]
            })
        }

        Transforms.insertNodes(this.state.editor, {
            type: "paragraph",
            children: [{text: text}]
        }, {
            at: [this.state.editor.children.length]
        });

        Transforms.removeNodes(this.state.editor, {
            at: [0]
        });
    }

    insertText(text) {
        Transforms.insertText(this.state.editor, text);
    }

    forceSave() {
        this.props.onTranslationUpdate?.(this.state.editor.children.map(n => Node.string(n)).join("\n"), this.state.currentKey);
    }

    render() {
        return <TranslationSlateEditorInner {...this.props} editor={this.state.editor}
                                            forceSave={this.forceSave.bind(this)} currentKey={this.state.currentKey}
                                            setCurrentKey={this.setCurrentKey.bind(this)}
                                            setContents={this.setContents.bind(this)}/>
    }
}

function TranslationSlateEditorInner({
                                         value,
                                         translationFileType,
                                         translationDirection,
                                         readOnly,
                                         onTranslationUpdate,
                                         onChange,
                                         pluralExample,
                                         diffWith,
                                         hasFocus,
                                         tabIndex,
                                         forceSave,
                                         editor,
                                         currentKey,
                                         setCurrentKey,
                                         setContents,
                                         placeholders,
                                         showPlaceholders
                                     }) {
    const {language, key} = useParams();
    const location = useLocation();
    tabIndex = useTabIndex(tabIndex);

    useEffect(() => {
        if (currentKey) forceSave();
        setCurrentKey(key);
    }, [location])

    useEffect(() => {
        if (currentKey && !hasFocus) forceSave();
    }, [hasFocus]);

    useEffect(() => {
        if (diffWith) {
            let changes = diffWords(diffWith, value);
            console.log(changes);

            while (editor.children.length !== 1) {
                Transforms.removeNodes(editor, {
                    at: [0]
                })
            }

            for (let change of changes) {
                Transforms.insertNodes(editor, {
                    type: change.added ? "add" : (change.removed ? "remove" : "diff"),
                    children: [{text: change.value}]
                }, {
                    at: [editor.children.length]
                });
            }

            Transforms.insertNodes(editor, {
                type: "paragraph",
                children: [{text: ""}]
            }, {
                at: [editor.children.length]
            });

            Transforms.insertNodes(editor, {
                type: "paragraph",
                children: [{text: value}]
            }, {
                at: [editor.children.length]
            });

            Transforms.removeNodes(editor, {
                at: [0]
            });
        } else {
            if (value === editor.children.map(n => Node.string(n)).join("\n")) return;
            setContents(value);
        }
    }, [value, diffWith])

    useEffect(() => {
        editor.onChange();
    }, [hasFocus]);

    const changeEvent = value => {
        onChange(value.map(n => Node.string(n)).join("\n"));
    }

    const decorate = ([node, path]) => {
        const nodeText = node.text;
        if (!nodeText) return [];

        let highlights = Placeholders[translationFileType];
        if (!highlights) highlights = [];

        return highlights.flatMap(highlight => {
            const matches = nodeText.match(highlight.regex);
            const locations = matches ? matches.map(m => [m.trim(), nodeText.indexOf(m.trim())]) : [];

            return locations.map(([placeholder, index], number) => ({
                anchor: {
                    path,
                    offset: index
                },
                focus: {
                    path,
                    offset: index + placeholder.length,
                },
                decoration: "placeholder",
                placeholderNumber: placeholders.find(x => x.placeholder === placeholder)?.number,
                direction: translationDirection,
                label: highlight.name || "warning",
                hasFocus: hasFocus,
                preview: highlight.preview?.({
                    pluralExample: pluralExample
                }),
                showPlaceholders: showPlaceholders
            }))
        });
    }

    const renderElement = useCallback(({attributes, children, element}) => {
        switch (element.type) {
            case "paragraph":
                return <div {...attributes}>{children}</div>
            case "diff":
                return <span className={Styles.diff} {...attributes}>{children}</span>
            case "add":
                return <span className={Styles.diffAdd} {...attributes}>{children}</span>
            case "remove":
                return <span className={Styles.diffRemove} {...attributes}>{children}</span>
        }
    })

    return <div dir={translationDirection} lang={language.replace("_", "-")}>
        <Slate editor={editor} value={[{
            type: "paragraph",
            children: [{text: "Loading"}]
        }]} onChange={changeEvent}>
            <Editable className={Styles.editor} tabIndex={tabIndex} renderLeaf={Leaf} decorate={decorate}
                      renderElement={renderElement} readOnly={readOnly}/>
        </Slate>
    </div>
}

export {TranslationSlateEditor};