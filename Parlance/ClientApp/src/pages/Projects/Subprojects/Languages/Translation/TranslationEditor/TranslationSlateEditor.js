import {useCallback, useEffect, useState} from "react";
import {Editable, Slate, withReact} from "slate-react";
import {createEditor, Node, Transforms} from "slate";
import Styles from "./TranslationSlateEditor.module.css";
import Placeholders from "./Placeholders";
import {useTranslation} from "react-i18next";
import {useHotkeys} from "react-hotkeys-hook";
import {diffWords} from "diff";

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
            return <Placeholder attributes={attributes} direction={leaf.direction} hasFocus={leaf.hasFocus}
                                preview={leaf.preview}>
                {children}
            </Placeholder>
        default:
            return <span {...attributes}>{children}</span>
    }
}

export function TranslationSlateEditor({
                                           value,
                                           translationFileType,
                                           translationDirection,
                                           readOnly,
                                           onTranslationUpdate,
                                           onChange,
                                           pluralExample,
                                           diffWith
                                       }) {
    const [editor] = useState(() => withReact(createEditor()));
    const [hasFocus, setHasFocus] = useState(false);

    const forceSave = () => {
        onTranslationUpdate(editor.children.map(n => Node.string(n)).join("\n"));
    }

    useHotkeys("ctrl+enter", () => {
        forceSave();
    }, {
        enableOnTags: ["INPUT", "TEXTAREA", "SELECT"],
        enableOnContentEditable: true,
        filter: () => hasFocus
    }, [onTranslationUpdate]);

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

            while (editor.children.length !== 1) {
                Transforms.removeNodes(editor, {
                    at: [0]
                })
            }

            Transforms.insertNodes(editor, {
                type: "paragraph",
                children: [{text: value}]
            }, {
                at: [editor.children.length]
            });

            Transforms.removeNodes(editor, {
                at: [0]
            });
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

            return locations.map(([placeholder, index]) => {
                return {
                    anchor: {
                        path,
                        offset: index
                    },
                    focus: {
                        path,
                        offset: index + placeholder.length,
                    },
                    decoration: "placeholder",
                    direction: translationDirection,
                    label: highlight.name || "warning",
                    hasFocus: hasFocus,
                    preview: highlight.preview?.({
                        pluralExample: pluralExample
                    })
                }
            })
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

    const focus = () => {
        setHasFocus(true);
    }

    const blur = () => {
        forceSave();
        setHasFocus(false);
    }

    return <Slate dir={translationDirection} editor={editor} value={[{
        type: "paragraph",
        children: [{text: "Loading"}]
    }]} onChange={changeEvent}>
        <Editable renderLeaf={Leaf} decorate={decorate} onBlur={blur} renderElement={renderElement}
                  onFocus={focus} readOnly={readOnly}/>
    </Slate>
}