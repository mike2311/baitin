import { useState } from 'react'
import { TextInput } from '../components/forms/TextInput'
import { Button } from '../components/ui/button'
import { Navigation } from '../components/Navigation'
import { postOeToOc } from '../services/api/orderConfirmation'

/**
 * Post OE to OC Page
 *
 * Original Logic Reference:
 * - FoxPro Form: `upostoe` (Post OE/Post OC)
 * - Documentation: docs/source/04-forms-and-screens/order-confirmation-forms.md (posting + numbering rules)
 */
export default function OrderConfirmationPostPage() {
  const [companyCode, setCompanyCode] = useState('HT')
  const [oeNosText, setOeNosText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    setResult(null)
    const code = companyCode.trim().toUpperCase()
    const oeNos = oeNosText
      .split(/[\n,]+/g)
      .map((s) => s.trim())
      .filter(Boolean)

    if (!code) {
      setError('Company code is required')
      return
    }
    if (oeNos.length === 0) {
      setError('Enter at least one OE No')
      return
    }

    setIsLoading(true)
    try {
      const res = await postOeToOc({ companyCode: code, oeNos })
      setResult(res)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Posting failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h2 className="text-xl font-semibold">Order Confirmation - Post OE to OC</h2>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <TextInput
              label="Company Code"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              maxLength={10}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">OE No(s)</label>
              <textarea
                className="w-full min-h-[120px] rounded-md border border-gray-300 p-2 text-sm"
                value={oeNosText}
                onChange={(e) => setOeNosText(e.target.value)}
                placeholder="Enter OE numbers separated by comma or new line"
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Posting...' : 'Post'}
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
    </div>
  )
}


