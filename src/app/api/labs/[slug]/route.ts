import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { labs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ 
        error: "Slug parameter is required",
        code: "MISSING_SLUG" 
      }, { status: 400 });
    }

    const lab = await db.select()
      .from(labs)
      .where(eq(labs.slug, slug))
      .limit(1);

    if (lab.length === 0) {
      return NextResponse.json({ 
        error: 'Lab not found',
        code: "LAB_NOT_FOUND" 
      }, { status: 404 });
    }

    return NextResponse.json(lab[0]);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ 
        error: "Slug parameter is required",
        code: "MISSING_SLUG" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { title, level, tag, steps, estimatedMinutes, objectives } = requestBody;

    // Security check: reject if slug is provided in body (immutable field)
    if ('slug' in requestBody) {
      return NextResponse.json({ 
        error: "Slug cannot be modified",
        code: "SLUG_IMMUTABLE" 
      }, { status: 400 });
    }

    // Validate level if provided
    if (level !== undefined && !['novice', 'adept', 'master'].includes(level)) {
      return NextResponse.json({ 
        error: "Level must be one of: novice, adept, master",
        code: "INVALID_LEVEL" 
      }, { status: 400 });
    }

    // Check if lab exists
    const existingLab = await db.select()
      .from(labs)
      .where(eq(labs.slug, slug))
      .limit(1);

    if (existingLab.length === 0) {
      return NextResponse.json({ 
        error: 'Lab not found',
        code: "LAB_NOT_FOUND" 
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: Date.now()
    };

    if (title !== undefined) updateData.title = title;
    if (level !== undefined) updateData.level = level;
    if (tag !== undefined) updateData.tag = tag;
    if (steps !== undefined) updateData.steps = steps;
    if (estimatedMinutes !== undefined) updateData.estimatedMinutes = estimatedMinutes;
    if (objectives !== undefined) updateData.objectives = objectives;

    const updated = await db.update(labs)
      .set(updateData)
      .where(eq(labs.slug, slug))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update lab',
        code: "UPDATE_FAILED" 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ 
        error: "Slug parameter is required",
        code: "MISSING_SLUG" 
      }, { status: 400 });
    }

    // Check if lab exists
    const existingLab = await db.select()
      .from(labs)
      .where(eq(labs.slug, slug))
      .limit(1);

    if (existingLab.length === 0) {
      return NextResponse.json({ 
        error: 'Lab not found',
        code: "LAB_NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(labs)
      .where(eq(labs.slug, slug))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete lab',
        code: "DELETE_FAILED" 
      }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}