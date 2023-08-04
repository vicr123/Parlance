import Styles from "./Hero.module.css"
import Container from "./Container";
import PageHeading from "./PageHeading";
import React from "react";
import SmallButton from "./SmallButton";

interface HeroButton {
    onClick: () => void;
    text: string
}

interface HeroProps {
    heading: string
    subheading?: string
    buttons: HeroButton[]
}

export default function Hero({heading, subheading, buttons}: HeroProps) {
    return <Container bottomBorder={true} className={Styles.heroContainer}>
        <div className={Styles.heroInner}>
            <PageHeading>{heading}</PageHeading>
            <PageHeading level={2}>{subheading}</PageHeading>
            <div className={Styles.buttonBox}>
                {buttons.map((button, i) => <SmallButton key={i} onClick={button.onClick}>{button.text}</SmallButton>)}
            </div>
        </div>
    </Container>
}