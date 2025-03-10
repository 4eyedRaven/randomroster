// app/api/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Helper function to generate a readable CSV string.
function generateReadableCSV(classes: any[]) {
  const rows: string[] = [];
  
  // Section 1: Class and Students.
  rows.push('Class Name,Student Name,Present,Capability Level');
  classes.forEach((c) => {
    if (c.students && c.students.length > 0) {
      c.students.forEach((student: any) => {
        // Exclude id fields and format the "present" value.
        rows.push([
          `"${c.name}"`,
          `"${student.name}"`,
          student.present ? 'Yes' : 'No',
          student.capability_level
        ].join(','));
      });
    } else {
      // If no students, output just the class name.
      rows.push([`"${c.name}"`, '', '', ''].join(','));
    }
  });

  // Add an empty row to separate sections.
  rows.push('');
  
  // Section 2: Grouping History.
  rows.push('Class Name,Grouping Timestamp,Grouping Method,Grouping Value,Group Details');
  classes.forEach((c) => {
    if (c.grouping_history && c.grouping_history.length > 0) {
      c.grouping_history.forEach((history: any) => {
        // "groups" is stored as JSON. Parse it and then format the details.
        let groupDetails = '';
        if (history.groups && Array.isArray(history.groups)) {
          groupDetails = history.groups
            .map((group: any) => {
              const studentNames = group.students && Array.isArray(group.students)
                ? group.students.map((s: any) => s.name).join(' / ')
                : '';
              return `${group.name}: ${studentNames}`;
            })
            .join(' | ');
        }
        rows.push([
          `"${c.name}"`,
          `"${new Date(history.timestamp).toLocaleString()}"`,
          history.method,
          history.value,
          `"${groupDetails}"`
        ].join(','));
      });
    } else {
      rows.push([`"${c.name}"`, '', '', '', ''].join(','));
    }
  });
  return rows.join('\n');
}

export async function GET(request: NextRequest) {
  // Create a Supabase server client using request cookies.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // use service role key if necessary for export
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  );

  // Authenticate the user.
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Fetch classes with nested students and grouping history.
  const { data: classes, error } = await supabase
    .from('classes')
    .select(`
      name,
      students(name, present, capability_level),
      grouping_history(timestamp, method, value, groups)
    `)
    .eq('user_id', user.id);
  
  if (error) {
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Generate the CSV string without id fields and with more readable formatting.
  const csv = generateReadableCSV(classes as any[]);
  
  // Return CSV file with download headers.
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="export.csv"',
    },
  });
}