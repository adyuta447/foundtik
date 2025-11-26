# FoundTIK Dashboard

A comprehensive Next.js application for managing campus complaints (keluhan) and lost & found items with admin verification system.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Project Features

### 1. **User Features**

#### Keluhan (Complaints) Module

- **List View** (`/keluhan-list`) - Browse all complaints with real-time search/filter
- **Detail View** (`/keluhan-detail?id=...`) - View complaint details and status updates
- **Create** (`/keluhan-new`) - Submit new complaints with descriptions

**Status Flow:**

- 🕐 **Menunggu** (Waiting) - Amber color, new complaints awaiting review
- ⚙️ **Diproses** (Processing) - Blue color, complaints under admin review
- ✅ **Selesai** (Completed) - Emerald color, resolved complaints

#### Lost & Found Module

- **List View** (`/(lost-found)/lost-found-list`) - Browse lost/found items with search
- **Detail View** (`/(lost-found)/lost-found-detail?id=...`) - View item details and verification status
- **Upload** (`/(lost-found)/lost-found-new`) - Post new lost or found items
- **Image Upload** - Capture photos of items with camera integration

**Status Flow:**

- 📋 **Verifikasi** (Pending) - Amber color, awaiting admin verification
- ✅ **Tersedia** (Available) - Emerald color, verified items
- 🔄 **Returned** - Blue color, claimed or returned items

#### Dashboard (`/dashboard`)

- Personal activity overview
- Quick links to submit complaints or post lost items
- User profile information

#### Profile (`/profile`)

- View personal information
- Manage account settings

### 2. **Admin Features**

#### Admin Keluhan (`/admin/keluhan`)

- View all submitted complaints in paginated table
- Filter by status (Menunggu, Diproses, Selesai)
- Update complaint status via dropdown
- Color-coded status badges with icons:
  - 🕐 Amber for "Menunggu" (waiting)
  - ⚙️ Blue for "Diproses" (processing)
  - ✅ Emerald for "Selesai" (completed)

**UI Features:**

- Gradient background (slate → blue → indigo)
- Rounded cards with shadow-xl
- Responsive table with hover states
- Loading spinner for data fetching

#### Admin Lost & Found (`/admin/lost-found`)

- Manage all lost & found items in verification queue
- Approve or reject items through modal interface
- Update item status (tersedia/verifikasi/returned)
- View uploader information and timestamps
- Image gallery with fallback placeholder

**Status Color System:**

- 🕐 **Verifikasi** (Pending) - Amber: `Clock` icon, waiting admin approval
- ✅ **Tersedia** (Available) - Emerald: `CheckCircle2` icon, verified & available
- 🔄 **Returned** - Blue: `AlertCircle` icon, claimed/returned items

**UI Features:**

- Gradient background matching user pages
- Enhanced select dropdowns with border-2 and hover effects
- Rounded images (rounded-xl) with shadow
- Responsive hover states (hover:bg-blue-50/50)
- Modal-based verification interface
- Real-time data refresh after status updates

### 3. **Authentication & Access Control**

- **Login** (`/login`) - Email/password authentication via Supabase
- **Register** (`/register`) - New user account creation
- **Role-Based Access:**

  - Admin pages (`/admin/*`) - Only accessible to users with `role="admin"`
  - User pages - Accessible to all authenticated users
  - Public pages - Login/Register accessible without authentication

- **Auth Context** (`/contexts/AuthContext.tsx`)
  - Manages user session and profile data
  - Handles login/logout lifecycle
  - Provides role information for access control

### 4. **UI/UX Design System**

#### Color Palette

- **Backgrounds:** Gradient from slate-50 via blue-50 to indigo-50
- **Status Colors:**
  - Amber-500: Waiting/Pending status
  - Blue-500: Processing/In-review status
  - Emerald-500: Completed/Available status
- **Accents:** Blue-600 for primary actions, Gray for neutral states

#### Component Styling

- Rounded corners: `rounded-xl` for cards, `rounded-lg` for inputs
- Shadows: `shadow-xl` for elevated surfaces
- Transitions: `transition-colors` for smooth hover effects
- Responsive padding: `p-4 sm:p-6 lg:p-8`
- Icons from `lucide-react` integrated into status displays

#### Typography

- Headers: Bold with 3xl-4xl font sizes
- Descriptions: Medium weight for clarity
- Table text: Monospaced font-family for consistency

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   ├── profile/
│   ├── keluhan-detail/
│   ├── keluhan-list/
│   ├── keluhan-new/
│   ├── (lost-found)/            # Route group for lost-found pages
│   │   ├── layout.tsx           # Shared layout with DashboardLayout
│   │   ├── lost-found-detail/
│   │   ├── lost-found-list/
│   │   └── lost-found-new/
│   └── admin/
│       ├── keluhan/             # Admin complaint management
│       └── lost-found/          # Admin lost & found verification
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx  # Navbar + sidebar layout
│   │   └── Sidebar.tsx
│   └── modals/
│       └── VerificationModal.tsx # Admin verification interface
├── contexts/
│   └── AuthContext.tsx          # Auth state management
└── lib/
    └── supabase.ts              # Supabase client & types

