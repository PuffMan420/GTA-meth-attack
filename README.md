# GTA Meth Attack

Ett litet spel i webbläsaren, ritat i pixelstil. Du ser staden uppifrån, ungefär som i gamla GTA: gator, kvarter, bilar och neon. Fienderna kommer i vågor, ungefär som i Vampire Survivors. Du går runt. Vapnen skjuter själva. Du plockar glitter (XP), levlar och väljer uppgraderingar.

Det är en tecknad parodi med överdriven humor. Ingenting i spelet är en instruktion om riktiga droger.

## Så spelar du

1. Öppna `index.html` (dubbelklicka på filen) eller länken du får från GitHub Pages.
2. Tryck på **Kör**.
3. På datorn: gå med **WASD** eller **piltangenterna**. På telefonen: dra i spaken nere till vänster.
4. Håll dig i rörelse. Zombisar, snutar och skumma typer jagar dig. Ibland dyker en boss upp.
5. Gå på glittret som fiender tappar. När mätaren fylls pausas spelet och du väljer **ett av tre kort**.
6. Hälsan syns uppe till vänster, tiden uppe i mitten. När hälsan tar slut ser du hur länge du klarade dig. Tryck **Kör igen**.

Ljudet skapas i webbläsaren. Knappen **Ljud på** stänger av det.

## Lägg upp spelet på GitHub Pages

Då får du en länk som fungerar i telefonen, utan att installera något.

1. Se till att filerna ligger på branchen **main**. Om du har en pull request: slå ihop den först, så att `index.html` finns på main.
2. Öppna repot på GitHub i webbläsaren.
3. Klicka på **Settings**.
4. Klicka på **Pages** i menyn till vänster.
5. Under **Build and deployment**, välj **Deploy from a branch**.
6. Välj branch **main** och mapp **/ (root)**.
7. Spara med **Save**.

Efter någon minut visas en länk, ungefär:

`https://puffman420.github.io/GTA-meth-attack/`

Öppna den på datorn eller i telefonen. Repot behöver vara publikt för att den gratis varianten av Pages ska fungera.

## Filer

- `index.html` — spelet
- `style.css` — menyer och knappar
- `js/game.js` — själva spelet

Inget behöver installeras och inget behöver byggas.
