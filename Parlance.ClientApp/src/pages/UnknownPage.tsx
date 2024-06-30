import { useTranslation } from "react-i18next";
import PageHeading from "../components/PageHeading";
import SmallButton from "../components/SmallButton";
import Styles from "./UnknownPage.module.css";
import { useNavigate } from "react-router-dom";

export default function UnknownPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className={Styles.unknownPage}>
            <PageHeading level={1}>{t("NOT_FOUND_TITLE")}</PageHeading>
            <Bonkers />
            <p>{t("NOT_FOUND_DESCRIPTION")}</p>
            <SmallButton onClick={() => navigate("/")}>
                {t("NOT_FOUND_GO_HOME")}
            </SmallButton>
        </div>
    );
}

function Bonkers() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="128"
            height="128"
            viewBox="0 0 16.933 16.933"
            className="crash_qZO8"
        >
            <g transform="translate(0 -280.067)">
                <path
                    d="M14.26 283.02a3.17 3.17 0 0 0-3.889 2.246l-2.465 9.2a3.17 3.17 0 0 0 2.245 3.889 3.17 3.17 0 0 0 3.888-2.245l1.096-4.09.001.001h.004l-.001.006c.574.156.896.72.742 1.294l-.009.037-.264.986-.548 2.045a1.056 1.056 0 0 0 .748 1.296 1.057 1.057 0 0 0 1.297-.749l.548-2.044.273-1.022a3.19 3.19 0 0 0-2.24-3.888l.002-.005h-.004l-.002-.001.822-3.067a3.164 3.164 0 0 0-2.244-3.888m-2.478 2.157a.27.27 0 0 1 .163.126l.054.094.095-.054a.27.27 0 0 1 .196-.03.265.265 0 0 1 .069.49l-.095.054.055.094a.265.265 0 1 1-.46.266l-.054-.095-.094.055a.265.265 45 1 1-.266-.46l.095-.054-.055-.095a.265.265 0 0 1 .297-.391m3.066.821a.27.27 0 0 1 .164.127l.055.095.094-.055a.27.27 0 0 1 .197-.03.265.265 0 0 1 .069.489l-.095.055.055.094a.265.265 45 0 1-.46.265l-.054-.094-.095.055a.265.265 45 1 1-.265-.46l.094-.054-.054-.095a.265.265 0 0 1 .295-.392m-1.708 1.22c.542.145 1.004.5 1.285.985a.53.53 0 0 1-.59.784.53.53 0 0 1-.326-.255 1.057 1.057 0 0 0-1.445-.387.53.53 0 0 1-.737-.184l-.001-.003a.53.53 0 0 1 .209-.73 2.12 2.12 0 0 1 1.605-.21z"
                    style={{
                        opacity: 1,
                        fill: "var(--svg-fg)",
                        fillOpacity: 1,
                        stroke: "none",
                        strokeWidth: 0.265,
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeMiterlimit: 4,
                        strokeDasharray: "none",
                        strokeDashoffset: 0,
                        strokeOpacity: 1,
                        paintOrder: "normal",
                    }}
                />
                <circle
                    cx="4.233"
                    cy="283.242"
                    r="1.058"
                    style={{
                        opacity: 1,
                        fill: "var(--svg-fg)",
                        fillOpacity: 1,
                        stroke: "none",
                        strokeWidth: 0.265,
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeMiterlimit: 4,
                        strokeDasharray: "none",
                        strokeDashoffset: 0,
                        strokeOpacity: 1,
                        paintOrder: "normal",
                    }}
                />
                <path
                    d="M6.395 283.621a6.35 6.35 0 0 1 2.547 1.71M1.146 287.795a6.22 6.22 0 0 1 7.85-2.437"
                    style={{
                        opacity: 1,
                        fill: "none",
                        fillOpacity: 1,
                        stroke: "var(--svg-fg)",
                        strokeWidth: 0.529167,
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeMiterlimit: 4,
                        strokeDasharray: "none",
                        strokeDashoffset: 0,
                        strokeOpacity: 1,
                        paintOrder: "normal",
                    }}
                />
                <path
                    d="m9.657 284.168-.661-.662"
                    style={{
                        fill: "none",
                        stroke: "var(--svg-fg)",
                        strokeWidth: 0.264583,
                        strokeLinecap: "round",
                        strokeLinejoin: "miter",
                        strokeMiterlimit: 4,
                        strokeDasharray: "none",
                        strokeOpacity: 1,
                    }}
                />
                <path
                    d="m9.26 286.417-1.058.264"
                    style={{
                        fill: "none",
                        stroke: "var(--svg-fg)",
                        strokeWidth: 0.264583,
                        strokeLinecap: "round",
                        strokeLinejoin: "miter",
                        strokeOpacity: 1,
                    }}
                />
            </g>
        </svg>
    );
}
