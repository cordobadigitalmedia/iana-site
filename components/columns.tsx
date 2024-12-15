"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { TransactionType } from "@/lib/airtable/types"

import { Badge } from "./ui/badge"
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
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "CAD",
      }).format(amount)

      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: "type",
    header: "Transaction Type",
    cell: ({ row }) => {
      return (
        <Badge
          variant={
            row.getValue("type") === "deposit" ? "default" : "destructive"
          }
        >
          {row.getValue("type")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "method",
    header: "Transaction Method",
  },
]
