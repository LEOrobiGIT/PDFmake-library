
<script> 
    import { afterUpdate } from 'svelte';
    import pdfMake from '../scripts/pdfMakeConfig.js';
    let fieldbase = {type: 'field',elemento:{id:0, content: '', selectedfont:'', selectedfontsize: '', selectedstyle: '', bold : '', italics :''}};
    let columnbase ={type :"column",elemento:{id: 1, fields: [] }};
    let contenuto =[fieldbase,columnbase];
    let nextId = 2; // id for the next field/column to be added
  
    function handleSubmit() {
      const dd = { content: [], styles: { /* styles configuration */ } };
  
      contenuto.forEach(item => {
        if (item.type === 'field') {
          const contenuto = item.elemento.content;
          const font = item.elemento.selectedfont || 'Roboto';
          const fontSize = item.elemento.selectedfontsize || 12;
          const style = item.elemento.selectedstyle || 'header';
  
          dd.content.push({
            text: contenuto,
            fontSize: fontSize,
            style: [style, font],
            bold: item.elemento.bold,
            italics: item.elemento.italics,
          });
        } else if (item.type === 'column') {
          const campi = item.elemento.fields;
          console.log(campi);
          const ris = [];
          campi.forEach(field => {
            console.log(field);
            const contenuto = field.content;
            const font = field.selectedfont || 'Roboto';
            const fontSize = field.selectedfontsize || 12;
            const style = field.selectedstyle || 'header';
            ris.push({
                text: contenuto,
                fontSize: fontSize,
                style: [style, font],
                bold: item.elemento.bold,
                italics: item.elemento.italics,
            });
          });
          dd.content.push({
            columns: ris
          });
        }
      });
  
      console.log(dd);
      pdfMake.createPdf(dd).download();
    }
  
    function addField() {
      const field = {
        id: nextId,
        content: '',
        selectedfont: '',
        selectedfontsize: '',
        selectedstyle: '',
        selectedbold: '',
        selecteditalics: '',
      };
      const item = { type: 'field', elemento: field };
  
      contenuto = [...contenuto, item];
      nextId++;
    }
    function addFieldtoColumn(index) {
      const field = {
        id: nextId,
        content: '',
        selectedfont: '',
        selectedfontsize: '',
        selectedstyle: '',
        selectedbold: '',
        selecteditalics: '',
      };
      const item = { type: 'field', elemento: field };
      for (var i = 0; i < contenuto.length; i++) {
        var colonna = contenuto[i];
        if (colonna.type === "column" && colonna.elemento.id === index) {
            colonna.elemento.fields.push(field);
            updateFunction();
            break; // Assuming you want to update only the first occurrence
    }
  }
      nextId++;
    }
    function updateFunction() {
		// Perform the desired update here
		contenuto =[...contenuto];
	}
    function addColumn() {
      const column = {
        id: nextId,
        fields: [],
      };
      const item = { type: 'column', elemento: column };
  
      contenuto = [...contenuto, item];
      nextId++;
    }
  
    function removeField(id) {
        contenuto = contenuto.filter(item => !(item.type === 'field' && item.elemento.id === id));
    }
    function removeColumn(id) {
        contenuto = contenuto.filter(item => !(item.type === 'column' && item.elemento.id === id));
    }
    function removeFieldFromColumn(c_id,f_id) {
        contenuto = contenuto.filter(item => {
        if (item.type === "column" && item.elemento.id === id) {
            return false; // Exclude the item with the matching id
        } 
        });
    }
    
    function handleChangeFont(event,id) {
        for (var i = 0; i < contenuto.length; i++) {
            var selected = contenuto[i];
            if (selected.type === "field" && selected.elemento.id === id){
                selected.elemento.selectedfont = event.target.value;
            }
        }
	  }

	function handleChangeFontSize(event,id) {
		for (var i = 0; i < contenuto.length; i++) {
            var selected = contenuto[i];
            if (selected.type === "field" && selected.elemento.id === id){
                selected.elemento.selectedfontsize = event.target.value;
            }
        }
	  }
      function handleChangeFontinColumn(event,id,id_colonna) {
        for (var i = 0; i < contenuto.length; i++) {
            var selected = contenuto[i];
            if (selected.type === "colonna" && selected.elemento.id === id_colonna){
                for (var y = 0; y < selected.elemento.fields.length; y++)
                    if (selected.elemento.fields[y].id === id){
                        selected.elemento.fields[y].selectedfont = event.target.value;
                    }
            }
        }
	  }
      function handleChangeFontSizeinColumn(event,id,id_colonna) {
        for (var i = 0; i < contenuto.length; i++) {
            var selected = contenuto[i];
            if (selected.type === "colonna" && selected.elemento.id === id_colonna){
                for (var y = 0; y < selected.elemento.fields.length; y++)
                    if (selected.elemento.fields[y].id === id){
                        selected.elemento.fields[y].selectedfontsize = event.target.value;
                    }
            }
        }
	  }
      
      
  
  </script>
    <main>
    <div class="container">
        <h1>Crea PDF</h1>
        <form class="elements" on:submit|preventDefault={handleSubmit}>
        {#each contenuto as item}
            {#if item.type === 'field'}
                <div class= "element"> 
                <label> 
                Contenuto: 
                <input type="text" bind:value={item.elemento.content}/> 
                </label>
                <div class ="font">
                <label for="font">Font:</label>
                <select id="font" bind:value={item.elemento.selectedfont}  on:change={(e) => handleChangeFont(e, item.elemento.id)}>
                    <option value="">Seleziona</option>
                    <option value="opensans">OpenSans</option>
                    <option value="roboto">Roboto</option>
                    <option value="oswald">Oswald</option>
                    <option value="Helvetica-Oblique">Helvetica-Oblique</option>
                    <option value="Courier">Courier</option>
                    <option value="Courier-Oblique">Courier-Oblique</option>
                    <option value="Symbol">Symbol</option>
                </select>
                </div>
                <div class ="fontsize">
                <label for="fontsizes">Grandezza del font:</label>
                <select id="fontsizes" bind:value={item.elemento.selectedfontsize}  on:change={(e) => handleChangeFontSize(e, item.elemento.id)}>
                    <option value="">Seleziona</option>
                    <option value="12">12</option>
                    <option value="14">14</option>
                    <option value="16">16</option>
                    <option value="18">18</option>
                    <option value="20">20</option>
                    <option value="22">22</option>
                    <option value="24">24</option>
                    <option value="26">26</option>
                </select>
                </div>
                <div class ="style">
                <label>
                    Header
                    <input type="radio" bind:group={item.elemento.selectedstyle} value="header" />
                </label>
                <label>
                    Quote
                    <input type="radio" bind:group={item.elemento.selectedstyle} value="quote" />
                </label>
                <label>
                    Colored
                    <input type="radio" bind:group={item.elemento.selectedstyle} value="colored" />
                </label>
                </div>
                <div class ="tipo">
                <label>
                    <input type="checkbox" bind:checked={item.elemento.selectedbold} value="true" />
                    Bold
                </label>
                <label>
                    <input type="checkbox" bind:checked={item.elemento.selecteditalics} value="true" />
                    Italics
                </label>
                </div>
                <button type="button" on:click={() => removeField(item.elemento.id)}>Rimuovi</button>
                <!--{#if field.id === selectedId}
                <button type="button" on:click={() => selectedId = 0}>Annulla</button>
                {:else}
                <button type="button" on:click={() => selectedId = field.id}>Modifica</button>
                {/if}-->
                </div>
            {:else if item.type === 'column'}
                <div class="colonna-element">
                    <h2>Colonna {item.elemento.id}</h2>
                    {#each item.elemento.fields as field}       
                        <div class="element">    
                                <label> 
                                  Contenuto: 
                                  <input type="text" bind:value={field.content}/> 
                                </label>
                                <div class ="font">
                                  <label for="font">Font:</label>
                                  <select id="font" bind:value={field.selectedfont}  on:change={(e) => handleChangeFontinColumn(e, field.id,item.elemento.id)}>
                                    <option value="">Seleziona</option>
                                      <option value="opensans">OpenSans</option>
                                      <option value="roboto">Roboto</option>
                                      <option value="oswald">Oswald</option>
                                      <option value="Helvetica-Oblique">Helvetica-Oblique</option>
                                      <option value="Courier">Courier</option>
                                      <option value="Courier-Oblique">Courier-Oblique</option>
                                      <option value="Symbol">Symbol</option>
                                  </select>
                                </div>
                                <div class ="fontsize">
                                  <label for="fontsizes">Grandezza del font:</label>
                                  <select id="fontsizes" bind:value={field.selectedfontsize}  on:change={(e) => handleChangeFontSizeinColumn(e, field.id,item.elemento.id)}>
                                    <option value="">Seleziona</option>
                                      <option value="12">12</option>
                                      <option value="14">14</option>
                                      <option value="16">16</option>
                                      <option value="18">18</option>
                                      <option value="20">20</option>
                                      <option value="22">22</option>
                                      <option value="24">24</option>
                                      <option value="26">26</option>
                                  </select>
                                </div>
                                <div class ="style">
                                  <label>
                                    Header
                                    <input type="radio" bind:group={field.selectedstyle} value="header" />
                                  </label>
                                  <label>
                                    Quote
                                    <input type="radio" bind:group={field.selectedstyle} value="quote" />
                                  </label>
                                  <label>
                                    Colored
                                    <input type="radio" bind:group={field.selectedstyle} value="colored" />
                                  </label>
                                </div>
                                <div class ="tipo">
                                  <label>
                                    <input type="checkbox" bind:checked={field.selectedbold} value="true" />
                                    Bold
                                  </label>
                                  <label>
                                    <input type="checkbox" bind:checked={field.selecteditalics} value="true" />
                                    Italics
                                  </label>
                                </div>
                                <button type="button" on:click={() => removeFieldFromColumn(item.elemento.id,field.id)}>Rimuovi</button>
                        </div>
                    {/each}
                    <button type="button" on:click={() => addFieldtoColumn(item.elemento.id)}>Aggiungi testo</button>
                    <button type="button" on:click={() => removeColumn(item.elemento.id)}>Rimuovi colonna</button>
                </div>
            {/if}
        {/each}
        <button type="button" on:click={addColumn}>Aggiungi colonna</button>
        <button type="button" on:click={addField}>Aggiungi testo</button>
        <button type="submit">Invia</button>
        </form> 
     </div>
    </main>