"use client"

import { useEffect, useState } from "react"
import { getCiphertext } from "@/lib/ciphertext"
import answers from "@/app/data/answers.json"

export default function AnswerPage() {
  const [ciphertext, setCiphertext] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCiphertext = async () => {
      try {
        const result = await getCiphertext()
        setCiphertext(result)

        if (answers[result as keyof typeof answers]) {
          setAnswer(answers[result as keyof typeof answers] as string)
        }
      } catch (err) {
        console.error("获取失败", err)
        setCiphertext("获取失败")
      } finally {
        setLoading(false)
      }
    }

    fetchCiphertext()
  }, [])

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        {ciphertext && !loading && (
          <div className="mb-2 rounded-lg border bg-muted p-3 text-center">
            <p>{ciphertext}</p>
          </div>
        )}

        {answer && !loading && (
          <div className="rounded-lg border bg-green-50 p-3 text-center text-green-800 dark:bg-green-900/30 dark:text-green-100">
            <p>{answer}</p>
          </div>
        )}

        {loading && (
          <div className="rounded-lg border p-3 text-center text-muted-foreground">
            <p>获取中...</p>
          </div>
        )}
      </div>
    </div>
  )
}
