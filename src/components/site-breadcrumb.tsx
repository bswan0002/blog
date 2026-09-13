import { Fragment } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export interface BreadcrumbEntry {
  label: string
  href?: string
}

export function SiteBreadcrumb({ items = [] }: { items?: BreadcrumbEntry[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="font-mono">
        <BreadcrumbItem>
          <BreadcrumbLink href="/" aria-current={items.length === 0 ? "page" : undefined}>
            Ben Swanson
          </BreadcrumbLink>
        </BreadcrumbItem>
        {items.map((item, index) => (
          <Fragment key={index}>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem className="min-w-0">
              {item.href ? (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
