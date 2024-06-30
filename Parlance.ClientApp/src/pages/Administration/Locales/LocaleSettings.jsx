import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../../components/BackButton";
import ListPageBlock from "../../../components/ListPageBlock";
import { VerticalLayout } from "../../../components/Layouts";
import PageHeading from "../../../components/PageHeading";
import LineEdit from "../../../components/LineEdit";
import { useTranslation } from "react-i18next";
import SelectableList from "../../../components/SelectableList";
import i18n from "../../../helpers/i18n";
import { useEffect, useState } from "react";
import Fetch from "../../../helpers/Fetch";
import LoadingModal from "../../../components/modals/LoadingModal";
import Modal from "../../../components/Modal";
import ModalList from "../../../components/ModalList";
import ErrorModal from "../../../components/modals/ErrorModal";

export default function LocaleSettings(props) {
    const [users, setUsers] = useState([]);
    const [addingUser, setAddingUser] = useState("");
    const { locale } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const updateUsers = async () => {
        let users = await Fetch.get(`/api/permissions/language/${locale}`);
        setUsers(
            users.map(x => ({
                contents: x,
                onClick: () => {
                    Modal.mount(
                        <Modal
                            heading={t("USER_PERMISSIONS_TITLE", { user: x })}
                            buttons={[Modal.CancelButton]}
                        >
                            <span>{t("GENERIC_PROMPT")}</span>
                            <ModalList>
                                {[
                                    {
                                        text: t(
                                            "LANGUAGE_PERMISSION_REVOKE_BUTTON",
                                            {
                                                lang: i18n.humanReadableLocale(
                                                    locale,
                                                ),
                                            },
                                        ),
                                        type: "destructive",
                                        onClick: async () => {
                                            Modal.mount(<LoadingModal />);
                                            try {
                                                await Fetch.delete(
                                                    `/api/permissions/language/${locale}/${encodeURIComponent(x)}`,
                                                    {},
                                                );
                                                await updateUsers();

                                                Modal.unmount();
                                            } catch (error) {
                                                Modal.mount(
                                                    <ErrorModal
                                                        error={error}
                                                    />,
                                                );
                                            }
                                        },
                                    },
                                ]}
                            </ModalList>
                        </Modal>,
                    );
                },
            })),
        );
    };

    useEffect(() => {
        updateUsers();
    }, []);

    const addUser = async () => {
        if (addingUser === "") return;

        Modal.mount(<LoadingModal />);
        try {
            await Fetch.post(
                `/api/permissions/language/${locale}/${encodeURIComponent(addingUser)}`,
                {},
            );
            await updateUsers();

            setAddingUser("");
            Modal.unmount();
        } catch (error) {
            Modal.mount(<ErrorModal error={error} />);
        }
    };

    return (
        <>
            <BackButton inListPage={true} onClick={() => navigate("..")} />
            <ListPageBlock>
                <VerticalLayout>
                    <PageHeading level={3}>
                        {i18n.humanReadableLocale(locale)}
                    </PageHeading>
                    <span>
                        {t("LANGUAGE_PERMISSIONS_PROMPT", {
                            lang: i18n.humanReadableLocale(locale),
                        })}
                    </span>
                    <SelectableList items={users} />
                </VerticalLayout>
            </ListPageBlock>
            <ListPageBlock>
                <VerticalLayout>
                    <PageHeading level={3}>
                        {t("LANGUAGE_PERMISSIONS_ADD_NEW")}
                    </PageHeading>
                    <span>
                        {t("translation:LANGUAGE_PERMISSIONS_ADD_NEW_PROMPT", {
                            lang: i18n.humanReadableLocale(locale),
                        })}
                    </span>
                    <LineEdit
                        placeholder={t("USERNAME")}
                        value={addingUser}
                        style={{
                            marginBottom: "9px",
                        }}
                        onChange={e => setAddingUser(e.target.value)}
                    />
                    <SelectableList onClick={addUser}>
                        {t("LANGUAGE_PERMISSIONS_ADD_NEW")}
                    </SelectableList>
                </VerticalLayout>
            </ListPageBlock>
        </>
    );
}
