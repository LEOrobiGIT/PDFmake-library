<script>
    import { name } from 'pdfmake/build/pdfmake';
    import fileList from '../src/fileList.json';
  
    // No need for the fetchFiles() function anymore

    function handleDragStart(event,i) {
        dropzones = document.querySelectorAll('.dropzone');
        cells = document.querySelectorAll('.cella');
        event.dataTransfer.setData('text/plain', event.target.id);
        dropzones.forEach(dropzone => {
            dropzone.style.pointerEvents = 'auto';
        });
    }
  </script>
 
