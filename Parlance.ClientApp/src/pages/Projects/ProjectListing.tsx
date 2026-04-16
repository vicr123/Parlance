import Container from "../../components/Container";
import PageHeading from "../../components/PageHeading";
import React, { useEffect, useState } from "react";
import Fetch from "../../helpers/Fetch";
import SelectableList from "../../components/SelectableList";
import { useNavigate } from "react-router-dom";
import TranslationProgressIndicator from "../../components/TranslationProgressIndicator";
import { useTranslation } from "react-i18next";
import ErrorCover from "../../components/ErrorCover";
import { calculateDeadline } from "../../helpers/Misc";
import { PartialProjectResponse } from "../../interfaces/projects";
import { useNetworkGet } from "@/network/useNetworkGet";

export default function ProjectListing() {
    const [projects, loading, _, error] =
        useNetworkGet<PartialProjectResponse[]>("/api/projects");
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div>
            <ErrorCover error={error}>
                <Container>
                    <PageHeading level={3}>
                        {t("AVAILABLE_PROJECTS")}
                    </PageHeading>
                    <SelectableList
                        items={
                            !loading
                                ? projects
                                      ?.sort((a, b) =>
                                          calculateDeadline(
                                              a.deadline ?? undefined,
                                          )
                                              .ms.subtract(
                                                  calculateDeadline(
                                                      b.deadline ?? undefined,
                                                  ).ms,
                                              )
                                              .asMilliseconds(),
                                      )
                                      .map(p => ({
                                          contents: (
                                              <TranslationProgressIndicator
                                                  title={p.name}
                                                  data={p.completionData}
                                                  deadline={
                                                      p.deadline ?? undefined
                                                  }
                                              />
                                          ),
                                          onClick: () => navigate(p.systemName),
                                      }))
                                : TranslationProgressIndicator.PreloadContents()
                        }
                    />
                </Container>
            </ErrorCover>
        </div>
    );
}
