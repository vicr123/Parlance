import {Route, Routes} from "react-router-dom";
import SubprojectListing from "./SubprojectListing";
import Languages from "./Languages";

export default function(props) {
    return <Routes>
        <Route element={<SubprojectListing />} path={"/"} />
        <Route element={<Languages />} path={"/:subproject/*"} />
    </Routes>
}