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
                <select
                    onChange={e => setGitProvider(e.target.value)}
                    value={gitProvider}
                >
                    <option value={"github"}>GitHub</option>
                    <option value={"forgejo"}>Forgejo (incl. Codeberg)</option>
                </select>
                {gitProvider == "github" && (
                    <>
                        <span>
                            On GitHub, visit your Project Settings or
                            Organization Settings to configure a webhook sent to
                            the below address, in JSON format.
                        </span>
                        <CopyContainer
                            text={`${window.location.protocol}//${window.location.hostname}/api/webhook/github`}
                        />
                        <span>
                            Parlance will only respond to the push event, so you
                            will not see the webhook status update until you
                            push to your repository.
                        </span>
                    </>
                )}
                {gitProvider == "forgejo" && (
                    <>
                        <span>
                            On Forgejo, visit your Project Settings to configure
                            a webhook sent to the below address, in JSON format.
                        </span>
                        <CopyContainer
                            text={`${window.location.protocol}//${window.location.hostname}/api/webhook/forgejo`}
                        />
                        <span>
                            Parlance will only respond to the push event, so you
                            will not see the webhook status update until you
                            push to your repository.
                        </span>
                    </>
                )}
            </VerticalLayout>
        </Modal>
    );
}
