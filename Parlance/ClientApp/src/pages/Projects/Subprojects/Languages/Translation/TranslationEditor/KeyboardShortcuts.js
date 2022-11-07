import useHotkeys from "@reecelucas/react-use-hotkeys";

const KeyboardShortcuts = {
    NextUnfinished: [["Control", "Enter"], ["Control", "L"]],
    PreviousUnfinished: [["Control", "H"]],
    Next: [["Control", "J"]],
    Previous: [["Control", "K"]],
    CopySource: [["Control", "]"]],
    CopyPlaceholder: [
        [["Alt", "1"], ["Alt", "¡"]],
        [["Alt", "2"], ["Alt", "™"]],
        [["Alt", "3"], ["Alt", "£"]],
        [["Alt", "4"], ["Alt", "¢"]],
        [["Alt", "5"], ["Alt", "∞"]],
        [["Alt", "6"], ["Alt", "§"]],
        [["Alt", "7"], ["Alt", "¶"]],
        [["Alt", "8"], ["Alt", "•"]],
        [["Alt", "9"], ["Alt", "ª"]]
    ]
};

function useKeyboardShortcut(shortcut, callback, enabled = true) {
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
            enableOnContentEditable: true,
            enabled,
            eventListenerOptions: {
                capture: true
            }
        });
    }
}

export {KeyboardShortcuts};
export {useKeyboardShortcut};