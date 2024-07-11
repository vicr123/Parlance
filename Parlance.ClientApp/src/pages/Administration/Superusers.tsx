import PageHeading from "../../components/PageHeading";
import { useTranslation } from "react-i18next";
import ListPageBlock from "../../components/ListPageBlock";
import SelectableList, {
    SelectableListItem,
} from "../../components/SelectableList";
import { useEffect, useState } from "react";
import Fetch from "../../helpers/Fetch";
import Modal from "../../components/Modal";
import LoadingModal from "../../components/modals/LoadingModal";
import UserManager from "../../helpers/UserManager";
import LineEdit from "../../components/LineEdit";
import { VerticalLayout } from "@/components/Layouts";

export default function () {
    const [superusers, setSuperusers] = useState<SelectableListItem[]>([]);
    const [promotingUser, setPromotingUser] = useState("");
    const { t } = useTranslation();

    const updateSuperusers = async () => {
        let superusers = await Fetch.get<string[]>("/api/superusers");
        setSuperusers(
            superusers.map(x => ({
                contents: x,
                onClick: () => {
                    if (x === UserManager.currentUser?.username) return;

                    Modal.mount(
                        <Modal
                            heading={t("Demote User")}
                            buttons={[
                                Modal.CancelButton,
                                {
                                    text: t("DEMOTE"),
                                    onClick: async () => {
                                        Modal.mount(<LoadingModal />);
                                        try {
                                            await Fetch.delete(
                                                `/api/superusers/${encodeURIComponent(x)}`,
                                            );
                                            await updateSuperusers();
                                            Modal.unmount();
                                        } catch (e) {
                                            Modal.unmount();
                                        }
                                    },
                                },
                            ]}
                        >
                            <p>{t("DEMOTE_SUPERUSER_PROMPT_1", { user: x })}</p>
                            <p>{t("DEMOTE_SUPERUSER_PROMPT_2", { user: x })}</p>
                        </Modal>,
                    );
                },
            })),
        );
    };

    useEffect(() => {
        updateSuperusers();
    }, []);

    const promote = () => {
        if (promotingUser === "") {
            Modal.mount(
                <Modal
                    heading={t("PROMOTE_TO_SUPERUSER")}
                    buttons={[Modal.OkButton]}
                >
                    <span>{t("PROMOTE_NO_USER_PROMPT")}</span>
                </Modal>,
            );
            return;
        }

        Modal.mount(
            <Modal
                heading={t("PROMOTE_TO_SUPERUSER")}
                buttons={[
                    Modal.CancelButton,
                    {
                        text: t("PROMOTE"),
                        onClick: async () => {
                            Modal.mount(<LoadingModal />);
                            try {
                                await Fetch.post("/api/superusers", {
                                    username: promotingUser,
                                });
                                await updateSuperusers();

                                setPromotingUser("");
                                Modal.unmount();
                            } catch (e) {
                                Modal.unmount();
                            }
                        },
                    },
                ]}
            >
                <VerticalLayout>
                    <span>
                        {t("PROMOTE_PROMPT_1", { user: promotingUser })}
                    </span>
                    <span>
                        {t("PROMOTE_PROMPT_2", { user: promotingUser })}
                    </span>
                </VerticalLayout>
            </Modal>,
        );
    };

    return (
        <>
            <ListPageBlock>
                <VerticalLayout>
                    <PageHeading level={3}>{t("SUPERUSERS")}</PageHeading>
                    <span>{t("SUPERUSER_PROMPT_1")}</span>
                    <SelectableList items={superusers} />
                </VerticalLayout>
            </ListPageBlock>
            <ListPageBlock>
                <VerticalLayout>
                    <PageHeading level={3}>
                        {t("PROMOTE_TO_SUPERUSER")}
                    </PageHeading>
                    <span>{t("SUPERUSER_PROMOTE_PROMPT_1")}</span>
                    <LineEdit
                        placeholder={"Username"}
                        value={promotingUser}
                        style={{
                            marginBottom: "9px",
                        }}
                        onChange={e =>
                            setPromotingUser(
                                (e.target as HTMLInputElement).value,
                            )
                        }
                    />
                    <SelectableList onClick={promote}>
                        {t("PROMOTE_TO_SUPERUSER")}
                    </SelectableList>
                </VerticalLayout>
            </ListPageBlock>
        </>
    );
}
