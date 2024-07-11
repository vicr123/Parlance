import BackButton from "../../components/BackButton";
import { useNavigate } from "react-router-dom";
import Container from "../../components/Container";
import { VerticalLayout, VerticalSpacer } from "@/components/Layouts.js";
import PageHeading from "../../components/PageHeading";
import LineEdit from "../../components/LineEdit";
import SelectableList from "../../components/SelectableList";
import { useTranslation } from "react-i18next";
import { useEffect, useId, useState } from "react";
import LoadingModal from "../../components/modals/LoadingModal";
import Modal from "../../components/Modal";
import ErrorModal from "../../components/modals/ErrorModal";
import Fetch from "../../helpers/Fetch";
import { NotificationConsent } from "@/interfaces/users";

export default function Attribution() {
    const [haveConsent, setHaveConsent] = useState(false);
    const [preferredName, setPreferredName] = useState("");
    const { t } = useTranslation();
    const navigate = useNavigate();
    const checkboxId = useId();

    useEffect(() => {
        (async () => {
            Modal.mount(<LoadingModal />);
            try {
                const consentDetails = await Fetch.get<NotificationConsent>(
                    "/api/user/attribution/consent",
                );
                setHaveConsent(consentDetails.consentProvided);
                setPreferredName(consentDetails.preferredUserName);
                Modal.unmount();
            } catch (err) {
                Modal.mount(<ErrorModal error={err} />);
                navigate("..");
            }
        })();
    }, []);

    const applySettings = async () => {
        Modal.mount(<LoadingModal />);
        try {
            await Fetch.post("/api/user/attribution/consent", {
                consentProvided: haveConsent,
                preferredName: preferredName,
            });
            Modal.unmount();
            navigate("..");
        } catch (err) {
            Modal.mount(<ErrorModal error={err} />);
        }
    };

    return (
        <div>
            <BackButton onClick={() => navigate("..")} />
            <Container>
                <VerticalLayout>
                    <PageHeading level={3}>{t("ATTRIBUTION")}</PageHeading>
                    <span>{t("ATTRIBUTION_PROMPT_1")}</span>
                    <span>{t("ATTRIBUTION_PROMPT_2")}</span>
                    <div>
                        <input
                            type={"checkbox"}
                            id={checkboxId}
                            checked={haveConsent}
                            onChange={e => setHaveConsent(e.target.checked)}
                        />
                        <label htmlFor={checkboxId}>
                            {t("ATTRIBUTION_CHECKBOX")}
                        </label>
                    </div>
                    {haveConsent && (
                        <>
                            <hr />
                            <span>{t("ATTRIBUTION_PROMPT_3")}</span>
                            <LineEdit
                                placeholder={t("PREFERRED_NAME")}
                                value={preferredName}
                                onChange={e =>
                                    setPreferredName(
                                        (e.target as HTMLInputElement).value,
                                    )
                                }
                            />
                        </>
                    )}
                    <VerticalSpacer height={20} />
                    <SelectableList onClick={applySettings}>
                        {t("APPLY_ATTRIBUTION_SETTINGS")}
                    </SelectableList>
                </VerticalLayout>
            </Container>
        </div>
    );
}
