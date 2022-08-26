import {useState} from "react";

function useForceUpdate() {
    const [value, setValue] = useState(0);
    return () => setValue(value => value + 1);
}

export {useForceUpdate}