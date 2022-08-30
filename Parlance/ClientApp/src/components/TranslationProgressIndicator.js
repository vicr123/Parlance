import Styles from "./TranslationProgressIndicator.module.css";

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
    let metrics = [
        <TranslationProgressMetric key={"total"} value={data.count} title={"Total"} className={Styles.percentComplete} />,
        <TranslationProgressMetric key={"complete"} value={`${Math.round(data.complete / data.count * 100)}%`} title={"Complete"} className={Styles.percentComplete} />,
        <TranslationProgressMetric key={"remain"} value={data.count - data.complete} title={"Remaining"} className={Styles.remain} />
    ]
    if (data.warnings > 0) metrics.push(<TranslationProgressMetric key={"warnings"} value={data.warnings} title={"Warnings"} className={Styles.warnings} />);
    if (data.errors > 0) metrics.push(<TranslationProgressMetric key={"errors"} value={data.errors} title={"Errors"} className={Styles.errors} />);
    
    return <div className={Styles.root}>
        <span className={Styles.title}>{title}</span>
        <div className={Styles.metrics}>
            {metrics}
        </div>
        <TranslationProgressBar data={data} className={Styles.progress} />
    </div>
}