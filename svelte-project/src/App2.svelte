<script>
    let message = '';
  
    function handleDragStart(event, zone) {
      event.dataTransfer.setData('text/plain', zone);
    }
  
    function handleDrop(event, zone) {
      event.preventDefault();
      const draggedZone = event.dataTransfer.getData('text/plain');
      if (draggedZone === zone) {
        message = `I'm still in the ${zone} zone`;
      } else if (zone === 'top') {
        message = "I'm in the upper half";
      } else if (zone === 'bottom') {
        message = "I'm in the lower half";
      } else if (zone === 'inner') {
        message = "I'm the inner zone";
      }
    }
  </script>
  
  <style>
    .container {
        position: relative;
        height: 200px;
        width: 300px;
        display: flex;
        flex-direction: column;
        margin-bottom: 1rem;
        border: 1px solid black;
    }
  
    .half {
        height: 50%;
        width: 100%;
    }
  
    .inner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border: 2px dashed #ccc;
      width: 100px;
      height: 100px;
    }
  </style>
  
  <div
    class="container"
    on:drop={(event) => handleDrop(event, 'container')}
    on:dragover={(event) => event.preventDefault()}
  >
    <div
      class="half"
      on:drop={(event) => handleDrop(event, 'top')}
      on:dragover={(event) => event.preventDefault()}
    >
      Upper Half
    </div>
    <div
      class="half"
      on:drop={(event) => handleDrop(event, 'bottom')}
      on:dragover={(event) => event.preventDefault()}
    >
      Lower Half
    </div>
    <div >
        <div
        class="inner"
        on:drop={(event) => handleDrop(event, 'inner')}
        on:dragover={(event) => event.preventDefault()}
      >
        Inner Zone
      </div>
    </div>
   
  </div>
  
  <div
    draggable="true"
    on:dragstart={(event) => handleDragStart(event, 'inner')}
  >
    Drag me to the inner zone
  </div>
  
  <p>{message}</p>