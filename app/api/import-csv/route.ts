import { NextRequest, NextResponse } from 'next/server'
import { parse } from 'csv-parse/sync'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  try {
    const fileContent = await file.text()
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    })

    const transactions = records.map((record: any) => ({
      date: record.Date,
      description: record.Description,
      withdrawals: record.Withdrawals ? parseFloat(record.Withdrawals) : null,
      deposits: record.Deposits ? parseFloat(record.Deposits) : null,
      balance: parseFloat(record.Balance),
    }))

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error parsing CSV:', error)
    return NextResponse.json({ error: 'Failed to parse CSV file' }, { status: 500 })
  }
}

