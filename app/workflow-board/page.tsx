"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/api/supabase";
import Link from "next/link";

type Project = {
  id: number;
  title: string;
  status: string;
  progress: number;
  completed_tasks: number;
  total_tasks: number;
  user_id: number;
};

export default function WorkflowBoardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState("");

  // =========================
  // FETCH PROJECTS (SAFE)
  // =========================
  const fetchProjects = async () => {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) return;

    const user = JSON.parse(userRaw);
    if (!user.id) return;

    const { data, error } = await supabase
      .from("research_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false });

    if (error) {
      console.error("FETCH ERROR:", error);
      return;
    }

    setProjects(data || []);
  };

  // =========================
  // LOAD ON MOUNT (FIX ESLINT ISSUE)
  // =========================
  useEffect(() => {
    const run = async () => {
      await fetchProjects();
    };

    run();
  }, []);

  // =========================
  // CREATE PROJECT
  // =========================
  const handleCreateProject = async () => {
    if (!title.trim()) return;

    const userRaw = localStorage.getItem("user");
    if (!userRaw) {
      alert("Không tìm thấy user");
      return;
    }

    const user = JSON.parse(userRaw);
    if (!user.id) return;

    // 1. create project
    const { data: projectData, error: projectError } = await supabase
      .from("research_projects")
      .insert([
        {
          title,
          user_id: user.id,
          progress: 0,
          completed_tasks: 0,
          total_tasks: 5,
          // status: "In Progress",
        },
      ])
      .select()
      .single();

    if (projectError || !projectData) {
      console.error(projectError);
      return;
    }

    // 2. create default tasks
    const { data, error } = await supabase
  .from("research_tasks")
  .insert([
    { project_id: projectData.id, title: "Idea", completed: false },
    { project_id: projectData.id, title: "Literature Review", completed: false },
    { project_id: projectData.id, title: "Dataset Collection", completed: false },
    { project_id: projectData.id, title: "Writing Draft", completed: false },
    { project_id: projectData.id, title: "Ready For Submission", completed: false },
  ])
  .select();

console.log("TASK INSERT RESULT:", { data, error });

if (error) {
  console.error("TASK ERROR FULL:", error);
  alert(error.message);
  return;
}

    // 3. refresh UI from DB (IMPORTANT)
    await fetchProjects();

    setTitle("");
    setOpenModal(false);
  };


  const getStatus = (p: Project) => {
  if (p.progress === 100) return "Completed";
  if (p.progress > 0) return "In Progress";
  return "Not Started";
};

  // =========================
  // STATS (SAFE LOGIC)
  // =========================
  const completed = projects.filter(p => p.progress === 100).length;
  const inProgress = projects.filter(p => p.progress > 0 && p.progress < 100).length;
  const notStarted = projects.filter(p => p.progress === 0).length;

  return (
    <div className="min-h-screen bg-slate-50 p-8">

      {/* HEADER */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-6xl font-extrabold text-blue-600">
            Research Project Tracker
          </h1>

          <p className="mt-3 text-gray-500 text-lg">
            Organize, monitor and manage your research projects efficiently.
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-blue-700 transition"
        >
          + New Project
        </button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border">
          <p className="text-gray-500 text-sm">Total Projects</p>
          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {projects.length}
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border">
          <p className="text-gray-500 text-sm">In Progress</p>
          <h2 className="text-3xl font-bold text-orange-500 mt-2">
            {inProgress}
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border">
          <p className="text-gray-500 text-sm">Completed</p>
          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {completed}
          </h2>
        </div>
      </div>

      {/* PROJECT LIST */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/workflow-board/${project.id}`}>
            <div className="bg-white rounded-3xl border border-blue-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                {getStatus(project)}
              </span>

              <h2 className="text-2xl font-bold text-blue-700 mt-4">
                {project.title}
              </h2>

              {/* PROGRESS BAR */}
              <div className="mt-5">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>

                <div className="h-3 bg-gray-200 rounded-full">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                {project.completed_tasks}/{project.total_tasks} tasks
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">

            <h2 className="text-3xl font-bold text-blue-600 mb-6">
              Create Research Project
            </h2>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project Title"
              className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setOpenModal(false)}
                className="px-5 py-2 rounded-xl border hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateProject}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                Create
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}