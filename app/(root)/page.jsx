"use client";
import axios from "axios";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from "react-markdown";

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
};

function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  // Dropzone for the image file
  const onDropImage = useCallback((acceptedFiles) => {
    setImageFile(acceptedFiles[0]);
  }, []);

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageActive,
  } = useDropzone({
    onDrop: onDropImage,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  // Dropzone for the PDF file
  const onDropPdf = useCallback((acceptedFiles) => {
    setPdfFile(acceptedFiles[0]);
  }, []);

  const {
    getRootProps: getPdfRootProps,
    getInputProps: getPdfInputProps,
    isDragActive: isPdfActive,
  } = useDropzone({
    onDrop: onDropPdf,
    accept: { "application/pdf": [] },
    maxFiles: 1,
  });

  async function send() {
    // Check if both files are selected before sending
    if (!imageFile || !pdfFile) {
      alert("Please select both an image and a PDF file.");
      return;
    }

    setLoading(true);
    setAnalysis(""); // Clear previous analysis
    try {
      // Convert both files to Base64 strings
      const base64Image = await fileToBase64(imageFile);
      const base64Pdf = await fileToBase64(pdfFile);

      // Send the Base64 strings to the API route
      const response = await axios.post("/api/ai", {
        img: base64Image,
        pdf: base64Pdf,
      });

      setAnalysis(response.data.text);
    } catch (error) {
      console.error(
        "Error during analysis:",
        error.response?.data?.error || error.message
      );
      setAnalysis("An error occurred during analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 w-full max-w-4xl">
        {/* Image Dropzone */}
        <div
          {...getImageRootProps()}
          className={`flex-1 w-full h-40 border-4 border-dashed rounded-lg flex flex-col items-center justify-center p-4 transition-colors cursor-pointer
          ${
            isImageActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-400 bg-white"
          }`}
        >
          <input {...getImageInputProps()} />
          {imageFile ? (
            <p className="text-gray-800 font-semibold text-center">
              Image selected:{" "}
              <span className="text-blue-600">{imageFile.name}</span>
            </p>
          ) : (
            <>
              <p className="text-gray-600 font-medium text-center">
                Drag & Drop a CCTV Image here or click to browse
              </p>
              {isImageActive && (
                <p className="text-blue-600 font-semibold mt-1">
                  Drop the Image ...
                </p>
              )}
            </>
          )}
        </div>

        {/* PDF Dropzone */}
        <div
          {...getPdfRootProps()}
          className={`flex-1 w-full h-40 border-4 border-dashed rounded-lg flex flex-col items-center justify-center p-4 transition-colors cursor-pointer
          ${
            isPdfActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-400 bg-white"
          }`}
        >
          <input {...getPdfInputProps()} />
          {pdfFile ? (
            <p className="text-gray-800 font-semibold text-center">
              PDF selected:{" "}
              <span className="text-blue-600">{pdfFile.name}</span>
            </p>
          ) : (
            <>
              <p className="text-gray-600 font-medium text-center">
                Drag & Drop the Typhoon Report here or click to browse
              </p>
              {isPdfActive && (
                <p className="text-blue-600 font-semibold mt-1">
                  Drop the PDF ...
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* File previews */}
      {(imageFile || pdfFile) && (
        <div className="mt-6 flex flex-col items-center justify-center w-full max-w-4xl">
          {imageFile && (
            <img
              src={URL.createObjectURL(imageFile)}
              alt="CCTV Image Preview"
              className="mt-4 max-w-full h-auto rounded-lg shadow-lg"
            />
          )}
          {pdfFile && (
            <div className="mt-4 w-full text-center bg-white p-4 rounded-lg shadow-md">
              <span className="font-semibold text-gray-700">Selected PDF:</span>{" "}
              {pdfFile.name}
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <button
        disabled={loading || !imageFile || !pdfFile}
        onClick={send}
        className={`mt-8 px-8 py-3 rounded-full text-white font-semibold text-lg transition-all duration-300 shadow-lg transform
        ${
          loading || !imageFile || !pdfFile
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:scale-95"
        }`}
      >
        {loading ? "Analyzing..." : "Analyze Impact"}
      </button>

      {/* Analysis Output */}
      {loading && <div className="mt-8"></div>}
      {analysis && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-xl w-full max-w-4xl text-gray-800 leading-relaxed text-left whitespace-pre-wrap">
          <h3 className="font-bold text-2xl text-blue-800 mb-4">
            Analysis Report
          </h3>

          <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default Home;
