/* eslint-disable tailwindcss/classnames-order */
"use client"

import { useEffect, useState } from "react"
import { PageAndNavQuery } from "@/tina/__generated__/types"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { useTina } from "tinacms/dist/react"

import { getTransactionsByUserEmail } from "@/lib/airtable/queries"
import type { TransactionType } from "@/lib/airtable/types"
import { DataTable } from "@/components/DataTable"
import { columns } from "@/components/columns"
import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"

export function Dashboard(props: {
  data: PageAndNavQuery
  variables: {
    relativePath: string
  }
  query: string
}) {
  const { data } = useTina(props)
  const [transactions, setTransactions] = useState<TransactionType[] | []>([])
  const { isAuthenticated, isLoading, user } = useKindeBrowserClient()
  useEffect(() => {
    const updateData = async () => {
      if (user?.email) {
        const transactionData = await getTransactionsByUserEmail(user.email)
        setTransactions(transactionData)
      }
    }
    updateData()
  }, [user?.email])

  if (isLoading) return <div>Loading...</div>

  //Add username
  //Add sitebar login logout instead of apply for load
  //title
  //Filter by transaction type
  //Total for balance

  return (
    <>
      <SiteHeader nav={data.nav} header={data.header} />
      <div className="flex min-h-[calc(100vh-65px)] flex-col">
        {isAuthenticated && user ? (
          <main className="container mx-auto py-8 space-y-8">
            {transactions && transactions.length > 0 && (
              <DataTable columns={columns} data={transactions} />
            )}
          </main>
        ) : (
          <div>
            You have to <LoginLink orgCode="org_e7b807671990">Login</LoginLink>{" "}
            to see this page
          </div>
        )}
        <Footer footer={data.footer} />
      </div>
    </>
  )
}
