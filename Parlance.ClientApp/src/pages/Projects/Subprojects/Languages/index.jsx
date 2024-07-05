import { Route, Routes } from "react-router-dom";
import LanguageListing from "./LanguageListing";
import Translation from "./Translation";

export default function (props) {
    return (
        <Routes>
            <Route element={<LanguageListing />} path={"/"} />
            <Route element={<Translation />} path={"/:language/*"} />
        </Routes>
    );
}
