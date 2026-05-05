import Styles from "./Signal.module.css";

export function Signal({
    signal,
    text,
}: {
    signal: "green" | "yellow" | "red";
    text: string;
}) {
    let circleClass = "";
    switch (signal) {
        case "red":
            circleClass = Styles.disconnected;
            break;
        case "yellow":
            circleClass = Styles.connecting;
            break;
        case "green":
            circleClass = Styles.connected;
            break;
    }

    return (
        <div className={Styles.signalContainer}>
            <div className={`${Styles.signal} ${circleClass}`} />
            <span>{text}</span>
        </div>
    );
}
