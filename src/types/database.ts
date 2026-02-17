export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      dogs: {
        Row: {
          id: string
          name: string
          slug: string
          gender: 'male' | 'female'
          color: string
          date_of_birth: string | null
          status: 'available' | 'reserved' | 'sold' | 'breeding' | 'retired'
          is_fluffy: boolean
          bio: string | null
          health_testing: string | null
          image_url: string | null
          gallery_urls: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          gender: 'male' | 'female'
          color: string
          date_of_birth?: string | null
          status?: 'available' | 'reserved' | 'sold' | 'breeding' | 'retired'
          is_fluffy?: boolean
          bio?: string | null
          health_testing?: string | null
          image_url?: string | null
          gallery_urls?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          gender?: 'male' | 'female'
          color?: string
          date_of_birth?: string | null
          status?: 'available' | 'reserved' | 'sold' | 'breeding' | 'retired'
          is_fluffy?: boolean
          bio?: string | null
          health_testing?: string | null
          image_url?: string | null
          gallery_urls?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      dog_images: {
        Row: {
          id: string
          dog_id: string
          image_url: string
          alt_text: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          dog_id: string
          image_url: string
          alt_text?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          dog_id?: string
          image_url?: string
          alt_text?: string | null
          display_order?: number
          created_at?: string
        }
      }
      health_tests: {
        Row: {
          id: string
          dog_id: string
          test_type: string
          result: string
          test_date: string | null
          document_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          dog_id: string
          test_type: string
          result: string
          test_date?: string | null
          document_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          dog_id?: string
          test_type?: string
          result?: string
          test_date?: string | null
          document_url?: string | null
          created_at?: string
        }
      }
      litters: {
        Row: {
          id: string
          name: string
          sire_id: string | null
          dam_id: string | null
          custom_sire_name: string | null
          custom_dam_name: string | null
          status: 'expected' | 'born' | 'available' | 'sold'
          expected_date: string | null
          date_of_birth: string | null
          description: string | null
          puppy_count: number | null
          available_count: number | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          sire_id?: string | null
          dam_id?: string | null
          custom_sire_name?: string | null
          custom_dam_name?: string | null
          status?: 'expected' | 'born' | 'available' | 'sold'
          expected_date?: string | null
          date_of_birth?: string | null
          description?: string | null
          puppy_count?: number | null
          available_count?: number | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          sire_id?: string | null
          dam_id?: string | null
          custom_sire_name?: string | null
          custom_dam_name?: string | null
          status?: 'expected' | 'born' | 'available' | 'sold'
          expected_date?: string | null
          date_of_birth?: string | null
          description?: string | null
          puppy_count?: number | null
          available_count?: number | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      litter_images: {
        Row: {
          id: string
          litter_id: string
          image_url: string
          alt_text: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          litter_id: string
          image_url: string
          alt_text?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          litter_id?: string
          image_url?: string
          alt_text?: string | null
          display_order?: number
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          city: string | null
          state: string | null
          experience_level: 'first_time' | 'experienced' | 'breeder' | null
          household_description: string | null
          living_situation: 'house' | 'apartment' | 'condo' | 'other' | null
          has_yard: boolean | null
          has_other_pets: boolean | null
          other_pets_description: string | null
          has_children: boolean | null
          children_ages: string | null
          goals: string | null
          timeline: string | null
          budget_range: string | null
          preferred_sex: 'male' | 'female' | 'either' | null
          preferred_color: string | null
          how_heard_about_us: string | null
          additional_notes: string | null
          status: 'pending' | 'reviewing' | 'approved' | 'declined' | 'waitlisted'
          litter_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          city?: string | null
          state?: string | null
          experience_level?: 'first_time' | 'experienced' | 'breeder' | null
          household_description?: string | null
          living_situation?: 'house' | 'apartment' | 'condo' | 'other' | null
          has_yard?: boolean | null
          has_other_pets?: boolean | null
          other_pets_description?: string | null
          has_children?: boolean | null
          children_ages?: string | null
          goals?: string | null
          timeline?: string | null
          budget_range?: string | null
          preferred_sex?: 'male' | 'female' | 'either' | null
          preferred_color?: string | null
          how_heard_about_us?: string | null
          additional_notes?: string | null
          status?: 'pending' | 'reviewing' | 'approved' | 'declined' | 'waitlisted'
          litter_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          city?: string | null
          state?: string | null
          experience_level?: 'first_time' | 'experienced' | 'breeder' | null
          household_description?: string | null
          living_situation?: 'house' | 'apartment' | 'condo' | 'other' | null
          has_yard?: boolean | null
          has_other_pets?: boolean | null
          other_pets_description?: string | null
          has_children?: boolean | null
          children_ages?: string | null
          goals?: string | null
          timeline?: string | null
          budget_range?: string | null
          preferred_sex?: 'male' | 'female' | 'either' | null
          preferred_color?: string | null
          how_heard_about_us?: string | null
          additional_notes?: string | null
          status?: 'pending' | 'reviewing' | 'approved' | 'declined' | 'waitlisted'
          litter_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          subject: string | null
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          subject?: string | null
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          subject?: string | null
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          updated_at?: string
        }
      }
      pricing_options: {
        Row: {
          id: string
          name: string
          subtitle: string
          price: string
          price_note: string | null
          description: string | null
          icon: string
          featured: boolean
          display_order: number
          features: string[]
          is_active: boolean
          option_type: 'ownership' | 'service'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subtitle: string
          price: string
          price_note?: string | null
          description?: string | null
          icon?: string
          featured?: boolean
          display_order?: number
          features?: string[]
          is_active?: boolean
          option_type?: 'ownership' | 'service'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subtitle?: string
          price?: string
          price_note?: string | null
          description?: string | null
          icon?: string
          featured?: boolean
          display_order?: number
          features?: string[]
          is_active?: boolean
          option_type?: 'ownership' | 'service'
          created_at?: string
          updated_at?: string
        }
      }
      puppies: {
        Row: {
          id: string
          litter_id: string
          name: string | null
          collar_color: string | null
          gender: 'male' | 'female'
          color: string | null
          status: 'available' | 'reserved' | 'deposit' | 'sold'
          price: number | null
          birth_weight_oz: number | null
          current_weight_oz: number | null
          buyer_name: string | null
          buyer_email: string | null
          buyer_phone: string | null
          deposit_amount: number | null
          deposit_paid_at: string | null
          sold_at: string | null
          notes: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          litter_id: string
          name?: string | null
          collar_color?: string | null
          gender: 'male' | 'female'
          color?: string | null
          status?: 'available' | 'reserved' | 'deposit' | 'sold'
          price?: number | null
          birth_weight_oz?: number | null
          current_weight_oz?: number | null
          buyer_name?: string | null
          buyer_email?: string | null
          buyer_phone?: string | null
          deposit_amount?: number | null
          deposit_paid_at?: string | null
          sold_at?: string | null
          notes?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          litter_id?: string
          name?: string | null
          collar_color?: string | null
          gender?: 'male' | 'female'
          color?: string | null
          status?: 'available' | 'reserved' | 'deposit' | 'sold'
          price?: number | null
          birth_weight_oz?: number | null
          current_weight_oz?: number | null
          buyer_name?: string | null
          buyer_email?: string | null
          buyer_phone?: string | null
          deposit_amount?: number | null
          deposit_paid_at?: string | null
          sold_at?: string | null
          notes?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      puppy_weights: {
        Row: {
          id: string
          puppy_id: string
          weight_oz: number
          recorded_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          puppy_id: string
          weight_oz: number
          recorded_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          puppy_id?: string
          weight_oz?: number
          recorded_at?: string
          notes?: string | null
        }
      }
      puppy_images: {
        Row: {
          id: string
          puppy_id: string
          image_url: string
          alt_text: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          puppy_id: string
          image_url: string
          alt_text?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          puppy_id?: string
          image_url?: string
          alt_text?: string | null
          display_order?: number
          created_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          customer_name: string
          customer_location: string | null
          customer_image_url: string | null
          title: string
          content: string
          rating: number | null
          puppy_id: string | null
          is_published: boolean
          featured: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_location?: string | null
          customer_image_url?: string | null
          title: string
          content: string
          rating?: number | null
          puppy_id?: string | null
          is_published?: boolean
          featured?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_location?: string | null
          customer_image_url?: string | null
          title?: string
          content?: string
          rating?: number | null
          puppy_id?: string | null
          is_published?: boolean
          featured?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          featured_image_url: string | null
          category: string | null
          is_published: boolean
          featured: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          featured_image_url?: string | null
          category?: string | null
          is_published?: boolean
          featured?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          featured_image_url?: string | null
          category?: string | null
          is_published?: boolean
          featured?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Dog = Database['public']['Tables']['dogs']['Row']
export type DogInsert = Database['public']['Tables']['dogs']['Insert']
export type DogUpdate = Database['public']['Tables']['dogs']['Update']

export type DogImage = Database['public']['Tables']['dog_images']['Row']
export type HealthTest = Database['public']['Tables']['health_tests']['Row']

export type Litter = Database['public']['Tables']['litters']['Row']
export type LitterInsert = Database['public']['Tables']['litters']['Insert']
export type LitterUpdate = Database['public']['Tables']['litters']['Update']

export type LitterImage = Database['public']['Tables']['litter_images']['Row']

export type Application = Database['public']['Tables']['applications']['Row']
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert']

export type ContactMessage = Database['public']['Tables']['contact_messages']['Row']
export type ContactMessageInsert = Database['public']['Tables']['contact_messages']['Insert']

export type PricingOption = Database['public']['Tables']['pricing_options']['Row']
export type PricingOptionInsert = Database['public']['Tables']['pricing_options']['Insert']
export type PricingOptionUpdate = Database['public']['Tables']['pricing_options']['Update']

export type Puppy = Database['public']['Tables']['puppies']['Row']
export type PuppyInsert = Database['public']['Tables']['puppies']['Insert']
export type PuppyUpdate = Database['public']['Tables']['puppies']['Update']

export type PuppyWeight = Database['public']['Tables']['puppy_weights']['Row']
export type PuppyWeightInsert = Database['public']['Tables']['puppy_weights']['Insert']

export type PuppyImage = Database['public']['Tables']['puppy_images']['Row']

// Extended types with relations
export type DogWithImages = Dog & {
  dog_images: DogImage[]
  health_tests: HealthTest[]
}

export type LitterWithParents = Litter & {
  sire: Dog | null
  dam: Dog | null
  litter_images?: LitterImage[]
}

export type PuppyWithWeights = Puppy & {
  puppy_weights: PuppyWeight[]
  puppy_images?: PuppyImage[]
}

export type LitterWithPuppies = LitterWithParents & {
  puppies: Puppy[]
}

export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type TestimonialInsert = Database['public']['Tables']['testimonials']['Insert']
export type TestimonialUpdate = Database['public']['Tables']['testimonials']['Update']

export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert']
export type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']

export type TestimonialWithPuppy = Testimonial & {
  puppy: Puppy | null
}
