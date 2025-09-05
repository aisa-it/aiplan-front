export function messageNotificationRender(data: any, detail: any) {
  let msg = data?.msg || '';

  const issueKey = `${detail.project?.identifier}-${detail.issue?.sequence_id}`;
  const issueUrl = detail.issue?.url;

  if (issueKey && issueUrl && msg.includes(issueKey)) {
    msg = msg.replace(
      issueKey,
      `<a href="${issueUrl}" target="_blank" style="color: #3F76FF; text-decoration: none;">${issueKey}</a>`,
    );
  }

  return `
    <div>
      <p>${msg}</p>
    </div>
  `;
}