supabase/
└── migrations/
    ├── create_profiles_table.sql
    ├── create_keluhan_table.sql
    ├── create_lost_found_table.sql
    └── create_klaim_barang_table.sql
```

---

## Database Schema

### Profiles Table

\`\`\`sql

- id (UUID, Primary Key)
- name (TEXT)
- role (TEXT: 'user' | 'admin')
- email (TEXT)
  \`\`\`

### Keluhan Table (Complaints)

\`\`\`sql

- id (UUID)
- user_id (UUID, Foreign Key → profiles)
- judul (TEXT)
- deskripsi (TEXT)
- status (TEXT: 'menunggu' | 'diproses' | 'selesai')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
  \`\`\`

### Lost & Found Table

\`\`\`sql

- id (UUID)
- user_id (UUID, Foreign Key → profiles)
- nama_barang (TEXT)
- deskripsi (TEXT)
- lokasi_ditemukan (TEXT)
- foto_url (TEXT)
- status (TEXT: 'tersedia' | 'verifikasi' | 'returned')
- verifikasi_status (TEXT: 'verified' | 'rejected' | NULL)
- created_at (TIMESTAMP)
  \`\`\`

---

## Key Components

### AdminLostFound Component

**File:** `src/app/admin/lost-found/page.tsx`

**Functionality:**

- Fetches all lost & found items from Supabase
- Displays items in responsive table with status badges
- Updates item status via dropdown selector
- Opens verification modal for admin decisions
- Auto-refreshes data after verification

**State Management:**
\`\`\`tsx

- items: LostFoundWithProfile[] - Table data
- loading: boolean - Initial data fetch state
- updatingId: string | null - Current update in progress
- selectedItem: LostFound | null - Selected for verification
- verificationOpen: boolean - Modal visibility
  \`\`\`

**Status Color System:**

- \`getStatusColor(status)\` returns object with:
  - \`color\` - Badge className
  - \`bgColor\`, \`textColor\`, \`borderColor\` - Component styling
  - \`icon\` - Icon component (Clock, CheckCircle2, AlertCircle)
  - \`label\` - User-friendly label

**Status Mapping:**

- "tersedia" → ✅ Emerald + CheckCircle2
- "verifikasi" → 🕐 Amber + Clock
- "returned" → 🔄 Blue + AlertCircle

### VerificationModal Component

**File:** \`src/components/modals/VerificationModal.tsx\`

**Props:**

- \`item: LostFound | null\` - Item being verified
- \`isOpen: boolean\` - Modal visibility
- \`onClose: () => void\` - Close handler
- \`onVerified: () => void\` - Success callback

**Functionality:**

- Approve or reject verification with optional notes
- Updates \`verifikasi_status\` in database
- Triggers data refresh on completion

---

## Route Groups & Nested Layouts

### Lost & Found Route Group: \`(lost-found)\`

**Purpose:** Group all lost-found related pages under shared layout

**Structure:**
\`\`\`
(lost-found)/
├── layout.tsx # Wraps pages with DashboardLayout
├── lost-found-detail/page.tsx
├── lost-found-list/page.tsx
└── lost-found-new/page.tsx
\`\`\`

**Key Pattern:**

- Parent \`layout.tsx\` provides \`DashboardLayout\` (navbar + sidebar)
- All child pages automatically inherit layout
- Import paths use \`../../../\` from nested pages to reach \`src/\` level

**Import Example:**
\`\`\`tsx
// Inside (lost-found)/lost-found-detail/page.tsx
import { supabase } from "@/lib/supabase"; // ✅ Correct
import { DashboardLayout } from "@/components/layout/DashboardLayout"; // ✅ Correct
\`\`\`

---

## Suspense Boundaries

### Why Suspense is Required

Next.js 16 App Router enforces Suspense boundaries for client components using \`useSearchParams()\` hook. This prevents hydration mismatches and improves performance.

### Pattern Used

**File:** \`src/app/keluhan-detail/page.tsx\` & \`src/app/(lost-found)/lost-found-detail/page.tsx\`

\`\`\`tsx
// ❌ WRONG - useSearchParams() at component root
export default function Page() {
const searchParams = useSearchParams(); // Error!
}

// ✅ CORRECT - Extract hook usage into inner component
function DetailContent() {
const searchParams = useSearchParams();
// ... component logic
}

export default function Page() {
return (
<Suspense fallback={<div>Loading...</div>}>
<DetailContent />
</Suspense>
);
}
\`\`\`

---

## Environment Setup

### Required Environment Variables

Create \`.env.local\`:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### Dependencies

\`\`\`json
{
"next": "^16.0.4",
"react": "^19.0.0-rc",
"react-dom": "^19.0.0-rc",
"@supabase/supabase-js": "^2.x",
"lucide-react": "latest",
"tailwindcss": "^3.x"
}
\`\`\`

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Supabase Documentation](https://supabase.com/docs) - learn about database & auth.
- [Tailwind CSS](https://tailwindcss.com/docs) - styling framework.
- [Lucide React Icons](https://lucide.dev) - icon library.

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
