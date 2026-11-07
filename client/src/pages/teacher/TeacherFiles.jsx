import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowDownToLine, FileText, FolderOpen } from "lucide-react";
import { fetchTeacherFiles } from "../../store/slices/teacherSlice";
import { saveProjectFile } from "../../store/slices/projectSlice";

const TeacherFiles = () => {
  const dispatch = useDispatch();
  const { files, loading } = useSelector((state) => state.teacher);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchTeacherFiles());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return (files || []).filter(
      (f) =>
        (f.originalName || "").toLowerCase().includes(term) ||
        (f.projectTitle || "").toLowerCase().includes(term) ||
        (f.student?.name || "").toLowerCase().includes(term)
    );
  }, [files, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Student Files</h1>
          <p className="card-subtitle">Files uploaded by the students you supervise</p>
        </div>
        <input
          type="text"
          className="input"
          placeholder="Search by file, project or student..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="card">
        {loading && (files || []).length === 0 ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {(files || []).length === 0 ? "No files uploaded yet." : "No files match your search."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["File", "Student", "Project", "Uploaded", ""].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-500" />
                        <span className="text-sm text-slate-800">{f.originalName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{f.student?.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{f.projectTitle}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {f.uploadedAt ? new Date(f.uploadedAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        onClick={() =>
                          dispatch(
                            saveProjectFile({
                              projectId: f.projectId,
                              fileId: f._id,
                              name: f.originalName,
                            })
                          )
                        }
                      >
                        <ArrowDownToLine className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherFiles;
