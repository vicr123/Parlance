import React, {
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    Editable,
    ReactEditor,
    RenderElementProps,
    RenderLeafProps,
    Slate,
    withReact,
} from "slate-react";
import { createEditor, Descendant, Node, NodeEntry, Transforms } from "slate";
import Styles from "./TranslationSlateEditor.module.css";
import Placeholders from "./Placeholders.js";
import { diffWords } from "diff";
import { useLocation, useParams } from "react-router-dom";
import { useTabIndex } from "react-tabindex";
import KeyboardShortcut from "../../../../../../components/KeyboardShortcut";
import {
    KeyboardShortcuts,
    KeyboardShortcut as KeyboardShortcutType,
} from "./KeyboardShortcuts";
import { TextDirection } from "@/interfaces/misc";
import { PlaceholderInterface } from "@/pages/Projects/Subprojects/Languages/Translation/TranslationEditor/EditorInterfaces";

interface TranslationEditorElement {
    type: "paragraph" | "add" | "remove" | "diff";
    children: { text: string }[];
}

interface TranslationEditorText {
    decoration: "placeholder";
    direction: TextDirection;
    hasFocus: boolean;
    preview: string;
    showPlaceholders: boolean;
    placeholderNumber: number;
}

declare module "slate" {
    interface CustomTypes {
        Element: TranslationEditorElement;
        Text: TranslationEditorText;
    }
}

function Placeholder({
    attributes,
    direction,
    hasFocus,
    preview,
    children,
}: {
    direction: TextDirection;
    hasFocus: boolean;
    preview: string;
    children: ReactNode;
    attributes: any;
}) {
    let contents = children;
    if (!hasFocus && preview) {
        contents = (
            <>
                <span contentEditable={false}>{preview}</span>
                <span className={Styles.hidden}>{children}</span>
            </>
        );
    }
    return (
        <span {...attributes}>
            <span dir={direction} className={Styles.placeholder}>
                {contents}
            </span>
        </span>
    );
}

function Leaf({ attributes, children, leaf }: RenderLeafProps) {
    switch (leaf.decoration) {
        case "placeholder":
            return (
                <>
                    <Placeholder
                        attributes={attributes}
                        direction={leaf.direction}
                        hasFocus={leaf.hasFocus}
                        preview={leaf.preview}
                    >
                        {children}
                    </Placeholder>
                    {leaf.showPlaceholders && leaf?.placeholderNumber < 10 && (
                        <KeyboardShortcut
                            shortcut={
                                KeyboardShortcuts.CopyPlaceholder[
                                    leaf.placeholderNumber
                                ] as KeyboardShortcutType[]
                            }
                        />
                    )}
                </>
            );
        default:
            return <span {...attributes}>{children}</span>;
    }
}

export function TranslationSlateEditor(props: {
    value: string;
    translationFileType: string;
    translationDirection: TextDirection;
    readOnly: boolean;
    onChange: (newValue: string) => void;
    pluralExample: string;
    diffWith: string;
    hasFocus: boolean;
    tabIndex: number;
    placeholders: PlaceholderInterface[];
    showPlaceholders: boolean;
    onTranslationUpdate: (contents: string, key: string) => void;
}) {
    const editor = useMemo(() => withReact(createEditor()), []);
    const [currentKey, setCurrentKey] = useState<string | undefined>();

    const setContents = (text: string) => {
        while (editor.children.length !== 1) {
            Transforms.removeNodes(editor, {
                at: [0],
            });
        }

        Transforms.insertNodes(
            editor,
            {
                type: "paragraph",
                children: [{ text: text }],
            },
            {
                at: [editor.children.length],
            },
        );

        Transforms.removeNodes(editor, {
            at: [0],
        });
    };

    const forceSave = () => {
        props.onTranslationUpdate?.(
            editor.children.map(n => Node.string(n)).join("\n"),
            currentKey!,
        );
    };

    return (
        <TranslationSlateEditorInner
            {...props}
            editor={editor}
            forceSave={forceSave}
            currentKey={currentKey}
            setCurrentKey={currentKey => setCurrentKey(currentKey)}
            setContents={setContents}
        />
    );
}

