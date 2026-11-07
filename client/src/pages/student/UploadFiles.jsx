import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProject, uploadProjectFiles } from "../../store/slices/studentSlice";
import { toast } from "react-toastify";
import { File, X, Upload, Loader2, FilePlus, Download } from "lucide-react";
import { saveProjectFile } from "../../store/slices/projectSlice";

// Must match the server's limit in middlewares/upload.js.
const MAX_FILE_MB = 10;

const UploadFiles = () => {
  const dispatch = useDispatch();
  const { project, files, loading } = useSelector((state) => state.student);
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!project) {
      dispatch(fetchProject());
    }
  }, [dispatch, project]);

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    
    const validFiles = newFiles.filter((file) => {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`${file.name} is too large (max ${MAX_FILE_MB}MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeSelected = (name) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    const Icon = ({ className }) => <File className={className} />;
    const color =
      extension === "pdf"
        ? "text-red-500"
        : ["doc", "docx"].includes(extension)
        ? "text-blue-500"
        : ["ppt", "pptx"].includes(extension)
        ? "text-orange-500"
        : "text-slate-500";

    return <Icon className={`w-8 h-8 ${color}`} />;
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    if (!project) {
      toast.error("No project found. Please submit a project proposal first.");
      return;
    }

    setIsUploading(true);
    
    try {
      const result = await dispatch(uploadProjectFiles({ 
        projectId: project._id, 
        files: selectedFiles 
      }));
      
      if (uploadProjectFiles.fulfilled.match(result)) {
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
      // success and error toasts come from the thunk
    } finally {
      setIsUploading(false);
    }
  };

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Upload Project Files</h2>
          </div>
          <div className="text-center py-8">
            <p className="text-slate-500">
              You have not submitted any project yet. Please submit your project proposal first to upload files.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Upload Project Files</h2>
          <p className="card-subtitle">
            Upload documents, code, and other project related files
          </p>
        </div>

        {/* FILE UPLOAD AREA */}
        <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center hover:bg-slate-100 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-lg font-medium text-slate-700">
              Click to select or drag and drop
            </p>
            <p className="text-slate-500 mt-2">
              PDF, DOC, PPT, ZIP, images or code, up to {MAX_FILE_MB}MB each
            </p>
          </label>
        </div>

        {/* SELECTED FILES LIST */}
        {selectedFiles.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-medium text-slate-800">
              Selected Files ({selectedFiles.length})
            </h3>
            <div className="space-y-3">
              {selectedFiles.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.name)}
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSelected(file.name)}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpload}
              disabled={isUploading || loading}
              className="w-full btn btn-primary flex justify-center items-center py-3"
            >
              {isUploading || loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload {selectedFiles.length} File(s)
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* UPLOADED FILES LIST */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Uploaded Files</h2>
          <p className="card-subtitle">
            Manage your uploaded project files
          </p>
        </div>

        {(files || []).length === 0 ? (
          <div className="text-center py-4">
            <FilePlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No files uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={file._id || index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.originalName)}
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {file.uploadedAt
                        ? new Date(file.uploadedAt).toLocaleString()
                        : file.filetype || "File"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    dispatch(
                      saveProjectFile({
                        projectId: project._id,
                        fileId: file._id,
                        name: file.originalName,
                      })
                    )
                  }
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadFiles;