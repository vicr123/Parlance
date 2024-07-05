import { Route, Routes } from "react-router-dom";
import GlossaryListing from "./GlossaryListing";

export default function Glossaries() {
    return (
        <Routes>
            {/*<Route element={<AddProject />} path={"/add"} />*/}
            <Route element={<GlossaryListing />} path={"/"} />
            {/*<Route element={<Project />} path={"/:project"} />*/}
        </Routes>
    );
}
