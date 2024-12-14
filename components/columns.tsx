"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { TransactionType } from "@/lib/airtable/types"

import { Button } from "./ui/button"

export const columns: ColumnDef<TransactionType>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "type",
    header: "Transaction Type",
  },
  {
    accessorKey: "method",
    header: "Transaction Method",
  },
  {
    accessorKey: "balance",
    header: "Balance",
  },
]
