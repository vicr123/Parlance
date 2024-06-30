import { Route, Routes } from "react-router-dom";
import LocaleSelection from "./LocaleSelection";
import LocaleSettings from "./LocaleSettings";

export default function Locales(props) {
    return (
        <Routes>
            <Route element={<LocaleSelection />} path={"/"} />
            <Route element={<LocaleSettings />} path={"/:locale"} />
        </Routes>
    );
}
