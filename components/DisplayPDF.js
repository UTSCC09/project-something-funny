'use client';
import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from '@/components/ui/button';

export default function DisplayPDF({ fileUrl }) {
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageRendering, setPageRendering] = useState(false);
  const [pendingPage, setPendingPage] = useState(null);
  const [loadingTask, setLoadingTask] = useState(null);
  const scale = 1.5;
  const canvasRef = useRef(null);
  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);
  const pageNumberRef = useRef(null);
  const totalPagesRef = useRef(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    const loadPDF = async () => {
      try {
        if (loadingTask)
          loadingTask.cancel(); 
        const newLoadingTask = pdfjsLib.getDocument({url:fileUrl});
        setLoadingTask(newLoadingTask); 

        const newPdfDocument = await newLoadingTask.promise;
        if (pdfDocument)
          pdfDocument.destroy();
        setPdfDocument(newPdfDocument);
        if (totalPagesRef.current)
          totalPagesRef.current.textContent = newPdfDocument.numPages;
        renderPage(pageNumber);
      }
      catch (error) {
        console.log(error);
      }
    };

    loadPDF();
    return () => {
      if (pdfDocument) 
        pdfDocument.destroy();
      if (loadingTask)
        loadingTask.cancel();
    };
  }, [fileUrl]);


  useEffect(() => {
    if (pdfDocument && pageNumber === 1) {
      renderPage(pageNumber);
    }
  }, [pdfDocument, pageNumber]);
  
  const renderPage = (num) => {
    if (!pdfDocument || pageRendering) 
      return;
    setPageRendering(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    pdfDocument.getPage(num).then((page) => {
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);
      renderTask.promise.then(() => {
        setPageRendering(false); 
        if (pendingPage !== null) {
          renderPage(pendingPage); 
          setPendingPage(null);
        }
      }).catch(() => {
        setPageRendering(false);
      });
    });

    if (pageNumberRef.current)
      pageNumberRef.current.textContent = num;
  };

  const checkRenderPage = (num) => {
    if (pageRendering)
      setPendingPage(num);
    else
      renderPage(num);
  };

  const PreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber((p) => {
        const newPage = p - 1;
        checkRenderPage(newPage);
        return newPage;
      });
    }
  };

  const NextPage = () => {
    if (pdfDocument && pageNumber < pdfDocument.numPages) {
      setPageNumber((p) => {
        const newPage = p + 1;
        checkRenderPage(newPage);
        return newPage;
      });
    }
  };

  return (
    <div className="w-full">
      <canvas ref={canvasRef} className="w-full h-auto border rounded"></canvas>
      <div className="flex items-center space-x-2 mt-2">
        <Button ref={prevButtonRef} variant="secondary" onClick={PreviousPage}>
          Previous
        </Button>
        <Button ref={nextButtonRef} variant="secondary" onClick={NextPage} >
          Next
        </Button>
        <p className="ml-4">
          Page: <span ref={pageNumberRef}>1</span> / <span ref={totalPagesRef}>0</span>
        </p>
      </div>
    </div>
  );
}
