import {Route, Routes} from "react-router-dom";
import Dashboard from "./Dashboard";
import TranslationEditor from "./TranslationEditor";

export default function(props) {
    return <Routes>
        <Route element={<Dashboard />} path={"/"} />
        <Route element={<TranslationEditor />} path={"/translate"} />
        <Route element={<TranslationEditor />} path={"/translate/:key"} />
    </Routes>
}