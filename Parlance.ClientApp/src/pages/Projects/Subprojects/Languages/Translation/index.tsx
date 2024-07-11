import { Route, Routes } from "react-router-dom";
import Dashboard from "./Dashboard";
import TranslationEditor from "./TranslationEditor/index";

export default function Translation() {
    return (
        <Routes>
            <Route element={<Dashboard />} path={"/"} />
            <Route element={<TranslationEditor />} path={"/translate"} />
            <Route element={<TranslationEditor />} path={"/translate/:key"} />
            <Route element={<Dashboard />} path={"/*"} />
        </Routes>
    );
}
