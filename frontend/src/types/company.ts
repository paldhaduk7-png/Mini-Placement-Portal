export interface Company {
  id: string
  name: string
  imageUrl?: string | null
  website?: string | null
  createdById?: string | null
  createdAt?: string
  updatedAt?: string
  drives?: any[]
  _count?: {
    drives: number
  }
}
