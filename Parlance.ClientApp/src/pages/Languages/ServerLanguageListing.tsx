import { useNavigate } from "react-router-dom";
import React, { useEffect, useReducer, useState } from "react";
import Hero from "../../components/Hero";
import ErrorCover from "../../components/ErrorCover";
import PageHeading from "../../components/PageHeading";
import SelectableList from "../../components/SelectableList";
import { useTranslation } from "react-i18next";
import UserManager from "../../helpers/UserManager";
import Fetch from "../../helpers/Fetch";
import i18n from "../../helpers/i18n";
import Modal from "../../components/Modal";
import TranslationProgressIndicator from "../../components/TranslationProgressIndicator";
import Container from "../../components/Container";
import { CompletionData, LanguageMeta } from "@/interfaces/projects";

export default function ServerLanguageListing() {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
    const [languages, setLanguages] = useState<LanguageMeta[]>([]);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<any>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    UserManager.on("currentUserChanged", forceUpdate);

    const updateProjects = async () => {
        try {
            let subprojectData = await Fetch.get<LanguageMeta[]>(
                `/api/projects/languages`,
            );
            setLanguages(subprojectData);
            setDone(true);
        } catch (err) {
            setError(err);
        }
    };

    useEffect(() => {
        updateProjects();
    }, []);

    const seenLanguages: string[] = [];
    const showLanguages = [
        ...languages,
        ...(UserManager.currentUser?.languagePermissions?.map<{
            language: string;
            completionData?: CompletionData;
        }>(language => ({
            language,
        })) || []),
    ]
        .filter(x => {
            if (seenLanguages.includes(x.language)) return false;
            seenLanguages.push(x.language);
            return true;
        })
        .sort((a, b) =>
            i18n
                .humanReadableLocale(a.language)
                .localeCompare(i18n.humanReadableLocale(b.language)),
        );

    const translationClicked = (language: string) => {
        if (languages.some(l => l.language === language)) {
            navigate(language);
        } else {
            Modal.mount(
                <Modal
                    heading={t("START_NEW_TRANSLATION")}
                    buttons={[Modal.OkButton]}
                >
                    {t("START_NEW_TRANSLATION_GUIDE")}
                </Modal>,
            );
        }
    };

    const myLanguages =
        UserManager.currentUser?.languagePermissions &&
        showLanguages.filter(lang =>
            UserManager.currentUser!.languagePermissions.includes(
                lang.language,
            ),
        );
    const otherLanguages = UserManager.currentUser?.languagePermissions
        ? showLanguages.filter(
              lang =>
                  !UserManager.currentUser!.languagePermissions.includes(
                      lang.language,
                  ),
          )
        : showLanguages;

    return (
        <div>
            <Hero heading={t("AVAILABLE_LANGUAGES")} buttons={[]} />
            <ErrorCover error={error}>
                {myLanguages && (
                    <>
                        <Container>
                            <PageHeading level={3}>
                                {t("MY_LANGUAGES")}
                            </PageHeading>
                            <SelectableList
                                items={
                                    done
                                        ? myLanguages.map(p => ({
                                              contents: (
                                                  <TranslationProgressIndicator
                                                      title={i18n.humanReadableLocale(
                                                          p.language,
                                                      )}
                                                      data={p.completionData}
                                                  />
                                              ),
                                              onClick: () =>
                                                  translationClicked(
                                                      p.language,
                                                  ),
                                          }))
                                        : TranslationProgressIndicator.PreloadContents()
                                }
                            />
                        </Container>
                    </>
                )}
                <Container>
                    <PageHeading level={3}>
                        {myLanguages
                            ? t("OTHER_LANGUAGES")
                            : t("AVAILABLE_LANGUAGES")}
                    </PageHeading>
                    <SelectableList
                        items={
                            done
                                ? otherLanguages.map(p => ({
                                      contents: (
                                          <TranslationProgressIndicator
                                              title={i18n.humanReadableLocale(
                                                  p.language,
                                              )}
                                              data={p.completionData}
                                          />
                                      ),
                                      onClick: () =>
                                          translationClicked(p.language),
                                  }))
                                : TranslationProgressIndicator.PreloadContents()
                        }
                    />
                </Container>
            </ErrorCover>
        </div>
    );
}
