'use client'

import { ChangeEvent, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

type AnalyzeResult = {
  summary?: string
  keyInsights?: string[]
  structuredResume?: unknown
}

export default function ResumeUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<AnalyzeResult | null>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null

    if (!selectedFile) {
      setFile(null)
      return
    }

    if (selectedFile.type !== 'application/pdf') {
      setError('Please choose a PDF file.')
      setFile(null)
      return
    }

    setError('')
    setResult(null)
    setFile(selectedFile)
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a PDF first.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Request failed: ${response.status} ${text}`)
      }

      const data: AnalyzeResult = await response.json()
      setResult(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Resume Analyzer
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Upload a PDF resume, send it to the analyze API, and view the parsed result.
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Button variant="outlined" component="label">
              Choose PDF
              <input hidden type="file" accept="application/pdf" onChange={handleFileChange} />
            </Button>

            {file && (
              <Typography variant="body2">
                Selected file: <strong>{file.name}</strong>
              </Typography>
            )}

            <Box>
              <Button variant="contained" onClick={handleAnalyze} disabled={loading || !file}>
                {loading ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            </Box>

            {loading && (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={20} />
                <Typography variant="body2">Uploading and analyzing...</Typography>
              </Stack>
            )}

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </Paper>

        {result && (
          <Stack spacing={2}>
            {result.summary && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Summary
                  </Typography>
                  <Typography variant="body1">{result.summary}</Typography>
                </CardContent>
              </Card>
            )}

            {Array.isArray(result.keyInsights) && result.keyInsights.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Key Insights
                  </Typography>
                  <Stack component="ul" sx={{ pl: 3, mb: 0 }}>
                    {result.keyInsights.map((item, index) => (
                      <Typography component="li" key={index}>
                        {item}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Raw Result
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'grey.100',
                    overflowX: 'auto',
                    fontSize: 14,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    m: 0,
                  }}
                >
                  {JSON.stringify(result, null, 2)}
                </Box>
              </CardContent>
            </Card>
          </Stack>
        )}
      </Stack>
    </Container>
  )
}
