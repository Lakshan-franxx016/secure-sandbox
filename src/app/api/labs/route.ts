import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { labs } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const level = searchParams.get('level');

    let query = db.select().from(labs);
    const conditions = [];

    // Search filter
    if (q) {
      conditions.push(like(labs.title, `%${q}%`));
    }

    // Level filter
    if (level && level !== 'all') {
      if (!['novice', 'adept', 'master'].includes(level)) {
        return NextResponse.json({ 
          error: "Invalid level. Must be 'novice', 'adept', or 'master'",
          code: "INVALID_LEVEL" 
        }, { status: 400 });
      }
      conditions.push(eq(labs.level, level));
    }

    // Apply conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Order by createdAt desc
    const results = await query.orderBy(desc(labs.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, title, level, tag, steps, estimatedMinutes, objectives } = body;

    // Validate required fields
    if (!slug) {
      return NextResponse.json({ 
        error: "Slug is required",
        code: "MISSING_SLUG" 
      }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (!level) {
      return NextResponse.json({ 
        error: "Level is required",
        code: "MISSING_LEVEL" 
      }, { status: 400 });
    }

    if (!tag) {
      return NextResponse.json({ 
        error: "Tag is required",
        code: "MISSING_TAG" 
      }, { status: 400 });
    }

    if (!steps) {
      return NextResponse.json({ 
        error: "Steps are required",
        code: "MISSING_STEPS" 
      }, { status: 400 });
    }

    // Validate level
    if (!['novice', 'adept', 'master'].includes(level)) {
      return NextResponse.json({ 
        error: "Level must be one of: novice, adept, master",
        code: "INVALID_LEVEL" 
      }, { status: 400 });
    }

    // Validate steps is array
    if (!Array.isArray(steps)) {
      return NextResponse.json({ 
        error: "Steps must be an array",
        code: "INVALID_STEPS_FORMAT" 
      }, { status: 400 });
    }

    // Validate objectives if provided
    if (objectives && !Array.isArray(objectives)) {
      return NextResponse.json({ 
        error: "Objectives must be an array",
        code: "INVALID_OBJECTIVES_FORMAT" 
      }, { status: 400 });
    }

    // Check for duplicate slug
    const existingLab = await db.select()
      .from(labs)
      .where(eq(labs.slug, slug.trim()))
      .limit(1);

    if (existingLab.length > 0) {
      return NextResponse.json({ 
        error: "Lab with this slug already exists",
        code: "DUPLICATE_SLUG" 
      }, { status: 409 });
    }

    // Prepare insert data
    const now = Date.now();
    const insertData = {
      slug: slug.trim(),
      title: title.trim(),
      level,
      tag: tag.trim(),
      steps,
      createdAt: now,
      updatedAt: now,
      estimatedMinutes: estimatedMinutes || null,
      objectives: objectives || null
    };

    const newLab = await db.insert(labs)
      .values(insertData)
      .returning();

    return NextResponse.json(newLab[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "Lab with this slug already exists",
        code: "DUPLICATE_SLUG" 
      }, { status: 409 });
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}