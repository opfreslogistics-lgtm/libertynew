import { createWorker } from 'tesseract.js'

export interface CheckData {
  amount?: string
  routingNumber?: string
  accountNumber?: string
  checkNumber?: string
  payee?: string
  date?: string
  memo?: string
  rawText: string
}

/**
 * Extract check information from an image using OCR
 */
export async function extractCheckData(imageDataUrl: string): Promise<CheckData> {
  const worker = await createWorker('eng')
  
  try {
    // Perform OCR on the image
    const { data: { text } } = await worker.recognize(imageDataUrl)
    
    // Parse the extracted text
    const parsedData = parseCheckText(text)
    
    return {
      ...parsedData,
      rawText: text,
    }
  } finally {
    await worker.terminate()
  }
}

/**
 * Parse OCR text to extract check information
 */
function parseCheckText(text: string): Omit<CheckData, 'rawText'> {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  const fullText = text.replace(/\s+/g, ' ')
  
  const result: Omit<CheckData, 'rawText'> = {}
  
  // Extract amount (look for currency patterns)
  const amountPatterns = [
    /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*dollars?/gi,
    /amount[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  ]
  
  for (const pattern of amountPatterns) {
    const match = fullText.match(pattern)
    if (match) {
      const amountStr = match[0].replace(/[^\d.]/g, '')
      if (amountStr) {
        result.amount = parseFloat(amountStr).toFixed(2)
        break
      }
    }
  }
  
  // Extract routing number (9 digits, often at bottom)
  const routingPattern = /\b(\d{9})\b/g
  const routingMatches = fullText.match(routingPattern)
  if (routingMatches) {
    // Routing number is typically 9 digits
    const routing = routingMatches.find(m => m.length === 9)
    if (routing) {
      result.routingNumber = routing
    }
  }
  
  // Extract account number (usually after routing number, 10-17 digits)
  const accountPattern = /\b(\d{10,17})\b/g
  const accountMatches = fullText.match(accountPattern)
  if (accountMatches) {
    // Account number is usually longer than routing number
    const account = accountMatches.find(m => m.length >= 10 && m.length <= 17)
    if (account) {
      result.accountNumber = account
    }
  }
  
  // Extract check number (usually 3-6 digits, often labeled "Check #" or "No.")
  const checkNumberPatterns = [
    /check\s*#?\s*:?\s*(\d{3,6})/gi,
    /no\.?\s*:?\s*(\d{3,6})/gi,
    /\b(\d{3,6})\b/g,
  ]
  
  for (const pattern of checkNumberPatterns) {
    const match = fullText.match(pattern)
    if (match) {
      const checkNum = match[0].replace(/[^\d]/g, '')
      if (checkNum.length >= 3 && checkNum.length <= 6) {
        result.checkNumber = checkNum
        break
      }
    }
  }
  
  // Extract date (look for date patterns)
  const datePatterns = [
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/g,
    /\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/g,
  ]
  
  for (const pattern of datePatterns) {
    const match = fullText.match(pattern)
    if (match) {
      result.date = match[0]
      break
    }
  }
  
  // Extract payee (usually "Pay to the order of" or "Pay:")
  const payeePatterns = [
    /pay\s+to\s+the\s+order\s+of[:\s]+([^\n]+)/gi,
    /pay[:\s]+([^\n]+)/gi,
  ]
  
  for (const pattern of payeePatterns) {
    const match = fullText.match(pattern)
    if (match && match[1]) {
      result.payee = match[1].trim().substring(0, 50)
      break
    }
  }
  
  // Extract memo (usually "Memo:" or "For:")
  const memoPatterns = [
    /memo[:\s]+([^\n]+)/gi,
    /for[:\s]+([^\n]+)/gi,
  ]
  
  for (const pattern of memoPatterns) {
    const match = fullText.match(pattern)
    if (match && match[1]) {
      result.memo = match[1].trim().substring(0, 100)
      break
    }
  }
  
  return result
}

/**
 * Format extracted amount for display
 */
export function formatExtractedAmount(amount: string | undefined): string {
  if (!amount) return ''
  const num = parseFloat(amount)
  if (isNaN(num)) return ''
  return num.toFixed(2)
}

