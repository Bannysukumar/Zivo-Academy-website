import { PublicLayoutClient } from "./public-layout-client"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayoutClient>{children}</PublicLayoutClient>
}
