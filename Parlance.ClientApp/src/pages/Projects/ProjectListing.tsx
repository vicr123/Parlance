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

export default function ProjectListing() {
    const [projects, setProjects] = useState<PartialProjectResponse[]>([]);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<any>(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const updateProjects = async () => {
        try {
            setProjects(await Fetch.get("/api/projects"));
            setDone(true);
        } catch (err) {
            console.log(err);
            setError(err);
        }
    };

    useEffect(() => {
        updateProjects();
    }, []);

    return (
        <div>
            <ErrorCover error={error}>
                <Container>
                    <PageHeading level={3}>
                        {t("AVAILABLE_PROJECTS")}
                    </PageHeading>
                    <SelectableList
                        items={
                            done
                                ? projects
                                      .sort((a, b) =>
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
