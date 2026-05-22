type LinkSource = 'workspace' | 'project' | 'docs' | 'forms';
interface ILinkBody {
  workspaceSlug?: string;
  projectIdentifier?: string;
  docsId?: string;
}
export const copyLinkToClipboard = (
  source: LinkSource,
  linkBody: ILinkBody,
) => {
  let link;
  switch (source) {
    case 'workspace': {
      link = linkBody.workspaceSlug;
      break;
    }
    case 'project': {
      link = `${linkBody.workspaceSlug}/projects/${linkBody.projectIdentifier}`;
      break;
    }

    case 'docs': {
      link = `${linkBody.workspaceSlug}/aidoc/${linkBody.docsId}`;
      break;
    }
  }

  return navigator.clipboard.writeText(
    `${location.protocol}//${location.host}/${link}`,
  );
};
