export function getDocLink(title: string, url: string) {
  return `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 400;"
                    href="${url}">
                    "${title}"
                    <a/>`;
}
