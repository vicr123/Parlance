import Modal from "@/components/Modal";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { VerticalLayout } from "@/components/Layouts";
import { CopyContainer } from "@/components/CopyContainer";

export function WebhookSetupModal() {
    const { t } = useTranslation();
    const [gitProvider, setGitProvider] = useState("github");

    return (
        <Modal heading={t("WEBHOOKS_SET_UP")} buttons={[Modal.OkButton]}>
            <VerticalLayout>
                <select>
                    <option value={"github"}>GitHub</option>
                </select>
                {gitProvider == "github" && (
                    <>
                        <span>
                            On GitHub, visit your Project Settings or
                            Organization Settings to configure a webhook sent to
                            the below address, in JSON format.
                        </span>
                        <CopyContainer
                            text={`${window.location.protocol}//${window.location.hostname}/api/webhooks/github`}
                        />
                    </>
                )}
            </VerticalLayout>
        </Modal>
    );
}
