import Modal from "@/components/Modal";
import { VerticalLayout, VerticalSpacer } from "@/components/Layouts";
import LineEdit from "@/components/LineEdit";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export function ChangeBranchModal({
    initialBranch,
    onChangeBranch,
}: {
    initialBranch: string;
    onChangeBranch: (branch: string) => void;
}) {
    const { t } = useTranslation();
    const [branch, setBranch] = useState(initialBranch);

    return (
        <Modal
            heading={t("PROJECT_CHANGE_BRANCH")}
            buttons={[
                Modal.CancelButton,
                {
                    text: t("PROJECT_CHANGE_BRANCH"),
                    onClick: () => {
                        onChangeBranch(branch);
                    },
                },
            ]}
        >
            <VerticalLayout>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {t("What is the name of the branch you want to checkout?")}
                    <VerticalSpacer height={3} />
                    <LineEdit
                        placeholder={t("BRANCH")}
                        value={branch}
                        onChange={e =>
                            setBranch((e.target as HTMLInputElement).value)
                        }
                    />
                    <hr />
                    {t(
                        "Changing branches will discard any changes that have not been pushed to the remote.",
                    )}
                </div>
            </VerticalLayout>
        </Modal>
    );
}
