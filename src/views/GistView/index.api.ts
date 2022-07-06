import type { GistResponse } from './index.d'
export const fetchData = async (gistId: string | null): Promise<GistResponse | null> => {
  if (!gistId) return null
  const response = await fetch(`https://api.github.com/gists/${gistId}`)
  const json = await response.json()
  return json
}
