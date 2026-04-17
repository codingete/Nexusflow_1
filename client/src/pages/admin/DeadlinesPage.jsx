import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDeadline } from "../../store/slices/deadlineSlice";
import { X } from "lucide-react";

const DeadlinesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    projectTitle: "",
    studentName: "",
    supervisorName: "",
    deadlineDate: "",
    description: "",
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.admin);

  const [viewProjects, setViewProjects] = useState(projects || []);

  useEffect(() => {
    setViewProjects(projects || []);
  }, [projects]);

  const projectRows = useMemo(() => {
    return viewProjects.map((project) => ({
      _id: project._id,
      title: project.title,
      studentName: project.student?.name || "-",
      studentEmail: project.student?.email || "-",
      studentDept: project.student?.department || "-",
      supervisor: project.supervisor?.name || "-",
      deadline: project.deadline
        ? new Date(project.deadline).toISOString().slice(0, 10)
        : "-",
      updatedAt: project.updatedAt
        ? new Date(project.updatedAt).toLocaleString()
        : "-",
      raw: project,
    }));
  }, [viewProjects]);

  const filteredProjects = projectRows.filter((row) => {
    return (
      row.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject || !formData.deadlineDate) return;

    let deadlineData = {
      name: selectedProject?.student?.name,
      dueDate: formData.deadlineDate, // FIXED
      project: selectedProject?._id,
    };

    try {
      const updated = await dispatch(
        createDeadline({ id: selectedProject._id, data: deadlineData })
      ).unwrap();

      const updatedProject = updated?.project || updated;

      if (updatedProject?._id) {
        setViewProjects((prev) =>
          prev.map((p) =>
            p._id === updatedProject._id ? { ...p, ...updatedProject } : p
          )
        );
      }
    } finally {
      setShowModal(false);
      setFormData({
        projectTitle: "",
        studentName: "",
        supervisorName: "",
        deadlineDate: "", // FIXED
        description: "",
      });
      setSelectedProject(null);
      setQuery("");
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="card-title">Manage Deadlines</h1>
            <p className="card-subtitle">
              Create and monitor project deadlines
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary mt-4 md:mt-0"
          >
            Create/Update Deadline
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="card">
        <input
          type="text"
          placeholder="Search by project or student..."
          className="input-field w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Project Deadlines</h2>
        </div>

        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Project Title</th>
                <th className="px-6 py-3">Supervisor</th>
                <th className="px-6 py-3">Deadline</th>
                <th className="px-6 py-3">Updated</th>
              </tr>
            </thead>

            <tbody>
              {filteredProjects.map((row) => (
                <tr key={row._id}>
                  <td className="px-6 py-4">
                    {row.studentName}
                    <br />
                    <span className="text-sm text-gray-500">
                      {row.studentEmail}
                    </span>
                  </td>
                  <td className="px-6 py-4">{row.title}</td>
                  <td className="px-6 py-4">{row.supervisor}</td>
                  <td className="px-6 py-4">{row.deadline}</td>
                  <td className="px-6 py-4">{row.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No projects found.
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-full max-w-2xl">
            <div className="flex justify-between mb-4">
              <h2>Create Deadline</h2>
              <button onClick={() => setShowModal(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* SEARCH PROJECT */}
              <input
                type="text"
                placeholder="Search project..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedProject(null);
                }}
                className="input-field w-full mb-2"
              />

              {query && !selectedProject && (
                <div className="border max-h-40 overflow-y-auto">
                  {projects
                    ?.filter((p) =>
                      p.title.toLowerCase().includes(query.toLowerCase())
                    )
                    .map((p) => (
                      <div
                        key={p._id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedProject(p);
                          setFormData({
                            ...formData,
                            projectTitle: p.title,
                            deadlineDate: p.deadline
                              ? new Date(p.deadline)
                                  .toISOString()
                                  .slice(0, 10)
                              : "",
                          });
                        }}
                      >
                        {p.title}
                      </div>
                    ))}
                </div>
              )}

              {/* DATE */}
              <input
                type="date"
                value={formData.deadlineDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deadlineDate: e.target.value,
                  })
                }
                disabled={!selectedProject}
                className="input-field w-full mt-3"
              />

              {/* DETAILS */}
              {selectedProject && (
                <div className="mt-3 p-3 bg-gray-100 rounded">
                  <p>
                    <strong>Student:</strong>{" "}
                    {selectedProject.student?.name} |{" "}
                    {selectedProject.student?.email}
                  </p>
                  <p>
                    <strong>Supervisor:</strong>{" "}
                    {selectedProject.supervisor?.name || "Unknown"}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DeadlinesPage;