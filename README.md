# Random Roster

Random Roster is a web application designed for teachers to manage classes and group students effectively. It allows teachers to create classes, add students with varying capability levels, and generate balanced student groups based on specified criteria. The application now leverages Supabase for data persistence and authentication.

**The app is available for testing at [https://randomroster.com/](https://randomroster.com).**

## Features

- **Class Management**
  - Add new classes.
  - Delete existing classes.
  - Switch between different classes.
  
- **Student Management**
  - Add students to a class with specified capability levels (High, Medium, Low).
  - Mark students as present or absent using a “Present” toggle.
  - Remove students from a class.
  
- **Grouping Tool**
  - Generate student groups based on:
    - Number of groups.
    - Number of students per group.
  - Ensure groups are numerically balanced and have a mix of capability levels.
  - Display generated groups in a modal dialog (lightbox) for easy viewing.
  - Close the modal by clicking outside, clicking the close button, or pressing the Escape key.

- **Supabase Integration**
  - **Data Persistence:** Classes, students, and grouping history are stored in Supabase.
  - **Authentication:** User authentication is managed via Supabase.
  - **Server-Side Rendering:** Utilizes Supabase SSR for secure data fetching and session management.

## Technologies Used

- **Framework:** Next.js (React framework)
- **Language:** TypeScript
- **Styling:** CSS with custom variables
- **State Management:** React hooks (useState, useEffect)
- **Data Persistence & Authentication:** Supabase (using `@supabase/supabase-js` and Supabase SSR)
- **Additional Libraries:** 
  - `framer-motion` for animations.
  - `uuid` for unique ID generation.
  - Drag-and-drop libraries (`@dnd-kit/core`, `@dnd-kit/sortable`)

## Getting Started

### Prerequisites

- **Node.js:** Make sure you have Node.js installed (version 14 or later).
- **npm:** Comes with Node.js. Alternatively, you can use yarn or pnpm.
- **Supabase Account:** Create a free account at [Supabase](https://supabase.com) and set up a new project.

### Installation

1. **Clone the Repository**
    ```bash
    git clone https://github.com/4eyedRaven/student_grouper.git
    cd student-grouping-app
    ```

2. **Install Dependencies**

   Using npm:
    ```bash
    npm install
    ```

   Or using yarn:
    ```bash
    yarn install
    ```

   Or using pnpm:
    ```bash
    pnpm install
    ```

3. **Configure Environment Variables**

   Copy the provided `.env.example` to `.env` and fill in your Supabase credentials:
    ```bash
    cp .env.example .env
    ```
   Then update:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Supabase Database Initialization

The Supabase database is initialized with the following SQL statements. These SQL scripts set up the necessary tables and policies for classes, students, and grouping history.

```sql
-- Create the classes table
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  created_at timestamptz default now()
);

-- Set up a foreign key so that classes are tied to an authenticated user.
alter table public.classes
  add constraint fk_classes_user foreign key (user_id)
  references auth.users (id) on delete cascade;

-- Create the students table
create table public.students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null,
  name text not null,
  present boolean default true,
  capability_level text not null,
  created_at timestamptz default now(),
  constraint valid_capability check (capability_level in ('high', 'medium', 'low'))
);

-- Link each student to a class
alter table public.students
  add constraint fk_students_class foreign key (class_id)
  references public.classes (id) on delete cascade;

-- Create the grouping_history table
create table public.grouping_history (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null,
  timestamp timestamptz default now(),
  method text not null, -- e.g., 'byGroups' or 'byStudents'
  value integer not null, -- number of groups or students per group
  number_of_students integer not null,
  groups jsonb not null, -- store an array of group objects
  created_at timestamptz default now()
);

-- Link the grouping history entry to the corresponding class
alter table public.grouping_history
  add constraint fk_grouping_history_class foreign key (class_id)
  references public.classes (id) on delete cascade;

-- Enable RLS on the classes table
alter table public.classes enable row level security;

-- Create a policy that allows a user to manage their own classes.
create policy "Classes policy" on public.classes
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.students enable row level security;

create policy "Students policy" on public.students
  for all
  using (
    exists (
      select 1 from public.classes c
      where c.id = class_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.classes c
      where c.id = class_id and c.user_id = auth.uid()
    )
  );

alter table public.grouping_history enable row level security;

create policy "Grouping history policy" on public.grouping_history
  for all
  using (
    exists (
      select 1 from public.classes c
      where c.id = class_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.classes c
      where c.id = class_id and c.user_id = auth.uid()
    )
  );
```

## Running the Development Server

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to http://localhost:3000 to view the application.

## Usage

### Class Management

- Add a New Class
  - Enter the class name in the "New class name" input field.
  - Press Enter or click the + button.
- Switch Between Classes
  - Click on a class name in the list to select it.
- Delete a Class
  - Click the × button next to the class name.
  - Confirm deletion if prompted.

### Student Management

- Add a New Student
  - Enter the student's name in the "New student name" input field.
  - Select the capability level from the dropdown (High, Medium, Low).
  - Press Enter or click the Add Student button.
- Mark Student as Present/Absent
  - Use the "Present" checkbox next to the student's name to toggle their attendance.
- Remove a Student
  - Click the Remove button in the "Actions" column next to the student's name.

### Grouping Students

- Select Grouping Criteria
  - Choose between:
    - By Number of Groups: Specify how many groups to create.
    - By Students per Group: Specify how many students should be in each group.

## Dependencies

- react: "^18.x"
- react-dom: "^18.x"
- next: "^15.x" or later
- typescript: "^4.x" (as a dev dependency)
- @types/react: "^18.x" (as a dev dependency)
- @types/react-dom: "^18.x" (as a dev dependency)
- eslint: "^9.x" (as a dev dependency)
- eslint-config-next: "^15.x" (as a dev dependency)
- @supabase/supabase-js: Supabase client library for authentication and data persistence
- Additional libraries as listed in package.json.

## License

This project is licensed under the MIT License.

⸻

## Running the Development Server

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to http://localhost:3000 to view the application.

## Usage

### Class Management

- Add a New Class
  - Enter the class name in the "New class name" input field.
  - Press Enter or click the + button.
- Switch Between Classes
  - Click on a class name in the list to select it.
- Delete a Class
  - Click the × button next to the class name.
  - Confirm deletion if prompted.

### Student Management

- Add a New Student
  - Enter the student's name in the "New student name" input field.
  - Select the capability level from the dropdown (High, Medium, Low).
  - Press Enter or click the Add Student button.
- Mark Student as Present/Absent
  - Use the "Present" checkbox next to the student's name to toggle their attendance.
- Remove a Student
  - Click the Remove button in the "Actions" column next to the student's name.

### Grouping Students

- Select Grouping Criteria
  - Choose between:
    - By Number of Groups: Specify how many groups to create.
    - By Students per Group: Specify how many students should be in each group.
- Generate Groups
  - Click the Generate Groups button.
- View Generated Groups
  - The groups will appear in a modal dialog.
  - Review the groups, which are balanced by number and capability levels.
  - Close the Modal
    - Click the × button in the top-right corner.
    - Click outside the modal content.
    - Press the Escape key.

### Drag-and-Drop Group Editing

After generating groups, you can manually adjust them:
- Drag Students Between Groups
  - Click and hold on a student's name to drag them to a different group.
- Real-Time Updates
  - The group lists update immediately to reflect changes.

### Project Structure

```
student-grouping-app/
├── app/                     # Next.js pages and server routes (includes Supabase SSR integration)
│   ├── auth/               # Authentication routes
│   ├── dashboard/          # Dashboard and user actions (logout)
│   ├── error/              # Error page
│   ├── login/              # Login and signup pages
│   ├── layout.tsx          # Global layout with fonts and client wrapper
│   └── page.tsx            # Root page (redirects based on auth)
├── components/              # React components (ClassManager, StudentManager, GroupingTool, etc.)
├── public/                  # Static assets (fonts, images, manifest)
├── styles/                  # Global CSS styles
├── types.ts                 # TypeScript interfaces for Class, Student, etc.
├── utils/supabase/         # Supabase client and server utilities (client.ts, server.ts, middleware.ts)
├── .env.example             # Example environment file for Supabase credentials
├── package.json             # Project metadata and dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md                # 
```

### Available Scripts

In the project directory, you can run:
- npm run dev: Runs the app in development mode.
- npm run build: Builds the app for production.
- npm run start: Starts the production server.
- npm run lint: Runs ESLint to check for linting errors.

### Dependencies

- react: "^18.x"
- react-dom: "^18.x"
- next: "^15.x" or later
- typescript: "^4.x" (as a dev dependency)
- @types/react: "^18.x" (as a dev dependency)
- @types/react-dom: "^18.x" (as a dev dependency)
- eslint: "^9.x" (as a dev dependency)
- eslint-config-next: "^15.x" (as a dev dependency)
- @supabase/supabase-js: Supabase client library for authentication and data persistence
- Additional libraries as listed in package.json.

### Contributing

Contributions are welcome! Please follow these steps:

1. Fork the Repository
2. Create a Feature Branch

```bash
git checkout -b feature/YourFeature
```

3. Commit Your Changes

```bash
git commit -m "Add your message"
```

4. Push to the Branch

```bash
git push origin feature/YourFeature
```

5. Open a Pull Request

### License

This project is licensed under the MIT License.

### Acknowledgments

- Thanks to all contributors and users who have provided feedback and suggestions (my wife).
- Built with Next.js, TypeScript, and Supabase.