import { Route, Routes } from "react-router-dom";
import LanguageListing from "./LanguageListing";
import Translation from "./Translation/index";

export default function () {
    return (
        <Routes>
            <Route element={<LanguageListing />} path={"/"} />
            <Route element={<Translation />} path={"/:language/*"} />
        </Routes>
    );
}
