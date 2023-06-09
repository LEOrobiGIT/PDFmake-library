
<script> 
	
  	import { afterUpdate } from 'svelte';
	import pdfMake from '../scripts/pdfMakeConfig.js';
	/*
	pdfMake.vfs = pdfMake.vfs || {}; // Ensure vfs object exists
	pdfMake.vfs['Roboto-Regular.ttf'] = '[path-to-font-file]'; // Replace [path-to-font-file] with the actual path
	pdfMake.vfs['Roboto-Bold.ttf'] = '[path-to-font-file]'; // Replace [path-to-font-file] with the actual path*/
	  let shouldUpdate = false;
	  let contenuto = [];
	  let fields = [{id: 0, content: '', selectedfont:'', selectedfontsize: '', selectedstyle: '', bold : '', italics :''}]; // array di oggetti contenenti l'id, il nome e l'opzione selezionata per ogni campo 
	  let colonna = [{ id: 1, fields: [] }]; 
	  let nextId = 1; // id per il prossimo campo da aggiungere 
	  let selectedId = 0; // id del campo selezionato per rimozione 
	  const dd = { content: [], style:{}};


	  function handleSubmit() { 
		const dd = { content: [], styles:{
			opensans: {
      			font: 'OpenSans',
    		},
    		opensansBold: {
				font: 'OpenSans-Bold',
			},
			oswald:{
				font: 'Oswald-regular',
			},
			roboto:{
				font: 'Roboto',
			},
			header: {
				bold: true
			},
			quote: {
				italics: true
			},
			defaultStyle: {
				fontSize: 15,
				bold: false
			},
			colored: {
				fontSize: 20,
				bold: true,
				color: "#ff5500",
				characterSpacing:3
			}}}; // inizializza l'oggetto dd con un array vuoto
		fields.forEach(field => { 
			const font = field.selectedfont || 'Roboto';
			const fontSize = field.selectedfontsize || 12;
			const style = field.selectedstyle || 'header';
			dd.content.push({ // aggiunge un nuovo oggetto all'array per ogni campo compilato
				text: field.content,
        		fontSize: fontSize, 
				style: [style,font],
				bold:field.selectedbold,
				italics:field.selecteditalics,
			});
			console.log(`Campo ${field.id}: Contenuto: ${field.content},Font selezionato:${field.selectedfont}, FontSize selezionata: ${field.selectedfontsize}, Stile selezionato: ${field.selectedstyle}`); // qui si potrebbe effettuare una chiamata API per inviare il form
		}); 
		console.log(dd);
		pdfMake.createPdf(dd).download();
	  } 
	  
	  function addField() { 
		fields = [...fields, {id: nextId, content: '', selectedfont:'',selectedfontsize: '', selectedstyle:'', bold : '', italics :''}]; // aggiunge un oggetto vuoto all'array 
		nextId++; // incrementa l'id per il prossimo campo da aggiungere 
	  } 
	  function addFieldColonna(colonnaId) {
		const column = colonna.find(col => col.id === colonnaId);
		if (column) {
			column.fields = [...column.fields, { id: nextId, content: '', selectedfont: '', selectedfontsize: '', selectedstyle: '', bold: '', italics: '' }];
			nextId++; // increment the id for the next field to be added
			updateFunction();
		}
		}
		
	  function addColumns() { 
		colonna = [...colonna, { id: nextId, fields: [] }]; // add a new column object with an empty fields array to the colonna array
    	nextId++; // incrementa l'id per il prossimo campo da aggiungere 
	  } 
	
	  function removeField(id) { 
		fields = fields.filter(field => field.id !== id); // rimuove l'oggetto con l'id specificato dall'array 
	  } 
	  function removeFieldColumn(id) { 
		colonna.fields = colonna.fields.filter(field => field.id !== id); // rimuove l'oggetto con l'id specificato dall'array 
	  } 
	  function removeColonna(colonnaId) {
			colonna = colonna.filter(column => column.id !== colonnaId);
		}
	  function handleChangeFont(event,field) {
		field.selectedfont = event.target.value;
	  }
	  function handleChangeFontSize(event,field) {
		field.selectedfontsize = event.target.value;
	  }

	function updateFunction() {
		// Perform the desired update here
		fields = [...fields];
      	colonna = [...colonna];
	}
	
	
  	
	</script> 
	<main> 
	  <div class ="container">
	  <h1>Crea PDF</h1> 
	  <form class = elements on:submit|preventDefault={handleSubmit}> 
	
		{#each fields as field} 
	
		<div class= "element"> 
		  <label> 
			Contenuto: 
			<input type="text" bind:value={field.content}/> 
		  </label>
		  <div class ="font">
			<label for="font">Font:</label>
			<select id="font" bind:value={field.selectedfont}  on:change={(e) => handleChangeFont(e, field)}>
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
			<select id="fontsizes" bind:value={field.selectedfontsize}  on:change={(e) => handleChangeFontSize(e, field)}>
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
		  <button type="button" on:click={() => removeField(field.id)}>Rimuovi</button>
		  <!--{#if field.id === selectedId}
			<button type="button" on:click={() => selectedId = 0}>Annulla</button>
		  {:else}
			<button type="button" on:click={() => selectedId = field.id}>Modifica</button>
		  {/if}-->
		</div>
		{/each}
		{#each colonna as column}
		<div class="colonna-element">
			<h2>Colonna {column.id}</h2>
			{#each column.fields as field}
				<div class="element">
					 
						<label> 
						  Contenuto: 
						  <input type="text" bind:value={field.content}/> 
						</label>
						<div class ="font">
						  <label for="font">Font:</label>
						  <select id="font" bind:value={field.selectedfont}  on:change={(e) => handleChangeFont(e, field)}>
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
						  <select id="fontsizes" bind:value={field.selectedfontsize}  on:change={(e) => handleChangeFontSize(e, field)}>
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
						<button type="button" on:click={() => removeFieldColumn(field.id)}>Rimuovi</button>
				</div>
			{/each}
			<button type="button" on:click={() => addFieldColonna(column.id)}>Aggiungi testo</button>
			<button type="button" on:click={() => removeColonna(column.id)}>Rimuovi colonna</button>
		</div>
		{/each}
		<button type="button" on:click={addColumns}>Aggiungi colonna</button>
	
		<button type="button" on:click={addField}>Aggiungi testo</button>
		<button type="submit">Invia</button>
	  </form> 
	</div>
	</main>