import React, { useState } from "react";
import { Document, Page } from "react-pdf";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const PdfScreen = ({pdfUrl, pdfPages, links, scaleFactor, setWordSelected}:any) => {

  console.log(pdfUrl)
  console.log(links)

    const handleClick = (link:any) => {
      setWordSelected(true)

        console.log(link.url);
    
    }


  return (
    <div className="relative overflow-auto max-w-full max-h-screen border-red-500 border-2">
      {/* <TransformWrapper
       initialScale={1}
       minScale={0.5}
       maxScale={3}
       limitToBounds={false} // Allow panning beyond the edges
       panning={{ disabled: false }} // Ensure panning is enabled
       centerZoomedOut={false} // Prevents snapping to the center
       centerOnInit={false} // Prevents initial snap behavior
       disablePadding={true} // Removes boundary padding that can cause snapping
    >
      <TransformComponent> */}
        {pdfUrl && (
          <div>
            <Document file={pdfUrl}>
              {pdfPages.map((page:any) => (
                <Page
                  key={page.pageIndex}
                  pageNumber={page.pageIndex + 1}
                  width={page.width * scaleFactor}
                  height={page.height * scaleFactor}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
              ))}
            </Document>

            {/* Overlay clickable links */}
            {links.map((link:any, index:any) => (
              <span
                key={index}
                target= "_blank"
                // href={link.url}
                rel="noopener noreferrer"
                onClick={() => handleClick(link)}
                className="absolute bg-blue-500 bg-opacity-30 cursor-pointer border-0"
                style={{
                  left: `${link.x}px`,
                  top: `${link.y}px`,
                  width: `${link.width}px`,
                  height: `${link.height}px`,
                }}
              />
            ))}
          </div>
        )}
        {/* </TransformComponent>
        </TransformWrapper> */}
      </div>
  )
}

export default PdfScreen