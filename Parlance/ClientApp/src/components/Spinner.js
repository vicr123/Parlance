import Styles from "./Spinner.module.css";
import {Suspense} from "react";

export default function Spinner() {
    return <div className={Styles.spinner}>
        <svg
            width="48"
            height="48"
            viewBox="0 0 12.7 12.7"
            version="1.1"
            id="svg4548"
            xmlns="http://www.w3.org/2000/svg">
            <g>
                <path
                    className={Styles.spinnerPath}
                    d="M 9.3849569 2.0153809 L 8.7777588 2.8825114 A 4.2333331 4.2333331 0 0 1 10.583333 6.35 A 4.2333331 4.2333331 0 0 1 6.35 10.583333 A 4.2333331 4.2333331 0 0 1 2.1166667 6.35 A 4.2333331 4.2333331 0 0 1 3.9237915 2.8850952 L 3.3160767 2.0169312 A 5.2916665 5.2916665 0 0 0 1.0583333 6.35 A 5.2916665 5.2916665 0 0 0 6.35 11.641667 A 5.2916665 5.2916665 0 0 0 11.641667 6.35 A 5.2916665 5.2916665 0 0 0 9.3849569 2.0153809 z "/>
            </g>
        </svg>
    </div>
}

Spinner.Container = function SpinnerContainer() {
    return <div className={Styles.spinnerContainer}>
        <Spinner/>
    </div>
}

Spinner.Suspense = function SpinnerSuspense({children}) {
    return <Suspense fallback={<Spinner.Container/>}>
        {children}
    </Suspense>
}