import Styles from "./TranslationProgressIndicator.module.css";
import {useTranslation} from "react-i18next";
import React from "react";
import PreloadingBlock from "./PreloadingBlock";
import {calculateDeadline} from "../helpers/Misc";

const percent = value => `${value * 100}%`;

function TranslationProgressMetric({value, title, className}) {
    if (typeof (value) === "number") {
        if (value > 10000) {
            value = `${(value / 1000).toFixed(0)}k`
        } else if (value > 1000) {
            value = `${(value / 1000).toFixed(1)}k`
        }
    }

    return <div className={`${Styles.metric} ${className}`}>
        <span className={Styles.metricValue}>{value}</span>
        <span className={Styles.metricTitle}>{title}</span>
    </div>
}

function TranslationProgressBar({data, className}) {
    if (data?.count) {
        return <div className={className}>
            <div className={Styles.progressBarSectionComplete}
                 style={{width: percent(data.passedChecks / data.count)}}/>
            <div className={Styles.progressBarSectionErrors} style={{width: percent(data.errors / data.count)}}/>
            <div className={Styles.progressBarSectionWarnings} style={{width: percent(data.warnings / data.count)}}/>
        </div>
    } else {
        return <div className={className}>

        </div>
    }
}

export default function TranslationProgressIndicator({title, data, deadline, badges = []}) {
    const {t} = useTranslation();
    const deadlineData = calculateDeadline(deadline);

    let metrics = [];
    if (data?.count == null) {

    } else {
        metrics.push([
            <TranslationProgressMetric key={"total"} value={data.count}
                                       title={t("TRANSLATION_PROGRESS_INDICATOR_TOTAL")}
                                       className={Styles.percentComplete}/>,
            <TranslationProgressMetric key={"complete"} value={`${Math.round(data.complete / data.count * 100)}%`}
                                       title={t("TRANSLATION_PROGRESS_INDICATOR_COMPLETE")}
                                       className={Styles.percentComplete}/>,
            <TranslationProgressMetric key={"remain"} value={data.count - data.complete}
                                       title={t("translation:TRANSLATION_PROGRESS_INDICATOR_REMAINING")}
                                       className={Styles.remain}/>
        ])
    }
    if (data?.warnings > 0) metrics.push(<TranslationProgressMetric key={"warnings"} value={data.warnings}
                                                                    title={t("TRANSLATION_PROGRESS_INDICATOR_WARNINGS")}
                                                                    className={Styles.warnings}/>);
    if (data?.errors > 0) metrics.push(<TranslationProgressMetric key={"errors"} value={data.errors}
                                                                  title={t("TRANSLATION_PROGRESS_INDICATOR_ERRORS")}
                                                                  className={Styles.errors}/>);

    if (deadlineData.valid) metrics.push(<TranslationProgressMetric key={"deadline"} value={deadlineData.text}
                                                                    title={t("TRANSLATION_PROGRESS_INDICATOR_REMAINING")}
                                                                    className={`${deadlineData.ms.asDays() <= 3 && Styles.errors}`}/>)
    
    metrics = metrics.flat().reverse();

    let titleStyles = [Styles.title];
    if (data?.count == null) titleStyles.push(Styles.newTitle);
    
    return <div className={Styles.root}>
        <div className={titleStyles.join(" ")}>
            <div className={Styles.titleContainer}>
                <span className={Styles.titleText}>{title}</span>
                {badges.map((text, i) => <span className={Styles.badge} key={i}>{text}</span>)}
            </div>
        </div>
        <div className={Styles.metrics}>
            {metrics}
        </div>
        <TranslationProgressBar data={data} className={Styles.progress}/>
    </div>
}

TranslationProgressIndicator.Preloading = function () {
    return <div className={Styles.root}>
        <PreloadingBlock className={Styles.title}/>
        <div className={Styles.metrics}>
            <PreloadingBlock className={Styles.metric}>
                <span className={Styles.metricValue}>20</span>
                <span className={Styles.metricTitle}>TEXT</span>
            </PreloadingBlock>
            <PreloadingBlock className={Styles.metric}>
                <span className={Styles.metricValue}>20</span>
                <span className={Styles.metricTitle}>TEXT</span>
            </PreloadingBlock>
            <PreloadingBlock className={Styles.metric}>
                <span className={Styles.metricValue}>20</span>
                <span className={Styles.metricTitle}>TEXT</span>
            </PreloadingBlock>
            <PreloadingBlock className={Styles.metric}>
                <span className={Styles.metricValue}>20</span>
                <span className={Styles.metricTitle}>TEXT</span>
            </PreloadingBlock>
            <PreloadingBlock className={Styles.metric}>
                <span className={Styles.metricValue}>20</span>
                <span className={Styles.metricTitle}>TEXT</span>
            </PreloadingBlock>
        </div>
        <PreloadingBlock className={Styles.progress}/>
    </div>
}

TranslationProgressIndicator.PreloadContents = function (num = 3) {
    let arr = [];
    for (let i = 0; i < num; i++) {
        arr.push({
            contents: <TranslationProgressIndicator.Preloading/>
        });
    }
    return arr;
};
