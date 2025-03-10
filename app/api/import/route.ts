// app/api/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// A simple CSV line parser that handles quoted fields.
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Extracts the roster section (first section) from the CSV text.
function extractRosterSection(csvText: string): string[] {
  const lines = csvText.split('\n');
  let rosterLines: string[] = [];
  let headerFound = false;
  for (const line of lines) {
    // Look for the header row.
    if (!headerFound) {
      if (line.trim().length > 0 && line.includes("Class Name") && line.includes("Student Name")) {
        headerFound = true;
      }
      continue;
    } else {
      // Stop when an empty line is encountered (assuming separation between sections).
      if (line.trim() === "") break;
      rosterLines.push(line);
    }
  }
  return rosterLines;
}

export async function POST(request: NextRequest) {
  // Create a Supabase server client.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  );

  // Ensure a file is provided via multipart form.
  const formData = await request.formData();
  const fileField = formData.get("file");
  if (!fileField || !(fileField instanceof File)) {
    return new NextResponse(JSON.stringify({ error: "File not provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const csvText = await fileField.text();

  // Extract the roster section and parse its rows.
  const rosterLines = extractRosterSection(csvText);
  const rosterData: { className: string; studentName: string; present: boolean; capability: string }[] = [];
  rosterLines.forEach(line => {
    const cols = parseCSVLine(line);
    if (cols.length >= 4) {
      const className = cols[0].replace(/^"|"$/g, '');
      const studentName = cols[1].replace(/^"|"$/g, '');
      const present = cols[2].replace(/^"|"$/g, '').toLowerCase() === 'yes';
      const capability = cols[3].replace(/^"|"$/g, '');
      rosterData.push({ className, studentName, present, capability });
    }
  });

  // Group rows by class name.
  const classesMap: {
    [key: string]: { students: { name: string; present: boolean; capability: string }[] };
  } = {};
  rosterData.forEach(row => {
    if (!classesMap[row.className]) {
      classesMap[row.className] = { students: [] };
    }
    classesMap[row.className].students.push({
      name: row.studentName,
      present: row.present,
      capability: row.capability,
    });
  });

  // Verify the authenticated user.
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Insert each class and its students into Supabase.
  const insertedClasses: string[] = [];
  for (const className in classesMap) {
    // Create the class record.
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .insert([{ name: className, user_id: user.id }])
      .select();
    if (classError || !classData || classData.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: classError?.message || 'Error creating class' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    const newClass = classData[0];

    // Prepare student records for this class.
    const studentsToInsert = classesMap[className].students.map(student => {
      // Normalize capability: only 'high' or 'low' are accepted, otherwise default to 'medium'.
      const normalizedCapability = ['high', 'low'].includes(student.capability.toLowerCase())
        ? student.capability.toLowerCase()
        : 'medium';
      return {
        class_id: newClass.id,
        name: student.name,
        present: student.present,
        capability_level: normalizedCapability,
      };
    });
    const { error: studentsError } = await supabase
      .from('students')
      .insert(studentsToInsert);
    if (studentsError) {
      return new NextResponse(JSON.stringify({ error: studentsError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    insertedClasses.push(newClass.name);
  }

  // Instead of returning a JSON response, redirect to /dashboard.
  return NextResponse.redirect(new URL('/dashboard', request.url));
}