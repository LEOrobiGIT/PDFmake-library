<script>
    import PDFmakerApp from './PDFmakerApp.svelte';
    import { ddStore } from './PDFstore.js';
    import fileList from './fileList.json';
    let dd;
    $: console.log(dd);
    const unsubscribe = ddStore.subscribe(value => {
        dd = value;
    });

    let dictionary = {
        page_counter_info: "Sovrascrive il contenuto del footer",
        page_counter : "Numero della pagina",
        default_font : "Scegli un font come default per il template",
        label_margins : "Margini della pagina",
        label_dimensions: "dimensioni totali 595 x 942 pixels",
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
        height_table: "Prima riga",
        dimensions : "Dimensioni",
        max_dimensions : "Dimensioni Massime",
        abs_dimensions : "Dimensioni Assolute",
        fill_expl : "riempie un rettangolo senza distorsione",
        abs_expl : "adatta a un rettangolo con distorsione",
        img_margins : "Margini dell'immagine",
        add_text : "Aggiungi Testo",
        add_img : "Aggiungi Immagine",
        add_svg : "Aggiugi SVG",
        add_column: "Aggiungi Colonna",
        add_row: "Aggiungi Riga",
        layout : "Layout",
        custom : "Custom",
        border : "Con bordi",
        no_border : "Nessun bordo",
        horizontal_lines : "Solo righe orizzontali",
        table_ch_color: "Colore dei caratteri della tabella",
        table_bg_color: "Colore dello sfondo della tabella",
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
    let css_root = {
        "--button-color": "#333",
        "--button-background": "#f4f4f4",
        "--font": "Segoe UI",
        "--fontsize" : "2em"
    }
    let parentContent = [];
    function handleDataFromChild(event) {
        parentContent = event.detail;
        console.log("parentContent = ", parentContent);
    }
    function loadFile() {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".json";

        fileInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        parentContent = JSON.parse(e.target.result);
                        console.log("Loaded content:", parentContent);
                    } catch (error) {
                        console.error("Error loading file:", error);
                    }
                };
                reader.readAsText(file);
            }
        });

        // Trigger the file input click event
        fileInput.click();
    }

    function saveData() {
    if (Array.isArray(parentContent) && parentContent.length === 0) {
        // If parentContent is an empty array, disable the save button
        return;
    }

    const jsonContent = JSON.stringify(parentContent, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}
    
</script>
<div class = "containernew">
    <div class = "header">
        Contenuto Header
    </div>
    <div class = "body">
        <div class = "left"> 
            Contenuto colonna di sinistra
            <div class="buttons">
                <button on:click={loadFile}>Load</button>
                <button on:click={saveData}>Save</button>
            </div>
        </div>
        <div class = "right">
            <PDFmakerApp fileListpassed={fileList} css_root = {css_root} dictionary = {dictionary} bind:dd={dd} on:dataToParent={handleDataFromChild} contenuto = {parentContent} />  
        </div>
    </div>
</div>
<style>
    .containernew{
        height: 97vh; /* Set the height to 100% of viewport height */
        display: flex;
        flex-direction: column;
    }
    .header {
        height: 20vh;
        border: 5px solid black;
        min-height : 20vh;
    }
    .body {
        height: 100%;
        /* width: 100%; */
        /* display: grid; */
        display: flex;
        max-height:77vh;
    }
    .left {
        width: 10vw;
        border: 5px solid black;
        min-width: 10vw;
    }
    .right {
        width: 100%;
        max-height: 100%;
        overflow: hidden;
    }
</style>


