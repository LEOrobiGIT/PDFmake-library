
<script> 
    import { afterUpdate } from 'svelte';
    import pdfMake from '../scripts/pdfMakeConfig.js';
    let fieldbase = {type: 'field',elemento:{id:0, content: '', selectedfont:'', selectedfontsize: '', selectedstyle: '', bold : '', italics :'', pagebreak: ''}};
    let columnbase ={type :"column",elemento:{id: 1, fields: [] }};
    let campo = {type : "campo",id : 3,testo:[],larghezza_colonne :[], colspan:[], numero: 1,altezza_riga : "auto"};
    let contenuto_campi ={type : "contenuto_campi",id : 4,testo:[],altezza_riga : "auto"};
    let table ={type : 'table', elemento:{id: 2, layout: '', style:'', color:'', cont_campi:{}, contenuto_t:[campo,contenuto_campi] }};
    let list = {type: 'list', elemento : {id:5, tipo:"", start : 1, style: "", color: "", markerColor: "", pointer : "", testo :[]}};
    let header = {type : 'header', elemento : {id : 6, testo : '', alignment : '', style : '', margin :{left: 0, top: 0,  right: 0, bottom: 0}}};
    let footer = {type : 'footer', elemento : {id : 7, testo : '', alignment : '', style : '', margin :{left: 0, top: 0,  right: 0, bottom: 0}}};
    let contenuto =[header,footer,fieldbase,columnbase,table,list];
    let style = {nome : '', font : '', fontsize: '', bold : '', italics : '',alignment: '', lineheight : 1, color :'', background : ''};
    let styles = [];
    let nextId = 8; // id for the next field/column to be added
  //gestisce il submit  
    function handleSubmit() {
      console.log(contenuto);
      const dd = { content: [], header: {text: "", alignment: "", style: "", margin: []}, footer : {text: "", alignment: "", style: "", margin: []}, styles: { /* styles configuration */ } };
  
      contenuto.forEach(item => {
        if (item.type === 'field') {
          const contenuto = item.elemento.content;
          const font = item.elemento.selectedfont || 'Roboto';
          const fontSize = item.elemento.selectedfontsize || 12;
          const style = item.elemento.selectedstyle || 'header';
          const pagebreak = item.elemento.pagebreak;
          dd.content.push({
            text: contenuto,
            fontSize: fontSize,
            style: [style, font],
            bold: item.elemento.bold,
            italics: item.elemento.italics,
            pageBreak : pagebreak
          });
        } else if (item.type === 'column') {
          const campi = item.elemento.fields;
          console.log(campi);
          const ris = [];
          campi.forEach(field => {
            console.log(field);
            const width = field.width;
            const contenuto = field.content;
            const font = field.selectedfont || 'Roboto';
            const fontSize = field.selectedfontsize || 12;
            const style = field.selectedstyle || 'header';
            ris.push({
                width: width,
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
        } else if (item.type === 'table') {
          const layout = item.elemento.layout || '';
          const style_table = item.elemento.style || 'header';
          const color = item.elemento.color || '#444'
          const contenuto_t = item.elemento.contenuto_t;
          const righe = [];
          const altezze = [];
          var testo_colonne =[];
          var larghezza = [];
          contenuto_t.forEach(el =>{
            if (el.type === "campo"){
              larghezza = el.larghezza_colonne;
              testo_colonne = el.testo;
              altezze.push(el.altezza_riga)
            } else if (el.type === "contenuto_campi") {
              righe.push(el.testo);
              altezze.push(el.altezza_riga)
            }
          }
          );
          const body_table =[];
          body_table.push(testo_colonne);
          righe.forEach(el =>{
            body_table.push(el);
          });
          dd.content.push({
            layout: layout,
            style: style_table,
            color: color,
			      table: {
              heights: altezze,
				      widths: larghezza,
				      body: body_table
			      }
          });

        } else if (item.type === 'list') {
          const tipo = item.elemento.tipo||"ul";
          const start = item.elemento.start;
          const style = item.elemento.style;
          const color = item.elemento.color;
          const markercolor = item.elemento.markerColor;
          const pointer = item.elemento.pointer;
          const lista = [];
          item.elemento.testo.forEach(el=>{
            lista.push(el.content);
          });
          if (tipo === "ul"){
            dd.content.push({
              style: style,
              color : color,
              markerColor : markercolor,
              type : pointer,
              ul:lista
            })
          }else {
            dd.content.push({
              start : start,
              style: style,
              color : color,
              markerColor : markercolor,
              type : pointer,
              ol:lista
            })
          }
        }else if (item.type === 'header'){
          const testo = item.elemento.testo;
          const alignment = item.elemento.alignment;
          const style = item.elemento.style;
          const margin = [];
          margin.push(item.elemento.margin.left);
          margin.push(item.elemento.margin.top);
          margin.push(item.elemento.margin.right);
          margin.push(item.elemento.margin.bottom);
          dd.header.text = testo;
          dd.header.alignment = alignment;
          dd.header.style = style;
          dd.header.margin = margin;
        } else if (item.type === 'footer'){
          const testo = item.elemento.testo;
          const alignment = item.elemento.alignment;
          const style = item.elemento.style;
          const margin = [];
          margin.push(item.elemento.margin.left);
          margin.push(item.elemento.margin.top);
          margin.push(item.elemento.margin.right);
          margin.push(item.elemento.margin.bottom);
          dd.footer.text = testo;
          dd.footer.alignment = alignment;
          dd.footer.style = style;
          dd.footer.margin = margin;
        }
      });
  
      console.log(dd);
      pdfMake.createPdf(dd).download();
      contenuto =[...contenuto];
    }
  //------------------Field--------------------------------------------------------------

    function addField() {
      const field = {
        id: nextId,
        content: '',
        selectedfont: '',
        selectedfontsize: '',
        selectedstyle: '',
        selectedbold: '',
        selecteditalics: '',
        pagebreak : ''
      };
      const item = { type: 'field', elemento: field };
  
      contenuto = [...contenuto, item];
      nextId++;
    }

    function removeField(id) {
        contenuto = contenuto.filter(item => !(item.type === 'field' && item.elemento.id === id));
    }

  //-------------------------------------Column-------------------------------------
    
    function addColumn() {
        const column = {
          id: nextId,
          fields: [],
        };
        const item = { type: 'column', elemento: column };
    
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
        width : "auto"
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

    function removeColumn(id) {
        contenuto = contenuto.filter(item => !(item.type === 'column' && item.elemento.id === id));
    }

    function removeFieldFromColumn(c_id,f_id) {
      contenuto = contenuto.map(item => {
      if (item.type === 'column' && item.elemento.id === c_id) {
        item.elemento.fields = item.elemento.fields.filter(field => field.id !== f_id);
      }
      return item;
      });
    }

    function updateFunction() {
      // Perform the desired update here
      contenuto =[...contenuto];
	  }
  //---------------------------- Tables------------------------------

    function addTable() {
        const table = {
          id: nextId,
          layout: '',
          style:'', 
          color:'', 
          contenuto_t:[{type : "campo",id : nextId+1,testo:[],larghezza_colonne :[],numero: 1},{type : "contenuto_campi",id : nextId+2,testo:[],altezza_riga : "auto"}] 
        };
        const item = { type: 'table', elemento: table };
    
        contenuto = [...contenuto, item];
        nextId = nextId +3;  
    }                 

    function removeRiga(tableId, contenutoCampiId) {
      contenuto = contenuto.map(item => {
        if (item.type === 'table' && item.elemento.id === tableId) {
          item.elemento.contenuto_t = item.elemento.contenuto_t.filter(campi => campi.id !== contenutoCampiId);
        }
        return item;
      });
    }

    function addRiga(tableId) {
      const contenuto_campi = {
          type:"contenuto_campi",
          id: nextId,
          testo: [],
          altezza_riga:"auto"
        };
        for (var i = 0; i < contenuto.length; i++) {
          var tabella = contenuto[i];
          if (tabella.type === "table" && tabella.elemento.id === tableId) {
              tabella.elemento.contenuto_t.push(contenuto_campi);
              updateFunction();
              break; // Assuming you want to update only the first occurrence
      }
      }
          nextId++;
          console.log(contenuto)

    }
  
    function removeTable(tableId) {
      contenuto = contenuto.filter(item => !(item.type === 'table' && item.elemento.id === tableId));
    }
  

  //---------------------Lists-----------------------------

  function addList() {
        const list = {
          id: nextId,
          tipo: '',
          start : 1,
          style:'', 
          color: "", 
          markerColor: "", 
          pointer : "",
          testo: []
        };
        const item = { type: 'list', elemento: list };
    
        contenuto = [...contenuto, item];
        nextId++  
  }

  function removeList(listId) {
    contenuto = contenuto.filter(item => !(item.type === 'list' && item.elemento.id === listId));
  }

  function addFieldtoList(index) {
      const field = {
        id: nextId,
        content: ''
      };
      for (var i = 0; i < contenuto.length; i++) {
        var lista = contenuto[i];
        if (lista.type === "list" && lista.elemento.id === index) {
          lista.elemento.testo.push(field);
            updateFunction();
            break; // Assuming you want to update only the first occurrence
        }
      }
      nextId++;
  }

  function removeFieldFromList(l_id,f_id) {
      contenuto = contenuto.map(item => {
      if (item.type === 'list' && item.elemento.id === l_id) {
        item.elemento.testo = item.elemento.testo.filter(field => field.id !== f_id);
      }
      return item;
      });
  }

  //--------------------------Header------------------------------------

  function addHeader() {
        const header = {
          id: nextId,
          testo: '',
          alignment : '',
          style : '',
          margin :{left: 0, top: 0,  right: 0, bottom: 0}
        };
        const item = { type: 'header', elemento: header};
    
        contenuto = [...contenuto, item];
        nextId++  
  }
  function removeHeader(headerId) {
    contenuto = contenuto.filter(item => !(item.type === 'header' && item.elemento.id === headerId));
  }

  //---------------Footer------------------------------------------

    function addFooter() {
          const footer = {
            id: nextId,
            testo: '',
            alignment : '',
            style : '',
            margin :{left: 0, top: 0,  right: 0, bottom: 0}
          };
          const item = { type: 'footer', elemento: footer};
      
          contenuto = [...contenuto, item];
          nextId++  
    }

    function removeFooter(footerId) {
      contenuto = contenuto.filter(item => !(item.type === 'footer' && item.elemento.id === footerId));
    }

  //----------------------Handles-----------------------------------  
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
    function countCampoElements(tableId) {
      for (let i = 0; i < contenuto.length; i++) {
        if (contenuto[i].type === 'table' && contenuto[i].elemento.id === tableId) {
          return  contenuto[i].elemento.contenuto_t[0].numero;
          }
        }
      }
    
  

  </script>
    <main>
    <div class="container">
      <div class = "sinistra">
        <button type="button" on:click={addColumn}>Aggiungi colonna</button>
        <button type="button" on:click={addField}>Aggiungi testo</button>
        <button type="button" on:click={addTable}>Aggiungi tabella</button>
        <button type="button" on:click={addList}>Aggiungi lista</button>
        <button type="button" on:click={addHeader}>Aggiungi header</button>
        <button type="button" on:click={addFooter}>Aggiungi footer</button>
      </div>
      <div class = "destra">
        <h1>Crea PDF</h1>
        <form class="elements" on:submit|preventDefault={handleSubmit}>
        {#each contenuto as item}
            {#if item.type === 'header'}
              <h1>Header</h1>
              <div class= "element-header"> 
                <div class = "cont-allignment">
                  <label> 
                    <p>Contenuto Header: </p>
                  <input type="text" bind:value={item.elemento.testo}/> 
                  </label>
                  <p>Alignment: </p>
                  <label> 
                    <input type="radio" bind:group={item.elemento.alignment} value="left"/> 
                    Sinistra
                  </label>
                  <label> 
                    <input type="radio" bind:group={item.elemento.alignment} value="right"/> 
                    Destra
                  </label>
                  <label> 
                    <input type="radio" bind:group={item.elemento.alignment} value="center"/> 
                    Centro
                  </label>
                </div>
                <div class = "style-margin">
                  <label for = "style-select"> 
                    <p>Style:</p>
                  </label>
                    <select id="style-select" bind:value={item.elemento.style} name="style-option">  
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                      <option value="option3">Option 3</option>
                      <option value="option4">Option 4</option>
                    </select>
                  <p>Margini:</p>
                  <label>
                    Sinstra:
                    <input type="number" bind:value={item.elemento.margin.left}/> 
                  </label>
                  <label>
                    Destra:
                    <input type="number" bind:value={item.elemento.margin.right}/> 
                  </label>
                  <label>
                    Sopra:
                    <input type="number" bind:value={item.elemento.margin.top}/> 
                  </label>
                  <label>
                    Sotto:
                    <input type="number" bind:value={item.elemento.margin.bottom}/> 
                  </label>
                </div>
              </div>
              <button type="button" on:click={() => removeHeader(item.elemento.id)}>Rimuovi</button>
            {:else if item.type === 'footer'}
              <h1>Footer</h1>
              <div class= "element-header"> 
                <div class = "cont-allignment">
                  <label> 
                    <p>Contenuto Footer: </p>
                  <input type="text" bind:value={item.elemento.testo}/> 
                  </label>
                  <p>Alignment: </p>
                  <label> 
                  <input type="radio" bind:group={item.elemento.alignment} value="left"/> 
                    Sinistra
                  </label>
                  <label> 
                    <input type="radio" bind:group={item.elemento.alignment} value="right"/> 
                      Destra
                  </label>
                  <label> 
                    <input type="radio" bind:group={item.elemento.alignment} value="center"/> 
                      Centro
                  </label>
                </div>
                <div class = "style-margin">
                  <label for = "style-select"> 
                    <p>Style:</p>
                  </label>
                    <select id="style-select" bind:value={item.elemento.style} name="style-option">  
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                      <option value="option3">Option 3</option>
                      <option value="option4">Option 4</option>
                    </select>
                  <p>Margini:</p>
                  <label>
                    Sinstra:
                    <input type="number" bind:value={item.elemento.margin.left}/> 
                  </label>
                  <label>
                    Destra:
                    <input type="number" bind:value={item.elemento.margin.right}/> 
                  </label>
                  <label>
                    Sopra:
                    <input type="number" bind:value={item.elemento.margin.top}/> 
                  </label>
                  <label>
                    Sotto:
                    <input type="number" bind:value={item.elemento.margin.bottom}/> 
                  </label>
                </div>
              </div>
              <button type="button" on:click={() => removeFooter(item.elemento.id)}>Rimuovi</button>
            {/if}
          {/each}
          {#each contenuto as item,x}
            {#if item.type === 'field'}
              <h1>Paragrafo</h1>
                <div class= "element"> 
                <label> 
                  <p>Contenuto :  </p>
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
                <label for="fontsizes"><p>Grandezza del font:</p></label>
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
                    <input type="radio" bind:group={item.elemento.selectedstyle} value="header" />
                    Header
                </label>
                <label>
                    <input type="radio" bind:group={item.elemento.selectedstyle} value="quote" />
                    Quote
                </label>
                <label>
                    <input type="radio" bind:group={item.elemento.selectedstyle} value="colored" />
                    Colored
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
                Page Break:
                <label>
                  <input type="radio" bind:group={item.elemento.pagebreak} value="before" />
                  Before
                </label>
                <label>
                  <input type="radio" bind:group={item.elemento.pagebreak} value="after" />
                  After
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
              <h1>Colonne</h1>
                <div class="colonna-element">
                    {#each item.elemento.fields as field,x}  
                      <h2>Elemento {x+1}</h2>     
                        <div class="element">    
                                <label> 
                                  <p>Contenuto: </p>
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
                                    <input type="radio" bind:group={field.selectedstyle} value="header" />
                                    Header
                                  </label>
                                  <label>
                                    <input type="radio" bind:group={field.selectedstyle} value="quote" />
                                    Quote
                                  </label>
                                  <label>
                                    <input type="radio" bind:group={field.selectedstyle} value="colored" />
                                    Colored
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
                                <div class= "larghezza">
                                  <label>
                                    <input type="radio" bind:group={field.width} value="auto"  />
                                    Larghezza auto
                                  </label>
                                  <label>
                                    <input type="radio" bind:group={field.width} value="*" />
                                    Larghezza Fill
                                  </label>
                                  <label class ="labellarghezza">
                                    <input type="radio" bind:group={field.width} value="custom"/>
                                    <p>Larghezza :</p>
                                    <input id = "1" type="number" bind:value={field.width}>
                                  </label>
                                </div>
                                <button type="button" on:click={() => removeFieldFromColumn(item.elemento.id,field.id)}>Rimuovi</button>
                        </div>
                    {/each}
                    <button type="button" on:click={() => addFieldtoColumn(item.elemento.id)}>Aggiungi testo</button>
                    <button type="button" on:click={() => removeColumn(item.elemento.id)}>Rimuovi colonne</button>
                </div>
            <!--let table ={type : 'table', elemento:{id: 2, layout: '', style:'', color:'', widths :[],heights: [], contenuto:[] }};
            let campo = {type : "campo",id : 3,testo:""};
            let contenuto_campi ={type : "contenuto_campi",id : 4,testo:""};-->
            {:else if item.type === 'table'}
              <h1>Tabella</h1>
              <div class="tabella-element">
                <h2>Layout</h2>
                <div class = "layout">
                  <label>
                    <input type="radio" bind:group={item.elemento.layout} value="" />
                    Border
                  </label>
                  <label>
                    <input type="radio" bind:group={item.elemento.layout} value="noBorders" />
                    noBorders
                  </label>
                  <label>
                    <input type="radio" bind:group={item.elemento.layout} value="quoheaderLineOnlyte" />
                    headerLineOnly
                  </label>
                  <label>
                    <input type="radio" bind:group={item.elemento.layout} value="lightHorizontalLines" />
                    lightHorizontalLines
                  </label>
                </div>
                <div class = "style">
                  <label>
                    <input type="radio" bind:group={item.elemento.style} value="header" />
                    Header
                  </label>
                  <label>
                      <input type="radio" bind:group={item.elemento.style} value="quote" />
                      Quote
                  </label>
                  <label>
                      <input type="radio" bind:group={item.elemento.style} value="colored" />
                      Colored
                  </label>
                </div>
              
                {#each item.elemento.contenuto_t as field}   
                  <div class="element-campi">  
                    {#if field.type === "campo"}
                      <h2>Attributi delle colonne</h2>
                      <label class = "label2"> 
                        Numero delle colonne: 
                        <input type="number" bind:value={field.numero}/> 
                      </label>
                      <label class = "label2"> 
                        Altezza riga: 
                      <input type="number"  bind:value={field.altezza_riga}/> 
                      </label>
                      {#each Array(field.numero) as _,i}
                      <label class = "label2"> 
                        Nome colonna: 
                        <input class = nomi_colonne type="text" bind:value={field.testo[i]}/> 
                      </label>
                      <label class = "label2"> 
                        Span della colonna: 
                      <input type="number" bind:value={field.colspan[i]}/> 
                      </label>
                      <label class = "label2"> 
                        Larghezza colonna: 
                      <input type="number" bind:value={field.larghezza_colonne[i]}/> 
                      </label>
                      {/each}
                    {:else if field.type === 'contenuto_campi'}
                      <h2>Riga </h2>
                      <div class = "element-riga">
                        {#each Array(countCampoElements(item.elemento.id)) as _,i}
                            <label class = "label2"> 
                                Contenuto colonna {i+1}: 
                                <input type="text" bind:value={field.testo[i]}/> 
                            </label>   
                        {/each}
                        <label class = "label2"> 
                          Altezza riga: 
                        <input type="number"  bind:value={field.altezza_riga}/> 
                        </label>
                      <button type="button" on:click={() => removeRiga(item.elemento.id,field.id)}>Rimuovi Riga</button>
                    </div>
                    {/if}
                    </div>
                {/each}
                <button type="button" on:click={() => addRiga(item.elemento.id)}>Aggiungi Riga</button>
                <button type="button" on:click={() => removeTable(item.elemento.id)}>Rimuovi tabella</button>
              </div>
            {:else if item.type === 'list'}
              <h1>Lista </h1>
              <div class="list-element">
                <div class = "ordine">
                  <label>
                    <input type="radio" bind:group={item.elemento.tipo} value="ol" />
                    Ordinata
                  </label>
                  <label>
                    <input type="radio" bind:group={item.elemento.tipo} value="ul" />
                    Non ordinata
                  </label>
                </div>
                <div class = "stile_colore">
                  <div class = "style">
                    <label>
                      <input type="radio" bind:group={item.elemento.style} value="header" />
                      Header
                    </label>
                    <label>
                      <input type="radio" bind:group={item.elemento.style} value="quote" />
                      Quote
                    </label>
                    <label>
                      <input type="radio" bind:group={item.elemento.style} value="colored" />
                      Colored
                    </label>
                  </div>
                  <div class = "colore">
                    <label class ="label3"> 
                      Colore: 
                      <input type="color" bind:value={item.elemento.color}/> 
                    </label>
                    <label class ="label3"> 
                      Colore del puntatore: 
                      <input type="color" bind:value={item.elemento.markerColor}/> 
                    </label>
                  </div>
                </div>
                <div class = "stileNumeri">
                  <label>
                    <input type="radio" bind:group={item.elemento.pointer} value="lower-roman" />
                    Lower-Roman
                  </label>
                  <label>
                    <input type="radio" bind:group={item.elemento.pointer} value="lower-alpha" />
                    Lower-Alpha
                  </label>
                  <label>
                    <input type="radio" bind:group={item.elemento.pointer} value="upper-roman" />
                    Upper-Roman
                  </label>
                  <label>
                    <input type="radio" bind:group={item.elemento.pointer} value="upper-alpha" />
                    Upper-Alpha
                  </label>
                  <label>
                    <input type="radio" bind:group={item.elemento.pointer} value="circle" />
                    Circle
                  </label>
                  <label>
                    <input type="radio" bind:group={item.elemento.pointer} value="square" />
                    Square
                  </label>
                </div>
                {#each item.elemento.testo as field,i}  
                <div class="contenutolista">
                  <label class ="label4"> 
                    Contenuto riga {i+1} : 
                    <input class = riga_lista type="text" bind:value={field.content}/> 
                  </label>
                  
                  <button type="button" on:click={() => removeFieldFromList(item.elemento.id,field.id)}>Rimuovi</button>
                </div> 
                {/each}
              
              <button type="button" on:click={() => addFieldtoList(item.elemento.id)}>Aggiungi riga</button>
              <button type="button" on:click={() => removeList(item.elemento.id)}>Rimuovi Lista</button>
              </div>
            {/if}
        {/each}
        <button type="submit">Invia</button>
        </form> 
     </div>       
    </div>
    </main>