// @ts-nocheck
import React, { useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker?url";
import PdfScreen from "./components/PdfScreen";
import RightSideBar from "./components/RightSideBar";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const PdfTextLinker = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wordSelected, setWordSelected] = useState(false);
  const [pdfPages, setPdfPages] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [links, setLinks] = useState([]);
  const scaleFactor = 1.5;

  const pdfOptions = [
    { name: "Select a PDF", url: "" },
    { name: "new pdf", url: "https://objectstore.nyc1.civo.com/dev-colonelz/670d0bdf9a23e9b6436486d9/template/company%20data/company%20policies/New%20Folder/a-16%2C%20garden%20city-21-02-25%20%281%29.pdf?AWSAccessKeyId=AAISH0GB3DMJX6X1105M&Expires=1897811031&Signature=zt4IVIOdKNOx7rqKzc9864CNr2A%3D" },
  ];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setPdfUrl(URL.createObjectURL(file)); // Update the PDF URL for rendering
      processPDF(file); // Call processPDF directly with the selected file
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const handleUrlChange = async (event) => {
    const selectedUrl = event.target.value;
    setPdfUrl(selectedUrl);
    if (selectedUrl) {
      try {
        setLoading(true);
        const response = await fetch(selectedUrl);
        const blob = await response.blob();
        processPDF(blob);
      } catch (error) {
        console.error("Error fetching PDF:", error);
        alert("Failed to load PDF.");
      } finally {
        setLoading(false);
      }
    }
  };

  const processPDF = async (fileOrBlob) => {
    if (!fileOrBlob) {
      alert("Please upload or select a PDF.");
      return;
    }

    setLoading(true);

    try {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const pdfData = new Uint8Array(e.target.result);
        const loadingTask = getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;

        const pages = [];
        const allLinks = [];

        for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex++) {
          const page = await pdf.getPage(pageIndex + 1);
          const viewport = page.getViewport({ scale: 1 });
          const textContent = await page.getTextContent();

          const textPositions = textContent.items.map((item) => {
            const [a, b, c, d, x, y] = item.transform;
            const fontSize = Math.hypot(a, b);
            const isVertical = Math.abs(b) > Math.abs(a);
            const wordWidthFactor = 0.6;
            const width = isVertical ? fontSize : item.str.length * fontSize * wordWidthFactor;
            const height = isVertical ? item.str.length * fontSize * wordWidthFactor : fontSize;
            const boxSizeIncreaseFactor = 1.2;
            const positionAdjustmentFactorX = -0.1;
            const positionAdjustmentFactorY = 0.14;

            return {
              text: item.str,
              x: x + width * positionAdjustmentFactorX,
              y: viewport.height - y + height * positionAdjustmentFactorY,
              fontSize: fontSize,
              isVertical: isVertical,
              width: width * boxSizeIncreaseFactor,
              height: height * boxSizeIncreaseFactor,
            };
          });

          const targetWords = [
            { word: "MASTER BEDROOM", url: "https://google.com" },
            { word: "BALCONY", url: "https://youtube.com" },
            { word: "KITCHEN", url: "https://takeuforward.org/" },
            { word: "CENTER TABLE", url: "https://www.hackerrank.com/" },
            { word: "LIVING AREA", url: "https://amazon.com" },
            { word: "CENTER", url: "https://pdfkit.org/" },
            { word: "LIFT", url: "https://www.npmjs.com/package/tesseract.js/v/4.1.1" },
            { word: "BED ROOM 2", url: "https://takeuforward.org/" },
            { word: "BED ROOM 3", url: "https://www.npmjs.com/package/tesseract.js/v/4.1.1" },
            { word: "BED ROOM 1", url: "https://google.com" },
            { word: "MASTER BED ROOM", url: "https://www.npmjs.com/package/tesseract.js/v/4.1.1" },
            { word: "TOILET", url: "https://amazon.com" },
            { word: "STUDY ROOM", url: "https://amazon.com" },
            { word: "SIDE TABLE", url: "https://amazon.com" },
          ];

          const foundWords = textPositions.filter((item) =>
            targetWords.some(target => target.word === item.text)
          );

          foundWords.forEach((word) => {
            const target = targetWords.find(target => target.word === word.text);
            allLinks.push({
              pageIndex,
              x: word.x * scaleFactor,
              y: (word.y - word.height) * scaleFactor,
              width: word.width * scaleFactor,
              height: word.height * scaleFactor,
              url: target.url,
            });
          });

          pages.push({
            pageIndex,
            numPages: pdf.numPages,
            width: viewport.width,
            height: viewport.height,
          });
        }

        setPdfPages(pages);
        setLinks(allLinks);
      };

      fileReader.readAsArrayBuffer(fileOrBlob);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Failed to process PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>PDF Text to Hyperlink</h2>

      {/* File Upload */}
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <br /><br />

      {/* Dropdown for PDF URLs */}
      <select onChange={handleUrlChange} defaultValue="">
        {pdfOptions.map((option, index) => {
          console.log(option)
          
          return (
          <option key={index} value={option.url}>{option.name}</option>
        )})}
      </select>
      <br /><br />

      {/* Display PDF */}
      <div className="flex gap-2">
        {pdfUrl && <PdfScreen pdfUrl={pdfUrl} pdfPages={pdfPages} links={links} scaleFactor={scaleFactor} setWordSelected={setWordSelected} />}
        {wordSelected && <RightSideBar />}
      </div>
    </div>
  );
};

export default PdfTextLinker;
