import { useContext } from "react";

import { useRouter } from "next/router";

import useSWR from "swr";

// contexts
import { issueViewContext } from "contexts/issue-view.context";
// services
import issuesService from "services/issues.service";
import cyclesService from "services/cycles.service";
import modulesService from "services/modules.service";
// types
import { IIssue } from "types";
// fetch-keys
import {
  CYCLE_ISSUES_WITH_PARAMS,
  MODULE_ISSUES_WITH_PARAMS,
  PROJECT_ISSUES_LIST_WITH_PARAMS,
  VIEW_ISSUES,
} from "constants/fetch-keys";

const useSpreadsheetIssuesView = () => {
  const {
    issueView,
    orderBy,
    setOrderBy,
    filters,
    setFilters,
    resetFilterToDefault,
    setNewFilterDefaultView,
    setIssueView,
  } = useContext(issueViewContext);

  const router = useRouter();
  const { workspaceSlug, projectId, cycleId, moduleId, viewId } = router.query;

  const params: any = {
    order_by: orderBy,
    assignees: filters?.assignees ? filters?.assignees.join(",") : undefined,
    state: filters?.state ? filters?.state.join(",") : undefined,
    priority: filters?.priority ? filters?.priority.join(",") : undefined,
    type: filters?.type ? filters?.type : undefined,
    labels: filters?.labels ? filters?.labels.join(",") : undefined,
    issue__assignees__id: filters?.issue__assignees__id
      ? filters?.issue__assignees__id.join(",")
      : undefined,
    issue__labels__id: filters?.issue__labels__id
      ? filters?.issue__labels__id.join(",")
      : undefined,
    created_by: filters?.created_by ? filters?.created_by.join(",") : undefined,
    sub_issue: "false",
  };

  const { data: projectSpreadsheetIssues } = useSWR(
    workspaceSlug && projectId
      ? PROJECT_ISSUES_LIST_WITH_PARAMS(projectId.toString(), params)
      : null,
    workspaceSlug && projectId
      ? () =>
          issuesService.getIssuesWithParams(workspaceSlug.toString(), projectId.toString(), params)
      : null
  );

  const { data: cycleSpreadsheetIssues } = useSWR(
    workspaceSlug && projectId && cycleId
      ? CYCLE_ISSUES_WITH_PARAMS(cycleId.toString(), params)
      : null,
    workspaceSlug && projectId && cycleId
      ? () =>
          cyclesService.getCycleIssuesWithParams(
            workspaceSlug.toString(),
            projectId.toString(),
            cycleId.toString(),
            params
          )
      : null
  );

  const { data: moduleSpreadsheetIssues } = useSWR(
    workspaceSlug && projectId && moduleId
      ? MODULE_ISSUES_WITH_PARAMS(moduleId.toString(), params)
      : null,
    workspaceSlug && projectId && moduleId
      ? () =>
          modulesService.getModuleIssuesWithParams(
            workspaceSlug.toString(),
            projectId.toString(),
            moduleId.toString(),
            params
          )
      : null
  );

  const { data: viewSpreadsheetIssues } = useSWR(
    workspaceSlug && projectId && viewId && params ? VIEW_ISSUES(viewId.toString(), params) : null,
    workspaceSlug && projectId && viewId && params
      ? () =>
          issuesService.getIssuesWithParams(workspaceSlug.toString(), projectId.toString(), params)
      : null
  );

  const spreadsheetIssues = cycleId
    ? (cycleSpreadsheetIssues as IIssue[])
    : moduleId
    ? (moduleSpreadsheetIssues as IIssue[])
    : viewId
    ? (viewSpreadsheetIssues as IIssue[])
    : (projectSpreadsheetIssues as IIssue[]);

  return {
    issueView,
    spreadsheetIssues: spreadsheetIssues ?? [],
    orderBy,
    setOrderBy,
    filters,
    setFilters,
    params,
    resetFilterToDefault,
    setNewFilterDefaultView,
    setIssueView,
  } as const;
};

export default useSpreadsheetIssuesView;
