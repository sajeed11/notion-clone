import React from "react"
import { Navbar } from "./_components/Navbar"

const MarketingLayout = ({
  children
}: {
  children: React.ReactNode
}) => {
  return (
    <div className="h-full">
      <Navbar />
      <main className="h-full pt-40 dark:bg-[#1F1F1F] bg-background">
        {children}
      </main>
    </div>
  )
}

export default MarketingLayout