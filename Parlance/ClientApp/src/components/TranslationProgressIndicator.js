import Styles from "./TranslationProgressIndicator.module.css";
import {useTranslation} from "react-i18next";

const percent = value => `${value * 100}%`;

function TranslationProgressMetric({value, title, className}) {
    return <div className={`${Styles.metric} ${className}`}>
        <span className={Styles.metricValue}>{value}</span>
        <span className={Styles.metricTitle}>{title}</span>
    </div>
}

function TranslationProgressBar({data, className}) {
    
    return <div className={className}>
        <div className={Styles.progressBarSectionComplete} style={{width: percent(data.passedChecks / data.count)}} />
        <div className={Styles.progressBarSectionErrors} style={{width: percent(data.errors / data.count)}} />
        <div className={Styles.progressBarSectionWarnings} style={{width: percent(data.warnings / data.count)}} />
    </div>
}

export default function TranslationProgressIndicator({title, data}) {
    const {t} = useTranslation();
    
    let metrics = [
        <TranslationProgressMetric key={"total"} value={data.count} title={t("TRANSLATION_PROGRESS_INDICATOR_TOTAL")} className={Styles.percentComplete} />,
        <TranslationProgressMetric key={"complete"} value={`${Math.round(data.complete / data.count * 100)}%`} title={t("TRANSLATION_PROGRESS_INDICATOR_COMPLETE")} className={Styles.percentComplete} />,
        <TranslationProgressMetric key={"remain"} value={data.count - data.complete} title={t("Remaining")} className={Styles.remain} />
    ]
    if (data.warnings > 0) metrics.push(<TranslationProgressMetric key={"warnings"} value={data.warnings} title={t("TRANSLATION_PROGRESS_INDICATOR_WARNINGS")} className={Styles.warnings} />);
    if (data.errors > 0) metrics.push(<TranslationProgressMetric key={"errors"} value={data.errors} title={t("TRANSLATION_PROGRESS_INDICATOR_ERRORS")} className={Styles.errors} />);
    
    return <div className={Styles.root}>
        <span className={Styles.title}>{title}</span>
        <div className={Styles.metrics}>
            {metrics}
        </div>
        <TranslationProgressBar data={data} className={Styles.progress} />
    </div>
}