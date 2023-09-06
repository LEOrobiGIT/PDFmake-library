
<script> 
  import { onMount} from 'svelte';
  import { afterUpdate} from 'svelte';
  import pdfMake from 'pdfmake/build/pdfmake';
  import pdfFonts from "../public/vfs_fonts";
  pdfMake.vfs = pdfFonts;
  import PDFPreview from './PDFPreview.svelte';
  import { ddStore } from './PDFstore.js';
  let generatedPdfData;
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let contenuto;
  export let fileListpassed = [];
  export let debug = false;
  export let dictionary = {
    label_header : "Header",
    label_footer : "Footer",
    label_index : "Indice",
    label_text : "Testo",
    label_row : "Riga Vuota",
    label_column : "Colonna",
    label_table : "Tabella",
    label_list : "Lista",
    label_svg: "SVG",
    label_image : "Immagine",
    add : "Aggiungi",
    list_file: "Lista dei file",
    create_PDF: "Crea un template PDF",
    header : "Header",
    button_remove: "Rimuovi",
    button_remove_column: "Rimuovi Colonna",
    button_remove_table : "Rimuovi Tabella",
    button_remove_row : "Rimuovi Riga",
    content_header : "Contenuto Header",
    content_footer: "Contenuto Footer",
    content_row: "Contenuto della riga",
    alignment : "Allineamento",
    left : "Sinistra",
    top : "Sopra",
    right : "Destra", 
    bottom: "Sotto",
    center : "Centro",
    style : "Stile",
    select : "Seleziona",
    fontsize : "Grandezza del font",
    margins : "Margini",
    words_preview : "Numero di parole approssimativo per la preview",
    content :"Contenuto",
    new_line : "shit + invio per andare a capo",
    page_break : "Nuova Pagina",
    before : "Prima",
    after : "Dopo",
    none : "Nessuno",
    bind_index : "Collega all'indice",
    columns_container: "Container delle Colonne",
    column_gap: "Distanza tra le colonne",
    width_auto : "Larghezza Auto",
    width_fill: "Larghezza Riempi",
    width : "Larghezza",
    max_width : "Larghezza Massima",
    auto_width : "Larghezza auto",
    height : "Altezza",
    max_height : "Altezza Massima",
    auto_height : "Altezza Auto",
    dimensions : "Dimensioni",
    max_dimensions : "Dimensioni Massime",
    abs_dimensions : "Dimensioni Assolute",
    fill_expl : "riempie un rettangolo senza distorsione",
    abs_expl : "adatta a un rettangolo con distorsione",
    img_margins : "Margini dell'immagine",
    svg_margins : "Margini dell'SVG",
    add_text : "Aggiungi Testo",
    add_img : "Aggiungi Immagine",
    add_svg : "Aggiugi SVG",
    add_column: "Aggiungi Colonna",
    add_row: "Aggiungi Riga",
    layout : "Layout",
    custom : "Custom",
    no_border : "Nessun bordo",
    horizontal_lines : "Solo righe orizzontali",
    table_color: "Colore della tabella",
    attributes : "Riga di Intestazione",
    details : "Dettagli",
    cells : "Celle del campo",
    cells_color: "Colore del campo",
    borders : "Bordi",
    row: "Riga",
    color : "Colore",
    pointer_color: "Colore del puntatore",
    ordered : "Ordinata",
    unordered : "Non ordinata",
    numbers :"Numeri",
    numbers_roman_small: "Numeri romani minuscoli",
    numbers_roman_big: "Numeri romani maiuscoli",
    letters_small : "Lettere minuscole",
    letters_big : "Lettere maiuscole",
    circle : "Cerchio",
    square : "Quadrato",
    svg_margins :"Margini dell'SVG",
    img_margings : "Margini dell'immagine",
    title_index: "Titolo dell'indice",
    id_index: "Identificativo dell'indice",
    create : "Crea",
    preview : "Preview"
  }; 
  export let css_root = {
    "--button-color": "#333",
    "--button-background": "#f4f4f4",
    "--font": "Segoe UI",
    "--fontsize" : "2em"
  }
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

  //-------------------intialize doc definition ----------------------------------
    let pdfData = null;
    let dd = {};
    ddStore.set(dd);
    pdfMake.createPdf(dd).getDataUrl((dataUrl) => {
      pdfData = dataUrl;
    });
    let default_font = "";
  //------------------Content structure ----------------------------
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
    if (contenuto && contenuto.length > 0){
      console.log("ok");
    } else {
      console.log("contenuto = ",contenuto);
      contenuto = [pagina];
    }
    //let contenuto =[pagina];
    let style = {nome : '', font : '', fontsize: '', bold : '', italics : '',alignment: '', lineheight : 1, color :'', background : ''};
    let nextId = 2; // id for the next field/column to be added
  //------------ Style declaration--------------------------
	  export let custom_styles = {
      header : {fontSize : 18,bold : true}, 
      subheader : {fontSize : 15, bold: true}, 
      quote: {italics : true}, 
      small : {fontSize : 6}, 
      normal : {fontSize :12}
    }
    var hasHeader = false;
    var hasFooter = false;
    var isHeaderPresent = false;
    var isFooterPresent = false;
  //handle submit  
    function handleSubmit(event) {
      checkFooterAndExecute;
      checkHeaderAndExecute;
      console.log(contenuto);
      if (default_font === ""){
        default_font = "Roboto";
      };
      var dd = {};
      var dd_preview = {};
      var pageMargins = contenuto[0].pageMargins;
      if (pageMargins.length === 0){
        pageMargins = [40,40,40,40];
      }
      dd = {pageMargins: pageMargins, content: [], header: {text: "", alignment: "", style: "", fontSize: "", font: "", margin: []}, footer : {text: "", alignment: "", style: "",fontSize: "", font: "", margin: []}, styles: custom_styles};
      dd_preview = {pageMargins: pageMargins, content: [], header: {text: "", alignment: "", style: "", fontSize: "", font: "", margin: []}, footer : {text: "", alignment: "", style: "",fontSize: "", font: "", margin: []}, styles: custom_styles};
      contenuto.forEach(item => {
        if (item.type === 'field') {
          var testo = item.elemento.content;
          testo = testo.concat("\n");
          const font = item.elemento.selectedfont || 'Roboto';
          const fontSize = item.elemento.selectedfontsize || 12;
          const style = item.elemento.selectedstyle || 'normal';
          const pagebreak = item.elemento.pagebreak;
          const tocItem = item.elemento.tocItem;
          const test_text = item.elemento.test_text || "40";
          var text_generated = generateText(test_text.toString()); 
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
          dd_preview.content.push({
            text: text_generated,
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
          dd_preview.content.push({
            text : "  ",
          });
        } else if (item.type === 'column') {
          const gap = item.gap;
          const campi = item.elemento.fields;
          const alignment = item.alignment;
          console.log(campi);
          const ris = [];
          const ris_preview = []
          campi.forEach(field => {
            if (field.type === "field"){
              const width = field.width;
              const contenuto = field.content;
              const font = field.selectedfont || 'Roboto';
              const fontSize = field.selectedfontsize || 12;
              const style = field.selectedstyle || 'normal';
              const test_text = field.test_text || "4";
              var text_generated = generateText(test_text.toString()); 
              ris.push({
                  width: width,
                  text: contenuto,
                  fontSize: fontSize,
                  style: style,
                  font: font,
                  bold: item.elemento.bold,
                  italics: item.elemento.italics,
              });
              ris_preview.push({
                  width: width,
                  text: text_generated,
                  fontSize: fontSize,
                  style: style,
                  font: font,
                  bold: item.elemento.bold,
                  italics: item.elemento.italics,
              });
            } else if (field.type === "IMG"){
              const imgContent = field.imgContent;
              const test_img = field.test_img;
              const larghezza = field.larghezza;
              const altezza = field.altezza;
              const larghezza_fit = field.larghezza_fit;
              const altezza_fit = field.altezza_fit;
              const alignment = field.alignment;
              const imgMargins = field.imgMargins;
              const isMaxDimensionsSelected = field.isMaxDimensionsSelected;
              if (isMaxDimensionsSelected === "true"){
                ris.push({
                  image: imgContent,
                  fit : [larghezza_fit,altezza_fit],
                  alignment : alignment,
                  margin : imgMargins
                });
                ris_preview.push({
                  image: test_img,
                  fit : [larghezza_fit,altezza_fit],
                  alignment : alignment,
                  margin : imgMargins
                });
              }else{
                ris.push({
                  image: imgContent,
                  width:larghezza,
                  height: altezza,
                  alignment : alignment,
                  margin : imgMargins
                });
                ris_preview.push({
                  image: test_img,
                  width:larghezza,
                  height: altezza,
                  alignment : alignment,
                  margin : imgMargins
                });
              }
            }else if (field.type === "SVG"){
              const imgContent = field.imgContent;
              const test_img = field.test_img;
              const larghezza = field.larghezza;
              const altezza = field.altezza;
              const larghezza_fit = field.larghezza_fit;
              const altezza_fit = field.altezza_fit;
              const alignment = field.alignment;
              const imgMargins = field.imgMargins;
              const isMaxDimensionsSelected = field.isMaxDimensionsSelected;
              if (isMaxDimensionsSelected === "true"){
                ris.push({
                  svg: imgContent,
                  fit : [larghezza_fit,altezza_fit],
                  alignment : alignment,
                  margin : imgMargins
                });
                ris_preview.push({
                  svg: test_img,
                  fit : [larghezza_fit,altezza_fit],
                  alignment : alignment,
                  margin : imgMargins
                });
              }else{
                ris.push({
                  svg: imgContent,
                  width:larghezza,
                  height: altezza,
                  alignment : alignment,
                  margin : imgMargins
                });
                ris_preview.push({
                  svg: test_img,
                  width:larghezza,
                  height: altezza,
                  alignment : alignment,
                  margin : imgMargins
                });
              }
            }

          });
          dd.content.push({
            columns: ris,
            columnGap: gap,
            alignment : alignment
          });
          dd_preview.content.push({
            columns: ris_preview,
            columnGap: gap,
            alignment : alignment
          });
          console.log(dd_preview);
        } else if (item.type === 'table') {
          const body_table =[];
          const body_table_preview = [];
          const layout = item.elemento.layout || '';
          const color = item.elemento.color || '#444';
          var bgcolor = item.elemento.bgcolor || '#ffffff';
          const contenuto_t = item.elemento.contenuto_t || '';
          const font = item.elemento.font || 'Roboto';
          const fontsize = item.elemento.fontsize || 12;
          const pagebreak = item.elemento.pagebreak;
          const bold = item.elemento.bold;
          const italics = item.elemento.italics;
          const altezze = [];
          const larghezza = [];
          var numero;
          contenuto_t.forEach(el =>{
            console.log(el);
            var riga = [];
            var riga_preview = [];
            if (el.type === "campo"){
              if (el.tipoaltezza_riga === "auto"){
                altezze.push(el.tipoaltezza_riga);
              }else{
                altezze.push(el.altezza_riga);
              };
              numero = el.numero;
              for (let i = 0; i < el.numero; i++){
                var testo = el.testo[i] || "";
                const test_text = el.test_text[i] || "4";
                var fill_color = el.fillcolor[i];
                var text_generated = generateText(test_text.toString()); 
                console.log(el.larghezza_colonne[i]);
                if (!el.larghezza_colonne[i]){
                  el.larghezza_colonne[i] = "auto"
                };
                larghezza.push(el.larghezza_colonne[i]);
                var borders = [];
                borders.push(el.borders.left[i]);
                borders.push(el.borders.top[i]);
                borders.push(el.borders.right[i]);
                borders.push(el.borders.bottom[i]);
                var alignment = el.alignments[i];
                var colspan = el.colspan[i] || 1;
                var bgcolor1;
                if (fill_color != ""){
                  bgcolor1 = fill_color;
                } else {
                  bgcolor1 = bgcolor;
                };
                riga.push({
                  border : borders,
                  fillColor: bgcolor1,
                  alignment : alignment,
                  colSpan: colspan,
                  text : testo,
                });
                riga_preview.push({
                  border : borders,
                  fillColor: bgcolor1,
                  alignment : alignment,
                  colSpan: colspan,
                  text : text_generated,
                });
              }
            } else if (el.type === "contenuto_campi") {
              if (el.tipoaltezza_riga === "auto"){
                altezze.push(el.tipoaltezza_riga);
              }else{
                altezze.push(el.altezza_riga);
              };
              for (let i = 0; i < numero; i++){
                var testo = el.testo[i]|| "";
                const test_text = el.test_text[i] || "8";
                var text_generated = generateText(test_text.toString());
                var fill_color = el.fillcolor[i];
                console.log(text_generated);
                var borders = [];
                borders.push(el.borders.left[i]);
                borders.push(el.borders.top[i]);
                borders.push(el.borders.right[i]);
                borders.push(el.borders.bottom[i]);
                var alignment = el.alignments[i];
                var colspan = el.colspan[i]|| 1;
                var bgcolor2;
                if (fill_color != ""){
                  bgcolor2 = fill_color;
                } else {
                  bgcolor2 = bgcolor;
                };
                riga.push({
                  border : borders,
                  fillColor: bgcolor2,
                  alignment : alignment,
                  colSpan: colspan,
                  text : testo,
                });
                riga_preview.push({
                  border : borders,
                  fillColor: bgcolor2,
                  alignment : alignment,
                  colSpan: colspan,
                  text : text_generated,
                });
                console.log("riga");
                console.log(riga);
              } 
            }
            body_table.push(riga);
            body_table_preview.push(riga_preview);
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
          dd_preview.content.push({
            layout: layout,
            color: color,
			      table: {
              heights: altezze,
				      widths: larghezza,
				      body: body_table_preview
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
          const font = item.elemento.font ||"Roboto";
          const fontsize = item.elemento.fontsize || 12;
          const lista = [];
          const lista_preview = [];
          item.elemento.testo.forEach(el=>{
            lista.push(el.content);
            const test_text = el.test_text || "10";
            var text_generated = generateText(test_text.toString()); 
            lista_preview.push(text_generated);
          });
          if (tipo === "ul"){
            dd.content.push({
              style: style,
              color : color,
              markerColor : markercolor,
              font : font,
              fontSize : fontsize,
              type : pointer,
              ul:lista
            });
            dd_preview.content.push({
              style: style,
              color : color,
              markerColor : markercolor,
              font : font,
              fontSize : fontsize,
              type : pointer,
              ul:lista_preview
            })
          }else {
            dd.content.push({
              start : start,
              style: style,
              color : color,
              markerColor : markercolor,
              font : font,
              fontSize : fontsize,
              type : pointer,
              ol:lista
            });
            dd_preview.content.push({
              start : start,
              style: style,
              color : color,
              markerColor : markercolor,
              font : font,
              fontSize : fontsize,
              type : pointer,
              ol:lista_preview
            })
          }
        } else if (item.type === 'header'){
          const testo = item.elemento.testo;
          const test_text = item.elemento.test_text || "4";
          var text_generated = generateText(test_text.toString()); 
          const alignment = item.elemento.alignment;
          const style = item.elemento.style;
          var font = item.elemento.font;
          var fontsize = item.elemento.fontsize;
          const margin = [];
          const margin_preview = [];
          margin.push(item.elemento.margin.left);
          margin.push(item.elemento.margin.top);
          margin.push(item.elemento.margin.right);
          margin.push(item.elemento.margin.bottom);
          margin_preview.push(item.elemento.margin.left);
          margin_preview.push(item.elemento.margin.top);
          margin_preview.push(item.elemento.margin.right);
          margin_preview.push(item.elemento.margin.bottom);
          dd.header.text = testo;
          dd.header.alignment = alignment;
          dd.header.style = style;
          dd.header.margin = margin;
          dd_preview.header.text = text_generated;
          dd_preview.header.alignment = alignment;
          dd_preview.header.style = style;
          dd_preview.header.margin = margin_preview;
          if (font === ""){
            font = default_font;
          }
          if (fontsize === ""){
            fontsize = 12;
          }
          dd.header.font = font;
          dd.header.fontSize = fontsize;
          dd_preview.header.font = font;
          dd_preview.header.fontSize = fontsize;
        } else if (item.type === 'footer'){
          const page_counter = item.elemento.page_counter;
          const testo = item.elemento.testo;
          const test_text = item.elemento.test_text || "4";
          var text_generated = generateText(test_text.toString()); 
          const alignment = item.elemento.alignment;
          const style = item.elemento.style;
          const margin = [];
          const margin_preview = [];
          var font = item.elemento.font;
          var fontsize = item.elemento.fontsize;
          if (font === ""){
              font = "Roboto";
            }
          if (fontsize === ""){
            fontsize = 12;
          }
          margin.push(item.elemento.margin.left);
          margin.push(item.elemento.margin.top);
          margin.push(item.elemento.margin.right);
          margin.push(item.elemento.margin.bottom);
          margin_preview.push(item.elemento.margin.left);
          margin_preview.push(item.elemento.margin.top);
          margin_preview.push(item.elemento.margin.right);
          margin_preview.push(item.elemento.margin.bottom);
          if (page_counter === true){
            dd.footer = function(currentPage, pageCount) { 
              return {
                text: currentPage.toString() + ' of ' + pageCount,
                alignment: alignment,
                style : style,
                margin : margin,
                font : font,
                fontsize : fontsize,
                }; 
            };
            dd_preview.footer = function(currentPage, pageCount) { 
              return {
                text: currentPage.toString() + ' of ' + pageCount,
                alignment: alignment,
                style : style,
                margin : margin,
                font : font,
                fontsize : fontsize,
                }; 
            };
          } else {
            dd.footer.text = testo;
            dd.footer.alignment = alignment;
            dd.footer.style = style;
            dd.footer.margin = margin;
            dd_preview.footer.text = text_generated;
            dd_preview.footer.alignment = alignment;
            dd_preview.footer.style = style;
            dd_preview.footer.margin = margin_preview;
            dd.footer.font = font;
            dd.footer.fontSize = fontsize;
            dd_preview.footer.font = font;
            dd_preview.footer.fontSize = fontsize;
          }
        } else if (item.type === 'svg'){
          const svgContent = item.elemento.svgContent;
          const test_svg = item.elemento.test_svg;
          const larghezza = item.elemento.larghezza;
          const altezza = item.elemento.altezza;
          const larghezza_fit = item.elemento.larghezza_fit;
          const altezza_fit = item.elemento.altezza_fit;
          const alignment = item.elemento.alignment;
          const svgMargins = item.elemento.svgMargins;
          const isMaxDimensionsSelected = item.elemento.isMaxDimensionsSelected;
          if (isMaxDimensionsSelected === "true"){
            console.log("ok");
            dd.content.push({
              svg: svgContent,
              fit : [larghezza_fit,altezza_fit],
              alignment : alignment,
              margin : svgMargins
            });
            dd_preview.content.push({
              svg: test_svg,
              fit : [larghezza_fit,altezza_fit],
              alignment : alignment,
              margin : svgMargins
            });
          }else{
            console.log("ok2");
            dd.content.push({
              svg: svgContent,
              width:larghezza,
              height: altezza,
              alignment : alignment,
              margin : svgMargins
            });
            dd.content.push({
              svg: test_svg,
              width:larghezza,
              height: altezza,
              alignment : alignment,
              margin : svgMargins
            });
          }
        } else if (item.type === 'img'){
          const imgContent = item.elemento.imgContent;
          const test_img = item.elemento.test_img;
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
            dd_preview.content.push({
              image: test_img,
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
            dd_preview.content.push({
              image: test_img,
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
          const test_text = item.elemento.test_text || "6";
          var text_generated = generateText(test_text.toString()); 
          const pageBreak = item.elemento.pageBreak;
          const bold = item.elemento.bold;
          const italics = item.elemento.italics;
          const font = item.elemento.font || "Roboto";
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
          dd_preview.content.push({
            toc : {
              id : id_sec,
              title : {
                text : text_generated,
                style : style,
                fontSize : fontSize,
                pageBreak : pageBreak,
                bold : bold,
                italics : italics,
                font : font
              }
            }
          });
          console.log(dd_preview);
        }
      });
      const clickedButtonValue = event.submitter.value;
      if(clickedButtonValue === "preview"){
        console.log(dd_preview);
        const pdfDocGenerator = pdfMake.createPdf(dd_preview);
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
        //pdfMake.createPdf(dd).download();
        ddStore.set(dd);
        const unsubscribe = ddStore.subscribe((value) => {
          console.log('Stored value in PDFstore:', value);
        });
        /*onDestroy(() => {
          unsubscribe();
        });*/
        dispatch("dataToParent", contenuto);
        contenuto =[...contenuto];
      }
      }
      
  //------------------Field(text)--------------------------------------------------------------

    function addField(i) {
      const field = {
        id: nextId,
        content: '',
        test_text: '40',
        selectedfont: default_font,
        selectedfontsize: '',
        selectedstyle: '',
        selectedbold: '',
        selecteditalics: '',
        pagebreak : '',
        tocItem : ''
      };
      const item = { type: 'field', elemento: field };
      contenuto.splice(i, 0, item);
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
        nextId++;
    }

    function addFieldtoColumn(index) {
      const field = {
        type : "field",
        id: nextId,
        content: '',
        test_text: '20',
        selectedfont: default_font,
        selectedfontsize: '',
        selectedstyle: '',
        selectedbold: '',
        selecteditalics: '',
        width : "auto",
        tocItem : ''
      };
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
    function addIMGtoColumn(index) {
      console.log(contenuto);
      var filePath = 'default/black.jpg';
      const reader = new FileReader();
      
      reader.addEventListener('load', function(event) {
        const result = event.target.result;

        const img = {
          type : "IMG",
          id: nextId,
          selectedFile: null,
          imgContent : '',
          test_img: result,
          larghezza: 10,
          altezza : 10,
          larghezza_fit: 100,
          altezza_fit: 200,
          alignment :"",
          imgMargins : [0,0,0,0],
          isMaxDimensionsSelected : "true",
        };
        for (var i = 0; i < contenuto.length; i++) {
          var colonna = contenuto[i];
          if (colonna.type === "column" && colonna.elemento.id === index) {
              colonna.elemento.fields.push(img);
              updateFunction();
              break; // Assuming you want to update only the first occurrence
          }
        }
        nextId++;
      });

      fetch(filePath)
        .then(response => response.blob())
        .then(blob => reader.readAsDataURL(blob));
    }
    function addSVGtoColumn(index) {
      var filePath = 'default/file-black-icon.svg';
      const reader = new FileReader();
      
      reader.addEventListener('load', function(event) {
        const result = event.target.result;

        const svg = {
          type : "SVG",
          id: nextId,
          selectedFile: null,
          imgContent : '',
          test_img: result,
          larghezza: 10,
          altezza : 10,
          larghezza_fit: 100,
          altezza_fit: 200,
          alignment :"",
          imgMargins : [0,0,0,0],
          isMaxDimensionsSelected : "true",
        };
        for (var i = 0; i < contenuto.length; i++) {
          var colonna = contenuto[i];
          if (colonna.type === "column" && colonna.elemento.id === index) {
              colonna.elemento.fields.push(svg);
              updateFunction();
              break; // Assuming you want to update only the first occurrence
          }
        }
        nextId++;
      });

      fetch(filePath)
        .then(response => response.blob())
        .then(blob => reader.readAsText(blob));
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
          font: default_font,
          fontsize: "12",
          pagebreak :"",
          bold : "",
          italics: "",
          color:'', 
          bgcolor : '',
          righe: 1,
          contenuto_t:[{type : "campo",id : nextId+1,testo:[""],test_text: [''], settings : [-1,-1,""],larghezza_colonne :["auto"],fillcolor : [""], numero: 1, tipoaltezza_riga : "auto", altezza_riga : 10, borders:{left:[true],top:[true],right:[true],bottom:[true]}, alignments: [""], colspan : [1]},{type : "contenuto_campi",id : nextId+2,id_riga : 1, testo:[""], test_text: [''],tipoaltezza_riga : "auto", altezza_riga : 10, fillcolor : [""], borders:{left:[true],top:[true],right:[true],bottom:[true]}, alignments : [""], colspan : [1]}] 
        };
        const item = { type: 'table', elemento: table };
        contenuto.splice(i, 0, item);
        nextId = nextId +3;  
    }                 
    var indice_settings = -1;
    function removeRiga(tableId, contenutoCampiId) {
      const tableCells = document.querySelectorAll('.table_cell');
      tableCells.forEach(cell => {
        cell.style.backgroundColor = 'white';
        cell.style.border = '1px solid #ccc';
      });
      for (var i = 0; i < contenuto.length; i++) {
          var tabella = contenuto[i];
          if (tabella.type === "table" && tabella.elemento.id === tableId) {
              tabella.elemento.righe -= 1;
              if (tabella.elemento.contenuto_t[0].settings[1] === contenutoCampiId){
                tabella.elemento.contenuto_t[0].settings = [-1,-1,""];
                indice_settings = -1;
              }
          }
        }
      contenuto = contenuto.map(item => {
        if (item.type === 'table' && item.elemento.id === tableId) {
          item.elemento.contenuto_t = item.elemento.contenuto_t.filter(campi => campi.id !== contenutoCampiId);
        }
        return item;
      });
    }
    
    function addSettings(event,tableId,fieldId,index){
      const tableCells = document.querySelectorAll('.table_cell');
      tableCells.forEach(cell => {
        cell.style.backgroundColor = 'white';
        cell.style.border = '1px solid #ccc';
      });
      const inputElement = event.target;
      inputElement.style.backgroundColor = 'lightblue';
      inputElement.style.border = '2px solid darkblue';
      for (var i = 0; i < contenuto.length; i++) {
          var tabella = contenuto[i];
          if (tabella.type === "table" && tabella.elemento.id === tableId) {
            for (var x = 0; x < tabella.elemento.contenuto_t.length; x++){
              var el = tabella.elemento.contenuto_t[x];
              if (el.id === fieldId){
                tabella.elemento.contenuto_t[0].settings[0] = index; 
                indice_settings = index;
                tabella.elemento.contenuto_t[0].settings[1] = el.id; 
                tabella.elemento.contenuto_t[0].settings[2] = el.type;
                console.log(tabella.elemento.contenuto_t[0]);
                console.log(tabella.elemento.contenuto_t);
              }
            }
          }
        }
        contenuto = [...contenuto];
    }
    function addRiga(tableId) {
      var num_righe = 1;
      var border = "";
      var colonne = 1;
      for (var i = 0; i < contenuto.length; i++) {
          var tabella = contenuto[i];
          if (tabella.type === "table" && tabella.elemento.id === tableId) {
            var num_righe = tabella.elemento.righe
            var border = tabella.elemento.layout;
            colonne = tabella.elemento.contenuto_t[0].numero;
            var bgcolor = tabella.elemento.bgcolor;
          }
      };
      var borders = {left:[],top:[],right:[],bottom:[]};
      if (border === "noBorders"){
        for (let i = 0; i < colonne; i++) {
          borders.left.push(false);
          borders.top.push(false);
          borders.right.push(false);
          borders.bottom.push(false);
        }
      }else if(border === "Custom"){
        for (let i = 0; i < colonne; i++) {
          borders.left.push(true);
          borders.top.push(true);
          borders.right.push(true);
          borders.bottom.push(true);
        }
      }else{
        for (let i = 0; i < colonne; i++) {
          borders.left.push(false);
          borders.top.push(false);
          borders.right.push(false);
          borders.bottom.push(false);
        }
      };
      var fillcolor = [];
      for (let i = 0; i < colonne; i++) {
          fillcolor.push(bgcolor);
        };
      contenuto_campi = {
          type:"contenuto_campi",
          id: nextId,
          id_riga: num_righe +1,
          testo: [""],
          test_text: [''],
          tipoaltezza_riga : "auto",
          altezza_riga:10,
          fillcolor : fillcolor,
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
    function addColonna(tableId){
      for (var i = 0; i < contenuto.length; i++) {
          var selected = contenuto[i];
          if (selected.type === "table" && selected.elemento.id === tableId){
            var larghezza_colonne = selected.elemento.contenuto_t[0].larghezza_colonne[0];
            var borders = {};
            var bgcolor = selected.elemento.bgcolor;
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
            selected.elemento.contenuto_t[0].fillcolor.push(bgcolor);
            selected.elemento.contenuto_t[0].numero += 1;
            var cont_t = selected.elemento.contenuto_t;
            for (var x = 1; x < cont_t.length; x++){
              cont_t[x].testo.push('');
              cont_t[x].colspan.push(1);
              cont_t[x].fillcolor.push(bgcolor);
              cont_t[x].alignments.push('');
              cont_t[x].borders.left.push(cont_t[x].borders.left[0]);
              cont_t[x].borders.top.push(cont_t[x].borders.top[0]);
              cont_t[x].borders.right.push(cont_t[x].borders.right[0]);
              cont_t[x].borders.bottom.push(cont_t[x].borders.bottom[0]);
            }
          }
        }
        contenuto = [...contenuto];
    }
    function removeColonna(tableId){
      for (var i = 0; i < contenuto.length; i++) {
          var selected = contenuto[i];
          if (selected.type === "table" && selected.elemento.id === tableId){
            if (selected.elemento.contenuto_t[0].numero > 1){
              var larghezza_colonne = selected.elemento.contenuto_t[0].larghezza_colonne[0];
              selected.elemento.contenuto_t[0].larghezza_colonne.pop();
              selected.elemento.contenuto_t[0].borders.left.pop();
              selected.elemento.contenuto_t[0].borders.top.pop();
              selected.elemento.contenuto_t[0].borders.right.pop();
              selected.elemento.contenuto_t[0].borders.bottom.pop();
              selected.elemento.contenuto_t[0].colspan.pop();
              selected.elemento.contenuto_t[0].numero -= 1;
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
      console.log(contenuto);
    }

  //---------------------Lists-----------------------------

    function addList(i) {
          const list = {
            id: nextId,
            tipo: 'ul',
            start : 1,
            style:'', 
            font : default_font,
            fontsize : '',
            color: "", 
            markerColor: "", 
            pointer : "",
            testo: [],
            test_text: [],
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
          content: '',
          test_text: '10'
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

    afterUpdate(checkHeaderAndExecute);

    function addHeader(i) {
      const header = {
        id: nextId,
        testo: '',
        test_text: '10',
        alignment : '',
        style : '',
        font: default_font,
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


    afterUpdate(checkFooterAndExecute);
    
    function addFooter(i) {
          const footer = {
            id: nextId,
            testo: '',
            test_text: '10',
            alignment : '',
            style : '',
            font: default_font,
            fontsize: '',
            page_counter : false,
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
      var filePath = 'default/file-black-icon.svg';
      const reader = new FileReader();
      
      reader.addEventListener('load', function(event) {
        const result = event.target.result;

        const svg = {
          id: nextId,
          selectedFile: null,
          svgContent: '',
          test_svg: result,
          larghezza: 10,
          altezza: 10,
          larghezza_fit: 100,
          altezza_fit: 200,
          alignment: '',
          svgMargins: [0, 10, 0, 0],
          isMaxDimensionsSelected: "true"
        };

        const item = { type: 'svg', elemento: svg };
        
        contenuto.splice(i, 0, item);
        nextId++;
        contenuto = [...contenuto];
        console.log(contenuto);
      });

      fetch(filePath)
        .then(response => response.blob())
        .then(blob => reader.readAsText(blob));
    }

    function removeSVG(svgId) {
      contenuto = contenuto.filter(item => !(item.type === 'svg' && item.elemento.id === svgId));
    }

  //---------------------IMG----------------------------------------
    function addIMG(i) {
      var filePath = 'default/black.jpg';
      const reader = new FileReader();
      
      reader.addEventListener('load', function(event) {
        const result = event.target.result;

        const img = {
          id: nextId,
          selectedFile: null,
          imgContent : '',
          test_img: result,
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
        contenuto = [...contenuto];
        console.log(contenuto);
      });

      fetch(filePath)
        .then(response => response.blob())
        .then(blob => reader.readAsDataURL(blob));
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
                  fontsize: fontsize,
                },
              };
            }else if (selected.type === "footer"){
              return {
                ...selected,
                elemento: {
                  ...selected.elemento,
                  fontsize: fontsize,
                },
              };
            }
          }
          return selected;
        });
        contenuto = [...contenuto];
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
          //console.log(fontsize);
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
        //console.log(selectedValue);
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
            //console.log(fontsize);
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
      const selectorleft = `.style_index_list${id}`;
      const selectorright = `.style_pointer_list${id}`;
      const selectedValue = event.target.value;
      const listLeftInputs = document.querySelectorAll(selectorleft);
      const listRightInputs = document.querySelectorAll(selectorright);
      console.log(listLeftInputs);
      console.log(listRightInputs);
      for (var i = 0; i < contenuto.length; i++) {
          var selected = contenuto[i];
          if (selected.type === "list" && selected.elemento.id === id){
            selected.elemento.pointer = "";
          }else{continue}
        };
      if (selectedValue === 'ol') {
        console.log("ol");
        listRightInputs.forEach(input => {
          input.disabled = true;
          input.checked = false;
        });
        listLeftInputs.forEach(input => {
          input.disabled = false;
        });
      } else if (selectedValue === 'ul') {
        console.log("ul");
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
          fontSize: "15",
          font: default_font,
          text :"",
          test_text: '15',
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
    

  //-----------------------Generate Text -----------------------------
    function generateText(num_words) {
      const words = [
        'Lorem', 'ipsum', 'dolor', 'sit', 'amet,', 'consectetur',
        'adipiscing', 'elit.', 'Sed', 'non', 'risus', 'quis', 'massa',
        'facilisis', 'gravida', 'et', 'sit', 'amet', 'erat', 'aliquet',
        'lobortis', 'odio.', 'Vivamus', 'tincidunt', 'purus', 'et', 'massa',
        'euismod', 'lobortis.', 'Nulla', 'mollis', 'tempor', 'lectus', 'quis',
        'convallis.', 'Suspendisse', 'placerat', 'molestie', 'ligula', 'ut',
        'gravida.', 'Nullam', 'placerat', 'efficitur', 'massa', 'non',
        'pellentesque.'
      ];

      let generatedText = '';
      let wordCount = 0;

      while (wordCount < num_words) {
        generatedText += words[wordCount % words.length] + ' ';
        wordCount++;
      }

      return generatedText.trim();
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

  //-------------Drag&Drop------------------------------------
    let objects = [
      { el: null, id: 'header', label: dictionary.label_header},
      { el: null, id: 'footer', label: dictionary.label_footer},
      { el: null, id: 'toc', label: dictionary.label_index},
      { el: null, id: 'text', label: dictionary.label_text},
      { el: null, id: 'row', label: dictionary.label_row},
      { el: null, id: 'column', label: dictionary.label_column},
      { el: null, id: 'table', label: dictionary.label_table},
      { el: null, id: 'list', label: dictionary.label_list},
      { el: null, id: 'svg', label: dictionary.label_svg},
      { el: null, id: 'image', label: dictionary.label_image}
    ]; //bottoni per l'aggiunta degli elementi

    var buttons = [];
    var fileButtons = [];
    var dropzones = [];
    var dropzonesText = [];
    var cells = [];
    let selectedFileContent = "";

    function applyCSSVariables() {
      document.documentElement.style.setProperty('--button-color', css_root['--button-color']||"#333");
      document.documentElement.style.setProperty('--button-background', css_root['--button-background']||"#f4f4f4");
      document.documentElement.style.setProperty('--font', css_root['--font']||"Segoe UI");
      document.documentElement.style.setProperty('--fontsize', css_root['--fontsize']||"2em");
    }

    onMount(() => {
      if (debug){
        console.log("fileListPassed",fileListpassed);
      } 
      checkFooterAndExecute;
      checkHeaderAndExecute;
      console.log("css_root = ",css_root);
      applyCSSVariables();
      buttons = document.querySelectorAll('.addButton');
      dropzones = document.querySelectorAll('.dropzone');
      cells = document.querySelectorAll('.cella');
      dropzonesText = document.querySelectorAll('.dropzone_Text');
      fileButtons = document.querySelectorAll('.fileButton');
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
    function handleDropFile(event,id,id_sec,pos) {
      event.preventDefault();
      console.log("id = "+id);
      console.log("id_sec = "+id_sec);
      console.log(contenuto);
      for (var i = 0; i < contenuto.length; i++) {
        var item = contenuto[i];
        if (item.type != "page" && item.elemento.id === id){
          console.log(item);
          if(item.type === "field"){
            item.elemento.content = selectedFileContent;
          }else if(item.type === "column"){
            console.log(item.elemento);
            for (var x = 0; x < item.elemento.fields.length; x++){
              var field = item.elemento.fields[x];
              console.log(field);
              if(field.id === id_sec){
                field.content = selectedFileContent;
              }
            }
          }else if(item.type === "toc"){
            item.elemento.text = selectedFileContent;
          }else if(item.type === "toc"){
            item.elemento.text = selectedFileContent;
          }else if(item.type === "table"){
            for (var x = 0; x < item.elemento.contenuto_t.length; x++){
              var el = item.elemento.contenuto_t[x];
              if (el.id === id_sec){
                el.testo[pos] = selectedFileContent;
              }
            };
          }else if (item.type === "list"){
            console.log(item.elemento.testo.length);
              for (var x = 0; x < item.elemento.testo.length; x++){
                var el = item.elemento.testo[x];
                console.log("el = ",el);
                if (el.id === id_sec){
                  el.content = selectedFileContent;
                }
              }
          }else if (item.type === "img"){
            item.elemento.imgContent = selectedFileContent;
          }else if (item.type === "svg"){
            item.elemento.svgContent = selectedFileContent;
          }else{
            item.elemento.testo = selectedFileContent;
          }
        }
      }
      console.log(contenuto);
      contenuto = [...contenuto];
    }
    function handleDropSVG(event,id) {
      event.preventDefault();
      console.log(selectedFileContent);
      for (var i = 0; i < contenuto.length; i++) {
        var item = contenuto[i];
        console.log("id = "+id);
        if (item.type != "page" && item.elemento.id === id){
          if (item.type === "img"){
            item.elemento.imgContent = selectedFileContent;
            item.elemento.selectedFile = selectedFileContent;
          }else{
            item.elemento.svgContent = selectedFileContent;
            item.elemento.selectedFile = selectedFileContent;
          };
        };
      };
      console.log(contenuto);
      contenuto = [...contenuto];
    }
    function handleDropSVG_IMG_COLUMN(event,column_id,field_id){
      event.preventDefault();
      console.log("----------------", selectedFileContent);
      for (var i = 0; i < contenuto.length; i++) {
        var item = contenuto[i];
        if (item.type != "page" && item.elemento.id === column_id){
          for (var x = 0; x < item.elemento.fields.length; x++){
            if (item.elemento.fields[x].id === field_id){
              if (item.elemento.fields[x].type === "IMG"){
                item.elemento.fields[x].imgContent = selectedFileContent;
                item.elemento.fields[x].selectedFile = selectedFileContent;
              }else{
                item.elemento.fields[x].imgContent = selectedFileContent;
                item.elemento.fields[x].selectedFile = selectedFileContent;
              };
            }
          }
        };
      };
      console.log(contenuto);
      contenuto = [...contenuto];
    };
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
    function handleDragOvernew(event) {
      event.preventDefault();
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
      for (let i = 0; i < fileListpassed.length; i++) {
        const file = fileListpassed[i];
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

  //----------------Toggle---------------------------------
    function toggle(){
      const toggleButton = document.getElementById('toggleButton');
      const container = document.getElementById('file_list');
      const destra = document.getElementById('destra');
      const elements = document.getElementById("elements");
      if (container.style.display === 'none') {
        container.style.display = 'block';
        toggleButton.style.backgroundColor =  "#8e8e8e";
        toggleButton.style.color = "white";
        destra.style["grid-template-rows"] = "46% 54%";
        elements.style["max-height"] = "41vh";
      } else {
        container.style.display = 'none';
        toggleButton.style.backgroundColor =  "var(--button-background, #f4f4f4)";
        toggleButton.style.color = "var(--button-color, #333)";
        destra.style["grid-template-rows"] = "12% 88%";
        elements.style["max-height"] = "67vh";
      };
    }

</script>
    <body>
      <div>
        {#if generatedPdfData}
        <PDFPreview pdfData = {generatedPdfData} />
        {/if}
      </div>
    <div class="container">
      <div class = "sinistra">
        <div class="cont_sinistra" id="fixedElement2">
          <h1 class="responsive-heading">{dictionary.add}:</h1>
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
      <div class = "destra" id = "destra">  
        <div class = "right1">
          <div class ="file_list" id = "file_list" style = "display: none">
            <h9>{dictionary.list_file}:</h9>
              {#if fileListpassed.length > 0}
                <div class ="list" > 
                {#each fileListpassed as file}
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
          <button id="toggleButton" on:click={() => toggle()}>Files</button>
          <div class = "separator">
          </div>
        </div>
        <div class = "elements-list" id = "elements">
        <h1>{dictionary.create_PDF}</h1>
        <form class="elements" on:submit|preventDefault={handleSubmit}>
          <div class = "cella">
            <h1>{dictionary.label_margins} <grey> ( {dictionary.label_dimensions} ).</grey></h1>
            <div class = "margini_pagina">
              <label>
                {dictionary.left}:
                <input type="number" class = "margini" bind:value={contenuto[0].pageMargins[0]} min="20" max = "290">
              </label>
              <label>
                {dictionary.top}:
                <input type="number" name = "top" class = "margini" bind:value={contenuto[0].pageMargins[1]} min="40" max = "420" on:change={HandleChangeMarginsPage}>
              </label>  
              <label>
                {dictionary.right}:
                <input type="number" class = "margini" bind:value={contenuto[0].pageMargins[2]} min="20" max = "290">
              </label>  
              <label>
                {dictionary.bottom}:
                <input type="number" name = "bottom" class = "margini" bind:value={contenuto[0].pageMargins[3]} min="40" max = "420" on:change={HandleChangeMarginsPage}> <small-grey>(pixels)</small-grey>
              </label>
            </div>
            <div class = "deafult_font">
              {dictionary.default_font}:
              <select id="default_font" bind:value={default_font}>
                <option value="">{dictionary.select}</option>
                <option value="Roboto">Roboto</option>
                <option value="RobotoSerif">RobotoSerif</option>
                <option value="Raleway">Raleway</option>
                <option value="NotoSerif">NotoSerif</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>
            <div class="dropzone lower-dropzone second" on:dragenter={(e) => handleDragEnter(e, 1)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, 1)} on:dragover={handleDragOver} id="drop_zone"></div>
          </div>
        {#each contenuto as item,i}
            {#if item.type === 'header'}
              <div class = "cella">
                <div class = "testo">
                  <h1>{dictionary.header}</h1> 
                  <button class = "rimuovi" type="button" on:click={() => removeHeader(item.elemento.id)}>{dictionary.button_remove}</button>
                </div>
                <div class= "element-header"> 
                  <div class = "cont-allignment">
                    <label> 
                      <p>{dictionary.content_header}: </p>
                    <textarea class="autosize-textarea dropzone_Text dropnew"   on:drop={(e) => handleDropFile(e,item.elemento.id,0,0)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} bind:value={item.elemento.testo} on:input={handleInput} on:input:resize={adjustTextareaHeight} id={`textareaHeader-${i}`} /> 
                    <!--<button class = "boldconverter" on:click={() => applyBold(`textareaHeader-${i}`)}>Bold</button>-->
                    </label>
                    <p>{dictionary.alignment}: </p>
                    <label> 
                      <input type="radio" bind:group={item.elemento.alignment} value="left"/> 
                      {dictionary.left}
                    </label>
                    <label> 
                      <input type="radio" bind:group={item.elemento.alignment} value="center"/> 
                      {dictionary.center}
                    </label>
                    <label> 
                      <input type="radio" bind:group={item.elemento.alignment} value="right"/> 
                      {dictionary.right}
                    </label>
                  </div>
                  <div class = "style-margin">
                    <div class = "style&fontsize">
                      <div class ="style">
                        <label> 
                          <p>{dictionary.style}:</p>
                          <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                          <select id="style-select_header" bind:value={item.elemento.style} name="style-option" on:change={(e) => ChangeFontandFillHeader(e, item.elemento.id)}>  
                            <option value="normal"> Default </option>
                            <option value="header" > Header</option>
                            <option value="subheader">SubHeader</option>
                            <option value="quote">Quote</option>
                            <option value="small">Small</option>
                          </select>
                        </label>
                      </div>
                      <div class ="font">
                        <label for="font_header">Font:</label>
                        <select id="font_header" bind:value={item.elemento.font}  on:change={(e) => handleChangeFont(e, item.elemento.id)}>
                            <option value="">{dictionary.select}</option>
                            <option value="Roboto">Roboto</option>
                            <option value="RobotoSerif">RobotoSerif</option>
                            <option value="Raleway">Raleway</option>
                            <option value="NotoSerif">NotoSerif</option>
                            <option value="Montserrat">Montserrat</option>
                        </select>
                      </div>
                      <div class ="fontsize">
                        <label for="fontsizes-header"><p>{dictionary.fontsize}:</p></label>
                        <select id="fontsizes-header" bind:value={item.elemento.fontsize}  on:change={(e) => handleChangeFontSize(e, item.elemento.id)}>
                          <option value="">{dictionary.select}</option>
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
                      <p>{dictionary.margins}:</p>
                      <label>
                        {dictionary.left}:
                        <input type="number" bind:value={item.elemento.margin.left} min="20" max = "595"/> 
                      </label>
                      <label>
                        {dictionary.right}:
                        <input type="number" bind:value={item.elemento.margin.right} min="20" max = "595"/> 
                      </label>
                      <label>
                        {dictionary.top}:
                        <input type="number" bind:value={item.elemento.margin.top} min="20" max={topMarginValue - 15}  on:change={(e) => ChangeFontsizeonMarginHeader()}/> 
                      </label>
                      <!--<label>
                        Sotto:
                        <input type="number" bind:value={item.elemento.margin.bottom} min="0" max = {bottomMarginValue - 15}/> 
                      </label>-->
                    </div>
                    <div class = "preview_height">
                      <p>{dictionary.words_preview}:</p>
                      <input type="number" bind:value = {item.elemento.test_text} min="1" /> 
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
                  <h1>{dictionary.label_footer}</h1><button  class = "rimuovi" type="button" on:click={() => removeFooter(item.elemento.id)}>Rimuovi</button>
                </div>
                <div class= "element-header"> 
                  <div class = "cont-allignment">
                    <label> 
                      <p>{dictionary.content_footer}: </p>
                      <textarea class="autosize-textarea dropzone_Text dropnew" bind:value={item.elemento.testo} on:input={handleInput} on:input:resize={adjustTextareaHeight} on:drop={(e) => handleDropFile(e,item.elemento.id,0,0)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} /> 
                    </label>
                    <p>{dictionary.alignment}: </p>
                    <label> 
                    <input type="radio" bind:group={item.elemento.alignment} value="left"/> 
                    {dictionary.left}
                    </label>
                    <label> 
                      <input type="radio" bind:group={item.elemento.alignment} value="center"/> 
                      {dictionary.center}
                    </label>
                    <label> 
                      <input type="radio" bind:group={item.elemento.alignment} value="right"/> 
                      {dictionary.right}
                    </label>
                  </div>
                  <div class = "style-margin">
                    <div class = "style&fontsize">
                      <div class ="style">
                        <label> 
                          <p>{dictionary.style}:</p>
                          <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                          <select id="style-select_footer" bind:value={item.elemento.style} name="style-option" on:change={(e) => ChangeFontandFillHeader(e, item.elemento.id)}>  
                            <option value="normal"> Default </option>
                            <option value="header" > Header</option>
                            <option value="subheader">SubHeader</option>
                            <option value="quote">Quote</option>
                            <option value="small">Small</option>
                          </select>
                        </label>
                      </div>
                      <div class ="font">
                        <label for="font_footer">Font:</label>
                        <select id="font_footer" bind:value={item.elemento.font}  on:change={(e) => handleChangeFont(e, item.elemento.id)}>
                            <option value="">{dictionary.select}</option>
                            <option value="Roboto">Roboto</option>
                            <option value="RobotoSerif">RobotoSerif</option>
                            <option value="Raleway">Raleway</option>
                            <option value="NotoSerif">NotoSerif</option>
                            <option value="Montserrat">Montserrat</option>
                        </select>
                      </div>
                      <div class ="fontsize">
                        <label for="fontsizes-footer"><p>{dictionary.fontsize}:</p></label>
                        <select id="fontsizes-footer" bind:value={item.elemento.fontsize}  on:change={(e) => handleChangeFontSize(e, item.elemento.id)}>
                            <option value="">{dictionary.select}</option>
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
                      <p>{dictionary.margins}:</p>
                      <label>
                        {dictionary.left}:
                        <input type="number" bind:value={item.elemento.margin.left} min="20" max = "595"/> 
                      </label>
                      <label>
                        {dictionary.right}:
                        <input type="number" bind:value={item.elemento.margin.right} min="20" max = "595"/> 
                      </label>
                      <label>
                        {dictionary.top}:
                        <input type="number" bind:value={item.elemento.margin.top} min="0" max = {bottomMarginValue -15} /> 
                      </label>
                      <!--<label>
                        {dictionary.bottom}:
                        <input type="number" bind:value={item.elemento.margin.bottom} min="20" max = {bottomMarginValue -15}/> 
                      </label>-->
                    </div>
                    <div class = "preview_height">
                      <p>{dictionary.words_preview}:</p>
                      <input type="number" bind:value = {item.elemento.test_text} min="1" /> 
                    </div>
                    <div class = "page_counter">
                      <label>
                        <input type="checkbox" bind:checked={item.elemento.page_counter} value = false />
                        {dictionary.page_counter}     <small-grey>({dictionary.page_counter_info})</small-grey>
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
                  <h1>{dictionary.label_text}</h1><button  class = "rimuovi" type="button" on:click={() => removeField(item.elemento.id)}>{dictionary.button_remove}</button>
                </div>
                  <div class= "element">
                    <div class = "contenuto_field">
                        <p>{dictionary.content} :<small-grey> ({dictionary.new_line})</small-grey></p> 
                        <textarea class="autosize-textarea dropzone_Text" bind:value={item.elemento.content} on:input={handleInput} on:input:resize={adjustTextareaHeight} on:drop={(e) => handleDropFile(e,item.elemento.id,0,0)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} /> 
                    </div>
                    
                      <div class = "style&tipo">
                        <div class ="style">
                          <label> 
                            <p>{dictionary.style}:</p>
                            <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                            <select id="style-select_field" bind:value={item.elemento.selectedstyle} name="style-option" on:change={(e) => ChangeFontandFill(e, item.elemento.id)}>  
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
                      </div>
                      <div class = "pbreak">
                        {dictionary.page_break}:
                        <label>
                          <input type="radio" bind:group={item.elemento.pagebreak} value="before" />
                          {dictionary.before}
                        </label>
                        <label>
                          <input type="radio" bind:group={item.elemento.pagebreak} value="after" />
                          {dictionary.after}
                        </label>
                        <label>
                          <input type="radio" bind:group={item.elemento.pagebreak} value="" />
                          {dictionary.none}
                        </label>
                      </div>
                      <div class = "f&f_size">
                        <div class ="font">
                          <label for="font">Font:</label>
                          <select id="font" bind:value={item.elemento.selectedfont}  on:change={(e) => handleChangeFont(e, item.elemento.id)}>
                              <option value="">{dictionary.select}</option>
                              <option value="Roboto">Roboto</option>
                              <option value="RobotoSerif">RobotoSerif</option>
                              <option value="Raleway">Raleway</option>
                              <option value="NotoSerif">NotoSerif</option>
							                <option value="Montserrat">Montserrat</option>
                          </select>
                        </div>
                        <div class ="fontsize">
                          <label for="fontsizes"><p>{dictionary.fontsize}:</p></label>
                          <select id="fontsizes" bind:value={item.elemento.selectedfontsize}  on:change={(e) => handleChangeFontSize(e, item.elemento.id)}>
                              <option value="">{dictionary.select}</option>
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
                      <div class = "preview_height">
                        <p>{dictionary.words_preview}:</p>
                        <input type="number" bind:value = {item.elemento.test_text} min="1" /> 
                      </div>
                    
                    <div class = "field_indice">
                      <label>
                        <h2> {dictionary.bind_index}: </h2>
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
                  <h2>{dictionary.label_row}</h2><button  class = "rimuovi" type="button" on:click={() => removeRow(item.elemento.id)}>{dictionary.button_remove}</button>
                </div>
              </div>
            {:else if item.type === 'column'}
              <div class = "cella">
                <div class = "testo">
                  <h1>{dictionary.columns_container}</h1><button  class = "rimuovi" type="button" on:click={() => removeColumn(item.elemento.id)}>{dictionary.button_remove}</button>
                </div>
                  <div class="element">
                    <div class = "distanza">
                      <label> 
                        {dictionary.column_gap}: 
                        <input type="number" bind:value={item.gap}/> px
                      </label>
                    </div>
                    <div class = "alignment">
                      <p>{dictionary.alignment}: </p>
                      <label> 
                      <input type="radio" bind:group={item.alignment} value="left"/> 
                      {dictionary.left}
                      </label>
                      <label> 
                        <input type="radio" bind:group={item.alignment} value="center"/> 
                        {dictionary.center}
                      </label>
                      <label> 
                        <input type="radio" bind:group={item.alignment} value="right"/> 
                        {dictionary.right}
                      </label>
                    </div>

                    {#each item.elemento.fields as field,x}  
                      {#if field.type === "field"}
                        <div class = "cella">
                        <div class = "testo">
                          <h2>{dictionary.label_column} {x+1}</h2><button class = "rimuovi" type="button" on:click={() => removeFieldFromColumn(item.elemento.id,field.id)}>{dictionary.button_remove_column}</button>
                        </div>   
                          <div class="element">  
                            <div class = "contenuto_field">
                              <!-- svelte-ignore a11y-label-has-associated-control -->
                              <label> 
                                <p>{dictionary.content}: </p><small-grey> ({dictionary.new_line})</small-grey>
                              </label>
                              <textarea class="autosize-textarea dropzone_Text drop2" bind:value={field.content} on:input={handleInput} on:input:resize={adjustTextareaHeight} on:drop={(e) => handleDropFile(e,item.elemento.id,field.id,0)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} /> 
                            </div>
                            <div class = "specifiche">
                              <div class = "style&tipo">
                                <div class ="style">
                                  <label> 
                                    <p>{dictionary.style}:</p>
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
                                  {dictionary.page_break}:
                                  <label>
                                    <input type="radio" bind:group={item.elemento.pagebreak} value="before" />
                                    {dictionary.before}
                                  </label>
                                  <label>
                                    <input type="radio" bind:group={item.elemento.pagebreak} value="after" />
                                    {dictionary.after}
                                  </label>
                                  <label>
                                    <input type="radio" bind:group={item.elemento.pagebreak} value="" />
                                    {dictionary.none}
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div class = "f&f_size">
                              <div class ="font">
                                <label for="font">Font:</label>
                                <select id="font" bind:value={field.selectedfont}  on:change={(e) => handleChangeFont(e, item.elemento.id)}>
                                  <option value="">{dictionary.select}</option>
                                  <option value="Roboto">Roboto</option>
                                  <option value="RobotoSerif">RobotoSerif</option>
                                  <option value="Raleway">Raleway</option>
                                  <option value="NotoSerif">NotoSerif</option>
                                  <option value="Montserrat">Montserrat</option>
                                </select>
                              </div>
                              <div class ="fontsize">
                                <label for="fontsizes"><p> {dictionary.fontsize}:</p></label>
                                <select id="fontsizes" bind:value={field.selectedfontsize}  on:change={(e) => handleChangeFontSize(e, item.elemento.id)}>
                                  <option value="">{dictionary.select}</option>
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
                                {dictionary.width_auto}
                              </label>
                              <label>
                                <input type="radio" bind:group={field.width} value="*" />
                                {dictionary.width_fill}
                              </label>
                              <label class ="labellarghezza">
                                <input type="radio" bind:group={field.width} value="custom"/>
                                <p>{dictionary.width} :</p>
                                <input id = "1" type="number" bind:value={field.width}>
                              </label>
                            </div>
                          </div>
                          <div class = "preview_height">
                            <p>{dictionary.words_preview}:</p>
                            <input type="number" bind:value = {field.test_text} min="1" /> 
                          </div>
                        </div>
                      {:else if field.type === "IMG"}
                        <div class = "cella">
                          <div class = "testo">
                            <h2>{dictionary.label_column} {x+1}</h2><button class = "rimuovi" type="button" on:click={() => removeFieldFromColumn(item.elemento.id,field.id)}>{dictionary.button_remove_column}</button>
                          </div>  
                          <div class="svg-element">
                            <!--<div class = "placeHolderSVG"> {field.imgContent}</div>-->
                            <!--<div class="svgArea dropzone_Text" on:drop={(e) => handleDropSVG_IMG_COLUMN(e,item.elemento.id,field.id)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} />-->
                            <!-- svelte-ignore missing-declaration -->
                            <!--<input  class = "custom-file-input" type="file" accept=".jpg , .png" on:change={handleFileIMGChange(event,field.id)} />-->
                            <textarea class="autosize-textarea dropzone_Text drop2" bind:value={field.imgContent} on:input={handleInput} on:input:resize={adjustTextareaHeight} on:drop={(e) => handleDropSVG_IMG_COLUMN(e,item.elemento.id,field.id)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} /> 
                            <h2>{dictionary.dimensions}:</h2>
                            <div class = "dimensioni_svg">
                              <label2>
                                <input type= "radio" bind:group={field.isMaxDimensionsSelected} on:change={handleDimensionChange_IMG(event,field.id)} value = "true">
                                {dictionary.max_dimensions}<small-grey2>({dictionary.fill_expl})</small-grey2>
                              </label2>
                              <div class = {"dim_max_img" + field.id}>
                                <div class = "dimensioni">
                                  <label7>
                                    {dictionary.max_width}:
                                    <input type = "number" bind:value = {field.larghezza_fit} min = 10 max = 595>
                                  </label7>
                                  <label7>
                                    {dictionary.max_height}:
                                    <input type = "number" bind:value = {field.altezza_fit} min = 10 max = 841 >
                                  </label7>
                                </div>
                              </div>
                              <label2>
                                <input type= "radio" bind:group={field.isMaxDimensionsSelected} on:change={handleDimensionChange_IMG(event,field.id)} value = "false">
                                {dictionary.abs_dimensions}<small-grey2>({dictionary.abs_expl})</small-grey2>
                              </label2>
                              <div class = {"dim_abs_img" + field.id}>
                                <div class = "dimensioni">
                                  <label7>
                                    {dictionary.width}:
                                    <input type = "number" bind:value = {field.larghezza} min = 10 max = 595>
                                  </label7>
                                  <label7>
                                    {dictionary.height}:
                                    <input type = "number" bind:value = {field.altezza} min = 10 max = 841 >
                                  </label7>
                                </div>
                              </div>
                              <div class = "posizione">
                                <p>{dictionary.alignment}: </p>
                                <label> 
                                  <input type="radio" bind:group={field.alignment} value="left"/> 
                                  {dictionary.left}
                                </label>
                                <label> 
                                  <input type="radio" bind:group={field.alignment} value="center"/> 
                                  {dictionary.center}
                                </label>
                                <label> 
                                  <input type="radio" bind:group={field.alignment} value="right"/> 
                                  {dictionary.right}
                                </label>    
                              </div>
                              <h2>{dictionary.img_margins}:</h2>
                              <div class = "margini_pagina">
                                {dictionary.left}:
                                <input type="number" class = "marginiIMG" bind:value={field.imgMargins[0]} oninput="HandleMarginiIMG()" min = 0 max = 595 >
                                {dictionary.top}:
                                <input type="number" class = "marginiIMG" bind:value={field.imgMargins[1]} oninput="HandleMarginiIMG()" min = 0 max = 841>
                                {dictionary.right}:
                                <input type="number" class = "marginiIMG" bind:value={field.imgMargins[2]} oninput="HandleMarginiIMG()" min = 0 max = 595>
                                {dictionary.bottom}:
                                <input type="number" class = "marginiIMG" bind:value={field.imgMargins[3]} oninput="HandleMarginiIMG()" min = 0 max = 841>
                              </div>
                            </div>
                          </div>
                        </div>
                      {:else if field.type === "SVG"}
                        <div class = "cella">
                          <div class = "testo">
                            <h2>{dictionary.label_column} {x+1}</h2><button class = "rimuovi" type="button" on:click={() => removeFieldFromColumn(item.elemento.id,field.id)}>{dictionary.button_remove_column}</button>
                          </div>  
                          <div class="svg-element">
                            <!--<div class = "placeHolderSVG"> {field.imgContent}</div>-->
                            <!---<div class="svgArea dropzone_Text" on:drop={(e) => handleDropSVG_IMG_COLUMN(e,item.elemento.id,field.id)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} />-->
                            <!-- svelte-ignore missing-declaration -->
                            <!-- <input  class = "custom-file-input" type="file" accept=".svg" on:change={handleFileSVGChange(event,field.id)} />-->
                            <textarea class="autosize-textarea dropzone_Text drop2" bind:value={field.imgContent} on:input={handleInput} on:input:resize={adjustTextareaHeight} on:drop={(e) => handleDropSVG_IMG_COLUMN(e,item.elemento.id,field.id)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} /> 
                            <h2>{dictionary.dimensions}:</h2>
                            <div class = "dimensioni_svg">
                              <label2>
                                <input type= "radio" bind:group={field.isMaxDimensionsSelected} on:change={handleDimensionChange_IMG(event,field.id)} value = "true">
                                {dictionary.max_dimensions}<small-grey2>({dictionary.fill_expl})</small-grey2>
                              </label2>
                              <div class = {"dim_max_img" + field.id}>
                                <div class = "dimensioni">
                                  <label7>
                                    {dictionary.max_width}:
                                    <input type = "number" bind:value = {field.larghezza_fit} min = 10 max = 595>
                                  </label7>
                                  <label7>
                                    {dictionary.max_height}:
                                    <input type = "number" bind:value = {field.altezza_fit} min = 10 max = 841 >
                                  </label7>
                                </div>
                              </div>
                              <label2>
                                <input type= "radio" bind:group={field.isMaxDimensionsSelected} on:change={handleDimensionChange_IMG(event,field.id)} value = "false">
                                {dictionary.abs_dimensions}<small-grey2>({dictionary.abs_expl})</small-grey2>
                              </label2>
                              <div class = {"dim_abs_img" + field.id}>
                                <div class = "dimensioni">
                                  <label7>
                                    {dictionary.width}:
                                    <input type = "number" bind:value = {field.larghezza} min = 10 max = 595>
                                  </label7>
                                  <label7>
                                    {dictionary.height}:
                                    <input type = "number" bind:value = {field.altezza} min = 10 max = 841 >
                                  </label7>
                                </div>
                              </div>
                              <div class = "posizione">
                                <p>{dictionary.alignment}: </p>
                                <label> 
                                  <input type="radio" bind:group={field.alignment} value="left"/> 
                                  {dictionary.left}
                                </label>
                                <label> 
                                  <input type="radio" bind:group={field.alignment} value="center"/> 
                                  {dictionary.center}
                                </label>
                                <label> 
                                  <input type="radio" bind:group={field.alignment} value="right"/> 
                                  {dictionary.right}
                                </label>    
                              </div>
                              <h2>{dictionary.svg_margins}:</h2>
                              <div class = "margini_pagina">
                                {dictionary.left}:
                                <input type="number" class = "marginiIMG" bind:value={field.imgMargins[0]} oninput="HandleMarginiIMG()" min = 0 max = 595 >
                                {dictionary.top}:
                                <input type="number" class = "marginiIMG" bind:value={field.imgMargins[1]} oninput="HandleMarginiIMG()" min = 0 max = 841>
                                {dictionary.right}:
                                <input type="number" class = "marginiIMG" bind:value={field.imgMargins[2]} oninput="HandleMarginiIMG()" min = 0 max = 595>
                                {dictionary.bottom}:
                                <input type="number" class = "marginiIMG" bind:value={field.imgMargins[3]} oninput="HandleMarginiIMG()" min = 0 max = 841>
                              </div>
                            </div>
                          </div>
                        </div>
                      {/if}
                      {/each}
                    <div class ="bottonicolonne">
                      <button class = "bottonecolonna" type="button" on:click={() => addFieldtoColumn(item.elemento.id)}>{dictionary.add_text}</button>
                      <button class = "bottonecolonna" type="button" on:click={() => addIMGtoColumn(item.elemento.id)}>{dictionary.add_img}</button>
                      <button class = "bottonecolonna" type="button" on:click={() => addSVGtoColumn(item.elemento.id)}>{dictionary.add_svg}</button>
                    </div>
                  </div>
                <div class="dropzone upper-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
                <div class="dropzone lower-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
              </div>
            {:else if item.type === 'table'}
              <div class = "cella">
                <div class = "testo">
                  <h1>{dictionary.label_table}</h1><button  class = "rimuovi-riga" type="button" on:click={() => removeTable(item.elemento.id)}>{dictionary.button_remove_table}</button>
                </div>
                <div class="tabella-element">
                  <h2>{dictionary.layout}</h2>
                  <div class = "layout">
                    <label>
                      <input type="radio" bind:group={item.elemento.layout} value="Custom" on:change = {HandleChangeLayoutTab(event,item.elemento.id)} />
                      {dictionary.border}
                    </label>
                    <label>
                      <input type="radio" bind:group={item.elemento.layout} value="noBorders" on:change = {HandleChangeLayoutTab(event,item.elemento.id)}/>
                      {dictionary.no_border}
                    </label>
                    <!--<label>
                      <input type="radio" bind:group={item.elemento.layout} value="headerLineOnly" />
                      Bordo solo per l'header
                    </label>-->
                    <label>
                      <input type="radio" bind:group={item.elemento.layout} value="lightHorizontalLines"on:change = {HandleChangeLayoutTab(event,item.elemento.id)}/>
                      {dictionary.horizontal_lines}
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
                      {dictionary.page_break}:
                      <label>
                        <input type="radio" bind:group={item.elemento.pagebreak} value="before" />
                        {dictionary.before}
                      </label>
                      <label>
                        <input type="radio" bind:group={item.elemento.pagebreak} value="after" />
                        {dictionary.after}
                      </label>
                      <label>
                        <input type="radio" bind:group={item.elemento.pagebreak} value="" />
                        {dictionary.none}
                      </label>
                    </div>
                  </div>
                  <div class = "f&f_size">
                    <div class ="font">
                      <label for="font">Font:</label>
                      <select id="font" bind:value={item.elemento.font}  on:change={(e) => handleChangeFont(e, item.elemento.id)}>
                          <option value="">{dictionary.select}</option>
                          <option value="Roboto">Roboto</option>
                          <option value="RobotoSerif">RobotoSerif</option>
                          <option value="Raleway">Raleway</option>
                          <option value="NotoSerif">NotoSerif</option>
                          <option value="Montserrat">Montserrat</option>
                      </select>
                    </div>
                    <div class ="fontsize">
                      <label for="fontsizes"><p>{dictionary.fontsize}:</p></label>
                      <select id="fontsizes" bind:value={item.elemento.fontsize}  on:change={(e) => handleChangeFontSize(e, item.elemento.id)}>
                          <option value="">{dictionary.select}</option>
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
                    <!--<div class="element-campi">  
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
                                  <textarea class="autosize-textarea dropzone_Text dropnew nomi_colonne"   on:drop={(e) => handleDropFile(e,item.elemento.id,field.id,i)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} bind:value={field.testo[i]} on:input={handleInput} on:input:resize={adjustTextareaHeight} />
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
                              <div class = "preview_height">
                                <p>Numero di parole approssimativo per la preview:</p>
                                <input type="number" bind:value = {field.test_text[i]} min="1" /> 
                              </div>
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
                                      <textarea class="autosize-textarea dropzone_Text dropnew "   on:drop={(e) => handleDropFile(e,item.elemento.id,field.id,i)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} bind:value={field.testo[i]} on:input={handleInput} on:input:resize={adjustTextareaHeight} />
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
                                    <div class = "preview_height">
                                      <p>Numero di parole approssimativo per la preview:</p>
                                      <input type="number" bind:value = {field.test_text[i]} min="1" /> 
                                    </div>
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
                  -->
                      {#if field.type === "campo"}
                      <div class ="altezza">
                        <label>
                          {dictionary.height_table}:
                        </label>
                        <label>
                          <input type="radio" bind:group={field.tipoaltezza_riga} value="auto" on:change={HandleChangeAltezzaColonna(event,field.id)} />
                          {dictionary.auto_height}
                        </label>
                        <label>
                          <input type="radio" bind:group={field.tipoaltezza_riga} value="custom" on:change={HandleChangeAltezzaColonna(event,field.id)}/>
                          <p>{dictionary.height} :</p>
                          <input id = {field.id} class="altezza_colonna" type="number" bind:value={field.altezza_riga} min = 2 disabled>
                        </label>
                      </div>
                      <div class = "colore_tabella">
                        <label class ="label3"> 
                          {dictionary.table_ch_color}
                          <input type="color" bind:value={item.elemento.color}/> 
                        </label>
                        <label class ="label3"> 
                          {dictionary.table_bg_color}
                          <input type="color" bind:value={item.elemento.bgcolor}/> 
                        </label>
                      </div>
                      {dictionary.attributes}
                      <div class = "attributes&addcolonna">
                        <div class = "attributes_container">
                          {#each [...Array(field.numero)] as _, index}
                          <input class ="table_cell" type= "text" on:click = {(e) => addSettings(e,item.elemento.id,field.id,index)} on:drop={(e) => handleDropFile(e,item.elemento.id,field.id,index)} on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} bind:value={field.testo[index]} />
                          {/each}
                        </div>
                        <div class ="add&remove">
                          <button  class = "aggiungi-colonna" type="button" on:click={() => addColonna(item.elemento.id)}>{dictionary.add_column}</button>
                          <button  class = "aggiungi-colonna" type="button" on:click={() => removeColonna(item.elemento.id)}>{dictionary.button_remove_column}</button>
                        </div>
                      </div>
                        {#if field.settings[0] != -1 && field.settings[2] === "campo"}
                          <div class = "settings">
                            {dictionary.details}
                            <div class= "larghezza">
                              <label>
                                <input id={"auto" + field.id} type="radio" bind:group={field.larghezza_colonne[indice_settings]} value="auto" on:change={HandleChangeLarghezzaColonna(event, field.id, indice_settings)}/>
                                {dictionary.auto_width}
                              </label>
                              <label>
                                <input id={"custom" + field.id} type="radio" value="custom" on:change={HandleChangeLarghezzaColonna(event, field.id,indice_settings)}/>
                                <p>{dictionary.width} :</p>
                                <input id={field.id + "/" + indice_settings} class="larghezza_colonna" type="number" bind:value={field.larghezza_colonne[indice_settings]}/>
                              </label>
                           </div>
                            <div class = "span&color">
                              <label class = "label"> 
                                {dictionary.cells}: 
                              <input type="number" bind:value={field.colspan[indice_settings]}/> 
                              </label>
                              <label class ="label"> 
                                {dictionary.cells_color}: 
                              <input type="color" bind:value={field.fillcolor[indice_settings]}/> 
                              </label>
                            </div>
                            <label class ="label5"> 
                              {dictionary.borders}: 
                              <input class = "border{item.elemento.id}" type="checkbox" bind:checked={field.borders.left[indice_settings]} > 
                              {dictionary.left}
                              <input class = "border{item.elemento.id}" type="checkbox" bind:checked={field.borders.top[indice_settings]} > 
                              {dictionary.top}
                              <input class = "border{item.elemento.id}" type="checkbox" bind:checked={field.borders.right[indice_settings]}>
                              {dictionary.right}
                              <input class = "border{item.elemento.id}" type="checkbox" bind:checked={field.borders.bottom[indice_settings]}>
                              {dictionary.bottom}
                            </label>
                            <label class ="label5"> 
                              {dictionary.alignment}: 
                              <input type="radio" bind:group={field.alignments[indice_settings]} value = "left"/> 
                              {dictionary.left}
                                <input type="radio" bind:group={field.alignments[indice_settings]} value = "center"/> 
                                {dictionary.center}
                                <input type="radio" bind:group={field.alignments[indice_settings]} value = "right"/> 
                                {dictionary.right}
                            </label>
                            <div class = "preview_height">
                              <p>{dictionary.words_preview}:</p>
                              <input type="number" bind:value = {field.test_text[indice_settings]} min="1" /> 
                            </div>
                          </div>
                        {/if}
                      {:else if field.type === "contenuto_campi"}
                      {dictionary.row} {field.id_riga}
                      <div class = "content&addriga">
                        <div class = "content_container">
                          {#each [...Array(item.elemento.contenuto_t[0].numero)] as _, index}
                          <input class ="table_cell" type= "text" on:click = {(e) => addSettings(e,item.elemento.id,field.id,index)} on:drop={(e) => handleDropFile(e,item.elemento.id,field.id,index)} on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} bind:value={field.testo[index]} />
                          {/each}
                        </div> 
                        <button class = "rimuovi-riga" type="button" on:click={() => removeRiga(item.elemento.id,field.id)}>{dictionary.button_remove_row}</button>   
                        {#if item.elemento.contenuto_t[0].settings[0] != -1 && item.elemento.contenuto_t[0].settings[2] === "contenuto_campi" && item.elemento.contenuto_t[0].settings[1] === field.id}
                        <div class = "settings" >
                          {dictionary.details}:
                          <div class = "span&color">
                            <label class = "label"> 
                              {dictionary.cells}: 
                            <input type="number" bind:value={field.colspan[indice_settings]}/> 
                            </label>
                            <label class ="label"> 
                              {dictionary.cells_color}: 
                            <input type="color" bind:value={field.fillcolor[indice_settings]}/> 
                            </label>
                          </div>
                          <label class ="label5"> 
                            {dictionary.borders}: 
                            <input class = "border{item.elemento.id}" type="checkbox" bind:checked={field.borders.left[indice_settings]} > 
                            {dictionary.left}
                            <input class = "border{item.elemento.id}" type="checkbox" bind:checked={field.borders.top[indice_settings]} > 
                            {dictionary.top}
                            <input class = "border{item.elemento.id}" type="checkbox" bind:checked={field.borders.right[indice_settings]}>
                            {dictionary.right}
                            <input class = "border{item.elemento.id}" type="checkbox" bind:checked={field.borders.bottom[indice_settings]}>
                            {dictionary.below}
                          </label>
                          <label class ="label5"> 
                            {dictionary.alignment}: 
                            <input type="radio" bind:group={field.alignments[indice_settings]} value = "left"/> 
                            {dictionary.left}
                              <input type="radio" bind:group={field.alignments[indice_settings]} value = "center"/> 
                              {dictionary.center}
                              <input type="radio" bind:group={field.alignments[indice_settings]} value = "right"/> 
                              {dictionary.right}
                          </label>
                          <div class = "preview_height">
                            <p>{dictionary.words_preview}:</p>
                            <input type="number" bind:value = {field.test_text[indice_settings]} min="1" /> 
                          </div>
                        </div>
                        {/if}
                      </div>             
                      {/if}
                  {/each}
                  <button  class = "aggiungi-riga" type="button" on:click={() => addRiga(item.elemento.id)}>{dictionary.add_row}</button>    
                </div>
                <div class="dropzone upper-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
                <div class="dropzone lower-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
              </div>
            {:else if item.type === 'list'}
              <div class = "cella">
                <div class = "testo">
                  <h1>{dictionary.label_list} </h1><button class = "rimuovi" type="button" on:click={() => removeList(item.elemento.id)}>Rimuovi</button>
                </div>
                <div class="list-element">
                  <div class = "stile_colore">
                    <div class ="style">
                      <label> 
                        <p>{dictionary.style}:</p>
                        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                        <select id="style-select_list" bind:value={item.elemento.style} name="style-option">  
                          <option value="normal" > Default </option>
                          <option value="header" > Header</option>
                          <option value="subheader">SubHeader</option>
                          <option value="quote">Quote</option>
                          <option value="small">Small</option>
                        </select>
                      </label>
                    </div>
                    
                    <div class = "colore">
                      <label class ="label3"> 
                        {dictionary.color}: 
                        <input type="color" bind:value={item.elemento.color}/> 
                      </label>
                      <label class ="label3"> 
                        {dictionary.pointer_color}: 
                        <input type="color" bind:value={item.elemento.markerColor}/> 
                      </label>
                    </div>
                  </div>
                  <div class = "f&f_size">
                    <div class ="font">
                      <label for="font">Font:</label>
                      <select id="font" bind:value={item.elemento.font}  on:change={(e) => handleChangeFont(e, item.elemento.id)}>
                          <option value="">{dictionary.select}</option>
                          <option value="Roboto">Roboto</option>
                          <option value="RobotoSerif">RobotoSerif</option>
                          <option value="Raleway">Raleway</option>
                          <option value="NotoSerif">NotoSerif</option>
                          <option value="Montserrat">Montserrat</option>
                      </select>
                    </div>
                    <div class ="fontsize">
                      <label for="fontsizes"><p>{dictionary.fontsize}:</p></label>
                      <select id="fontsizes" bind:value={item.elemento.fontsize}  on:change={(e) => handleChangeFontSize(e, item.elemento.id)}>
                          <option value="">{dictionary.select}</option>
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
                  <div class = "ordine">
                    <div class = "list_left1">
                      <label>
                        <input type="radio" bind:group={item.elemento.tipo} value="ol" on:change={disableRadioButtons(event,item.elemento.id)}/>
                        {dictionary.ordered}
                      </label>
                    </div>
                    <div class = "list-right1">
                      <label>
                        <input type="radio" bind:group={item.elemento.tipo} value="ul" on:change={disableRadioButtons(event,item.elemento.id)} />
                        {dictionary.unordered}
                      </label>
                    </div>
                  </div>
                  <div class = "stileNumeri">
                    <div class = "list_left_cont">
                      <div class = {"list_left"  + item.elemento.id}>
                        <label>
                          <input class = {"style_index_list" + item.elemento.id} type="radio" bind:group={item.elemento.pointer} value="numbers" />
                          {dictionary.numbers}
                        </label>
                        <label>
                          <input class = {"style_index_list" + item.elemento.id} type="radio" bind:group={item.elemento.pointer} value="lower-roman" />
                          {dictionary.numbers_roman_small}
                        </label>
                        <label>
                          <input class = {"style_index_list" + item.elemento.id} type="radio" bind:group={item.elemento.pointer} value="lower-alpha" />
                          {dictionary.letters_small}
                        </label>
                        <label>
                          <input class = {"style_index_list" + item.elemento.id} type="radio" bind:group={item.elemento.pointer} value="upper-roman" />
                          {dictionary.numbers_roman_big}
                        </label>
                        <label>
                          <input class = {"style_index_list" + item.elemento.id} type="radio" bind:group={item.elemento.pointer} value="upper-alpha" />
                          {dictionary.letters_small}
                        </label>
                      </div>
                    </div>
                    <div class = "list_right_cont">
                      <div class = {"list_right"  + item.elemento.id}>
                        <label>
                          <input class = {"style_pointer_list" + item.elemento.id} type="radio" bind:group={item.elemento.pointer} value="circle" />
                          {dictionary.circle}
                        </label>
                        <label>
                          <input class = {"style_pointer_list" + item.elemento.id} type="radio" bind:group={item.elemento.pointer} value="square" />
                          {dictionary.square}
                        </label>
                      </div>
                    </div>
                  </div>
                  {#each item.elemento.testo as field,i2}  
                  <div class="contenutolista">
                    <label class ="label7"> 
                      {dictionary.content_row} {i2+1} : 
                      <textarea class="autosize-textarea dropzone_Text dropnew"   on:drop={(e) => handleDropFile(e,item.elemento.id,field.id,0)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} bind:value={field.content} on:input={handleInput} on:input:resize={adjustTextareaHeight} />
                    </label>
                    <button class = "rimuovi_riga" type="button" on:click={() => removeFieldFromList(item.elemento.id,field.id)}>Rimuovi</button>
                  </div> 
                  <div class = "preview_height">
                    <p>{dictionary.words_preview}:</p>
                    <input type="number" bind:value = {field.test_text} min="1" /> 
                  </div>
                  {/each}       
                <button class = "aggiungi-riga" type="button" on:click={() => addFieldtoList(item.elemento.id)}>{dictionary.add_row}</button>
                </div>
                <div class="dropzone upper-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
                <div class="dropzone lower-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
              </div>
            {:else if item.type === 'svg'}
              <div class = "cella">
                <div class = "testo">
                  <h1>{dictionary.label_svg} </h1>  <button class = "rimuovi" type="button" on:click={() => removeSVG(item.elemento.id)}>{dictionary.button_remove}</button>
                </div>
                <div class="svg-element">
                  <!--<div class = "placeHolderSVG"> {item.elemento.svgContent}</div>-->
                  <!--<div class="svgArea dropzone_Text" on:drop={(e) => handleDropSVG(e,item.elemento.id)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} />-->
                  <!-- svelte-ignore missing-declaration -->       
                    <!--<input class = "custom-file-input" type="file" accept=".svg" on:change={handleFileSVGChange(event,item.elemento.id)} />-->
                    <textarea class="autosize-textarea dropzone_Text drop2" bind:value={item.elemento.svgContent} on:input={handleInput} on:input:resize={adjustTextareaHeight} on:drop={(e) => handleDropFile(e,item.elemento.id,0,0)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} /> 
                  <h2>{dictionary.dimensions}:</h2>
                  <div class = "dimensioni_svg">
                    <label2>
                      <input type= "radio" bind:group={item.elemento.isMaxDimensionsSelected} on:change={handleDimensionChange_SVG(event,item.elemento.id)} value = "true">
                      {dictionary.max_dimensions}<small-grey2>({dictionary.fill_expl})</small-grey2>
                    </label2>
                    <div class = {"dim_max" + item.elemento.id}>
                      <div class = "dimensioni">
                        <label7>
                          {dictionary.max_width}:
                          <input type = "number" bind:value = {item.elemento.larghezza_fit} min = 10 max = 595 >
                        </label7>
                        <label7>
                          {dictionary.max_height}:
                          <input type = "number" bind:value = {item.elemento.altezza_fit} min = 10 max = 841 >
                        </label7>
                      </div>
                    </div>
                    <label2>
                      <input type= "radio" bind:group={item.elemento.isMaxDimensionsSelected} on:change={handleDimensionChange_SVG(event,item.elemento.id)} value = "false">
                      {dictionary.abs_dimensions}<small-grey2>({dictionary.abs_expl})</small-grey2>
                    </label2>
                    <div class = {"dim_abs" + item.elemento.id}>
                      <div class = "dimensioni">
                        <label7>
                          {dictionary.width}:
                          <input type = "number" bind:value = {item.elemento.larghezza} min = 10 max = 595>
                        </label7>
                        <label7>
                          {dictionary.height}:
                          <input type = "number" bind:value = {item.elemento.altezza} min = 10 max = 841>
                        </label7>
                      </div>
                    </div>
                    <div class = "posizione">
                      <p>{dictionary.alignment}: </p>
                      <label> 
                        <input type="radio" bind:group={item.elemento.alignment} value="left"/> 
                        {dictionary.left}
                      </label>
                      <label> 
                        <input type="radio" bind:group={item.elemento.alignment} value="center"/> 
                        {dictionary.center}
                      </label>
                      <label> 
                        <input type="radio" bind:group={item.elemento.alignment} value="right"/> 
                        {dictionary.right}
                      </label>
                    </div>
                    <h2>{dictionary.svg_margins}:</h2>
                    <div class = "margini_pagina">
                      {dictionary.left}:
                      <input type="number" class = "marginiSVG" bind:value={item.elemento.svgMargins[0]}  min = 0 max = 595>
                      {dictionary.top}:
                      <input type="number" class = "marginiSVG" bind:value={item.elemento.svgMargins[1]}  min = 0 max = 841>
                      {dictionary.right}:
                      <input type="number" class = "marginiSVG" bind:value={item.elemento.svgMargins[2]}  min = 0 max = 595>
                      {dictionary.bottom}:
                      <input type="number" class = "marginiSVG" bind:value={item.elemento.svgMargins[3]}  min = 0 max = 841>
                    </div>
                  </div>
                </div>
                <div class="dropzone upper-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
                <div class="dropzone lower-dropzone" on:dragenter={(e) => handleDragEnter(e, i)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, i)} on:dragover={handleDragOver} id="drop_zone"></div>
              </div>
            {:else if item.type === 'img'}
              <div class = "cella">
                <div class = "testo">
                  <h1>{dictionary.label_image} </h1> <button class = "rimuovi" type="button" on:click={() => removeIMG(item.elemento.id)}>{dictionary.button_remove}</button>
                </div>
                <div class="svg-element">
                  <!--<div class = "placeHolderSVG"> {item.elemento.imgContent}</div>-->
                  <!--<div class="svgArea dropzone_Text" on:drop={(e) => handleDropSVG(e,item.elemento.id)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} />-->
                  <!-- svelte-ignore missing-declaration -->
                  <!--<input  class = "custom-file-input" type="file" accept=".jpeg , .png" on:change={handleFileIMGChange(event,item.elemento.id)} />-->
                  <textarea class="autosize-textarea dropzone_Text drop2" bind:value={item.elemento.imgContent} on:input={handleInput} on:input:resize={adjustTextareaHeight} on:drop={(e) => handleDropFile(e,item.elemento.id,0,0)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave} />
                  <h2>{dictionary.dimensions}:</h2>
                  <div class = "dimensioni_svg">
                    <label2>
                      <input type= "radio" bind:group={item.elemento.isMaxDimensionsSelected} on:change={handleDimensionChange_IMG(event,item.elemento.id)} value = "true">
                      {dictionary.max_dimensions}<small-grey2>({dictionary.fill_expl})</small-grey2>
                    </label2>
                    <div class = {"dim_max_img" + item.elemento.id}>
                      <div class = "dimensioni">
                        <label7>
                          {dictionary.max_width}:
                          <input type = "number" bind:value = {item.elemento.larghezza_fit} min = 10 max = 595>
                        </label7>
                        <label7>
                          {dictionary.max_height}:
                          <input type = "number" bind:value = {item.elemento.altezza_fit} min = 10 max = 841 >
                        </label7>
                      </div>
                    </div>
                    <label2>
                      <input type= "radio" bind:group={item.elemento.isMaxDimensionsSelected} on:change={handleDimensionChange_IMG(event,item.elemento.id)} value = "false">
                      {dictionary.abs_dimensions}<small-grey2>({dictionary.abs_expl})</small-grey2>
                    </label2>
                    <div class = {"dim_abs_img" + item.elemento.id}>
                      <div class = "dimensioni">
                        <label7>
                          {dictionary.width}:
                          <input type = "number" bind:value = {item.elemento.larghezza} min = 10 max = 595>
                        </label7>
                        <label7>
                          {dictionary.height}:
                          <input type = "number" bind:value = {item.elemento.altezza} min = 10 max = 841 >
                        </label7>
                      </div>
                    </div>
                    <div class = "posizione">
                      <p>{dictionary.alignment}: </p>
                      <label> 
                        <input type="radio" bind:group={item.elemento.alignment} value="left"/> 
                        {dictionary.left}
                      </label>
                      <label> 
                        <input type="radio" bind:group={item.elemento.alignment} value="center"/> 
                        {dictionary.center}
                      </label>
                      <label> 
                        <input type="radio" bind:group={item.elemento.alignment} value="right"/> 
                        {dictionary.right}
                      </label>    
                    </div>
                    <h2>{dictionary.img_margins}:</h2>
                    <div class = "margini_pagina">
                      {dictionary.left}:
                      <input type="number" class = "marginiIMG" bind:value={item.elemento.imgMargins[0]} oninput="HandleMarginiIMG()" min = 0 max = 595 >
                      {dictionary.top}:
                      <input type="number" class = "marginiIMG" bind:value={item.elemento.imgMargins[1]} oninput="HandleMarginiIMG()" min = 0 max = 841>
                      {dictionary.right}:
                      <input type="number" class = "marginiIMG" bind:value={item.elemento.imgMargins[2]} oninput="HandleMarginiIMG()" min = 0 max = 595>
                      {dictionary.bottom}:
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
                  <h1>{dictionary.label_index}</h1><button class = "rimuovi" type="button" on:click={() => removeTOC(item.elemento.id)}>{dictionary.button_remove}</button>
                </div>
                  <div class= "element"> 
                    <div class = "title&id">
                      <label> 
                        <p>{dictionary.title_index} :</p>
                        <textarea class="autosize-textarea dropzone_Text dropnew"  bind:value={item.elemento.text} on:input={handleInput} on:input:resize={adjustTextareaHeight} on:drop={(e) => handleDropFile(e,item.elemento.id,0,0)}  on:dragover={handleDragOverText} on:dragenter={handleDragEnterText} on:dragleave={handleDragLeave}  /> 
                      </label>
                      <label> 
                        <p>{dictionary.id_index} :</p>
                        <input type="text" bind:value={item.elemento.id_sec} required/> 
                      </label>
                      <div class = "preview_height">
                        <p>{dictionary.words_preview}:</p>
                      </div>
                      <input type="number" bind:value = {item.elemento.test_text} min="1" /> 
                    </div>
                    <div class= "specifiche_toc">
                      <div class = "fontsize&style">
                        <div class ="fontsize">
                          <label for="fontsizes"><p>{dictionary.fontsize}:</p></label>
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
                            <option value="">{dictionary.select}</option>
                            <option value="Roboto">Roboto</option>
                            <option value="RobotoSerif">RobotoSerif</option>
                            <option value="Raleway">Raleway</option>
                            <option value="NotoSerif">NotoSerif</option>
                            <option value="Montserrat">Montserrat</option>
                          </select>
                        </div>
                        <div class ="style">
                          <label> 
                            <p>{dictionary.style}:</p>
                            <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                            <select id="style-select_toc" bind:value={item.elemento.style} name="style-option" on:change={(e) => ChangeFontandFill(e, item.elemento.id)}>  
                              <option value="normal" > Default </option>
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
                          {dictionary.page_break}:
                          <label>
                            <input type="radio" bind:group={item.elemento.pageBreak} value="before" />
                            {dictionary.before}
                          </label>
                          <label>
                            <input type="radio" bind:group={item.elemento.pageBreak} value="after" />
                            {dictionary.after}
                          </label>
                          <label>
                            <input type="radio" bind:group={item.elemento.pageBreak} value="" />
                            {dictionary.none}
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
          <button value = "invia" type="submit">{dictionary.create}</button>
          <button value = "preview" type="submit">{dictionary.preview}</button>
          <div class="dropzone lower-dropzone third" on:dragenter={(e) => handleDragEnter(e, contenuto.length - 1)} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, contenuto.length - 1)} on:dragover={handleDragOver} id="drop_zone"></div>
        </div>
        </form> 
      </div>
     </div>
    <div class="preview">
      <iframe title = "pdf-window" id="fixedElement" src="{pdfData}" frameborder="0" width=100% height=100%></iframe>
    </div>    
    </div>
    </body>
    <style>
      grey {
          color: grey;
          font-size: 20px;
          margin-left: 2%;
          font-weight: 300;
      }
      body {
        position: relative;
        width: 100%;
        height: 100%;
        color: #333;
        margin: 0;
        padding: 8px;
        box-sizing: border-box;
        font-family: var(--font, "Segoe UI");
      }
      h1{
        font-size: var(--fontsize,"2em");
      }

      a {
        color: rgb(0,100,200);
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      a:visited {
        color: rgb(0,80,160);
      }

      label {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin-top: auto;
          margin-bottom: auto;
          gap: 10px;
      }

      input, button, select, textarea {
          font-family: inherit;
          font-size: inherit;
          -webkit-padding: 0.4em 0;
          padding: 0.4em;
          /* margin: 0 0 0.5em 0; */
          box-sizing: border-box;
          border: 1px solid #ccc;
          border-radius: 2px;
          margin-top: auto;
          margin-bottom: auto;
      }
      h9 {
          font-size: 2em;
          font-weight: bold;
          display: block;
          margin-bottom: 10px;
      }
      input:disabled {
        color: #ccc;
      }
      button#toggleButton {
        margin-left: auto;
        position: relative;
        display: block;
        margin-right: auto;
        margin-bottom: 10px;
      }
      button {
        color: var(--button-color,"#333");
        background-color: var(--button-background,"#f4f4f4");
        outline: none;
      }

      button:disabled {
        color: #999;
      }

      button:not(:disabled):active {
        background-color: #ddd;
      }

      button:focus {
        border-color: #666;
      }
      .container {
          display: grid;
          /* flex-direction: column; */
          /* position: fixed; */
          grid-template-columns: 10% 62.5% 27.5%;
          /* display: flex; */
          height: 100%;
          width : 100%;
      }
      .sinistra {
          /*width: 20%;*/
          /*min-width: 140px;*/
          max-height: 76vh;
      }

      .cont_sinistra {
          display: flex;
          flex-direction: column;
          /*width: 10%;*/
          /* overflow-y: scroll; */
          /* overflow-x: hidden; */
          /* height: 600px; */
          /* margin-bottom: 30px; */
          /* overflow: visible; */
          /*min-width: 110px;*/
          justify-content: space-evenly;
          /*min-height: 570px;*/
          /*top: 10px;*/
          /* height: 80%; */
          padding-right : 5px;
          /*bottom: 10px;*/
          position: fixed;
          border-right: 2px solid gainsboro;
          /*left: 20px;*/
      }
      .responsive-heading {
          /* Set the font size based on the viewport width */
          font-size: calc(10px + 1.1vw);
        }
        .destra {
          width: 96%;
          /* min-width: 800px; */
          margin-right: 2%;
          margin-left: 2%;
          position: relative;
          /*margin-top: 200px;*/
          z-index: 1;
          min-height : 500px;
          display: grid;
          grid-template-rows: 12% 88%;        
      }
      .separator {
          border-bottom: 5px solid #d9d9d9;
          width: 100%;
      }
      .right1 {
          display: flex;
          flex-direction: column;
      }
      .elements-list {
          overflow-y: auto;
          max-height: 67vh;
      }
      .font {
          /* padding: 5px; */
          display: flex;
          /* background-color: #7cafd1; */
          /* flex-direction: column; */
          gap: 10px;
      }
      .contenuto_field {
        display: flex;
        flex-direction: column;
      }
      form.elements {
          display: flex;
          flex-direction: column;
        
      }
      .colonna-element {
          background-color: beige;
          width: 100%;
          padding: 5px;
          /* margin-right: 0px; */
      }
      .element {
          display: flex;
          gap: 10px;
          /* margin-bottom: 10px; */
          /* justify-content: space-between; */
          /* padding: 5px; */
          /* background-color: aliceblue; */
          flex-direction: column;
      }


      .f\&f_size {
        display: grid;
        grid-template-columns: 50% 50%;
      }
      .style\&tipo {
          display: grid;
          /* gap: 100px; */
          align-items: center;
          grid-template-columns: auto 30%;
      }
      .tipo\&page {
          display: grid;
          grid-template-columns: 20% 70%;
          gap: 10%;
      }
      .style\&fontsize {
          display: flex;
          justify-content: space-between;
      }
      .alignment {
          display: grid;
          grid-template-columns: 15% 12% 12% 12%;
      }
      .title\&id {
          display: grid;
          justify-content: space-between;
          /* margin-right: 40%; */
          grid-template-columns: 50% 45%;
      }
      .specifiche_toc {
          /* display: grid; */
          /* justify-content: space-between; */
          /* grid-template-columns: 50% 50%; */
          gap: 10px;
          display: flex;
          flex-direction: column;
      }
      .pbreak\&type {
          display: grid;
          grid-template-columns: 70% 20%;
          justify-content: space-between;
      }
      .fontsize\&style {
          display: grid;
          /* gap: 20%; */
          grid-template-columns: 40% 30% 30%;
      }
      select#select_indice {
          min-width: 100px;
          width: auto;
      }
      p {
          display: flex;
          justify-content: space-between;
      }
      .fontsize {
          /* margin-top: 0px; */
          /* margin-bottom: 0px; */
          /* background-color: #b1d6dd; */
          /* height: 100%; */
          /* padding: 5px; */
          display: flex;
          /* flex-direction: column; */
          gap: 10px;
      }
      .tipo {
          margin-bottom: auto;
          margin-top: auto;
          display: flex;
          justify-content: space-between;
      }
      .pbreak {
        display: grid;
        /* align-self: center; */
        width: 100%;
        grid-template-columns: 25% 25% 25% 25%;
      }
      button {
        color: var(--button-color, #333);
        background-color: var(--button-background, #f4f4f4);
        outline: none;
        margin: 4px;
      }
      .larghezza {
          display: grid;
          /* flex-direction: column; */
          /* background: #acb9ff; */
          /* padding: 5px; */
          grid-template-columns: 30% 25% 35%;
          justify-content: space-between;
      }
      .altezza {
          display: grid;
          grid-template-columns: 30% 35% 35%;
      }
      .colore_tabella {
        display: grid;
      grid-template-columns: 50% 50%;
      }
      small-grey {
          color: #a5a5a5;
          font-weight: 400;
      }
      small-grey2 {
          color: #a5a5a5;
          font-weight: 400;
          margin-left: 50px;
      }
      .addButton {
          cursor: grab;
      }
      .tabella-element {
          display: flex;
          flex-direction: column;
          /* background: #d4e7e1; */
          /* padding: 5px; */
          gap: 20px;
      }
      .attributi_colonne {
          display: grid;
          grid-template-columns: 40% 20% 30%;
          justify-content: space-between;
      }
      .layout {
          /* background: #dffbff; */
          display: grid;
          grid-template-columns: 20% 30% 40%;
      }

      label.label2 {
          /* margin-right: 50%; */
          /* margin-left: 0%; */
          /* justify-content: space-between; */
          display: flex;
          gap: 10%;
      }
      .element-campi {
          display: flex;
          flex-direction: column;
          gap: 10px;
      }
      .element-riga {
          /* background: #b8bcb9; */
          /* padding: 5px; */
          gap: 20px;
          display: flex;
          flex-direction: column;
      }
      .list-element {
          /* background: #eff5df; */
          /* padding: 5px; */
          display: flex;
          flex-direction: column;
          gap: 20px;
      }
      select#default_font {
        margin-left: 50px;
      }
      .list_left1 {
          border: 1px solid #cfcfcf;
          width: 90%;
          padding: 10px;
          border-radius: 50px;
          justify-self: center;
          /* margin-right: 0px; */
      }
      .deafult_font {
          margin-top: 25px;
      }

      .list-right1 {
          /* justify-self: center; */
          border: 1px solid #cfcfcf;
          width: 90%;
          padding: 10px;
          border-radius: 50px;
          justify-self: center;
      }
      .ordine {
          /* margin: 5px; */
          display: grid;
          /* justify-content: center; */
          /* gap: 50px; */
          grid-template-columns: 50% 50%;
          border-bottom: 1px solid #cfcfcf;
          padding-bottom: 10px;
      }

      .stile_colore {
          display: grid;
          /* justify-content: space-between; */
          grid-template-columns: 30% 60%;
          gap: 10%;
          align-items: center;
      }
      .colore {
          display: grid;
          /* flex-direction: column; */
          /* background: #efe1ac; */
          /* padding: 5px; */
          grid-template-columns: 40% auto;
      }
      label.label3 {
          display: flex;
          /* justify-content: space-between; */
          align-items: center;
          /* margin-right: 20%; */
          gap: 5%;
      }
      .stileNumeri {
          /* margin: 5px; */
          /* background: #f7d2b6; */
          /* display: grid; */
          /* grid-template-columns: 1fr 1fr; */
          /* gap: 10px; */
          /* padding: 5px; */
          /* margin-top: 10px; */
          display: grid;
          grid-template-columns: 50% 50%;
      }
      .list_left_cont {
          display: grid;
          /* grid-template-columns: 50% 50%; */
          row-gap: 10px;
          margin-bottom: 20px;
          border-right: 1px solid #cfcfcf;
          padding: 10px;
      }
      .list_right {
          display: grid;
          grid-template-columns: 50% 50%;
          /* column-gap: 10px; */
          row-gap: 10px;
          margin-bottom: 20px;
          padding: 10px;
      }
      .contenutolista {
          /* margin-top: 10px; */
          /* background: #e39576; */
          display: grid;
          justify-content: space-between;
          grid-template-columns: 70% 30%;
          border: 1px solid #cfcfcf;
          padding: 15px;
          border-radius: 10px;
      }
      label.label4 {
          display: flex;
          gap: 30px;
      }
      input[type="color"] {
          padding: 0px;
      }
      .element-header {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          flex-direction: column;
      }

      input[type="number"] {
          width: 70px;
      }

      .style-margin {
          gap: 10px;
          width: 100%;
          display: flex;
          /* grid-template-columns: 25% 75%; */
          flex-direction: column;
      }
      .margini {
          /* display: grid; */
          /* grid-template-rows: 50% 50%; */
          /* grid-template-columns: 20% 20% 20% 20% 20%; */
          /* gap: 1%; */
          display: flex;
          justify-content: space-between;
      }
      .cont-allignment {
          /* display: flex; */
          width: 100%;
          align-items: center;
          display: grid;
          grid-template-columns: 45% 15% 13% 13% 13% 1%;
      }
      .colonne {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 30px;
      }
      .nome\&width {
          display: grid;
          grid-template-columns: 40% 25% 30%;
          justify-content: space-between;
      }
      .span\&color {
          display: grid;
          grid-template-columns: 60% 40%;
      }
      label.label5 {
          /* margin-right: 20%; */
          display: grid;
          /* justify-content: flex-start; */
          grid-template-columns: 20% 4% 10% 4% 10% 4% 10% 4% 10%;
      }
      input.nomi_colonne {
          width: 50%;
      }
      label.label6 {
          display: grid;
          grid-template-columns: auto auto;
      }
      label.label7 {
          /*display: grid;*/
          /*grid-template-columns: 30% 70%;*/
      }
      .cont_righe {
          display: flex;
          flex-direction: column;
          gap: 20px;
      }
      button.aggiungi-riga {
          border-color: black;
          background: #a9a9a975;
          margin: 0px;
      }
      .rimuovi-riga {
          margin: 10px;
      }
      .height\&remove {
          display: flex;
          /* grid-template-columns: 50% 50%; */
          justify-content: space-between;
      }
      button.rimuovi_riga {
          max-width: 150px;
          border-color: black;
          background: #a9a9a975;
          /* display: flex; */
          margin-left: 40%;
      }
      .svg-element {
          display: flex;
          flex-direction: column;
          gap: 10px;
      }
      .dimensioni_svg {
          gap: 20px;
          display: flex;
          flex-direction: column;
      }
      .dimensioni {
          display: grid;
          justify-content: space-between;
          margin-left: 10%;
          grid-template-columns: 40% 40%;
          /* gap: 10%; */
      }
      label7 {
          display: flex;
          justify-content: space-between;
          align-items: center;
      }
      .posizione {
          display: grid;
          grid-template-columns: 10% 10% 10% 10%;
          gap: 40px;
      }
      .margini_pagina {
          display: flex;
          align-items: center;
          justify-content: space-between;
          /* gap: 20px; */
          /* margin-right: 20%; */
      }
      .autosize-textarea {
          resize: none;
          overflow-y: hidden;
          width: 100%;
          height: 56px;
          min-height: 56px;
      }
      .cella {
          border: solid 2px #cdcdcd;
          border-radius: 10px;
          padding: 3%;
          position: relative;
          margin-top: 7px;
          margin-bottom: 7px;
          /*width: 94%;*/
      }
      .cella2 {
          border: solid 2px #cdcdcd;
          border-radius: 10px;
          /* padding: 30px; */
          padding-left: 30px;
          padding-right: 30px;
          position: relative;
          margin-top: 7px;
          margin-bottom: 7px;
      }
      .buttons_send_preview {
          display: flex;
          flex-direction: column;
      }
      .testo {
          display: flex;
          justify-content: space-between;
      }
      button.rimuovi {
          /* margin-left: 90%; */
          width: fit-content;
          align-self: center;
          height: 20%;
          border-color: black;
          background: #a1a1a175;
      }

      .custom-file-input::-webkit-file-upload-button {
          visibility: hidden;
        }
        .custom-file-input::before {
          content: 'Seleziona un file';
          display: inline-block;
          background: linear-gradient(top, #f9f9f9, #e3e3e3);
          border: 1px solid #afafaf;
          border-radius: 10px;
          padding: 5px 8px;
          outline: none;
          white-space: nowrap;
          -webkit-user-select: none;
          cursor: pointer;
          /* text-shadow: 1px 1px #fff; */
          font-weight: 500;
          /* font-size: 10pt; */
      }
      input.custom-file-input {
          width: auto;
      }
      .custom-file-input:hover::before {
          border-color: black;
      }
      .custom-file-input:active::before {
          background: -webkit-linear-gradient(top, #e3e3e3, #f9f9f9);
      }
      .preview {
          /* position: relative; */
          /* width: 300px; */
          /* right: 0px; */
          /*width: 700px;*/
          height: 100%;
          max-height: 100%;
      }
      button.preview {
          position: fixed;
          bottom: 15px;
          right: 300px;
          width: 80px;
          cursor: pointer;
      } 
      button.send {
          bottom: 15px;
          position: fixed;
          right: 20px;
          width: 80px;
          cursor: pointer;
      }
      #fixedElement {
          /*position: fixed;*/
          /*width: auto;*/
          /*right: 10px;*/
          /*height: -webkit-fill-available;*/
          /*min-width: 400px;*/
          /*top: 10px;*/
          /*bottom: 10px;*/
      }
      .resize-handle {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 10px;
          height: 10px;
          background-color: #000;
          cursor: nwse-resize;
          z-index: 999; /* Ensure the resize handle appears on top of the iframe */
        }
        .add-element {
          width: 90%;
          height: 70px;
          border: #c2c2c2;
          border-radius: 20px;
          padding: 20px;
          /* text-align: -webkit-center; */
          border-style: dotted;
          border-width: 4px;
          /* margin: 10%; */
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
      }
      .inner-dropzone {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgb(233 233 233 / 50%);
          z-index: 2;
        }
        .list {
          display: grid;
          grid-template-columns: 33% 33% 33%;
          row-gap: 5px;
          column-gap: 0.5%;
          max-height: 120px;
          overflow-y: scroll;
          border-bottom: 2px solid #d9d9d9;
          border-top: 2px solid #d9d9d9;
      }
      single_file.fileButton {
          border: 1px solid black;
          padding: 2px;
      }
      .file_list {
        top: 0px;
        display: none;
        z-index: 3;
        background-color: white;
        padding-bottom: 5px;
        margin-bottom: 5px;
        border-bottom: 5px solid #e0e0e0;
      }
      .dropzone_Text {
          width: 100%;
          height: auto;
          /* right: 0px; */
          /* left: 20px; */
      }
      .dropnew {
          position: relative;
          width: 50%;
          height: 56px;
      }
      .drop2 {
          width: 100%;
          /* max-width: 100%; */
          position: relative;
      }
      .preview_height {
          display: flex;
          gap: 5%;
      }
      @media screen and (max-width: 1050px) {
          #fixedElement {
              display: none;
          }
          .preview {
              width: 0%;
          }
          .destra {
          
          }

      }
      @media screen and (max-width: 1323px) {
          #fixedElement {
              display: none;
          }
          .preview {
              width: 0%;
          }
          .destra {
              width: 90%;
              /* margin-right: 50px; */
              /* margin-left: 200px; */
              min-width: 700px;
              /* margin-right: 350px; */
              margin-left: 20px;
              position: relative;
          }
          .file_list{
              right: 5px;
              left : 13%;
          }
      

      }
      @media screen and (max-width: 1200px) {
          .file_list{
              left : 150px;
          }
      }
      .dropzone {
          position: absolute;
          background-color: rgba(0, 0, 0, 0.1); /* Set the desired background color */
          opacity: 0; /* Make it invisible */
          z-index: 1;
      }
      .svgArea {
          pointer-events: none;
      }
      .dropzone {
          pointer-events: none;
        }
        
      .disable-clicks * {
          pointer-events: none;
      }

      .upper-dropzone {
          top: 0;
          left: 0;
          width: 100%;
          height: 50%;
      }

      .lower-dropzone {
          bottom: 0;
          left: 0;
          width: 100%;
          height: 50%;
      }
      .second {
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100%;
      }
      .third {
          /* height: 100%; */
          bottom: auto;
          left: auto;
      }
      input.table_cell {
          width: 150px;
      }
      .attributes_container {
          display: flex;
          gap: 0px;
          width: 96%;
          overflow-x: auto;
          border: 3px solid #d8d8d8;
          padding: 2%;
          border-radius: 10px;
      }
      .content_container {
          display: flex;
          gap: 0px;
          width: 96%;
          overflow-x: auto;
          border: 3px solid #d8d8d8;
          padding: 2%;
          border-radius: 10px;
      }
      .attributes\&addcolonna {
          display: grid;
          grid-template-columns: 70% 30%;
      }
      .content\&addriga {
          grid-template-columns: 80% 20%;
          display: grid;
      }
      .settings {
          border: 1px #b8b8b8 solid;
          padding: 20px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 20px;
      }
      @media screen and (max-width: 1440px) {
          .container {
              display: grid;
              /* flex-direction: column; */
              /* position: fixed; */
              grid-template-columns: 12% 56.5% 31.5%;
              /* display: flex; */
          }
      }
      @media screen and (max-width: 1323px) {
          .container {
              display: grid;
              /* flex-direction: column; */
              /* position: fixed; */
              grid-template-columns: 20% 80%;
              /* display: flex; */
          }

      }
      @media screen and (max-width: 1050px) {
          .container {
              display: grid;
              /* flex-direction: column; */
              /* position: fixed; */
              grid-template-columns: 16% 84%;
              /* display: flex; */
          }

      }
      @media screen and (max-width: 763px) {
          .container {
              display: grid;
              /* flex-direction: column; */
              /* position: fixed; */
              grid-template-columns: 25% 75%;
              /* display: flex; */
          }

      }
      .add\&remove {
          width: 99%;
          margin-left: 1%;
      }
      button.aggiungi-colonna {
          width: 90%;
          height: 40px;
          margin-left: 10px;
          margin-right: 10px;
          margin-top: 2px;
          margin-bottom: 2px;
      }
    </style>