"use server"

import Airtable from "airtable"

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(
  process.env.AIRTABLE_BASE!
)

const usersTable = base("Supporters")
const transactionsTable = base("Transactions")

export async function getUserByEmail(email: string) {
  const records = await usersTable
    .select({
      filterByFormula: `{Email} = '${email}'`,
      maxRecords: 1,
    })
    .firstPage()

  if (records.length === 0) {
    return null
  }

  const record = records[0]
  return {
    id: record.id,
    name: record.get("Name") as string,
    email: record.get("Email") as string,
    transactions: record.get("Transactions") as string[],
  }
}

export async function getTransactionsByUserEmail(email: string) {
  // First, get the user by email
  const user = await getUserByEmail(email)
  if (!user) {
    throw new Error("User not found")
  }

  const transactionIds = user.transactions

  if (!transactionIds || transactionIds.length === 0) {
    return []
  }

  // Fetch all transactions
  const transactions = await Promise.all(
    transactionIds.map(async (transactionId) => {
      const transaction = await transactionsTable.find(transactionId)
      return {
        id: transaction.id,
        transactionID: transaction.get("TransactionID") as string,
        date: transaction.get("Date") as string,
        type: transaction.get("Type") as string,
        method: transaction.get("Method") as string,
        amount: transaction.get("Amount") as number,
        balance: transaction.get("Balance") as number,
      }
    })
  )

  // Sort transactions by date (most recent first)
  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}
