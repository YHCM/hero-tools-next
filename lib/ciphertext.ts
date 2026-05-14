export async function getCiphertext(): Promise<string> {
  try {
    const response = await fetch(
      "https://manageplatform.maple-game.com:9009/defend/web/rampageHero/ciphertext"
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const ciphertext = html.match(/<div>([^<]+)<\/div>/)?.[1]

    return ciphertext || "获取暗号问题失败"
  } catch (error) {
    console.error("获取暗号问题失败：", error)
    return "获取暗号问题失败"
  }
}
