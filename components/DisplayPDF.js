import * as pdfjsLib from 'pdfjs-dist'
import styles from '../styles/Posts.module.css';

export default function displayPDF(fileUrl) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.entry';
  
  let pdfDocument = null;
  let pageNumber = 1;
  let scale = 1.5;
  let canvas = document.getElementById('canvas');
  let ctx = canvas.getContext('2d');
  let pendingPage = null;
  let pageRendering = false;

  document.getElementById("prev").addEventListener("click", PreviousPage);
  document.getElementById("next").addEventListener("click", NextPage);
  document.getElementById("pdf_buttons").className = styles.show_pdf_buttons;

  function checkRenderPage(num) {
    if (pageRendering)
      pendingPage = num;
    else
      renderPage(num);
  }

  function PreviousPage() {
    if (pageNumber > 1) {
      pageNumber--;
      checkRenderPage(pageNumber);
    }
  }

  function NextPage() {
    if (pageNumber < pdfDocument.numPages) {
      pageNumber++;
      checkRenderPage(pageNumber);
    }
  }

  function renderPage(num) {
    pageRendering = true;
    pdfDocument.getPage(num).then(page => {
      let viewport = page.getViewport({scale:scale});
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      let renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      let renderTask = page.render(renderContext);
      renderTask.promise.then(() => {
        pageRendering = false;
        if (pendingPage !== null) {
          renderPage(pendingPage);
          pendingPage = null;
        }
      });
    });
    document.getElementById('page_number').textContent = num;
  }

  pdfjsLib.getDocument(fileUrl.fileUrl).promise.then(function(pdfDocument_) {
    if (pdfDocument)
      pdfDocument.destroy();
    pdfDocument = pdfDocument_;
    document.getElementById('total_pages').textContent = pdfDocument.numPages;
    renderPage(pageNumber);
  });
}