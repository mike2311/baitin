import { useState } from 'react'
import { TextInput } from '../components/forms/TextInput'
import { Button } from '../components/ui/button'
import { generateContractsFromOc } from '../services/api/contract'

/**
 * Contract Generation Page
 *
 * Original Logic Reference:
 * - Documentation: docs/source/02-business-processes/contract-process.md (Generate from OC, group by vendor)
 */
export default function ContractGeneratePage() {
  const [confNo, setConfNo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    setResult(null)
    const key = confNo.trim()
    if (!key) {
      setError('OC No (confNo) is required')
      return
    }
    setIsLoading(true)
    try {
      const res = await generateContractsFromOc(key)
      setResult(res)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Contract generation failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h2 className="text-xl font-semibold">Contract - Generate from OC</h2>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <TextInput label="OC No (confNo)" value={confNo} onChange={(e) => setConfNo(e.target.value)} />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate'}
            </Button>
          </form>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {result && (
            <div className="text-sm bg-gray-50 rounded border p-3">
              <div className="font-medium mb-2">Result</div>
              <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


