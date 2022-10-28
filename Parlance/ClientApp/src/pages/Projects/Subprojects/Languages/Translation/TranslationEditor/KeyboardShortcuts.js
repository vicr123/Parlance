import useHotkeys from "@reecelucas/react-use-hotkeys";

const KeyboardShortcuts = {
    NextUnfinished: [["Control", "Enter"], ["Control", "L"]],
    PreviousUnfinished: [["Control", "H"]],
    Next: [["Control", "J"]],
    Previous: [["Control", "K"]]
};

function useKeyboardShortcut(shortcut, callback) {
    const isMac = navigator.userAgent.toLowerCase().includes("mac");

    for (let item of shortcut) {
        let resolved = item.map(x => {
            if (isMac) {
                switch (x) {
                    case "Control":
                        return "Meta";
                }
            }
            return x;
        });

        // This hook will always be called in a stable order
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useHotkeys(resolved.join("+"), e => {
            e.preventDefault();
            callback(e);
        }, {
            enableOnContentEditable: true
        });
    }
}

export {KeyboardShortcuts};
export {useKeyboardShortcut};