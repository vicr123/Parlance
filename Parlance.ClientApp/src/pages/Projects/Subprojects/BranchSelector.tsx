import Styles from "./BranchSelector.module.css"
import {ProjectResponse} from "@/interfaces/projects";
import Container from "@/components/Container";
import Icon from "@/components/Icon";
import SelectableList from "@/components/SelectableList";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function BranchSelector({branches, changeBranch}: {
    branches: ProjectResponse["branches"],
    changeBranch: (systemName: string) => void,
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const {t} = useTranslation();
    
    const currentBranch = branches.find(branch => branch.currentBranch)!;
    
    return <Container className={Styles.main}>
        {t("BRANCH_SELECTOR_PROMPT")}
        <div className={Styles.buttonWrapper}>
            <div className={Styles.branchButton} onClick={() => setMenuOpen(true)}>
                <Icon icon={"branch"} />
                {currentBranch?.name}
                <Icon icon={"arrow-down"} />
            </div>
            {menuOpen && <>
                <div className={Styles.scrim} onClick={() => setMenuOpen(false)} />
                <div className={Styles.popout}>
                    <div className={Styles.popoutInner}>
                        <SelectableList items={branches.map(branch => ({
                            contents: <div className={Styles.branchListItem}>
                                <Icon icon={branch.defaultBranch ? "default" : "branch"} />
                                {branch.name}
                            </div>,
                            onClick: () => {
                                setMenuOpen(false);
                                changeBranch(branch.systemName);
                            }
                        }))} />
                    </div>
                </div>
            </>}
        </div>
    </Container>
}