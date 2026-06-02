"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/api/supabase";
import { ArrowLeft } from "lucide-react";

type Task = {
  id: number;
  title: string;
  completed: boolean;
  project_id: number;
  note?: string;
};

type Project = {
  id: number;
  title: string;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = Number(params?.id);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTask, setNewTask] = useState("");

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitles, setEditTitles] = useState<{ [key: number]: string }>({});

  const [taskNotes, setTaskNotes] = useState<{ [key: number]: string }>({});

  // =====================
  // LOAD DATA
  // =====================
  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      setLoading(true);

      const { data: projectData } = await supabase
        .from("research_projects")
        .select("*")
        .eq("id", projectId)
        .single();

      setProject(projectData);

      const { data: taskData } = await supabase
        .from("research_tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("id", { ascending: true });

      setTasks(taskData || []);
      setLoading(false);
    };

    loadData();
  }, [projectId]);

  // =====================
  // PROGRESS AUTO CALC
  // =====================
  const updateProgress = async (updatedTasks: Task[]) => {
  const completed = updatedTasks.filter(t => t.completed).length;

  const progress =
    updatedTasks.length > 0
      ? Math.round((completed / updatedTasks.length) * 100)
      : 0;

  // 👇 thêm status logic
  const status =
    progress === 100
      ? "Completed"
      : progress > 0
      ? "In Progress"
      : "Not Started";

  await supabase
    .from("research_projects")
    .update({
      progress,
      completed_tasks: completed,
      total_tasks: updatedTasks.length,
    })
    .eq("id", projectId);
};

  // =====================
  // TOGGLE TASK
  // =====================
  const toggleTask = async (taskId: number, current: boolean) => {
    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, completed: !current } : t
    );

    setTasks(updated);

    await supabase
      .from("research_tasks")
      .update({ completed: !current })
      .eq("id", taskId);

    updateProgress(updated);
  };

  // =====================
  // ADD TASK
  // =====================
  const addTask = async () => {
    if (!newTask.trim()) return;

    const { data } = await supabase
      .from("research_tasks")
      .insert([
        {
          project_id: projectId,
          title: newTask,
          completed: false,
        },
      ])
      .select()
      .single();

    if (!data) return;

    const updated = [...tasks, data];
    setTasks(updated);

    setNewTask("");
    updateProgress(updated);
  };

  // =====================
  // DELETE TASK
  // =====================
  const deleteTask = async (taskId: number) => {
    const updated = tasks.filter(t => t.id !== taskId);

    setTasks(updated);

    await supabase
      .from("research_tasks")
      .delete()
      .eq("id", taskId);

    updateProgress(updated);
  };

  // =====================
  // SAVE EDIT
  // =====================
  const saveEdit = async (taskId: number) => {
    const newTitle = editTitles[taskId];

    if (!newTitle) return;

    await supabase
      .from("research_tasks")
      .update({ title: newTitle })
      .eq("id", taskId);

    setTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, title: newTitle } : t
      )
    );

    setEditingTaskId(null);

    setEditTitles(prev => {
      const copy = { ...prev };
      delete copy[taskId];
      return copy;
    });
  };

  // =====================
  // SAVE NOTE
  // =====================
  const saveNote = async (taskId: number) => {
    const note = taskNotes[taskId] || "";

    await supabase
      .from("research_tasks")
      .update({ note })
      .eq("id", taskId);

    setTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, note } : t
      )
    );
  };

  // =====================
  // PROGRESS UI
  // =====================
  const completed = tasks.filter(t => t.completed).length;
  const progress =
    tasks.length > 0
      ? Math.round((completed / tasks.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-8">

      <Link
        href="/workflow-board"
        className="inline-flex items-center gap-2 text-blue-600 font-semibold mb-6"
      >
        <ArrowLeft size={18} />
        Back to Projects
      </Link>

      <h1 className="text-5xl font-extrabold text-blue-600">
        {loading ? "Loading..." : project?.title}
      </h1>

      <p className="text-gray-500 mt-3">
        {progress}% Complete
      </p>

      {/* PROGRESS BAR */}
<div className="w-full bg-gray-200 rounded-full h-3 mt-3 overflow-hidden">
  <div
    className="h-full bg-green-500 transition-all duration-300"
    style={{ width: `${progress}%` }}
  />
</div>

      {/* ADD TASK */}
      <div className="flex gap-2 mt-6 mb-6">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task..."
          className="border p-2 rounded flex-1"
        />

        <button
          onClick={addTask}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      {/* TASK LIST */}
      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="p-4 border rounded-xl space-y-2">

            <div className="flex justify-between">
              <div className="flex gap-3 items-center">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id, task.completed)}
                />

                {editingTaskId === task.id ? (
                  <input
                    value={editTitles[task.id] ?? ""}
                    onChange={(e) =>
                      setEditTitles(prev => ({
                        ...prev,
                        [task.id]: e.target.value
                      }))
                    }
                  />
                ) : (
                  <span className={task.completed ? "line-through text-gray-400" : ""}>
                    {task.title}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {editingTaskId === task.id ? (
                  <button
                    onClick={() => saveEdit(task.id)}
                    className="text-green-600"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingTaskId(task.id);
                      setEditTitles(prev => ({
                        ...prev,
                        [task.id]: task.title
                      }));
                    }}
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>

            <textarea
              value={taskNotes[task.id] ?? task.note ?? ""}
              onChange={(e) =>
                setTaskNotes(prev => ({
                  ...prev,
                  [task.id]: e.target.value,
                }))
              }
              onBlur={() => saveNote(task.id)}
              className="w-full border p-2 text-sm rounded"
              placeholder="Write progress note..."
            />
          </div>
        ))}
      </div>
    </div>
  );
}