<script>
    import { onMount, onDestroy } from 'svelte';
    import { PDFDocumentProxy } from 'pdfjs-dist';
  
    export let pdfData;
  
    let pdfDocument;
    let currentPage = 1;
    let totalPages = 0;
    let canvas;
    let context;

    onMount(async () => {
      // Set the worker source
      PDFDocumentProxy.GlobalWorkerOptions.workerSrc = '/pdfjs/build/pdf.worker.js';

      try {
        // Create a new PDFDocumentProxy using the provided data
        pdfDocument = await PDFDocumentProxy.createFromData(pdfData);

        // Perform any other initialization or setup here

        // Example: Log the number of pages in the PDF
        console.log('Number of Pages:', pdfDocument.numPages);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    });

    onMount(() => {
      initializePdfReader();
    });
  
    onDestroy(() => {
      if (pdfDocument) {
        pdfDocument.destroy();
      }
    });
  
    async function initializePdfReader() {
    if (!pdfData) return;

    try {
      const { PDFJS } = await import('pdfjs-dist/build/pdf');

      // Set the worker source
      PDFJS.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.js';

      const loadingTask = PDFJS.getDocument({ data: pdfData });

      pdfDocument = await loadingTask.promise;
      totalPages = pdfDocument.numPages;

      renderPdfPage(currentPage);
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  }
  
    async function renderPdfPage(pageNumber) {
      try {
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const scale = canvas.offsetWidth / viewport.width;
  
        const scaledViewport = page.getViewport({ scale });
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;
  
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };
  
        page.render(renderContext);
      } catch (error) {
        console.error('Error rendering PDF page:', error);
      }
    }
  
    function goToPreviousPage() {
      if (currentPage > 1) {
        currentPage--;
        renderPdfPage(currentPage);
      }
    }
  
    function goToNextPage() {
      if (currentPage < totalPages) {
        currentPage++;
        renderPdfPage(currentPage);
      }
    }
  </script>
  
  <div>
    <canvas bind:this={canvas} style="border: 1px solid black;"></canvas>
  
    <div>
      <button on:click={goToPreviousPage} disabled={currentPage === 1}>Previous</button>
      <span>{currentPage} / {totalPages}</span>
      <button on:click={goToNextPage} disabled={currentPage === totalPages}>Next</button>
    </div>
  </div>