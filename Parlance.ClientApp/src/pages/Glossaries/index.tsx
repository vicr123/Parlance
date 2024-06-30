import { Route, Routes } from "react-router-dom";
import ServerGlossaryListing from "./ServerGlossaryListing";
import GlossaryEditor from "./GlossaryEditor";

export default function () {
    return (
        <Routes>
            <Route element={<ServerGlossaryListing />} path={"/"} />
            <Route element={<GlossaryEditor />} path={"/:glossary"} />
            <Route element={<GlossaryEditor />} path={"/:glossary/:language"} />
        </Routes>
    );
}
