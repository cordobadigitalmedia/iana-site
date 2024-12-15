/* eslint-disable tailwindcss/classnames-order */
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageAndNavQuery } from "@/tina/__generated__/types"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { DollarSign } from "lucide-react"
import { useTina } from "tinacms/dist/react"

import { getTransactionsByUserEmail } from "@/lib/airtable/queries"
import type { TransactionType } from "@/lib/airtable/types"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
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
  const [loadingData, setLoadingData] = useState(false)
  const [transactions, setTransactions] = useState<TransactionType[] | []>([])
  const { isAuthenticated, isLoading, user } = useKindeBrowserClient()
  useEffect(() => {
    const updateData = async () => {
      setLoadingData(true)
      if (user?.email) {
        const transactionData = await getTransactionsByUserEmail(user.email)
        setTransactions(transactionData)
      }
      setLoadingData(false)
    }
    updateData()
  }, [user?.email])

  return (
    <>
      <SiteHeader nav={data.nav} header={data.header} />
      <div className="flex min-h-[calc(100vh-65px)] flex-col">
        {isAuthenticated && user ? (
          <main className="container mx-auto py-4 space-y-4">
            {isLoading || loadingData ? <Loading /> : null}
            <div className="flex">
              Assalamu-alaikum {user.given_name}{" "}
              <div className="grow flex justify-end">
                <LogoutLink>
                  <Button>Logout</Button>
                </LogoutLink>
              </div>
            </div>
            {transactions && transactions.length > 0 && (
              <>
                <div className="flex items-center gap-4">
                  <div className="prose flex items-center p-4 rounded border border-gray-300 w-fit">
                    Current Balance: <DollarSign className="size-5" />
                    <div className="text-lg">
                      {transactions
                        .map((item) => item.balance)
                        .reduce((a, b) => a + b, 0)}
                    </div>
                  </div>
                  <Link
                    href="mailto:support-iana@ianafinancial.org"
                    target="_blank"
                  >
                    <Button>Send transaction request</Button>
                  </Link>
                </div>
                <div className="prose max-w-none">
                  <h2>Transactions History</h2>
                </div>
                <DataTable columns={columns} data={transactions} />
              </>
            )}
          </main>
        ) : (
          <main className="container mx-auto py-4 space-y-4">
            Please{" "}
            <LoginLink orgCode="org_e7b807671990">
              <Button>Login</Button>
            </LoginLink>{" "}
            to see this page
          </main>
        )}
        <Footer footer={data.footer} />
      </div>
    </>
  )
}
