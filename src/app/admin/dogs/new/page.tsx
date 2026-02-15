import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DogForm } from '../dog-form'

export default function NewDogPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Add New Dog</h1>
      <p className="mt-1 text-neutral-600">
        Add a new dog to your breeding program
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Dog Information</CardTitle>
        </CardHeader>
        <CardContent>
          <DogForm />
        </CardContent>
      </Card>
    </div>
  )
}
