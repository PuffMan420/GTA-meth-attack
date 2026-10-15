# GTA Meth Attack

Ett litet spel i webbläsaren, ritat i pixelstil. Du ser staden uppifrån, ungefär som i gamla GTA: gator, kvarter, bilar och neon. Fienderna kommer i vågor, ungefär som i Vampire Survivors. Du går runt. Vapnen skjuter själva. Du plockar glitter (XP), levlar och väljer uppgraderingar.

Det är en tecknad parodi med överdriven humor. Ingenting i spelet är en instruktion om riktiga droger.

Själva spelet är på engelska: menyer, knappar, kort, vapen och texter på skärmen. Den här instruktionen är på svenska.

## Så spelar du

1. Öppna `index.html` (dubbelklicka på filen) eller länken du får från GitHub Pages.
2. Tryck på **GO**.
3. Gå med **WASD** eller **piltangenterna**. Vapnen siktar och skjuter själva. Klicka med musen på **GO**, korten och knapparna uppe till höger.
4. Håll dig i rörelse. Zombisar, snutar och skumma typer jagar dig. Ibland dyker en boss upp.
5. Gå på glittret som fiender tappar. När mätaren fylls pausas spelet och du väljer **ett av tre kort**.
6. Hälsan syns uppe till vänster, tiden uppe i mitten. När hälsan tar slut ser du hur länge du klarade dig. Tryck **AGAIN**.

Ljudet skapas i webbläsaren. Knappen **Sound on** stänger av det.

## Lägg upp spelet på GitHub Pages

Då får du en länk som öppnas i webbläsaren på datorn, utan att installera något. Spelet är gjort för en fast 1280×720-yta. Är fönstret större läggs svarta kanter runt, eller så skalas ytan upp i hela steg så att pixelgrafiken håller sig skarp.

1. Se till att filerna ligger på branchen **main**. Om du har en pull request: slå ihop den först, så att `index.html` finns på main.
2. Öppna repot på GitHub i webbläsaren.
3. Klicka på **Settings**.
4. Klicka på **Pages** i menyn till vänster.
5. Under **Build and deployment**, välj **Deploy from a branch**.
6. Välj branch **main** och mapp **/ (root)**.
7. Spara med **Save**.

Efter någon minut visas en länk, ungefär:

`https://puffman420.github.io/GTA-meth-attack/`

Öppna den på datorn. Repot behöver vara publikt för att den gratis varianten av Pages ska fungera.

## Filer

- `index.html` — spelet
- `style.css` — menyer och knappar
- `js/game.js` — själva spelet

Inget behöver installeras och inget behöver byggas.