function TranslationSlateEditorInner({
    value,
    translationFileType,
    translationDirection,
    readOnly,
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
    showPlaceholders,
}: {
    value: string;
    translationFileType: string;
    translationDirection: TextDirection;
    readOnly: boolean;
    onChange: (newValue: string) => void;
    pluralExample: string;
    diffWith: string;
    hasFocus: boolean;
    tabIndex: number;
    forceSave: () => void;
    editor: ReactEditor;
    currentKey?: string;
    setCurrentKey: (key: string) => void;
    setContents: (key: string) => void;
    placeholders: PlaceholderInterface[];
    showPlaceholders: boolean;
}) {
    const { language, key } = useParams();
    const location = useLocation();
    tabIndex = useTabIndex(tabIndex);

    useEffect(() => {
        if (currentKey) forceSave();
        setCurrentKey(key!);
    }, [location]);

    useEffect(() => {
        if (currentKey && !hasFocus) forceSave();
    }, [hasFocus]);

    useEffect(() => {
        if (diffWith) {
            let changes = diffWords(diffWith, value);
            console.log(changes);

            while (editor.children.length !== 1) {
                Transforms.removeNodes(editor, {
                    at: [0],
                });
            }

            for (let change of changes) {
                Transforms.insertNodes(
                    editor,
                    {
                        type: change.added
                            ? "add"
                            : change.removed
                              ? "remove"
                              : "diff",
                        children: [{ text: change.value }],
                    },
                    {
                        at: [editor.children.length],
                    },
                );
            }

            Transforms.insertNodes(
                editor,
                {
                    type: "paragraph",
                    children: [{ text: "" }],
                },
                {
                    at: [editor.children.length],
                },
            );

            Transforms.insertNodes(
                editor,
                {
                    type: "paragraph",
                    children: [{ text: value }],
                },
                {
                    at: [editor.children.length],
                },
            );

            Transforms.removeNodes(editor, {
                at: [0],
            });
        } else {
            if (value === editor.children.map(n => Node.string(n)).join("\n"))
                return;
            setContents(value);
        }
    }, [value, diffWith]);

    useEffect(() => {
        editor.onChange();
    }, [hasFocus]);

    const changeEvent = (value: Descendant[]) => {
        onChange(value.map(n => Node.string(n)).join("\n"));
    };

    const decorate = ([node, path]: NodeEntry) => {
        // @ts-expect-error
        const nodeText = node.text;
        if (!nodeText) return [];

        let highlights = Placeholders[translationFileType];
        if (!highlights) highlights = [];

        return highlights.flatMap(highlight => {
            const matches = [...nodeText.matchAll(highlight.regex)];
            const locations = matches
                ? matches.map(m => [m[0].trim(), m.index])
                : [];

            return locations.map(([placeholder, index]) => ({
                anchor: {
                    path,
                    offset: index,
                },
                focus: {
                    path,
                    offset: index + placeholder.length,
                },
                decoration: "placeholder",
                placeholderNumber: placeholders.find(
                    x => x.placeholder === placeholder,
                )?.number,
                direction: translationDirection,
                label: highlight.name || "warning",
                hasFocus: hasFocus,
                preview: highlight.preview?.({
                    pluralExample: pluralExample,
                }),
                showPlaceholders: showPlaceholders,
            }));
        });
    };

    const renderElement = useCallback(
        ({ attributes, children, element }: RenderElementProps) => {
            switch (element.type) {
                case "paragraph":
                    return <div {...attributes}>{children}</div>;
                case "diff":
                    return (
                        <span className={Styles.diff} {...attributes}>
                            {children}
                        </span>
                    );
                case "add":
                    return (
                        <span className={Styles.diffAdd} {...attributes}>
                            {children}
                        </span>
                    );
                case "remove":
                    return (
                        <span className={Styles.diffRemove} {...attributes}>
                            {children}
                        </span>
                    );
            }
        },
        [],
    );

    return (
        <div dir={translationDirection} lang={language!.replace("_", "-")}>
            <Slate
                editor={editor}
                value={[
                    {
                        type: "paragraph",
                        children: [{ text: "Loading" }],
                    },
                ]}
                onChange={changeEvent}
            >
                <Editable
                    className={Styles.editor}
                    tabIndex={tabIndex}
                    renderLeaf={Leaf}
                    decorate={decorate}
                    renderElement={renderElement}
                    readOnly={readOnly}
                />
            </Slate>
        </div>
    );
}
