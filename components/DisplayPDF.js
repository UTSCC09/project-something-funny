'use client';
import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from '@/components/ui/button';

export default function DisplayPDF({ fileUrl }) {
  const canvasRef = useRef(null);
  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);
  const pageNumberRef = useRef(null);
  const totalPagesRef = useRef(null);

  useEffect(() => {

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.entry';

    let pdfDocument = null;
    let pageNumber = 1;
    const scale = 1.5;
    let pendingPage = null;
    let pageRendering = false;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const renderPage = (num) => {
      pageRendering = true;
      pdfDocument.getPage(num).then((page) => {
        const viewport = page.getViewport({ scale: scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };
        const renderTask = page.render(renderContext);
        renderTask.promise.then(() => {
          pageRendering = false;
          if (pendingPage !== null) {
            renderPage(pendingPage);
            pendingPage = null;
          }
        });
      });

      if (pageNumberRef.current) {
        pageNumberRef.current.textContent = num;
      }
    };

    const checkRenderPage = (num) => {
      if (pageRendering) {
        pendingPage = num;
      } else {
        renderPage(num);
      }
    };

    const PreviousPage = () => {
      if (pageNumber > 1) {
        pageNumber--;
        checkRenderPage(pageNumber);
      }
    };

    const NextPage = () => {
      if (pdfDocument && pageNumber < pdfDocument.numPages) {
        pageNumber++;
        checkRenderPage(pageNumber);
      }
    };

    const loadPDF = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        pdfDocument = await loadingTask.promise;
        if (totalPagesRef.current) {
          totalPagesRef.current.textContent = pdfDocument.numPages;
        }
        renderPage(pageNumber);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPDF();


    const prevButton = prevButtonRef.current;
    const nextButton = nextButtonRef.current;

    prevButton.addEventListener('click', PreviousPage);
    nextButton.addEventListener('click', NextPage);


    return () => {
      prevButton.removeEventListener('click', PreviousPage);
      nextButton.removeEventListener('click', NextPage);
      if (pdfDocument) {
        pdfDocument.destroy();
      }
    };
  }, [fileUrl]);

  return (
    <div className="w-full">
      <canvas ref={canvasRef} className="w-full h-auto border rounded"></canvas>
      <div className="flex items-center space-x-2 mt-2">
        <Button ref={prevButtonRef} variant="secondary">
          Previous
        </Button>
        <Button ref={nextButtonRef} variant="secondary">
          Next
        </Button>
        <p className="ml-4">
          Page: <span ref={pageNumberRef}>1</span> / <span ref={totalPagesRef}>0</span>
        </p>
      </div>
    </div>
  );
}
