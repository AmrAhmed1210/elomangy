// supabase/functions/olomangy-chat/tools.ts

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";
import { embed } from "./gemini.ts";

export async function executeTool(
  name: string,
  args: any,
  supabase: SupabaseClient,
  apiKey: string
): Promise<any> {
  console.log(`[TOOL EXECUTE] Running tool: ${name} with args:`, args);
  
  try {
    switch (name) {
      case "list_tracks": {
        const { data, error } = await supabase
          .from("tracks")
          .select("name, name_ar, slug, is_flat")
          .order("order");
        if (error) throw error;
        return { tracks: data ?? [] };
      }

      case "list_diplomas": {
        const { data, error } = await supabase
          .from("diplomas")
          .select("name, name_ar, slug, description, eligibility")
          .order("order");
        if (error) throw error;
        return { diplomas: data ?? [] };
      }

      case "list_training_sessions": {
        const { data, error } = await supabase
          .from("training_sessions")
          .select("key, title, description, mode")
          .order("order");
        if (error) throw error;
        return { training_sessions: data ?? [] };
      }

      case "list_courses": {
        const { track_slug, year, semester_label } = args;
        
        // 1. Find the track
        const { data: track, error: trackErr } = await supabase
          .from("tracks")
          .select("id")
          .eq("slug", track_slug)
          .maybeSingle();
        
        if (trackErr) throw trackErr;
        if (!track) {
          return { error: `Track with slug '${track_slug}' not found` };
        }

        // 2. Query semesters under track
        let semQuery = supabase
          .from("semesters")
          .select("id, label, year")
          .eq("track_id", track.id);
        
        if (year) {
          semQuery = semQuery.eq("year", year);
        }
        
        if (semester_label) {
          semQuery = semQuery.ilike("label", `%${semester_label}%`);
        }
        
        const { data: semesters, error: semErr } = await semQuery;
        if (semErr) throw semErr;
        
        if (!semesters || semesters.length === 0) {
          return { courses: [], message: "No matching semesters found for the criteria" };
        }

        // 3. Query courses for these semesters
        const semesterIds = semesters.map(s => s.id);
        const { data: courses, error: courseErr } = await supabase
          .from("courses")
          .select("id, semester_id, code, name, instructor")
          .in("semester_id", semesterIds)
          .order("order");
        
        if (courseErr) throw courseErr;

        // Map semester details onto courses
        const semestersMap = new Map(semesters.map(s => [s.id, s]));
        const mappedCourses = (courses ?? []).map(c => {
          const sem = semestersMap.get(c.semester_id);
          return {
            id: c.id,
            code: c.code,
            name: c.name,
            instructor: c.instructor || "غير معروف",
            semester_label: sem?.label ?? "",
            year: sem?.year ?? null
          };
        });

        return { courses: mappedCourses };
      }

      case "get_resource_links": {
        const { parent_type, parent_name_or_slug } = args;
        let resolvedParentId: string | null = null;
        let resolvedName = parent_name_or_slug;

        if (parent_type === "course") {
          // Resolve course code or name to UUID
          const { data: course, error } = await supabase
            .from("courses")
            .select("id, name, code")
            .or(`code.ilike.%${parent_name_or_slug}%,name.ilike.%${parent_name_or_slug}%`)
            .limit(1)
            .maybeSingle();
          
          if (error) throw error;
          if (course) {
            resolvedParentId = course.id;
            resolvedName = `${course.code} - ${course.name}`;
          }
        } else if (parent_type === "diploma") {
          // Resolve diploma slug or name to UUID
          const { data: diploma, error } = await supabase
            .from("diplomas")
            .select("id, name, name_ar")
            .or(`slug.eq.${parent_name_or_slug},name.ilike.%${parent_name_or_slug}%,name_ar.ilike.%${parent_name_or_slug}%`)
            .limit(1)
            .maybeSingle();
          
          if (error) throw error;
          if (diploma) {
            resolvedParentId = diploma.id;
            resolvedName = diploma.name_ar || diploma.name;
          }
        } else if (parent_type === "section") {
          // Resolve special section slug or name to UUID
          const { data: section, error } = await supabase
            .from("special_sections")
            .select("id, name_en, name_ar")
            .or(`slug.eq.${parent_name_or_slug},name_en.ilike.%${parent_name_or_slug}%,name_ar.ilike.%${parent_name_or_slug}%`)
            .limit(1)
            .maybeSingle();
          
          if (error) throw error;
          if (section) {
            resolvedParentId = section.id;
            resolvedName = section.name_ar || section.name_en;
          }
        }

        if (!resolvedParentId) {
          return { error: `Could not resolve ${parent_type} matching '${parent_name_or_slug}'` };
        }

        const { data: links, error: linksErr } = await supabase
          .from("resource_links")
          .select("label, type, url")
          .eq("parent_type", parent_type)
          .eq("parent_id", resolvedParentId)
          .order("order");
        
        if (linksErr) throw linksErr;

        return {
          parent_type,
          resolved_name: resolvedName,
          links: links ?? []
        };
      }

      case "search_site_content": {
        const { query, category } = args;
        
        let kbResults: any[] = [];
        let courseResults: any[] = [];
        let diplomaResults: any[] = [];
        let trainingResults: any[] = [];
        let teamResults: any[] = [];

        const categoryFilter = category || "all";

        // 1. Knowledge Base Vector Search
        if (categoryFilter === "knowledge_base" || categoryFilter === "all") {
          try {
            const queryEmbedding = await embed(query, apiKey);
            const { data, error } = await supabase.rpc("match_kb_chunks", {
              query_embedding: queryEmbedding,
              match_count: 5,
              min_similarity: 0.35,
            });
            if (error) {
              console.error("[TOOL search_site_content] match_kb_chunks error:", error.message);
            } else if (data) {
              kbResults = data.map((d: any) => ({
                content: d.content,
                page: d.metadata?.page || null
              }));
            }
          } catch (e) {
            console.error("[TOOL search_site_content] vector search failed:", e);
          }
        }

        // 2. Courses Text Match
        if (categoryFilter === "courses" || categoryFilter === "all") {
          const { data, error } = await supabase
            .from("courses")
            .select("id, code, name, instructor, semester:semesters(label, track:tracks(name, name_ar))")
            .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
            .limit(5);
          
          if (!error && data) {
            courseResults = data.map((c: any) => ({
              id: c.id,
              code: c.code,
              name: c.name,
              instructor: c.instructor,
              semester: c.semester?.label || "",
              track: c.semester?.track?.name_ar || c.semester?.track?.name || ""
            }));
          }
        }

        // 3. Diplomas Text Match
        if (categoryFilter === "diplomas" || categoryFilter === "all") {
          const { data, error } = await supabase
            .from("diplomas")
            .select("name, name_ar, slug, description, eligibility")
            .or(`name.ilike.%${query}%,name_ar.ilike.%${query}%,description.ilike.%${query}%`)
            .limit(3);
          
          if (!error && data) {
            diplomaResults = data;
          }
        }

        // 4. Training Sessions Text Match
        if (categoryFilter === "training" || categoryFilter === "all") {
          const [sessions, videos] = await Promise.all([
            supabase
              .from("training_sessions")
              .select("title, description, key, mode")
              .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
              .limit(3),
            supabase
              .from("training_videos")
              .select("title, description, youtube_url, duration")
              .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
              .limit(3)
          ]);

          if (sessions.data) {
            trainingResults.push(...sessions.data.map((s: any) => ({ type: "session", ...s })));
          }
          if (videos.data) {
            trainingResults.push(...videos.data.map((v: any) => ({ type: "video", ...v })));
          }
        }

        // 5. Team Content Match
        if (categoryFilter === "team" || categoryFilter === "all") {
          const [projects, events, services, members] = await Promise.all([
            supabase
              .from("team_projects")
              .select("title, description, link")
              .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
              .limit(2),
            supabase
              .from("team_events")
              .select("title, description, location, register_link")
              .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
              .limit(2),
            supabase
              .from("team_services")
              .select("title, description, contact_link")
              .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
              .limit(2),
            supabase
              .from("team_committees")
              .select("name, name_ar, description_ar")
              .or(`name.ilike.%${query}%,name_ar.ilike.%${query}%,description_ar.ilike.%${query}%`)
              .limit(2)
          ]);

          if (projects.data) teamResults.push(...projects.data.map(p => ({ type: "project", ...p })));
          if (events.data) teamResults.push(...events.data.map(e => ({ type: "event", ...e })));
          if (services.data) teamResults.push(...services.data.map(s => ({ type: "service", ...s })));
          if (members.data) teamResults.push(...members.data.map(m => ({ type: "committee", ...m })));
        }

        return {
          query,
          category: categoryFilter,
          results: {
            student_guide_chunks: kbResults,
            courses: courseResults,
            diplomas: diplomaResults,
            training: trainingResults,
            team: teamResults
          }
        };
      }

      default:
        return { error: `Tool function '${name}' is not implemented` };
    }
  } catch (err: any) {
    console.error(`Error executing tool ${name}:`, err);
    return { error: err.message || String(err) };
  }
}
