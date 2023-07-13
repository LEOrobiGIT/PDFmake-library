
<script> 
  import { onMount, onDestroy } from 'svelte';
  import { afterUpdate, tick } from 'svelte';
  import pdfMake from 'pdfmake/build/pdfmake';
  import pdfFonts from "../public/vfs_fonts";
  //import pdfFonts from "pdfmake/build/vfs_fonts"; 
  pdfMake.vfs = pdfFonts;
  import PDFPreview from './PDFPreview.svelte';
  import fileList from '../src/fileList.json';
  import { ddStore } from './PDFstore.js';
  let generatedPdfData;
  export let fileListpassed;
  //------------------FONTS-----------------------------
    pdfMake.fonts = {
      NotoSerif: {
        normal: "NotoSerif-Regular.ttf",
        bold: "NotoSerif-Bold.ttf",
        italics: "NotoSerif-Italic.ttf",
        bolditalics: "NotoSerif-BoldItalic.ttf",
      },
	    Montserrat: {
        normal: "Montserrat-Regular.ttf",
        bold: "Montserrat-Bold.ttf",
        italics: "Montserrat-Italic.ttf",
        bolditalics: "Montserrat-BoldItalic.ttf",
      },
      Raleway: {
        normal: "Raleway-Regular.ttf",
        bold: "Raleway-Bold.ttf",
        italics: "Raleway-Italic.ttf",
        bolditalics: "Raleway-BoldItalic.ttf",
      },
      RobotoSerif: {
        normal: "RobotoSerif-Regular.ttf",
        bold: "RobotoSerif-Bold.ttf",
        italics: "RobotoSerif-Italic.ttf",
        bolditalics: "RobotoSerif-BoldItalic.ttf",
      },
      Roboto: {
        normal: "Roboto-Regular.ttf",
        bold: "Roboto-Bold.ttf",
        italics: "Roboto-Italic.ttf",
        bolditalics: "Roboto-BoldItalic.ttf",
      }
    };

  //-------------------inizializzazione doc definition ----------------------------------
    let pdfData = null;
    let dd = {};
    ddStore.set(dd);
    pdfMake.createPdf(dd).getDataUrl((dataUrl) => {
      pdfData = dataUrl;
    });
  //------------------Struttura del contenuto ----------------------------
    let fieldbase = {type: 'field',elemento:{id:0, content: '', selectedfont:'', selectedfontsize: '', selectedstyle: '', selectedbold : '', selecteditalics :'', pagebreak: ''}};
    let columnbase ={type :"column",elemento:{id: 1, gap: 10, fields: [], alignment: "" }};
    let campo = {type : "campo",id : 3,testo:[],larghezza_colonne :[], fillcolor : [], numero: 1, altezza_riga : "auto", borders:{left:[false],top:[false],right:[false],bottom:[false]}, alignments: [], colspan : []};
    let contenuto_campi ={type : "contenuto_campi",id : 4,testo:[],altezza_riga : "auto", fillcolor : [], borders:{left:[false],top:[false],right:[false],bottom:[false]}, alignments : [], colspan : []};
    let table ={type : 'table', elemento:{id: 2, layout: '', style:'', color:'',contenuto_t:[campo,contenuto_campi] }};
    let list = {type: 'list', elemento : {id:5, tipo:"", start : 1, style: "", color: "", markerColor: "", pointer : "", testo :[]}};
    let header = {type : 'header', elemento : {id : 6, testo : '', alignment : '', style : '', margin :{left: 0, top: 0,  right: 0, bottom: 0}}};
    let footer = {type : 'footer', elemento : {id : 7, testo : '', alignment : '', style : '', margin :{left: 0, top: 0,  right: 0, bottom: 0}}};
    let svg = {type: 'svg',elemento: {id :8 , selectedFile: null,svgContent : '',larghezza : 0, altezza: 0 ,larghezza_fit: 0, altezza_fit: 0, alignment : "", svgMargins : []}};
    let img = {type: 'img',elemento: {id :9 , selectedFile: null,imgContent : '',larghezza : 0, altezza: 0 ,larghezza_fit: 0, altezza_fit: 0, alignment : "", imgMargins : []}};
    let toc = {type : 'toc', elemento: { id: 10, id_sec : "", style : "", fontSize: 15, text :"", pageBreak: '',bold: "", italics : "" }}
    let pagina = {type : 'page', id : 1, pageMargins : [40,40,40,40]};
    let contenuto =[pagina];
    let style = {nome : '', font : '', fontsize: '', bold : '', italics : '',alignment: '', lineheight : 1, color :'', background : ''};
    let nextId = 2; // id for the next field/column to be added
  //------------ Dichiarazione degli stili--------------------------
	  let custom_styles = {
      header : {fontSize : 18,bold : true}, 
      subheader : {fontSize : 15, bold: true}, 
      quote: {italics : true}, 
      small : {fontSize : 8}, 
      normal : {fontSize :12}
    }
    var hasHeader = false;
    var hasFooter = false;
    var isHeaderPresent = false;
    var isFooterPresent = false;
  //gestisce il submit  
    function handleSubmit(event) {
      checkFooterAndExecute;
      checkHeaderAndExecute;
      console.log(contenuto);
      var dd = {};
      var pageMargins = contenuto[0].pageMargins;
      if (pageMargins.length === 0){
        pageMargins = [40,40,40,40];
      }
      dd = {pageMargins: pageMargins, content: [], header: {text: "", alignment: "", style: "", fontSize: "", font: "", margin: []}, footer : {text: "", alignment: "", style: "",fontSize: "", font: "", margin: []}, styles: custom_styles};
      contenuto.forEach(item => {
        if (item.type === 'field') {
          var testo = item.elemento.content;
          testo = testo.concat("\n");
          const font = item.elemento.selectedfont || 'Roboto';
          const fontSize = item.elemento.selectedfontsize || 12;
          const style = item.elemento.selectedstyle || 'normal';
          const pagebreak = item.elemento.pagebreak;
          const tocItem = item.elemento.tocItem;
          dd.content.push({
            text: testo,
            fontSize: fontSize,
            style: style,
            font: font,
            bold: item.elemento.selectedbold,
            italics: item.elemento.selecteditalics,
            pageBreak : pagebreak,
            tocItem : tocItem
          });
        } else if (item.type === 'row') {
          dd.content.push({
            text : "  ",
          });
        } else if (item.type === 'column') {
          const gap = item.gap;
          const campi = item.elemento.fields;
          const alignment = item.alignment;
          console.log(campi);
          const ris = [];
          campi.forEach(field => {
            const width = field.width;
            const contenuto = field.content;
            const font = field.selectedfont || 'Roboto';
            const fontSize = field.selectedfontsize || 12;
            const style = field.selectedstyle || 'normal';
            ris.push({
                width: width,
                text: contenuto,
                fontSize: fontSize,
                style: style,
                font: font,
                bold: item.elemento.bold,
                italics: item.elemento.italics,
            });
          });
          dd.content.push({
            columns: ris,
            columnGap: gap,
            alignment : alignment
          });
        } else if (item.type === 'table') {
          const body_table =[];
          const layout = item.elemento.layout || '';
          const color = item.elemento.color || '#444'
          const contenuto_t = item.elemento.contenuto_t || '';
          const font = item.elemento.font || 'Roboto';
          const fontsize = item.elemento.fontsize || 12;
          const pagebreak = item.elemento.pagebreak;
          const bold = item.elemento.bold;
          const italics = item.elemento.italics;
          const altezze = [];
          const larghezza = [];
          contenuto_t.forEach(el =>{
            console.log("el");
            console.log(el);
            var riga = [];
            if (el.type === "campo"){
              if (el.tipoaltezza_riga === "auto"){
                altezze.push(el.tipoaltezza_riga);
              }else{
                altezze.push(el.altezza_riga);
              };
              for (let i = 0; i < el.numero; i++){
                var testo = el.testo[i] || "";
                console.log(el.larghezza_colonne[i]);
                if (!el.larghezza_colonne[i]){
                  el.larghezza_colonne[i] = "auto"
                };
                larghezza.push(el.larghezza_colonne[i]);
                var fill_color = el.fillcolor[i];
                var borders = [];
                borders.push(el.borders.left[i]);
                borders.push(el.borders.top[i]);
                borders.push(el.borders.right[i]);
                borders.push(el.borders.bottom[i]);
                var alignment = el.alignments[i];
                var colspan = el.colspan[i] || 1;
                riga.push({
                  border : borders,
                  fillColor: fill_color,
                  alignment : alignment,
                  colSpan: colspan,
                  text : testo,
                });
              }
            } else if (el.type === "contenuto_campi") {
              if (el.tipoaltezza_riga === "auto"){
                altezze.push(el.tipoaltezza_riga);
              }else{
                altezze.push(el.altezza_riga);
              };
              for (let i = 0; i < el.testo.length; i++){
                var testo = el.testo[i]|| "";
                var fill_color = el.fillcolor[i];
                var borders = [];
                borders.push(el.borders.left[i]);
                borders.push(el.borders.top[i]);
                borders.push(el.borders.right[i]);
                borders.push(el.borders.bottom[i]);
                var alignment = el.alignments[i];
                var colspan = el.colspan[i]|| 1;
                riga.push({
                  border : borders,
                  fillColor: fill_color,
                  alignment : alignment,
                  colSpan: colspan,
                  text : testo,
                });
                console.log("riga");
                console.log(riga);
              } 
            }
            body_table.push(riga);
          });
          dd.content.push({
            layout: layout,
            color: color,
			      table: {
              heights: altezze,
				      widths: larghezza,
				      body: body_table
			      },
            fontSize: fontsize,
            font: font,
            pageBreak : pagebreak,
            bold: bold,
            italics: italics
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
        } else if (item.type === 'header'){
          const testo = item.elemento.testo;
          const alignment = item.elemento.alignment;
          const style = item.elemento.style;
          var font = item.elemento.font;
          var fontsize = item.elemento.fontsize;
          const margin = [];
          margin.push(item.elemento.margin.left);
          margin.push(item.elemento.margin.top);
          margin.push(item.elemento.margin.right);
          margin.push(item.elemento.margin.bottom);
          dd.header.text = testo;
          dd.header.alignment = alignment;
          dd.header.style = style;
          dd.header.margin = margin;
          if (font === ""){
            font = "Roboto";
          }
          if (fontsize === ""){
            fontsize = 12;
          }
          dd.header.font = font;
          dd.header.fontSize = fontsize;
        } else if (item.type === 'footer'){
          const testo = item.elemento.testo;
          const alignment = item.elemento.alignment;
          const style = item.elemento.style;
          const margin = [];
          var font = item.elemento.font;
          var fontsize = item.elemento.fontsize;
          margin.push(item.elemento.margin.left);
          margin.push(item.elemento.margin.top);
          margin.push(item.elemento.margin.right);
          margin.push(item.elemento.margin.bottom);
          dd.footer.text = testo;
          dd.footer.alignment = alignment;
          dd.footer.style = style;
          dd.footer.margin = margin;
          if (font === ""){
            font = "Roboto";
          }
          if (fontsize === ""){
            fontsize = 12;
          }
          dd.footer.font = font;
          dd.footer.fontSize = fontsize;
        } else if (item.type === 'svg'){
          const svgContent = item.elemento.svgContent;
          const larghezza = item.elemento.larghezza;
          const altezza = item.elemento.altezza;
          const larghezza_fit = item.elemento.larghezza_fit;
          const altezza_fit = item.elemento.altezza_fit;
          const alignment = item.elemento.alignment;
          const svgMargins = item.elemento.svgMargins;
          const isMaxDimensionsSelected = item.elemento.isMaxDimensionsSelected;
          if (isMaxDimensionsSelected === "true"){
            dd.content.push({
              svg: svgContent,
              fit : [larghezza_fit,altezza_fit],
              alignment : alignment,
              margin : svgMargins
            });
          }else{
            dd.content.push({
              svg: svgContent,
              width:larghezza,
              height: altezza,
              alignment : alignment,
              margin : svgMargins
            });
          }
        } else if (item.type === 'img'){
          const imgContent = item.elemento.imgContent;
          const larghezza = item.elemento.larghezza;
          const altezza = item.elemento.altezza;
          const larghezza_fit = item.elemento.larghezza_fit;
          const altezza_fit = item.elemento.altezza_fit;
          const alignment = item.elemento.alignment;
          const imgMargins = item.elemento.imgMargins;
          const isMaxDimensionsSelected = item.elemento.isMaxDimensionsSelected;
          if (isMaxDimensionsSelected === "true"){
            dd.content.push({
              image: imgContent,
              fit : [larghezza_fit,altezza_fit],
              alignment : alignment,
              margin : imgMargins
            });
          }else{
            dd.content.push({
              image: imgContent,
              width:larghezza,
              height: altezza,
              alignment : alignment,
              margin : imgMargins
            });
          }
        } else if (item.type === 'toc'){
          const id_sec = item.elemento.id_sec;
          const style = item.elemento.style;
          const fontSize = item.elemento.fontSize;
          const text = item.elemento.text;
          const pageBreak = item.elemento.pageBreak;
          const bold = item.elemento.bold;
          const italics = item.elemento.italics;
          const font = item.elemento.font;
          dd.content.push({
            toc : {
              id : id_sec,
              title : {
                text : text,
                style : style,
                fontSize : fontSize,
                pageBreak : pageBreak,
                bold : bold,
                italics : italics,
                font : font
              }
            }
          });
        }
      });
      const clickedButtonValue = event.submitter.value;
      if(clickedButtonValue === "preview"){
        console.log(dd);
        const pdfDocGenerator = pdfMake.createPdf(dd);
        if (window.innerWidth < 1270) {
          // Open the PDF in a new tab/window
          pdfDocGenerator.open();
          pdfDocGenerator.getDataUrl((dataUrl) => {
          pdfData = dataUrl;
        });
          contenuto =[...contenuto];
        }else{
          pdfDocGenerator.getDataUrl((dataUrl) => {
            pdfData = dataUrl;
          });
          contenuto =[...contenuto];
        }
      }else{
        //generatedPdfData = pdfMake.createPdf(dd).getDataUrl;
        //pdfMake.createPdf(dd).print();
        ddStore.set(dd);

        const unsubscribe = ddStore.subscribe((value) => {
          console.log('Stored value in PDFstore:', value);
        });
        onDestroy(() => {
          unsubscribe();
        });

        contenuto =[...contenuto];
      }
      }
      

  //------------------Field(testo)--------------------------------------------------------------

    function addField(i) {
      const field = {
        id: nextId,
        content: '',
        selectedfont: '',
        selectedfontsize: '',
        selectedstyle: '',
        selectedbold: '',
        selecteditalics: '',
        pagebreak : '',
        tocItem : ''
      };
      const item = { type: 'field', elemento: field };
      contenuto.splice(i, 0, item);
      //contenuto = [...contenuto, item];
      nextId++;
    }

    function removeField(id) {
        contenuto = contenuto.filter(item => !(item.type === 'field' && item.elemento.id === id));
    }

  //-------------------------------------Column-------------------------------------
    
    function addColumn(i) {
        const column = {
          id: nextId,
          fields: [],
        };
        const item = { type: 'column', gap :10, elemento: column, alignment : ""};
        contenuto.splice(i, 0, item);
        //contenuto = [...contenuto, item];
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
        width : "auto",
        tocItem : ''
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

    function addTable(i) {
        const table = {
          id: nextId,
          layout: 'Custom', 
          font: "",
          fontsize: "12",
          pagebreak :"",
          bold : "",
          italics: "",
          color:'', 
          righe: 1,
          contenuto_t:[{type : "campo",id : nextId+1,testo:[""],larghezza_colonne :["auto"],fillcolor : [""], numero: 1, tipoaltezza_riga : "auto", altezza_riga : 10, borders:{left:[true],top:[true],right:[true],bottom:[true]}, alignments: [""], colspan : [1]},{type : "contenuto_campi",id : nextId+2,id_riga : 1, testo:[""], tipoaltezza_riga : "auto", altezza_riga : 10, fillcolor : [""], borders:{left:[true],top:[true],right:[true],bottom:[true]}, alignments : [""], colspan : [1]}] 
        };
        const item = { type: 'table', elemento: table };
        contenuto.splice(i, 0, item);
        //contenuto = [...contenuto, item];
        nextId = nextId +3;  
    }                 

    function removeRiga(tableId, contenutoCampiId) {
      for (var i = 0; i < contenuto.length; i++) {
          var tabella = contenuto[i];
          if (tabella.type === "table" && tabella.elemento.id === tableId) {
              tabella.elemento.righe -= 1;
          }
        }
      contenuto = contenuto.map(item => {
        if (item.type === 'table' && item.elemento.id === tableId) {
          item.elemento.contenuto_t = item.elemento.contenuto_t.filter(campi => campi.id !== contenutoCampiId);
        }
        return item;
      });
    }

    function addRiga(tableId) {
      var num_righe = 1;
      var border = "";
      for (var i = 0; i < contenuto.length; i++) {
          var tabella = contenuto[i];
          if (tabella.type === "table" && tabella.elemento.id === tableId) {
            var num_righe = tabella.elemento.righe
            var border = tabella.elemento.layout;
          }
      };
      var borders = {};
      if (border === "noBorders"){
        borders = {left:[false],top:[false],right:[false],bottom:[false]};
      }else if(border === "Custom"){
        borders = {left:[true],top:[true],right:[true],bottom:[true]};
      }else{
        borders = {left:[false],top:[false],right:[false],bottom:[false]};
      };
      contenuto_campi = {
          type:"contenuto_campi",
          id: nextId,
          id_riga: num_righe +1,
          testo: [""],
          tipoaltezza_riga : "auto",
          altezza_riga:10,
          fillcolor : [""],
          borders:borders, 
          alignments : [""], 
          colspan : [1]
        };
        for (var i = 0; i < contenuto.length; i++) {
          var tabella = contenuto[i];
          if (tabella.type === "table" && tabella.elemento.id === tableId) {
              tabella.elemento.righe += 1;
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
    
    function updateCheckboxValue(checked, index, direction, field) {
      if (checked) {
        field.borders[direction][index] = true;
      } else {
        field.borders[direction][index] = false;
      }
    }

  //---------------------Lists-----------------------------

    function addList(i) {
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
          contenuto.splice(i, 0, item);
          //contenuto = [...contenuto, item];
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
    const checkHeaderAndExecute = () => {
      const hasHeader = contenuto.some(item => item.type === 'header');
      if (hasHeader) {
        ChangeFontsizeonMarginHeader();
      }
    };

    onMount(checkHeaderAndExecute);

    afterUpdate(checkHeaderAndExecute);

    function addHeader(i) {
      const header = {
        id: nextId,
        testo: '',
        alignment : '',
        style : '',
        font: '',
        fontsize: '',
        margin :{left: 20, top: 20,  right: 20, bottom: 0}
      };
      const item = { type: 'header', elemento: header};
      for (var x = 0; x < contenuto.length; x++) {
        var selected = contenuto[x];
        if (selected.type === "header"){
          hasHeader = true;
        };
      };  
      if (hasHeader === false){
        hasHeader = true;
        document.getElementById('header').disabled = true;
        contenuto.splice(i, 0, item);
        nextId++;
      };
    }
    function removeHeader(headerId) {
      contenuto = contenuto.filter(item => !(item.type === 'header' && item.elemento.id === headerId));
      document.getElementById('header').disabled = false;
      isHeaderPresent = false;
      hasHeader = false;
    }

  //---------------Footer------------------------------------------
    const checkFooterAndExecute = () => {
      const hasFooter = contenuto.some(item => item.type === 'footer');

      if (hasFooter) {
        ChangeFontsizeonMarginFooter();
      }
    };

    onMount(checkFooterAndExecute);

    afterUpdate(checkFooterAndExecute);
    
    function addFooter(i) {
          const footer = {
            id: nextId,
            testo: '',
            alignment : '',
            style : '',
            font: '',
            fontsize: '',
            margin :{left: 20, top: 0,  right: 20, bottom: 20}
          };
          const item = { type: 'footer', elemento: footer};
          for (var x = 0; x < contenuto.length; x++) {
            var selected = contenuto[x];
            if (selected.type === "footer"){
              hasFooter = true;
            };
          };  
          if (hasFooter === false){
            hasFooter = true;
            document.getElementById('footer').disabled = true;
            contenuto.splice(i, 0, item);
            nextId++;
          };
    }

    function removeFooter(footerId) {
      contenuto = contenuto.filter(item => !(item.type === 'footer' && item.elemento.id === footerId));
      document.getElementById('footer').disabled = false;
      isFooterPresent = false;
      hasFooter = false;
    }
  //--------------------Riga------------------------------------
    function addRow(i) {
      const row = {
        id: nextId
      };
      const item = { type: 'row', elemento: row};
      contenuto.splice(i, 0, item);
      nextId++;   
    }

    function removeRow(rowId) {
      contenuto = contenuto.filter(item => !(item.type === 'row' && item.elemento.id === rowId));
    }
  //---------------------SVG----------------------------------------
    function addSVG(i) {
      const svg = {
        id: nextId,
        selectedFile: null,
        svgContent : '',
        larghezza: 10,
        altezza : 10,
        larghezza_fit: 100,
        altezza_fit: 200,
        alignment :"",
        svgMargins : [0,10,0,0],
        isMaxDimensionsSelected : "true"
      };
      const item = { type: 'svg', elemento: svg};
      contenuto.splice(i, 0, item);
      //contenuto = [...contenuto, item];
      nextId++  
    }

    function removeSVG(svgId) {
      contenuto = contenuto.filter(item => !(item.type === 'svg' && item.elemento.id === svgId));
    }

  //---------------------IMG----------------------------------------
    function addIMG(i) {
      const img = {
        id: nextId,
        selectedFile: null,
        imgContent : '',
        larghezza: 10,
        altezza : 10,
        larghezza_fit: 100,
        altezza_fit: 200,
        alignment :"",
        imgMargins : [0,10,0,0],
        isMaxDimensionsSelected : "true",
      };
      const item = { type: 'img', elemento: img};
      contenuto.splice(i, 0, item);
      //contenuto = [...contenuto, item];
      nextId++  
    }

    function removeIMG(imgId) {
      contenuto = contenuto.filter(item => !(item.type === 'img' && item.elemento.id === imgId));
    }
    function addIMGtoEl(i) {
      const img = {
        id: nextId,
        selectedFile: null,
        imgContent : '',
        larghezza: 10,
        altezza : 10,
        larghezza_fit: 100,
        altezza_fit: 200,
        alignment :"",
        imgMargins : [0,10,0,0],
        isMaxDimensionsSelected : "true",
      };
      const item = { type: 'img', elemento: img};
      
      //contenuto = [...contenuto, item];
      nextId++  
    }

    function removeIMGfromEl(imgId) {
      contenuto = contenuto.filter(item => !(item.type === 'img' && item.elemento.id === imgId));
    }

  //----------------------Handles-----------------------------------  
      function ChangeFontandFill(event, id) {
        var stile = event.target.value;
        console.log(stile);
        const fontsize = custom_styles[stile].fontSize.toString();
        const bold = custom_styles[stile].bold;
        const italics = custom_styles[stile].italics;
        console.log(fontsize);
        
        contenuto = contenuto.map((selected) => {
          if (selected.type != "page" && selected.elemento.id === id) {
            if (selected.type === "field"){
              return {
                ...selected,
                elemento: {
                  ...selected.elemento,
                  selectedfontsize: fontsize,
                  selectedbold:bold,
                  selecteditalics:italics,
                },
              };
            }else if (selected.type === "toc"){
              return {
                ...selected,
                elemento: {
                  ...selected.elemento,
                  fontSize: fontsize,
                  bold:bold,
                  italics:italics,
                },
              };
            }
          }
          return selected;
        });
        
        console.log(contenuto);
        
      }
      function ChangeFontandFillHeader(event, id) {
        var stile = event.target.value;
        console.log(stile);
        const fontsize = custom_styles[stile].fontSize.toString();
        console.log(fontsize);
        
        contenuto = contenuto.map((selected) => {
          if (selected.type != "page" && selected.elemento.id === id) {
            if (selected.type === "header"){
              return {
                ...selected,
                elemento: {
                  ...selected.elemento,
                  selectedfontsize: fontsize,
                },
              };
            }else if (selected.type === "footer"){
              return {
                ...selected,
                elemento: {
                  ...selected.elemento,
                  fontSize: fontsize,
                },
              };
            }
          }
          return selected;
        });
        
        console.log(contenuto);
        
      }

      function ChangeFontandFillColumn(event, id_c, id_f) {
        var stile = event.target.value;
        console.log(stile);
        const fontsize = custom_styles[stile].fontSize.toString();
        const bold = custom_styles[stile].bold;
        const italics = custom_styles[stile].italics;
        console.log(fontsize);
        console.log(contenuto);
        contenuto = contenuto.map((selected) => {
          if (selected.type !== "page" && selected.elemento.id === id_c) {
            selected.elemento.fields = selected.elemento.fields.map((field) => {
              if (field.id === id_f) {
                field.selectedfontsize = fontsize;
                field.selectedbold = bold;
                field.selecteditalic = italics;
              }
              return field;
            });
          }
          return selected;
        });
      }
    /*
    function ChangeBorderandFill(event, id){
      var border = event.target.value;
      var numero = 0;
      console.log(border);
      if (border === "noBorders"){
        console.log(contenuto);
        contenuto = contenuto.map((selected) => {
          if (selected.type !== "page" && selected.elemento.id === id) {
            selected.elemento.layout = border;
            selected.elemento.contenuto_t = selected.elemento.contenuto_t.map((cont) => {
              if (cont.type === "campo"){
                var numero = cont.numero;
              }
              cont.borders = {
                left: Array(numero).fill(false),
                top: Array(numero).fill(false),
                right: Array(numero).fill(false),
                bottom: Array(numero).fill(false)
              }
            })
          }
        })
      }else if(border === ""){
        console.log(contenuto);
        contenuto = contenuto.map((selected) => {
          if (selected.type !== "page" && selected.elemento.id === id) {
            selected.elemento.layout = border;
            selected.elemento.contenuto_t = selected.elemento.contenuto_t.map((cont) => {
              if (cont.type === "campo"){
                var numero = cont.numero;
                console.log(contenuto);
              }
              cont.borders = {
                left: Array(numero).fill(true),
                top: Array(numero).fill(true),
                right: Array(numero).fill(true),
                bottom: Array(numero).fill(true)
              }
              
            })
          }
        })
      }
    }*/

    let topMarginValue = 40;
    let bottomMarginValue = 40;

    function HandleChangeMarginsPage(event){
      const inputName = event.target.name;
      const inputValue = event.target.value;
      if (inputName === 'top') {
        topMarginValue = inputValue;
      } else if (inputName === 'bottom') {
        bottomMarginValue = inputValue;
      }
    }

    function ChangeFontsizeonMarginFooter() {
      const selectElement = document.getElementById('fontsizes-footer');
      var selectedValue = (event && event.target) ? event.target.value : undefined;
        if (selectedValue === undefined){
          selectedValue = 20;
        };
      var difference = bottomMarginValue - selectedValue - 5;
      if (difference < 0){
        difference = 0;
      };
      for (let i = 0; i < selectElement.options.length; i++) {
        const optionValue = selectElement.options[i].value;
        selectElement.options[i].disabled = optionValue > difference;
      }
      var fontsize;
      for (var i = 0; i < contenuto.length; i++) {
        var selected = contenuto[i];
        if (selected.type === "footer"){
          fontsize = parseInt(selected.elemento.fontsize);
          console.log(fontsize);
        }
      }   
      if (fontsize > difference) {
        for (var i = 0; i < contenuto.length; i++) {
          var selected = contenuto[i];
          if (selected.type === "footer"){
            if(difference > 4){
              selected.elemento.fontsize = difference.toString();
            }
        }
      } 
      console.log(contenuto);
      }
    }

    function ChangeFontsizeonMarginHeader() {
        const selectElement = document.getElementById('fontsizes-header');
        var selectedValue = (event && event.target) ? event.target.value : undefined;
        if (selectedValue === undefined){
          selectedValue = 20;
        };
        console.log(selectedValue);
        var difference = topMarginValue - selectedValue - 5;
        if (difference < 0){
          difference = 0;
        };
        for (let i = 0; i < selectElement.options.length; i++) {
          const optionValue = selectElement.options[i].value;
          selectElement.options[i].disabled = optionValue > difference;
        }
        var fontsize;
        for (var i = 0; i < contenuto.length; i++) {
          var selected = contenuto[i];
          if (selected.type === "header"){
            fontsize = parseInt(selected.elemento.fontsize);
            console.log(fontsize);
          }
        }   
        if (fontsize > difference) {
          for (var i = 0; i < contenuto.length; i++) {
            var selected = contenuto[i];
            if (selected.type === "header"){
              if(difference > 4){
                selected.elemento.fontsize = difference.toString();
              }
          }
        } 
        console.log(contenuto);
        }
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
    function countCampoElements(tableId) {
      for (let i = 0; i < contenuto.length; i++) {
        if (contenuto[i].type === 'table' && contenuto[i].elemento.id === tableId) {
          return  contenuto[i].elemento.contenuto_t[0].numero;
          }
        }
      }

    function handleDimensionChange_SVG(event,id) {
      const selectedValue = event.target.value;
      const listMaxInputs = document.querySelectorAll(`[class^="dim_max"][class$="${id}"] input`);
      const listAbsInputs = document.querySelectorAll(`[class^="dim_abs"][class$="${id}"] input`);
      if (selectedValue === 'true') {
        listAbsInputs.forEach(input => {
          input.disabled = true;
        });
        listMaxInputs.forEach(input => {
          input.disabled = false;
        });
      } else if (selectedValue === 'false') {
        listMaxInputs.forEach(input => {
          input.disabled = true;       
        });
        listAbsInputs.forEach(input => {
          input.disabled = false;
        });
      } else {
        listMaxInputs.forEach(input => {
          input.disabled = false;
        });
        listAbsInputs.forEach(input => {
          input.disabled = false;
        });
      }
      console.log(contenuto);
    }
    
    function handleDimensionChange_IMG(event,id) {
        const selectedValue = event.target.value;
        const listMaxInputs = document.querySelectorAll(`[class^="dim_max_img"][class$="${id}"] input`);
        const listAbsInputs = document.querySelectorAll(`[class^="dim_abs_img"][class$="${id}"] input`);
        if (selectedValue === 'true') {
          listAbsInputs.forEach(input => {
            input.disabled = true;
          });
          listMaxInputs.forEach(input => {
            input.disabled = false;
          });
        } else if (selectedValue === 'false') {
          listMaxInputs.forEach(input => {
            input.disabled = true;       
          });
          listAbsInputs.forEach(input => {
            input.disabled = false;
          });
        } else {
          listMaxInputs.forEach(input => {
            input.disabled = false;
          });
          listAbsInputs.forEach(input => {
            input.disabled = false;
          });
        }
        console.log(contenuto);
      }

    function handleFileSVGChange(event,id) {
          const file = event.target.files && event.target.files[0];
          for (var i = 0; i < contenuto.length; i++) {
              var selected = contenuto[i];
              if (selected.elemento){
                if (selected.elemento.id === id){
                  selected.elemento.selectedFile = file;
                  const reader = new FileReader();
                  reader.addEventListener('load', function(event) {
                    selected.elemento.svgContent = event.target.result;
                  });
                  reader.readAsText(file);
                  console.log(contenuto);
                }
              }
          }
    }
    

    function handleFileIMGChange(event,id) {
          const file = event.target.files && event.target.files[0];
          for (var i = 0; i < contenuto.length; i++) {
              var selected = contenuto[i];
              if (selected.elemento){
                if (selected.elemento.id === id){
                  selected.elemento.selectedFile = file;
                  const reader = new FileReader();
                  reader.addEventListener('load', function(event) {
                    selected.elemento.imgContent = event.target.result;
                  });
                  reader.readAsDataURL(file);
                  console.log(contenuto);
                }
              }
          }
    }

    function disableRadioButtons(event,id) {
      const selectedValue = event.target.value;
      const listLeftInputs = document.querySelectorAll(`[class^="list_left"][class$="${id}"] input`);
      const listRightInputs = document.querySelectorAll(`[class^="list_right"][class$="${id}"] input`);
      for (var i = 0; i < contenuto.length; i++) {
          var selected = contenuto[i];
          if (selected.type === "list" && selected.elemento.id === id){
            console.log(selected.elemento.pointer);
            selected.elemento.pointer = "";
          }else{continue}
        };
      if (selectedValue === 'ol') {
        listRightInputs.forEach(input => {
          input.disabled = true;
          input.checked = false;
        });
        listLeftInputs.forEach(input => {
          input.disabled = false;
        });
      } else if (selectedValue === 'ul') {
        listLeftInputs.forEach(input => {
          input.disabled = true;
          input.checked = false;
        });
        listRightInputs.forEach(input => {
          input.disabled = false;
        });
      } else {
        listLeftInputs.forEach(input => {
          input.disabled = false;
        });
        listRightInputs.forEach(input => {
          input.disabled = false;
        });
      }
    }

    function HandleChangeAltezzaColonna(event,id){
      const selectedValue = event.target.value;
      const inputElement = document.getElementById(id);
      if (selectedValue === 'auto') {
        inputElement.disabled = true; // Disable the input field
      } else if (selectedValue === 'custom') {
        inputElement.disabled = false; // Enable the input field
      }
    }
    function HandleChangeLarghezzaColonna(event,fieldId,index){
      const radioAuto = document.getElementById("auto" + fieldId);
      const radioCustom = document.getElementById("custom" + fieldId);
      const inputCustom = document.getElementById(fieldId + "/" + index);

      if (event.target.value === "auto") {
        // If "auto" is selected, disable the input and deselect the "custom" radio
        inputCustom.disabled = true;
        radioCustom.checked = false;
      } else if (event.target.value === "custom") {
        // If "custom" is selected, enable the input and deselect the "auto" radio
        inputCustom.disabled = false;
        radioAuto.checked = false;
      }
    }
    function HandleNumberofColumns(event,number,id){
      const numColumns = parseInt(event.target.value);
      var id_tab;
      if (number < numColumns){
        for (var i = 0; i < contenuto.length; i++) {
          var selected = contenuto[i];
          if (selected.type === "table" && selected.elemento.contenuto_t[0].id === id){
            var id_tab = selected.elemento.id;
            var larghezza_colonne = selected.elemento.contenuto_t[0].larghezza_colonne[0];
            var borders = {};
            borders.left = selected.elemento.contenuto_t[0].borders.left[0];
            borders.top = selected.elemento.contenuto_t[0].borders.top[0];
            borders.right = selected.elemento.contenuto_t[0].borders.right[0];
            borders.bottom = selected.elemento.contenuto_t[0].borders.bottom[0];
            selected.elemento.contenuto_t[0].larghezza_colonne.push(larghezza_colonne);
            selected.elemento.contenuto_t[0].borders.left.push(borders.left);
            selected.elemento.contenuto_t[0].borders.top.push(borders.top);
            selected.elemento.contenuto_t[0].borders.right.push(borders.right);
            selected.elemento.contenuto_t[0].borders.bottom.push(borders.bottom);
            selected.elemento.contenuto_t[0].colspan.push(1);
            selected.elemento.contenuto_t[0].numero = numColumns;
            var cont_t = selected.elemento.contenuto_t;
            for (var x = 1; x < cont_t.length; x++){
              cont_t[x].testo.push('');
              cont_t[x].colspan.push(1);
              cont_t[x].fillcolor.push('');
              cont_t[x].alignments.push('');
              cont_t[x].borders.left.push(cont_t[x].borders.left[0]);
              cont_t[x].borders.top.push(cont_t[x].borders.top[0]);
              cont_t[x].borders.right.push(cont_t[x].borders.right[0]);
              cont_t[x].borders.bottom.push(cont_t[x].borders.bottom[0]);
            }
          }
        }
      }else if(number>numColumns){
        for (var i = 0; i < contenuto.length; i++) {
          var selected = contenuto[i];
          if (selected.type === "table" && selected.elemento.contenuto_t[0].id === id){
            var id_tab = selected.elemento.id;
            selected.elemento.contenuto_t[0].larghezza_colonne.pop();
            selected.elemento.contenuto_t[0].borders.left.pop();
            selected.elemento.contenuto_t[0].borders.top.pop();
            selected.elemento.contenuto_t[0].borders.right.pop();
            selected.elemento.contenuto_t[0].borders.bottom.pop();
            selected.elemento.contenuto_t[0].colspan.pop();
            selected.elemento.contenuto_t[0].numero = numColumns;
            var cont_t = selected.elemento.contenuto_t;
            for (var x = 1; x < cont_t.length; x++){
              cont_t[x].testo.pop();
              cont_t[x].colspan.pop();
              cont_t[x].fillcolor.pop();
              cont_t[x].alignments.pop();
              cont_t[x].borders.left.pop();
              cont_t[x].borders.top.pop();
              cont_t[x].borders.right.pop();
              cont_t[x].borders.bottom.pop();
            }
          }
        }
      }
      contenuto = [...contenuto];
      HandleChangeLayoutTabonNew(id_tab);
      console.log(contenuto);
    }
    function HandleChangeLayoutTab(event, itemId) {
      const selectedLayout = event.target.value;
      const borderElements = document.getElementsByClassName(`border${itemId}`);

      if (selectedLayout === "noBorders" || selectedLayout === "lightHorizontalLines") {
        for (let i = 0; i < borderElements.length; i++) {
          borderElements[i].disabled = true;
        }
      } else {
        for (let i = 0; i < borderElements.length; i++) {
          borderElements[i].disabled = false;
        }
      }
    }
    function HandleChangeLayoutTabonNew(itemId) {
      var selectedLayout ;
      for (var i = 0; i < contenuto.length; i++) {
        var selected = contenuto[i];
        if (selected.type === "table" && selected.elemento.id === itemId){
          selectedLayout = selected.elemento.layout;
          console.log(selectedLayout);
        }
      }
      console.log(selectedLayout);
      const borderElements = document.getElementsByClassName(`border${itemId}`);
      if (selectedLayout === "noBorders" || selectedLayout === "lightHorizontalLines") {
        console.log("okok");
        for (let i = 0; i < borderElements.length; i++) {
          console.log(i);
          borderElements[i].disabled = true;
        }
      } else {
        for (let i = 0; i < borderElements.length; i++) {
          borderElements[i].disabled = false;
        }
      }
    }
    function handleClick(label) {
      const i = contenuto.length;
      console.log(i);
      switch (label) {
        case 'Header':
          addHeader(i);
          break;
        case 'Footer':
          addFooter(i);
          break;
        case 'Indice':
          addTOC(i);
          break;
        case 'Testo':
          addField(i);
          break;
        case 'Colonna':
          addColumn(i);
          break;
        case 'Tabella':
          addTable(i);
          break;
        case 'Lista':
          addList(i);
          break;
        case 'SVG':
          addSVG(i);
          break;
        case 'Immagine':
          addIMG(i);
          break;
        default:
          // Handle unknown button label
          break;
      }
      contenuto = [...contenuto];
    }
        
  //-----------------------------TOC---------------------------
    function addTOC(i) {
        const toc = {
          id: nextId,
          id_sec : "",
          style : "",
          fontSize: 15,
          font:"",
          text :"",
          pageBreak: '',
          bold : "",
          italics: ""
        };
        const item = { type: 'toc', elemento: toc};
        contenuto.splice(i, 0, item);
        //contenuto = [...contenuto, item];
        nextId++  
      }

    function removeTOC(tocId) {
      contenuto = contenuto.filter(item => !(item.type === 'toc' && item.elemento.id === tocId));
    }
    

  
  //-------------------TextArea auto resize-------------------------
    function adjustTextareaHeight(event) {
      const textarea = event.target;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }

    function handleInput(event) {
      adjustTextareaHeight(event);
    }

  /* //---------------------------------iframe-resize----------------------
    let iframeWidth = 400;
    let iframeHeight = 300;
    let mouseX = 0;
    let mouseY = 0;
    let isDragging = false;

    function handleMouseDown(event) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      isDragging = true;
    }

    function handleMouseUp() {
      isDragging = false;
    }

    function handleMouseMove(event) {
      if (!isDragging) return;

      const dx = event.clientX - mouseX;
      const dy = event.clientY - mouseY;
      iframeWidth += dx;
      iframeHeight += dy;

      mouseX = event.clientX;
      mouseY = event.clientY;
    }

    onMount(() => {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
    });

    onDestroy(() => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    });
    */


  /*//--------------------SelectedtoBold&italics----------------
    function applyBold(textareaId) {
      event.preventDefault();
      var textarea = document.getElementById(textareaId);
      var start = textarea.selectionStart;
      var end = textarea.selectionEnd;
      var selectedText = textarea.value.substring(start, end);
      console.log("textarea = "+textarea+"start= "+"selectedText = "+selectedText);

      if (selectedText.length > 0) {
          var boldText = '<b>' + selectedText + '</b>';
          var modifiedText = textarea.value.substring(0, start) + boldText + textarea.value.substring(end);
          textarea.value = modifiedText;
          textarea.setSelectionRange(start, start + boldText.length);
      }
    }*/
  //-------------Drag&Drop------------------------------------
    let objects = [
      { el: null, id: 'header', label: 'Header' },
      { el: null, id: 'footer', label: 'Footer' },
      { el: null, id: 'toc', label: 'Indice' },
      { el: null, id: 'text', label: 'Testo' },
      { el: null, id: 'row', label: 'Riga Vuota' },
      { el: null, id: 'column', label: 'Colonna' },
      { el: null, id: 'table', label: 'Tabella' },
      { el: null, id: 'list', label: 'Lista' },
      { el: null, id: 'svg', label: 'SVG' },
      { el: null, id: 'image', label: 'Immagine' }
    ]; //bottoni per l'aggiunta degli elementi

    var buttons = [];
    var fileButtons = [];
    var dropzones = [];
    var dropzonesText = [];
    var cells = [];
    let selectedFileContent = "";

    onMount(() => {
      buttons = document.querySelectorAll('.addButton');
      dropzones = document.querySelectorAll('.dropzone');
      cells = document.querySelectorAll('.cella');
      dropzonesText = document.querySelectorAll('.dropzone_Text');
      fileButtons = document.querySelectorAll('.fileButton');
      //console.log("dropzones = "+dropzones);
      //console.log("dropzonesText = "+dropzonesText);
      //console.log("buttons = "+buttons);
      //console.log("fileButtons = "+fileButtons);
      dropzones.forEach(dropzone => {
        dropzone.addEventListener('dragenter', handleDragEnter);
        dropzone.addEventListener('dragleave', handleDragLeave);
      });
      buttons.forEach(button => {
        button.addEventListener('dragstart', handleDragStart);
        button.addEventListener('dragend', handleDragEnd);
      });
    });

    // Add event listeners for dragstart and dragend events
    buttons.forEach(button => {
      button.addEventListener('dragstart', handleDragStart);
      button.addEventListener('dragend', handleDragEnd);
    });
    dropzones.forEach((dropzone, i) => {
      //dropzone.addEventListener('dragenter', (event) => handleDragEnter(event, i));
      //dropzone.addEventListener('dragleave', (event) => handleDragLeave(event, i));
      dropzone.addEventListener('dragend',  (event) => handleDragEnd(event, i));
    });
    dropzonesText.forEach((dropzone, i) => {
      
    });
    function handleDrop(event,i) {
      event.preventDefault();
      const dropZone = event.currentTarget;
      console.log(dropZone);
      console.log(i);
      const droppedElementId = event.dataTransfer.getData('text/plain');

      // Find the corresponding object based on the id
      const droppedObject = objects.find((obj) => obj.id === droppedElementId);
      const isLowerDropZone = dropZone.classList.contains("dropzone") && dropZone.classList.contains("lower-dropzone") && dropZone.classList.contains("drag-over");
      // Create a new element based on the dropped object's label
      switch (droppedObject.label) {
        case 'Header':
          if (isLowerDropZone){
            addHeader(i+1);
            isHeaderPresent = true;
          }else{
            addHeader(i);
            isHeaderPresent = true;
          }
          break;
        case 'Footer':
          if (isLowerDropZone){
            addFooter(i+1);
            isFooterPresent = true;
          }else{
            addFooter(i);
            isFooterPresent = true;
          }
          break;
        case 'Indice':
          if (isLowerDropZone){
            addTOC(i+1);
          }else{
            addTOC(i);
          }
          break;
        case 'Testo':
        if (isLowerDropZone){
          addField(i+1);
        }else{
          addField(i);
        }
        break;
        case 'Colonna':
          if (isLowerDropZone){
            addColumn(i+1);
          }else{
            addColumn(i);
          }
          break;
        case 'Tabella':
          if (isLowerDropZone){
            addTable(i+1);
          }else{
            addTable(i);
          }
          break;
        case 'Lista':
          if (isLowerDropZone){
            addList(i+1);
          }else{
            addList(i);
          }
          break;
        case 'SVG':
          if (isLowerDropZone){
            addSVG(i+1);
          }else{
            addSVG(i);
          }
          break;
        case 'Riga Vuota':
          if (isLowerDropZone){
            addRow(i+1);
          }else{
            addRow(i);
          }
          break;
        case 'Immagine':
        if (isLowerDropZone){
            addIMG(i+1);
          }else{
            addIMG(i);
          }
          break;
        default:
          // Handle unknown object label
          break;
      }
      if (isHeaderPresent) {
        document.getElementById('header').disabled = true;
      } ;
      if (isFooterPresent){
        document.getElementById('footer').disabled = true;
      };
      // Push the new element into the `contenuto` array

      // Update the component state or trigger a re-render
      // to reflect the changes in the `contenuto` array
      console.log("---------------------------");
      console.log(contenuto);
      contenuto = [...contenuto];
      event.target.classList.remove('drag-over');
      console.log(dropzones);
      contenuto = [...contenuto];
    }
    function handleDropFile(event,id,id_sec) {
      event.preventDefault();
      for (var i = 0; i < contenuto.length; i++) {
        var item = contenuto[i];
        console.log("id = "+id);
        if (item.type != "page" && item.elemento.id === id){
          if(item.type === "field"){
            item.elemento.content = selectedFileContent;
          }if(item.type === "column"){
            console.log(item.elemento);
            for (var x = 0; x < item.elemento.fields.length; x++){
              var field = item.elemento.fields[x];
              console.log(field);
              if(field.id === id_sec){
                field.content = selectedFileContent;
              }
            }
          }else{
            item.elemento.testo = selectedFileContent;
          }
        }
      }
      console.log(contenuto);
      contenuto = [...contenuto];
    }
    function handleDropAdd(event,i) {
      event.preventDefault();
      const dropZone = event.currentTarget;
      console.log(dropZone);
      console.log(i);
      const droppedElementId = event.dataTransfer.getData('text/plain');

      // Find the corresponding object based on the id
      const droppedObject = objects.find((obj) => obj.id === droppedElementId);
      const isLowerDropZone = dropZone.classList.contains("dropzone") && dropZone.classList.contains("lower-dropzone") && dropZone.classList.contains("drag-over");
      // Create a new element based on the dropped object's label
      switch (droppedObject.label) {
        case 'Colonna':
          addColumntoEl(i);
          break;
        case 'Tabella':
          addTabletoEl(i);
          break;
        case 'Lista':
          addListtoEl(i);
          break;
        case 'SVG':
          addSVGtoEl(i);
          break;
        case 'Immagine':
          addIMGtoEl(i);
          break;
        default:
          break;
      }
      console.log("---------------------------");
      console.log(contenuto);
      contenuto = [...contenuto];
      event.target.classList.remove('drag-over');
      console.log(dropzones);
      contenuto = [...contenuto];
    }
    function handleDragEnter(event,i) {
      console.log("ciao");
      event.preventDefault();
      // Add any necessary styling or visual indication for the drop zone
      event.target.classList.add('drag-over');
      cells.forEach(cell => {
        cell.classList.add('disable-clicks');
      });
    }
    function handleDragEnterText(event) {
      console.log("ciao");
      event.preventDefault();
      // Add any necessary styling or visual indication for the drop zone
      event.target.classList.add('drag-over');
    }
    function handleDragEnterAdd(event,i) {
      console.log(event.target);
      event.preventDefault();
      // Add any necessary styling or visual indication for the drop zone
      event.target.classList.add('drag-over');
    }
    function handleDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }
    function handleDragOverAdd(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }
    function handleDragOverText(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }

    function handleDragLeave(event) {
      event.preventDefault();
      // Remove any styling or visual indication from the drop zone
      event.target.classList.remove('drag-over');
      cells.forEach(cell => {
        cell.classList.remove('disable-clicks');
      });
      /*dropzones.forEach(dropzone => {
        dropzone.style.pointerEvents = '';
      });*/
    }
    function handleDragLeaveText(event) {
      event.preventDefault();
      // Remove any styling or visual indication from the drop zone
      event.target.classList.remove('drag-over');
      /*dropzones.forEach(dropzone => {
        dropzone.style.pointerEvents = '';
      });*/
    }
    function handleDragLeaveAdd(event) {
      event.preventDefault();
      // Remove any styling or visual indication from the drop zone
      event.target.classList.remove('drag-over');
      cells.forEach(cell => {
        cell.classList.remove('disable-clicks');
      });
      /*dropzones.forEach(dropzone => {
        dropzone.style.pointerEvents = '';
      });*/
    }
    function handleDragStart(event,i) {
      buttons = document.querySelectorAll('.addButton');
      dropzones = document.querySelectorAll('.dropzone');
      cells = document.querySelectorAll('.cella');
      event.dataTransfer.setData('text/plain', event.target.id);
      dropzones.forEach(dropzone => {
        dropzone.style.pointerEvents = 'auto';
      });
    }
    function handleDragStartFile(event) {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.name.trim() === event.currentTarget.textContent.trim()) {
          console.log("ok");
          selectedFileContent = file.name;        
          break;
        }
      }
      dropzones = document.querySelectorAll('.dropzone');
      dropzonesText = document.querySelectorAll('.dropzone_Text');
      event.dataTransfer.setData('text/plain', event.target.id);
      dropzonesText.forEach(dropzone => {
        dropzone.style.pointerEvents = 'auto';
      });
      dropzones.forEach(dropzone => {
        dropzone.style.pointerEvents = '';
      });
    }
    function handleDragEnd() {
      dropzones.forEach(dropzone => {
        dropzone.style.pointerEvents = '';
        dropzone.classList.remove('drag-over'); // Remove the 'drag-over' class
      });
      cells.forEach(cell => {
        cell.classList.remove('disable-clicks');
      });
    }
    function handleDragEndFile() {
      dropzonesText.forEach(dropzone => {
        dropzone.style.pointerEvents = '';
        dropzone.classList.remove('drag-over'); // Remove the 'drag-over' class
      });
    }


</script>

    <main>
      <div>
        {#if generatedPdfData}
        <PDFPreview pdfData = {generatedPdfData} />
        {/if}
      </div>
    <div class="container">
      <div class = "sinistra">
        <div class="cont_sinistra" id="fixedElement2">
          <h1 class="responsive-heading">Aggiungi:</h1>
          {#each objects as { el, id, label }}
            <button
              type="button"
              id="{id}"
              draggable="true"
              bind:this={el}
              on:dragstart={handleDragStart}
              class = "addButton"
              on:click={() => handleClick(label)}
            >
              {label}
            </button>
          {/each}
        </div>
      </div>
      <div class = "destra">  
        <div class ="file_list">
          <h1>Lista dei file:</h1>
            {#if fileList.length > 0}
              <div class ="list"> 
              {#each fileList as file}
              <single_file
                  type="button"
                  draggable="true"
                  on:dragstart={handleDragStartFile}
                  on:dragend={handleDragEndFile}
                  class = "fileButton"
              >
                  {file.name}
              </single_file>
              {/each}
            </div>
            <!--<p>{file.content}</p>-->
            {:else}
              <p>Loading files...</p>
            {/if}
        </div>
        <!--<div class="dropzone lower-dropzone third" on:dragenter={(e) => handleDragEnter(e, 0)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, 0)} on:dragover={handleDragOver} id="drop_zone"></div>-->
        <h1>Crea PDF</h1>
        <form class="elements" on:submit|preventDefault={handleSubmit}>
          <div class = "cella">
            <h1>Margini della pagina  <grey> ( dimensioni totali 595 x 942 pixels ).</grey></h1>
            <div class = "margini_pagina">
              <label>
                Sinistra:
                <input type="number" class = "margini" bind:value={contenuto[0].pageMargins[0]} min="20" max = "290">
              </label>
              <label>
                Superiore:
                <input type="number" name = "top" class = "margini" bind:value={contenuto[0].pageMargins[1]} min="40" max = "420" on:change={HandleChangeMarginsPage}>
              </label>  
              <label>
                Destra:
                <input type="number" class = "margini" bind:value={contenuto[0].pageMargins[2]} min="20" max = "290">
              </label>  
              <label>
                Inferiore:
                <input type="number" name = "bottom" class = "margini" bind:value={contenuto[0].pageMargins[3]} min="40" max = "420" on:change={HandleChangeMarginsPage}> <small-grey>(pixels)</small-grey>
              </label>
            </div>
            <div class="dropzone lower-dropzone second" on:dragenter={(e) => handleDragEnter(e, 1)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, 1)} on:dragover={handleDragOver} id="drop_zone"></div>
          </div>
        {#each contenuto as item,i}
            {#if item.type === 'header'}
              <div class = "cella">
                <div class = "testo">
                  <h1>Header</h1> 
                  <button class = "rimuovi" type="button" on:click={() => removeHeader(item.elemento.id)}>Rimuovi</button>
                </div>
                <div class= "element-header"> 
                  <div class = "cont-allignment">
                    <label> 
                      <p>Contenuto Header: </p>
                    <textarea class="autosize-textarea dropzone_Text"   on:drop={(e) => handleDropFile(e,item.elemento.id,0)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} bind:value={item.elemento.testo} on:input={handleInput} on:input:resize={adjustTextareaHeight} id={`textareaHeader-${i}`} /> 
                    <!--<button class = "boldconverter" on:click={() => applyBold(`textareaHeader-${i}`)}>Bold</button>-->
                    </label>
                    <p>Alignment: </p>
                    <label> 
                      <input type="radio" bind:group={item.elemento.alignment} value="left"/> 
                      Sinistra
                    </label>
                    <label> 
                      <input type="radio" bind:group={item.elemento.alignment} value="center"/> 
                      Centro
                    </label>
                    <label> 
                      <input type="radio" bind:group={item.elemento.alignment} value="right"/> 
                      Destra
                    </label>
                  </div>
                  <div class = "style-margin">
                    <div class = "style&fontsize">
                      <div class ="style">
                        <label> 
                          <p>Style:</p>
                          <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                          <select id="style-select" bind:value={item.elemento.style} name="style-option" on:change={(e) => ChangeFontandFillHeader(e, item.elemento.id)}>  
                            <option value="normal"> Default </option>
                            <option value="header" > Header</option>
                            <option value="subheader">SubHeader</option>
                            <option value="quote">Quote</option>
                            <option value="small">Small</option>
                          </select>
                        </label>
                      </div>
                      <div class ="font">
                        <label for="font">Font:</label>
                        <select id="font" bind:value={item.elemento.font}  on:change={(e) => handleChangeFont(e, item.elemento.id)}>
                            <option value="">Seleziona</option>
                            <option value="Roboto">Roboto</option>
                            <option value="RobotoSerif">RobotoSerif</option>
                            <option value="Raleway">Raleway</option>
                            <option value="NotoSerif">NotoSerif</option>
                            <option value="Montserrat">Montserrat</option>
                        </select>
                      </div>
                      <div class ="fontsize">
                        <label for="fontsizes"><p>Grandezza del font:</p></label>
                        <select id="fontsizes-header" bind:value={item.elemento.fontsize}  on:change={(e) => handleChangeFontSize(e, item.elemento.id)}>
                          <option value="">Seleziona</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                          <option value="9">9</option>
                          <option value="10">10</option>
                          <option value="11">11</option>
                          <option value="12">12</option>
                          <option value="13">13</option>
                          <option value="14">14</option>
                          <option value="15">15</option>
                          <option value="16">16</option>
                          <option value="17">17</option>
                          <option value="18">18</option>
                          <option value="19">19</option>
                          <option value="20">20</option>
                          <option value="21">21</option>
                          <option value="22">22</option>
                          <option value="23">23</option>
                          <option value="24">24</option>
                          <option value="25">25</option>
                          <option value="26">26</option>
                          <option value="27">27</option>
                          <option value="28">28</option>
                          <option value="29">29</option>
                          <option value="30">30</option>
                        </select>
                      </div>
                    </div>
                    <div class = "margini">
                      <p>Margini:</p>
                      <label>
                        Sinstra:
                        <input type="number" bind:value={item.elemento.margin.left} min="20" max = "595"/> 
                      </label>
                      <label>
                        Destra:
                        <input type="number" bind:value={item.elemento.margin.right} min="20" max = "595"/> 
                      </label>
                      <label>
                        Sopra:
                        <input type="number" bind:value={item.elemento.margin.top} min="20" max={topMarginValue - 15}  on:change={(e) => ChangeFontsizeonMarginHeader()}/> 
                      </label>
                      <!--<label>
                        Sotto:
                        <input type="number" bind:value={item.elemento.margin.bottom} min="0" max = {bottomMarginValue - 15}/> 
                      </label>-->
                    </div>
                  </div>
                  <!--
                  <div class = "add-element">
                    Aggiungi un elemento alla sezione 
                    <div class = "inner-dropzone"on:dragenter={(e) => handleDragEnterAdd(e, i)} on:dragleave={handleDragLeaveAdd} on:drop={(e) => handleDropAdd(e, i)} on:dragover={handleDragOverAdd} ></div>
                  </div>
                  -->
                </div>
                <div class="dropzone upper-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
                <div class="dropzone lower-dropzone"on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
              </div>
            {:else if item.type === 'footer'}
              <div class = "cella">
                <div class = "testo">
                  <h1>Footer</h1><button  class = "rimuovi" type="button" on:click={() => removeFooter(item.elemento.id)}>Rimuovi</button>
                </div>
                <div class= "element-header"> 
                  <div class = "cont-allignment">
                    <label> 
                      <p>Contenuto Footer: </p>
                      <textarea class="autosize-textarea dropzone_Text" bind:value={item.elemento.testo} on:input={handleInput} on:input:resize={adjustTextareaHeight} on:drop={(e) => handleDropFile(e,item.elemento.id,0)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} /> 
                    </label>
                    <p>Alignment: </p>
                    <label> 
                    <input type="radio" bind:group={item.elemento.alignment} value="left"/> 
                      Sinistra
                    </label>
                    <label> 
                      <input type="radio" bind:group={item.elemento.alignment} value="center"/> 
                        Centro
                    </label>
                    <label> 
                      <input type="radio" bind:group={item.elemento.alignment} value="right"/> 
                        Destra
                    </label>
                  </div>
                  <div class = "style-margin">
                    <div class = "style&fontsize">
                      <div class ="style">
                        <label> 
                          <p>Style:</p>
                          <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                          <select id="style-select" bind:value={item.elemento.style} name="style-option" on:change={(e) => ChangeFontandFillHeader(e, item.elemento.id)}>  
                            <option value="normal"> Default </option>
                            <option value="header" > Header</option>
                            <option value="subheader">SubHeader</option>
                            <option value="quote">Quote</option>
                            <option value="small">Small</option>
                          </select>
                        </label>
                      </div>
                      <div class ="font">
                        <label for="font">Font:</label>
                        <select id="font" bind:value={item.elemento.font}  on:change={(e) => handleChangeFont(e, item.elemento.id)}>
                            <option value="">Seleziona</option>
                            <option value="Roboto">Roboto</option>
                            <option value="RobotoSerif">RobotoSerif</option>
                            <option value="Raleway">Raleway</option>
                            <option value="NotoSerif">NotoSerif</option>
                            <option value="Montserrat">Montserrat</option>
                        </select>
                      </div>
                      <div class ="fontsize">
                        <label for="fontsizes"><p>Grandezza del font:</p></label>
                        <select id="fontsizes-footer" bind:value={item.elemento.fontsize}  on:change={(e) => handleChangeFontSize(e, item.elemento.id)}>
                            <option value="">Seleziona</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>
                            <option value="13">13</option>
                            <option value="14">14</option>
                            <option value="15">15</option>
                            <option value="16">16</option>
                            <option value="17">17</option>
                            <option value="18">18</option>
                            <option value="19">19</option>
                            <option value="20">20</option>
                            <option value="21">21</option>
                            <option value="22">22</option>
                            <option value="23">23</option>
                            <option value="24">24</option>
                            <option value="25">25</option>
                            <option value="26">26</option>
                            <option value="27">27</option>
                            <option value="28">28</option>
                            <option value="29">29</option>
                            <option value="30">30</option>
                        </select>
                      </div>
                    </div>
                    <div class = "margini">
                      <p>Margini:</p>
                      <label>
                        Sinstra:
                        <input type="number" bind:value={item.elemento.margin.left} min="20" max = "595"/> 
                      </label>
                      <label>
                        Destra:
                        <input type="number" bind:value={item.elemento.margin.right} min="20" max = "595"/> 
                      </label>
                      <!--<label>
                        Sopra:
                        <input type="number" bind:value={item.elemento.margin.top} min="0" max = {topMarginValue -15} on:change={(e) => ChangeFontsizeonMarginFooter()}/> 
                      </label>-->
                      <label>
                        Sotto:
                        <input type="number" bind:value={item.elemento.margin.bottom} min="20" max = {bottomMarginValue -15}/> 
                      </label>
                    </div>
                  </div>
                </div>
                <div class="dropzone upper-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
                <div class="dropzone lower-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
              </div>
            {/if}
          {/each}
          {#each contenuto as item,i}
            {#if item.type === 'field'}
              <div class = "cella">
                <div class = "testo">
                  <h1>Testo</h1><button  class = "rimuovi" type="button" on:click={() => removeField(item.elemento.id)}>Rimuovi</button>
                </div>
                  <div class= "element">
                    <div class = "contenuto_field">
                        <p>Contenuto :<small-grey> (shift + invio per andare a capo)</small-grey></p> 
                        <textarea class="autosize-textarea dropzone_Text" bind:value={item.elemento.content} on:input={handleInput} on:input:resize={adjustTextareaHeight} on:drop={(e) => handleDropFile(e,item.elemento.id,0)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} /> 
                    </div>
                    
                      <div class = "style&tipo">
                        <div class ="style">
                          <label> 
                            <p>Style:</p>
                            <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                            <select id="style-select" bind:value={item.elemento.selectedstyle} name="style-option" on:change={(e) => ChangeFontandFill(e, item.elemento.id)}>  
                              <option value="normal"> Default </option>
                              <option value="header" > Header</option>
                              <option value="subheader">SubHeader</option>
                              <option value="quote">Quote</option>
                              <option value="small">Small</option>
                            </select>
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
                        <div class = "pbreak">
                          Page Break:
                          <label>
                            <input type="radio" bind:group={item.elemento.pagebreak} value="before" />
                            Prima
                          </label>
                          <label>
                            <input type="radio" bind:group={item.elemento.pagebreak} value="after" />
                            Dopo
                          </label>
                          <label>
                            <input type="radio" bind:group={item.elemento.pagebreak} value="" />
                            Nessuno
                          </label>
                        </div>
                      </div>
                      <div class = "f&f_size">
                        <div class ="font">
                          <label for="font">Font:</label>
                          <select id="font" bind:value={item.elemento.selectedfont}  on:change={(e) => handleChangeFont(e, item.elemento.id)}>
                              <option value="">Seleziona</option>
                              <option value="Roboto">Roboto</option>
                              <option value="RobotoSerif">RobotoSerif</option>
                              <option value="Raleway">Raleway</option>
                              <option value="NotoSerif">NotoSerif</option>
							                <option value="Montserrat">Montserrat</option>
                          </select>
                        </div>
                        <div class ="fontsize">
                          <label for="fontsizes"><p>Grandezza del font:</p></label>
                          <select id="fontsizes" bind:value={item.elemento.selectedfontsize}  on:change={(e) => handleChangeFontSize(e, item.elemento.id)}>
                              <option value="">Seleziona</option>
                              <option value="5">5</option>
                              <option value="6">6</option>
                              <option value="7">7</option>
                              <option value="8">8</option>
                              <option value="9">9</option>
                              <option value="10">10</option>
                              <option value="11">11</option>
                              <option value="12">12</option>
                              <option value="13">13</option>
                              <option value="14">14</option>
                              <option value="15">15</option>
                              <option value="16">16</option>
                              <option value="17">17</option>
                              <option value="18">18</option>
                              <option value="19">19</option>
                              <option value="20">20</option>
                              <option value="21">21</option>
                              <option value="22">22</option>
                              <option value="23">23</option>
                              <option value="24">24</option>
                              <option value="25">25</option>
                              <option value="26">26</option>
                              <option value="27">27</option>
                              <option value="28">28</option>
                              <option value="29">29</option>
                              <option value="30">30</option>
                          </select>
                        </div>
                  
                      </div>
                    
                    <div class = "field_indice">
                      <label>
                        <h2> Collega all'indice: </h2>
                        <select id = "select_indice" bind:value={item.elemento.tocItem}  >
                          {#each contenuto as item}
                            {#if item.type === 'toc'}
                              <option value= {item.elemento.id_sec}>{item.elemento.id_sec}</option>
                            {/if}
                          {/each}
                        </select>
                      </label>
                    </div>
                  </div>
                <div class="dropzone upper-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
                <div class="dropzone lower-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
              </div>
            {:else if item.type === 'row'}
              <div class = "cella2">
                <div class = "testo">
                  <h2>Riga Vuota</h2><button  class = "rimuovi" type="button" on:click={() => removeRow(item.elemento.id)}>Rimuovi</button>
                </div>
              </div>
            {:else if item.type === 'column'}
              <div class = "cella">
                <div class = "testo">
                  <h1>Container Colonne</h1><button  class = "rimuovi" type="button" on:click={() => removeColumn(item.elemento.id)}>Rimuovi</button>
                </div>
                  <div class="element">
                    <div class = "distanza">
                      <label> 
                        Distanza tra le colonne: 
                        <input type="number" bind:value={item.gap}/> px
                      </label>
                    </div>
                    <div class = "alignment">
                      <p>Alignment: </p>
                      <label> 
                      <input type="radio" bind:group={item.alignment} value="left"/> 
                        Sinistra
                      </label>
                      <label> 
                        <input type="radio" bind:group={item.alignment} value="center"/> 
                          Centro
                      </label>
                      <label> 
                        <input type="radio" bind:group={item.alignment} value="right"/> 
                          Destra
                      </label>
                    </div>

                    {#each item.elemento.fields as field,x}  
                      <div class = "cella">
                        <div class = "testo">
                          <h2>Colonna {x+1}</h2><button class = "rimuovi" type="button" on:click={() => removeFieldFromColumn(item.elemento.id,field.id)}>Rimuovi colonna</button>
                        </div>   
                          <div class="element">  
                            <div class = "contenuto_field">
                              <!-- svelte-ignore a11y-label-has-associated-control -->
                              <label> 
                                <p>Contenuto: </p><small-grey> (shift + invio per andare a capo)</small-grey>
                              </label>
                              <textarea class="autosize-textarea dropzone_Text" bind:value={field.content} on:input={handleInput} on:input:resize={adjustTextareaHeight} on:drop={(e) => handleDropFile(e,item.elemento.id,field.id)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} /> 
                            </div>
                            <div class = "specifiche">
                              <div class = "style&tipo">
                                <div class ="style">
                                  <label> 
                                    <p>Style:</p>
                                    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                                    <select id="style-select" bind:value={field.selectedstyle} name="style-option" on:change={(e) => ChangeFontandFillColumn(e, item.elemento.id,field.id)}>  
                                      <option value="normal" > Default </option>
                                      <option value="header" > Header</option>
                                      <option value="subheader">SubHeader</option>
                                      <option value="quote">Quote</option>
                                      <option value="small">Small</option>
                                    </select>
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
                                <div class = "pbreak">
                                  Page Break:
                                  <label>
                                    <input type="radio" bind:group={item.elemento.pagebreak} value="before" />
                                    Prima
                                  </label>
                                  <label>
                                    <input type="radio" bind:group={item.elemento.pagebreak} value="after" />
                                    Dopo
                                  </label>
                                  <label>
                                    <input type="radio" bind:group={item.elemento.pagebreak} value="" />
                                    Nessuno
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div class = "f&f_size">
                              <div class ="font">
                                <label for="font">Font:</label>
                                <select id="font" bind:value={field.selectedfont}  on:change={(e) => handleChangeFont(e, item.elemento.id)}>
                                  <option value="">Seleziona</option>
                                  <option value="Roboto">Roboto</option>
                                  <option value="RobotoSerif">RobotoSerif</option>
                                  <option value="Raleway">Raleway</option>
                                  <option value="NotoSerif">NotoSerif</option>
                                  <option value="Montserrat">Montserrat</option>
                                </select>
                              </div>
                              <div class ="fontsize">
                                <label for="fontsizes"><p>Grandezza del font:</p></label>
                                <select id="fontsizes" bind:value={field.selectedfontsize}  on:change={(e) => handleChangeFontSize(e, item.elemento.id)}>
                                  <option value="">Seleziona</option>
                                  <option value="5">5</option>
                                  <option value="6">6</option>
                                  <option value="7">7</option>
                                  <option value="8">8</option>
                                  <option value="9">9</option>
                                  <option value="10">10</option>
                                  <option value="11">11</option>
                                  <option value="12">12</option>
                                  <option value="13">13</option>
                                  <option value="14">14</option>
                                  <option value="15">15</option>
                                  <option value="16">16</option>
                                  <option value="17">17</option>
                                  <option value="18">18</option>
                                  <option value="19">19</option>
                                  <option value="20">20</option>
                                  <option value="21">21</option>
                                  <option value="22">22</option>
                                  <option value="23">23</option>
                                  <option value="24">24</option>
                                  <option value="25">25</option>
                                  <option value="26">26</option>
                                  <option value="27">27</option>
                                  <option value="28">28</option>
                                  <option value="29">29</option>
                                  <option value="30">30</option>
                                </select>
                              </div>
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
                          </div>
                        </div>
                      {/each}
                    <div class ="bottonicolonne">
                      <button type="button" on:click={() => addFieldtoColumn(item.elemento.id)}>Aggiungi testo</button>
                    </div>
                  </div>
                <div class="dropzone upper-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
                <div class="dropzone lower-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
              </div>
            {:else if item.type === 'table'}
              <div class = "cella">
                <div class = "testo">
                  <h1>Tabella</h1><button  class = "rimuovi-riga" type="button" on:click={() => removeTable(item.elemento.id)}>Rimuovi tabella</button>
                </div>
                <div class="tabella-element">
                  <h2>Layout</h2>
                  <div class = "layout">
                    <label>
                      <input type="radio" bind:group={item.elemento.layout} value="Custom" on:change = {HandleChangeLayoutTab(event,item.elemento.id)} />
                      Custom
                    </label>
                    <label>
                      <input type="radio" bind:group={item.elemento.layout} value="noBorders" on:change = {HandleChangeLayoutTab(event,item.elemento.id)}/>
                      Nessun bordo
                    </label>
                    <!--<label>
                      <input type="radio" bind:group={item.elemento.layout} value="headerLineOnly" />
                      Bordo solo per l'header
                    </label>-->
                    <label>
                      <input type="radio" bind:group={item.elemento.layout} value="lightHorizontalLines"on:change = {HandleChangeLayoutTab(event,item.elemento.id)}/>
                      Solo righe orizzontali
                    </label>
                  </div>
                  <div class = "colore_tabella">
                    <label class ="label3"> 
                      Colore della tabella
                      <input type="color" bind:value={item.elemento.color}/> 
                    </label>
                  </div>
                  <div class = "tipo&page">
                    <div class ="tipo">
                      <label>
                          <input type="checkbox" bind:checked={item.elemento.bold} value="true" />
                          Bold
                      </label>
                      <label>
                          <input type="checkbox" bind:checked={item.elemento.italics} value="true" />
                          Italics
                      </label>
                    </div>
                    <div class = "pbreak">
                      Page Break:
                      <label>
                        <input type="radio" bind:group={item.elemento.pagebreak} value="before" />
                        Prima
                      </label>
                      <label>
                        <input type="radio" bind:group={item.elemento.pagebreak} value="after" />
                        Dopo
                      </label>
                      <label>
                        <input type="radio" bind:group={item.elemento.pagebreak} value="" />
                        Nessuno
                      </label>
                    </div>
                  </div>
                  <div class = "f&f_size">
                    <div class ="font">
                      <label for="font">Font:</label>
                      <select id="font" bind:value={item.elemento.font}  on:change={(e) => handleChangeFont(e, item.elemento.id)}>
                          <option value="">Seleziona</option>
                          <option value="Roboto">Roboto</option>
                          <option value="RobotoSerif">RobotoSerif</option>
                          <option value="Raleway">Raleway</option>
                          <option value="NotoSerif">NotoSerif</option>
                          <option value="Montserrat">Montserrat</option>
                      </select>
                    </div>
                    <div class ="fontsize">
                      <label for="fontsizes"><p>Grandezza del font:</p></label>
                      <select id="fontsizes" bind:value={item.elemento.fontsize}  on:change={(e) => handleChangeFontSize(e, item.elemento.id)}>
                          <option value="">Seleziona</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                          <option value="9">9</option>
                          <option value="10">10</option>
                          <option value="11">11</option>
                          <option value="12">12</option>
                          <option value="13">13</option>
                          <option value="14">14</option>
                          <option value="15">15</option>
                          <option value="16">16</option>
                          <option value="17">17</option>
                          <option value="18">18</option>
                          <option value="19">19</option>
                          <option value="20">20</option>
                          <option value="21">21</option>
                          <option value="22">22</option>
                          <option value="23">23</option>
                          <option value="24">24</option>
                          <option value="25">25</option>
                          <option value="26">26</option>
                          <option value="27">27</option>
                          <option value="28">28</option>
                          <option value="29">29</option>
                          <option value="30">30</option>
                      </select>
                    </div>             
                  </div>           
                  {#each item.elemento.contenuto_t as field}   
                    <div class="element-campi">  
                      {#if field.type === "campo"}
                        <h2>Attributi delle colonne</h2>
                        <div class = "attributi_colonne">
                          <label class = "label2"> 
                            Numero delle colonne: 
                            <input type="number"on:change={HandleNumberofColumns(event,field.numero,field.id)} value = 1 min = 1/> 
                          </label>
                          <label>
                            <input type="radio" bind:group={field.tipoaltezza_riga} value="auto" on:change={HandleChangeAltezzaColonna(event,field.id)} />
                            Altezza auto
                          </label>
                          <label>
                            <input type="radio" bind:group={field.tipoaltezza_riga} value="custom" on:change={HandleChangeAltezzaColonna(event,field.id)}/>
                            <p>Altezza :</p>
                            <input id = {field.id} class="altezza_colonna" type="number" bind:value={field.altezza_riga} min = 2 disabled>
                          </label>
                        </div>
                        {#each Array(field.numero) as _,i}
                        <div class = "cella">
                          <h2>Colonna {i+1}</h2>
                            <div class = "colonne">
                              <div class= "nome&width">
                                <label class = "label2"> 
                                  Nome colonna: 
                                  <input class = nomi_colonne type="text" bind:value={field.testo[i]}/> 
                                </label>
                                <label>
                                  <input id={"auto" + field.id} type="radio" bind:group={field.larghezza_colonne[i]} value="auto" on:change={HandleChangeLarghezzaColonna(event, field.id, i)}/>
                                  Larghezza auto
                                </label>
                                <label>
                                  <input id={"custom" + field.id} type="radio" value="custom" on:change={HandleChangeLarghezzaColonna(event, field.id,i)}/>
                                  <p>Larghezza :</p>
                                  <input id={field.id + "/" + i} class="larghezza_colonna" type="number" bind:value={field.larghezza_colonne[i]}/>
                                </label>
                              </div>
                              <div class = "span&color">
                                <label class = "label"> 
                                  Celle del campo: 
                                <input type="number" bind:value={field.colspan[i]}/> 
                                </label>
                                <label class ="label"> 
                                  Colore del campo: 
                                <input type="color" bind:value={field.fillcolor[i]}/> 
                                </label>
                              </div>
                              <label class ="label5"> 
                                Bordi: 
                                <input class = "border{item.elemento.id}" type="checkbox" bind:checked={field.borders.left[i]} on:change={() => updateCheckboxValue(field.borders.left[i], i, 'left', field)}> 
                                  Sinistra
                                <input class = "border{item.elemento.id}" type="checkbox" bind:checked={field.borders.top[i]} on:change={() => updateCheckboxValue(field.borders.top[i], i, 'top', field)}> 
                                  Sopra
                                <input class = "border{item.elemento.id}" type="checkbox" bind:checked={field.borders.right[i]} on:change={() => updateCheckboxValue(field.borders.right[i], i, 'right', field)}>
                                  Destra
                                <input class = "border{item.elemento.id}" type="checkbox" bind:checked={field.borders.bottom[i]} on:change={() => updateCheckboxValue(field.borders.bottom[i], i, 'bottom', field)}>
                                  Sotto
                              </label>
                              <label class ="label5"> 
                                Allineamento: 
                                <input type="radio" bind:group={field.alignments[i]} value = "left"/> 
                                  Sinistra
                                  <input type="radio" bind:group={field.alignments[i]} value = "center"/> 
                                  Centro
                                  <input type="radio" bind:group={field.alignments[i]} value = "right"/> 
                                  Destra
                              </label>
                            </div>
                          </div>
                        {/each}
                      {:else if field.type === 'contenuto_campi'}
                        <div class = "cella">
                          <h2>Riga {field.id_riga}</h2>
                          <div class = "element-riga">
                            {#each Array(countCampoElements(item.elemento.id)) as _,i}
                              <div class = "riga">
                                <div class = "cella"> 
                                  <div class = "cont_righe">
                                    <label class = "label2"> 
                                      Contenuto colonna {i+1}: 
                                      <textarea class="autosize-textarea" bind:value={field.testo[i]} on:input={handleInput} on:input:resize={adjustTextareaHeight} />
                                    </label> 
                                    <div class = "span&color">  
                                      <label class = "label6"> 
                                        Celle occupate in larghezza: 
                                        <input type="number" bind:value={field.colspan[i]}/> 
                                      </label>
                                      <label class ="label6"> 
                                        Colore della cella: 
                                      <input type="color" bind:value={field.fillcolor[i]}/> 
                                      </label>
                                    </div>
                                    <label class ="label5"> 
                                      Bordi: 
                                      <input class = "border{item.elemento.id}" type="checkbox" bind:checked={field.borders.left[i]} on:change={() => updateCheckboxValue(field.borders.left[i], i, 'left', field)}> 
                                        Sinistra
                                      <input class = "border{item.elemento.id}" type="checkbox" bind:checked={field.borders.top[i]} on:change={() => updateCheckboxValue(field.borders.top[i], i, 'top', field)}> 
                                        Sopra
                                      <input class = "border{item.elemento.id}" type="checkbox" bind:checked={field.borders.right[i]} on:change={() => updateCheckboxValue(field.borders.right[i], i, 'right', field)}>
                                        Destra
                                      <input class = "border{item.elemento.id}" type="checkbox" bind:checked={field.borders.bottom[i]} on:change={() => updateCheckboxValue(field.borders.bottom[i], i, 'bottom', field)}>
                                        Sotto
                                    </label>
                                    <label class ="label5"> 
                                      Allineamento del testo: 
                                      <input type="radio" bind:group={field.alignments[i]} value = "left"/> 
                                        Sinistra
                                        <input type="radio" bind:group={field.alignments[i]} value = "center"/> 
                                        Centro
                                        <input type="radio" bind:group={field.alignments[i]} value = "right"/> 
                                        Destra
                                    </label>
                                  </div>
                                </div>
                              </div>
                            {/each}
                            <div class = "height&remove">
                              <label>
                                <input type="radio" bind:group={field.tipoaltezza_riga} value="auto" on:change={HandleChangeAltezzaColonna(event,field.id)} />
                                Altezza auto
                              </label>
                              <label>
                                <input type="radio" bind:group={field.tipoaltezza_riga} value="custom" on:change={HandleChangeAltezzaColonna(event,field.id)}/>
                                <p>Altezza :</p>
                                <input id = {field.id} class="altezza_colonna" type="number" bind:value={field.altezza_riga} min = 2 disabled>
                              </label>
                              <button class = "rimuovi-riga" type="button" on:click={() => removeRiga(item.elemento.id,field.id)}>Rimuovi Riga</button>
                            </div>
                        </div>
                      </div>
                      {/if}
                      </div>
                  {/each}
                  <div class = "height&remove">
                    <button  class = "aggiungi-riga" type="button" on:click={() => addRiga(item.elemento.id)}>Aggiungi Riga</button>
                  </div>
                </div>
                <div class="dropzone upper-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
                <div class="dropzone lower-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
              </div>
            {:else if item.type === 'list'}
              <div class = "cella">
                <div class = "testo">
                  <h1>Lista </h1><button class = "rimuovi" type="button" on:click={() => removeList(item.elemento.id)}>Rimuovi</button>
                </div>
                <div class="list-element">
                  <div class = "stile_colore">
                    <div class ="style">
                      <label> 
                        <p>Style:</p>
                        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                        <select id="style-select" bind:value={item.elemento.style} name="style-option">  
                          <option value="" disabled> Default </option>
                          <option value="header" > Header</option>
                          <option value="subheader">SubHeader</option>
                          <option value="quote">Quote</option>
                          <option value="small">Small</option>
                        </select>
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
                  <div class = "ordine">
                    <div class = "list_left1">
                      <label>
                        <input type="radio" bind:group={item.elemento.tipo} value="ol" on:change={disableRadioButtons(event,item.elemento.id)}/>
                        Ordinata
                      </label>
                    </div>
                    <div class = "list-right1">
                      <label>
                        <input type="radio" bind:group={item.elemento.tipo} value="ul" on:change={disableRadioButtons(event,item.elemento.id)} />
                        Non ordinata
                      </label>
                    </div>
                  </div>
                  <div class = "stileNumeri">
                    <div class = "list_left">
                      <div class = {"list_left"  + item.elemento.id}>
                        <label>
                          <input class = "style_index_list" type="radio" bind:group={item.elemento.pointer} value="" />
                          Numeri
                        </label>
                        <label>
                          <input class = "style_index_list" type="radio" bind:group={item.elemento.pointer} value="lower-roman" />
                          Numeri romani minuscoli
                        </label>
                        <label>
                          <input class = "style_index_list" type="radio" bind:group={item.elemento.pointer} value="lower-alpha" />
                          Lettere minuscole
                        </label>
                        <label>
                          <input class = "style_index_list" type="radio" bind:group={item.elemento.pointer} value="upper-roman" />
                          Numeri romani maiuscoli
                        </label>
                        <label>
                          <input class = {"style_index_list" + item.elemento.id} type="radio" bind:group={item.elemento.pointer} value="upper-alpha" />
                          Lettere maiuscole
                        </label>
                      </div>
                    </div>
                    <div class = "list_right">
                      <div class = {"list_right"  + item.elemento.id}>
                        <label>
                          <input class = {"style_pointer_list" + item.elemento.id} type="radio" bind:group={item.elemento.pointer} value="circle" />
                          Circle
                        </label>
                        <label>
                          <input class = {"style_pointer_list" + item.elemento.id} type="radio" bind:group={item.elemento.pointer} value="square" />
                          Square
                        </label>
                      </div>
                    </div>
                  </div>
                  {#each item.elemento.testo as field,i2}  
                  <div class="contenutolista">
                    <label class ="label7"> 
                      Contenuto riga {i2+1} : 
                      <textarea class="autosize-textarea" bind:value={field.content} on:input={handleInput} on:input:resize={adjustTextareaHeight} />
                    </label>
                    
                    <button class = "rimuovi_riga" type="button" on:click={() => removeFieldFromList(item.elemento.id,field.id)}>Rimuovi</button>
                  </div> 
                  {/each}       
                <button class = "aggiungi-riga" type="button" on:click={() => addFieldtoList(item.elemento.id)}>Aggiungi riga</button>
                </div>
                <div class="dropzone upper-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
                <div class="dropzone lower-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
              </div>
            {:else if item.type === 'svg'}
              <div class = "cella">
                <div class = "testo">
                  <h1>SVG </h1>  <button class = "rimuovi" type="button" on:click={() => removeSVG(item.elemento.id)}>Rimuovi</button>
                </div>
                <div class="svg-element">
                  <!-- svelte-ignore missing-declaration -->       
                  <input class = "custom-file-input" type="file" accept=".svg" on:change={handleFileSVGChange(event,item.elemento.id)} />
                  <h2>Dimensioni:</h2>
                  <div class = "dimensioni_svg">
                    <label2>
                      <input type= "radio" bind:group={item.elemento.isMaxDimensionsSelected} on:change={handleDimensionChange_SVG(event,item.elemento.id)} value = "true">
                      Dimensioni massime<small-grey2>(riempie un rettangolo senza distorsione)</small-grey2>
                    </label2>
                    <div class = {"dim_max" + item.elemento.id}>
                      <div class = "dimensioni">
                        <label7>
                          Larghezza Massima:
                          <input type = "number" bind:value = {item.elemento.larghezza_fit} min = 10 max = 595 >
                        </label7>
                        <label7>
                          Altezza Massima:
                          <input type = "number" bind:value = {item.elemento.altezza_fit} min = 10 max = 841 >
                        </label7>
                      </div>
                    </div>
                    <label2>
                      <input type= "radio" bind:group={item.elemento.isMaxDimensionsSelected} on:change={handleDimensionChange_SVG(event,item.elemento.id)} value = "false">
                      Dimensioni assolute<small-grey2>(adatta a un rettangolo con distorsione)</small-grey2>
                    </label2>
                    <div class = {"dim_abs" + item.elemento.id}>
                      <div class = "dimensioni">
                        <label7>
                          Larghezza:
                          <input type = "number" bind:value = {item.elemento.larghezza} min = 10 max = 595>
                        </label7>
                        <label7>
                          Altezza:
                          <input type = "number" bind:value = {item.elemento.altezza} min = 10 max = 841>
                        </label7>
                      </div>
                    </div>
                    <div class = "posizione">
                      <p>Alignment: </p>
                      <label> 
                        <input type="radio" bind:group={item.elemento.alignment} value="left"/> 
                        Sinistra
                      </label>
                      <label> 
                        <input type="radio" bind:group={item.elemento.alignment} value="center"/> 
                        Centro
                      </label>
                      <label> 
                        <input type="radio" bind:group={item.elemento.alignment} value="right"/> 
                        Destra
                      </label>
                    </div>
                    <h2>Margini dell' SVG:</h2>
                    <div class = "margini_pagina">
                      Sinistra:
                      <input type="number" class = "marginiSVG" bind:value={item.elemento.svgMargins[0]} oninput="HandleMarginiSVG()" min = 0 max = 595>
                      Superiore:
                      <input type="number" class = "marginiSVG" bind:value={item.elemento.svgMargins[1]} oninput="HandleMarginiSVG()" min = 0 max = 841>
                      Destra:
                      <input type="number" class = "marginiSVG" bind:value={item.elemento.svgMargins[2]} oninput="HandleMarginiSVG()" min = 0 max = 595>
                      Inferiore:
                      <input type="number" class = "marginiSVG" bind:value={item.elemento.svgMargins[3]} oninput="HandleMarginiSVG()" min = 0 max = 841>
                    </div>
                  </div>
                </div>
                <div class="dropzone upper-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
                <div class="dropzone lower-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
              </div>
            {:else if item.type === 'img'}
              <div class = "cella">
                <div class = "testo">
                  <h1>Image </h1> <button class = "rimuovi" type="button" on:click={() => removeIMG(item.elemento.id)}>Rimuovi</button>
                </div>
                <div class="svg-element">
                  <!-- svelte-ignore missing-declaration -->
                  <input  class = "custom-file-input" type="file" accept=".jpeg , .png" on:change={handleFileIMGChange(event,item.elemento.id)} />
                  <h2>Dimensioni:</h2>
                  <div class = "dimensioni_svg">
                    <label2>
                      <input type= "radio" bind:group={item.elemento.isMaxDimensionsSelected} on:change={handleDimensionChange_IMG(event,item.elemento.id)} value = "true">
                      Dimensioni massime<small-grey2>(riempie un rettangolo senza distorsione)</small-grey2>
                    </label2>
                    <div class = {"dim_max_img" + item.elemento.id}>
                      <div class = "dimensioni">
                        <label7>
                          Larghezza Massima:
                          <input type = "number" bind:value = {item.elemento.larghezza_fit} min = 10 max = 595>
                        </label7>
                        <label7>
                          Altezza Massima:
                          <input type = "number" bind:value = {item.elemento.altezza_fit} min = 10 max = 841 >
                        </label7>
                      </div>
                    </div>
                    <label2>
                      <input type= "radio" bind:group={item.elemento.isMaxDimensionsSelected} on:change={handleDimensionChange_IMG(event,item.elemento.id)} value = "false">
                      Dimensioni assolute<small-grey2>(adatta a un rettangolo con distorsione)</small-grey2>
                    </label2>
                    <div class = {"dim_abs_img" + item.elemento.id}>
                      <div class = "dimensioni">
                        <label7>
                          Larghezza:
                          <input type = "number" bind:value = {item.elemento.larghezza} min = 10 max = 595>
                        </label7>
                        <label7>
                          Altezza:
                          <input type = "number" bind:value = {item.elemento.altezza} min = 10 max = 841 >
                        </label7>
                      </div>
                    </div>
                    <div class = "posizione">
                      <p>Alignment: </p>
                      <label> 
                        <input type="radio" bind:group={item.elemento.alignment} value="left"/> 
                        Sinistra
                      </label>
                      <label> 
                        <input type="radio" bind:group={item.elemento.alignment} value="center"/> 
                        Centro
                      </label>
                      <label> 
                        <input type="radio" bind:group={item.elemento.alignment} value="right"/> 
                        Destra
                      </label>    
                    </div>
                    <h2>Margini dell' immagine:</h2>
                    <div class = "margini_pagina">
                      Sinistra:
                      <input type="number" class = "marginiIMG" bind:value={item.elemento.imgMargins[0]} oninput="HandleMarginiIMG()" min = 0 max = 595 >
                      Superiore:
                      <input type="number" class = "marginiIMG" bind:value={item.elemento.imgMargins[1]} oninput="HandleMarginiIMG()" min = 0 max = 841>
                      Destra:
                      <input type="number" class = "marginiIMG" bind:value={item.elemento.imgMargins[2]} oninput="HandleMarginiIMG()" min = 0 max = 595>
                      Inferiore:
                      <input type="number" class = "marginiIMG" bind:value={item.elemento.imgMargins[3]} oninput="HandleMarginiIMG()" min = 0 max = 841>
                    </div>
                  </div>
                </div>
                <div class="dropzone upper-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
                <div class="dropzone lower-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
              </div>
            {:else if item.type === 'toc'}
              <div class = "cella">
                <div class = "testo">
                  <h1>Indice</h1><button class = "rimuovi" type="button" on:click={() => removeTOC(item.elemento.id)}>Rimuovi</button>
                </div>
                  <div class= "element"> 
                    <div class = "title&id">
                      <label> 
                        <p>Titolo dell'indice :</p>
                        <textarea class="autosize-textarea" bind:value={item.elemento.text} on:input={handleInput} on:input:resize={adjustTextareaHeight} /> 
                      </label>
                      <label> 
                        <p>Identificativo dell'indice :</p>
                        <input type="text" bind:value={item.elemento.id_sec} required/> 
                      </label>
                    </div>
                    <div class= "specifiche_toc">
                      <div class = "fontsize&style">
                        <div class ="fontsize">
                          <label for="fontsizes"><p>Grandezza del font:</p></label>
                          <select id="fontsizes" bind:value={item.elemento.fontSize}  on:change={(e) => handleChangeFontSize(e, item.elemento.id)}>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>
                            <option value="13">13</option>
                            <option value="14">14</option>
                            <option value="15">15</option>
                            <option value="16">16</option>
                            <option value="17">17</option>
                            <option value="18">18</option>
                            <option value="19">19</option>
                            <option value="20">20</option>
                            <option value="21">21</option>
                            <option value="22">22</option>
                            <option value="23">23</option>
                            <option value="24">24</option>
                            <option value="25">25</option>
                            <option value="26">26</option>
                            <option value="27">27</option>
                            <option value="28">28</option>
                            <option value="29">29</option>
                            <option value="30">30</option>
                          </select>
                        </div>
                        <div class ="font">
                          <label for="font">Font:</label>
                          <select id="font" bind:value={item.elemento.font}  on:change={(e) => handleChangeFont(e, item.elemento.id)}>
                            <option value="">Seleziona</option>
                            <option value="Roboto">Roboto</option>
                            <option value="RobotoSerif">RobotoSerif</option>
                            <option value="Raleway">Raleway</option>
                            <option value="NotoSerif">NotoSerif</option>
                            <option value="Montserrat">Montserrat</option>
                          </select>
                        </div>
                        <div class ="style">
                          <label> 
                            <p>Stile:</p>
                            <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                            <select id="style-select" bind:value={item.elemento.style} name="style-option" on:change={(e) => ChangeFontandFill(e, item.elemento.id)}>  
                              <option value="" > Default </option>
                              <option value="header" > Header</option>
                              <option value="subheader">SubHeader</option>
                              <option value="quote">Quote</option>
                              <option value="small">Small</option>
                            </select>
                          </label>
                        </div>
                      </div>
                      <div class = "pbreak&type">
                        <div class = "pbreak">
                          Page Break:
                          <label>
                            <input type="radio" bind:group={item.elemento.pagebreak} value="before" />
                            Prima
                          </label>
                          <label>
                            <input type="radio" bind:group={item.elemento.pagebreak} value="after" />
                            Dopo
                          </label>
                          <label>
                            <input type="radio" bind:group={item.elemento.pagebreak} value="" />
                            Nessuno
                          </label>
                        </div>  
                        <div class ="tipo">
                          <label>
                              <input type="checkbox" bind:checked={item.elemento.bold} value="true" />
                              Bold
                          </label>
                          <label>
                              <input type="checkbox" bind:checked={item.elemento.italics} value="true" />
                              Italics
                          </label>
                        </div>
                      </div>
                    </div>              
                  </div>
                <div class="dropzone upper-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
                <div class="dropzone lower-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
              </div>
            {/if}
        {/each}
        <div class = "buttons_send_preview">
          <button value = "invia" type="submit">Invia</button>
          <button value = "preview" type="submit">Preview</button>
          <div class="dropzone lower-dropzone third" on:dragenter={(e) => handleDragEnter(e, contenuto.length - 1)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, contenuto.length - 1)} on:dragover={handleDragOver} id="drop_zone"></div>
        </div>
        </form> 
     </div>
    <div class="preview">
      <!--<div class="resize-handle" onmousedown={handleMouseDown} onmouseup={handleMouseUp}></div>-->
      <iframe title = "pdf-window" id="fixedElement" src="{pdfData}" frameborder="0" width=100% height=100%></iframe>
    </div>    
    </div>
    </main>