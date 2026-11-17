import type { MakaleCevirisi } from "./data";

// Deutsche Artikelübersetzungen (Schlüssel: Slug des Artikels; Slug und Bilder wie im Türkischen).
// Interne Links werden mit dem türkischen Pfad geschrieben ("/tcl-vrf"); auf der Seite automatisch "/de/...".
export const CEVIRI_DE: Record<string, MakaleCevirisi> = {
  "tcl-mini-vrf-nedir-villa-ve-kucuk-ofis": {
    baslik: "Was ist TCL Mini VRF? Ein Ratgeber für Villen, Maisonetten und kleine Büros",
    kategori: "TCL VRF",
    okumaSuresi: "5 Min. Lesezeit",
    gorselAlt: "TCL Mini VRF Full-DC-Inverter-Außengerät",
    ozet: "Was ist TCL Mini VRF und worin unterscheidet es sich von Split- und Multisplit-Klimaanlagen? 8–28 kW Leistung, ein- und dreiphasige Modelle, SEER/SCOP-Werte, Einsatztemperaturen und die richtige Leistungsauswahl für Villen, Maisonetten und kleine Büros.",
    icerikHtml: `
      <h2>Was ist Mini VRF?</h2>
      <p>Mini VRF ist eine für kleinere Projekte ausgelegte Variante der VRF-Technik, die in großen Gebäuden eingesetzt wird. An ein einziges Außengerät werden mehrere Innengeräte angeschlossen; das System schickt jedem Raum so viel Kältemittel, wie er braucht, und heizt und kühlt die Räume unabhängig voneinander. So werden alle Räume einer Villa oder eines kleinen Büros mit einem Außengerät klimatisiert – ohne eine Reihe von Klima-Außengeräten an der Fassade.</p>

      <h2>Die TCL Mini VRF-Serie</h2>
      <p>TCL Mini VRF besteht aus Außengeräten mit Full-DC-Inverter-Twin-Rotary-Verdichtern und wird in 9 Leistungsgrößen zwischen <strong>8 kW und 28 kW</strong> gefertigt:</p>
      <ul>
        <li><strong>Einphasig (220–240 V):</strong> Modelle mit 8,0 – 9,0 – 12,1 – 14,0 – 15,5 kW Kälteleistung</li>
        <li><strong>Dreiphasig:</strong> Modelle mit 18,0 – 22,4 – 25,2 – 28,0 kW Kälteleistung</li>
      </ul>
      <p>Einphasige Modelle sind ein großer Vorteil in Wohnungen ohne dreiphasigen Stromanschluss. Laut Katalog liegt die saisonale Kühleffizienz (SEER) je nach Modell zwischen 5,4 und 7,0, die saisonale Heizeffizienz (SCOP) zwischen 3,8 und 4,4.</p>

      <h2>Einsatztemperaturbereich</h2>
      <ul>
        <li><strong>Kühlen:</strong> Außentemperaturen von -15 °C bis 55 °C</li>
        <li><strong>Heizen:</strong> Außentemperaturen von -20 °C bis 24 °C</li>
      </ul>
      <p>Dieser Bereich ermöglicht es, Mini VRF in Istanbul und ähnlichen Klimazonen nicht nur im Sommer, sondern auch im Winter zum Heizen zu nutzen.</p>

      <h2>Split, Multisplit und Mini VRF im Vergleich</h2>
      <h3>Split-Klimaanlage</h3>
      <p>Jedes Innengerät hat ein eigenes Außengerät. Für ein oder zwei Räume ist das die wirtschaftlichste Lösung; mit steigender Raumzahl hängen jedoch viele Außengeräte an der Fassade.</p>
      <h3>Multisplit</h3>
      <p>An ein Außengerät werden mehrere Innengeräte angeschlossen. Die Zahl der anschließbaren Innengeräte und die Rohrlängen sind begrenzt; geeignet für kleine Wohnungen.</p>
      <h3>Mini VRF</h3>
      <p>Im Vergleich zu Multisplit lassen sich meist mehr Innengeräte anschließen, längere Rohrstrecken realisieren und die Leistung genauer an den momentanen Bedarf jedes Raumes anpassen. Je nach Projekt können verschiedene Innengerätetypen wie Kassetten-, Kanal- (Deckeneinbau) und Wandgeräte kombiniert werden; die zum Außengerät passenden Innengeräte legen wir bei der Besichtigung modellbezogen fest. In Villen, Maisonetten und Büros mit vielen Räumen ist es optisch wie in puncto Komfort eine flexiblere Lösung.</p>

      <h2>Für welche Projekte eignet es sich?</h2>
      <ul>
        <li><strong>Villen und Maisonetten:</strong> Alle Räume an einem Außengerät, nur ein Außengerät an der Fassade</li>
        <li><strong>Kleine Büros und Praxen:</strong> Unabhängige Regelung der Räume, regelmäßige Nutzungszeiten</li>
        <li><strong>Geschäfte und Cafés:</strong> Unsichtbare Montage mit Kassetten- oder Kanalgeräten in der abgehängten Decke</li>
        <li><strong>Kliniken:</strong> Jeder Raum kann auf einer anderen Temperatur gehalten werden</li>
      </ul>
      <p>In größeren Gebäuden (Bürotürme, Hotels, mehrgeschossige Büros) kommt die TCL TMV6+ Super Serie zum Einsatz, bei der Außengerätemodule mit 8–32 HP bis 128 HP kombiniert werden.</p>

      <h2>Wie wird die Leistung gewählt?</h2>
      <p>Die Mini-VRF-Leistung richtet sich nach der für jeden Raum einzeln berechneten Kühl- und Heizlast. Die Raumleistungen werden addiert, anschließend wird das Außengerät unter Berücksichtigung der Gleichzeitigkeit gewählt. Fassadenausrichtung, Glasanteil, Dämmung und Nutzungsintensität beeinflussen das Ergebnis direkt; deshalb ist eine Auswahl „nach Quadratmetern“ oft irreführend. Für eine grobe Einschätzung können Sie unseren <a href="/hesaplama">Leistungsrechner</a> nutzen.</p>

      <h2>TCL Mini VRF mit İklim Ofisi</h2>
      <p>Bei der Besichtigung prüfen wir Ihre Räume einzeln, berechnen die Leistung, legen Aufstellort des Außengeräts und Rohrtrasse fest und übernehmen Lieferung, Montage und Inbetriebnahme aus einer Hand. Alle Modelle und technischen Tabellen finden Sie auf unserer Seite <a href="/tcl-vrf#mini-vrf">TCL VRF-Systeme</a>; einen Vergleich der beiden Systeme lesen Sie in unserem Artikel <a href="/blog/vrf-mi-split-klima-mi">VRF oder Split-Klimaanlage?</a>. Fordern Sie eine <a href="/iletisim">kostenlose Besichtigung</a> für Ihr Projekt an.</p>
    `,
  },
  "tcl-vrf-nedir-tmv6-super-serisi": {
    baslik: "Was ist TCL VRF? Wissenswertes über die TMV6+ Super Serie",
    kategori: "TCL VRF",
    okumaSuresi: "6 Min. Lesezeit",
    gorselAlt: "TCL TMV6+ Super Serie VRF-Außengerät",
    ozet: "Leistungsbereich, Effizienzwerte, Einsatztemperaturen, Rohrlängen und Innengeräteoptionen der TCL TMV6+ Super Serie VRF-Systeme sowie die Projekte, für die sie sich eignen.",
    icerikHtml: `
      <h2>Was ist TCL VRF?</h2>
      <p>TCL VRF ist ein zentrales Klimasystem, bei dem viele Innengeräte an eine Außengerätegruppe angeschlossen werden. Bei der VRF-Technik (Variable Refrigerant Flow, variabler Kältemittelmassenstrom) schickt das System jedem Raum genau so viel Kältemittel, wie er gerade benötigt. So wird jeder Raum über sein eigenes Thermostat unabhängig beheizt oder gekühlt, und für selten genutzte Räume wird keine Energie verschwendet.</p>
      <p>Die aktuelle VRF-Serie von TCL, <strong>TMV6+ Super</strong>, arbeitet mit Full-DC-Inverter-Verdichtern und -Ventilatormotoren. Die Serie wurde für Büro-, Hotel-, Geschäfts-, Restaurant-, Bürohaus- und Wohnprojekte entwickelt.</p>

      <h2>Leistung: 32 HP pro Einzelgerät, 128 HP in Kombination</h2>
      <p>Die TMV6+ Super Serie umfasst 13 verschiedene Außengerätemodule von 8 HP bis 32 HP. Ein einzelnes Außengerät hat maximal 32 HP; bei größeren Projekten werden Module bis 128 HP kombiniert. So lassen sich mit derselben Produktfamilie Lösungen von einer kleinen Büroetage bis zu einem großen Hotel umsetzen.</p>
      <p>Für kleinere Projekte gibt es die <strong>TCL Mini VRF</strong>-Serie im Leistungsbereich von 8–28 kW. Die Modelle mit 8–16 kW arbeiten einphasig (220–240 V), die Modelle mit 18–28 kW dreiphasig. Sie wird häufig für Villen, Maisonetten, kleine Büros und Praxen gewählt.</p>

      <h2>Effizienzwerte</h2>
      <p>Laut Katalog erreicht die saisonale Kühleffizienz (SEER) der TMV6+ Super Serie bis zu 7,35 und die saisonale Heizeffizienz (SCOP) bis zu 4,50. Da saisonale Werte den Betrieb bei unterschiedlichen Außentemperaturen und Teillast über das ganze Jahr abbilden, sind sie für die Betriebskosten aussagekräftiger als ein einzelner COP-/EER-Wert.</p>

      <h2>Einsatztemperaturbereich</h2>
      <ul>
        <li><strong>Kühlen:</strong> Außentemperaturen von -15 °C bis 56 °C</li>
        <li><strong>Heizen:</strong> Außentemperaturen von -30 °C bis 28 °C</li>
      </ul>
      <p>Um die Heizleistung bei niedrigen Außentemperaturen zu halten, wird eine Heiztechnik mit doppelter Enthalpie (Dampfeinspritzung) eingesetzt. Das ist wichtig bei Projekten, in denen auch im Winter mit dem VRF-System geheizt werden soll.</p>

      <h2>Rohrlängen und Flexibilität bei der Aufstellung</h2>
      <p>Bei VRF-Projekten bestimmen die Rohrgrenzwerte, wo das Außengerät aufgestellt werden kann. Bei der TMV6+ Super Serie gilt:</p>
      <ul>
        <li>Gesamtrohrlänge bis 1.100 m,</li>
        <li>tatsächliche Rohrlänge bis zum entferntesten Innengerät 220 m (äquivalent 240 m),</li>
        <li>Höhenunterschied 100 m bei Außengerät oben und 110 m bei Außengerät unten,</li>
        <li>Höhenunterschied zwischen Innengeräten 40 m.</li>
      </ul>
      <p>Da der Ventilator des Außengeräts bis zu 130 Pa externe statische Pressung liefern kann, lässt sich das Gerät auch in geschlossenen Technikräumen oder Zwischengeschossen aufstellen; die Warmluft wird über einen Kanal abgeführt.</p>

      <h2>Wichtige Technologien</h2>
      <ul>
        <li><strong>DC-Inverter-Scrollverdichter:</strong> Stufenlose Frequenzregelung passt die Leistung dem Bedarf an.</li>
        <li><strong>6-stufige Ölrückführung:</strong> Stellt die Rückführung des Verdichteröls bei langen Rohrleitungen sicher.</li>
        <li><strong>Dreifache Redundanz:</strong> Dank Notlauf von Verdichter, Modul und Sensoren legt eine einzelne Störung nicht das ganze System still.</li>
        <li><strong>Polaritätsfreie Kommunikation:</strong> Da das Kommunikationskabel zwischen Innen- und Außengerät keine Polarität hat, sinkt das Risiko von Montagefehlern.</li>
      </ul>

      <h2>Innengeräteoptionen</h2>
      <p>An ein TCL VRF-System lassen sich über 100 Innengerätemodelle in 9 Kategorien anschließen. Am häufigsten eingesetzt werden:</p>
      <ul>
        <li><strong>Kassettengeräte (360°, kompakt, 1- und 2-Wege):</strong> Büros, Geschäfte und Restaurants mit abgehängter Decke</li>
        <li><strong>Kanalgeräte (flach, mittlere/hohe und sehr hohe Pressung):</strong> Hotelzimmer, Besprechungsräume und Räume mit verdeckter Montage</li>
        <li><strong>Wand- und Boden-/Deckengeräte:</strong> Räume ohne abgehängte Decke</li>
        <li><strong>Frischluftgeräte:</strong> Geräte, die Außenluft konditionieren und in den Raum einbringen</li>
      </ul>

      <h2>Steuerung und Fernverwaltung</h2>
      <p>Jedes Innengerät kann einzeln mit einer Kabel- oder Funkfernbedienung gesteuert werden. Mit zentralen Touch-Steuerungen wird das ganze Gebäude von einer Stelle aus überwacht; mit WLAN-Modul und Tsmart-App lässt sich das System auch per Smartphone steuern.</p>

      <h2>Für welche Projekte eignet sich TCL VRF?</h2>
      <p>VRF bietet Vorteile in allen Gebäuden mit vielen Räumen, die zu unterschiedlichen Zeiten genutzt werden: Büroetagen, Bürotürme, Hotels, Praxen, Schulen, Geschäfte und Villen. Wo viele Split-Außengeräte an der Fassade unerwünscht sind, sorgt eine einzige Außengerätegruppe für ein sauberes Erscheinungsbild.</p>

      <h2>Ihr TCL VRF-Projekt mit İklim Ofisi</h2>
      <p>Das richtige VRF-System beginnt mit der richtigen Lastberechnung. Unsere Ingenieure besichtigen Ihr Gebäude, berechnen Kühl- und Heizlast Raum für Raum und legen Aufstellort des Außengeräts und Rohrtrasse fest; anschließend übernehmen sie Lieferung, Montage und Inbetriebnahme aus einer Hand. Modelle und technische Tabellen finden Sie auf unserer Seite <a href="/tcl-vrf">TCL VRF-Systeme</a>; für Ihr Projekt können Sie eine <a href="/iletisim">kostenlose Besichtigung</a> anfordern.</p>
    `,
  },
  "vrf-mi-split-klima-mi": {
    baslik: "VRF oder Split-Klimaanlage? Das richtige System für Ihr Gebäude wählen",
    kategori: "RATGEBER",
    okumaSuresi: "5 Min. Lesezeit",
    gorselAlt: "Kassetten-VRF-Innengerät in einer abgehängten Decke",
    ozet: "Die Unterschiede zwischen Split-Klimaanlage und VRF-System: Anfangsinvestition, Betriebseffizienz, Fassadenbild, unabhängige Regelung und Wartung. Welches System für welches Gebäude richtig ist.",
    icerikHtml: `
      <h2>Wie funktionieren die beiden Systeme?</h2>
      <p>Bei einer <strong>Split-Klimaanlage</strong> hat jedes Innengerät ein eigenes Außengerät. Für fünf Räume sind in der Regel fünf Außengeräte nötig (bei Multisplit-Systemen lassen sich mehrere Innengeräte an ein Außengerät anschließen, die Anzahl ist jedoch begrenzt).</p>
      <p>Bei einem <strong>VRF-System</strong> versorgt eine Außengerätegruppe über Kältemittelleitungen Dutzende Innengeräte. Das System schickt jedem Raum so viel Kältemittel, wie er braucht, und die Räume werden unabhängig geregelt.</p>

      <h2>Vergleich nach 7 Kriterien</h2>
      <h3>1. Anfangsinvestition</h3>
      <p>Für einen oder wenige Räume ist eine Split-Klimaanlage deutlich günstiger. Mit steigender Raumzahl schrumpft der Unterschied; in Gebäuden mit vielen Räumen gleichen weniger Außengeräte, kürzere Stromleitungen und eine einheitliche Regelung bei VRF die Gesamtkosten aus.</p>
      <h3>2. Betriebseffizienz</h3>
      <p>Gebäude verbringen den größten Teil des Jahres im Teillastbetrieb: Manche Räume sind leer, manche in der Sonne, manche im Schatten. VRF-Systeme passen ihre Leistung unter diesen Bedingungen stufenlos an und arbeiten hocheffizient. In einem Gebäude mit vielen Räumen ist der jährliche Energieverbrauch meist niedriger als bei Split-Systemen.</p>
      <h3>3. Fassaden- und Dachbild</h3>
      <p>Beim Split-System hängt für jeden Raum ein Außengerät an der Fassade. In Bürotürmen, Hotels oder Wohnanlagen mit Fassadenauflagen ist das oft nicht möglich. Bei VRF stehen die Außengeräte gebündelt auf dem Dach oder in einem Technikbereich.</p>
      <h3>4. Rohrlänge</h3>
      <p>Bei Split-Klimaanlagen ist die Rohrstrecke zwischen Innen- und Außengerät kurz. Bei VRF-Systemen kann das Außengerät dank Rohrstrecken von mehreren hundert Metern an der günstigsten Stelle des Gebäudes aufgestellt werden.</p>
      <h3>5. Steuerung und Verwaltung</h3>
      <p>Bei VRF werden alle Innengeräte über eine Zentralsteuerung oder die Gebäudeleittechnik überwacht; Betriebszeiten, Temperaturgrenzen und Störungsprotokolle sind auf einem Bildschirm sichtbar. In Büros und Hotels ist das ein wichtiger Vorteil für Energieeinsparung und Wartung.</p>
      <h3>6. Auswirkungen einer Störung</h3>
      <p>Beim Split-System betrifft der Ausfall eines Geräts nur diesen Raum. Hochwertige VRF-Systeme können dank Verdichter- und Modulredundanz weiterlaufen; dennoch werden eine korrekte Planung und regelmäßige Wartung umso wichtiger.</p>
      <h3>7. Verbrauchsaufteilung</h3>
      <p>Soll in einem Gebäude mit eigenständigen Wohnungen ein gemeinsames VRF-System installiert werden, muss die Aufteilung des Verbrauchs von Anfang an geplant werden. Bei kleinen Einheiten in getrenntem Eigentum ist oft ein eigenes System pro Einheit praktischer.</p>

      <h2>Wann welches System?</h2>
      <ul>
        <li><strong>Split-Klimaanlage:</strong> Wenige Räume, z. B. eine Wohnung mit 1–3 Zimmern, ein kleiner Laden oder ein einzelner Besprechungsraum.</li>
        <li><strong>Mini VRF:</strong> Villen, Maisonetten, kleine Büros und Praxen; mittelgroße Projekte, bei denen ein Außengerät mehrere Innengeräte versorgt.</li>
        <li><strong>VRF:</strong> Büroetagen, Bürotürme, Hotels, Schulen, Einkaufszentren und alle Gebäude mit vielen Räumen und Fassadenauflagen.</li>
      </ul>

      <h2>Vor der Entscheidung</h2>
      <p>Die richtige Wahl ergibt sich aus der Zahl der Räume, den Nutzungszeiten, der verfügbaren Fläche für das Außengerät und dem Budget. Bei Innengeräten in kleinen Räumen muss außerdem die Kältemittelfüllmenge nach den einschlägigen Normen geprüft werden. Diese Prüfungen führen wir bei der Besichtigung durch und erstellen bei Bedarf getrennte Angebote für beide Systeme, damit Sie leichter vergleichen können.</p>
      <p>Ein aktuelles VRF-Beispiel finden Sie auf unserer Seite <a href="/tcl-vrf">TCL VRF-Systeme</a>; den groben Leistungsbedarf Ihrer Räume ermitteln Sie mit unserem <a href="/hesaplama">Leistungsrechner</a>.</p>
    `,
  },
  "vrf-klima-maliyetini-belirleyen-etkenler": {
    baslik: "Was bestimmt die Kosten einer VRF-Anlage? Was Sie vor der Angebotsanfrage wissen sollten",
    kategori: "VRF-ZENTRALSYSTEME",
    okumaSuresi: "5 Min. Lesezeit",
    gorselAlt: "Auf einem Gebäudedach aufgestellte VRF-Außengeräte",
    ozet: "Den Preis einer VRF-Anlage bestimmen Leistung, Innengerätetyp, Rohrtrasse, Aufstellort des Außengeräts, Steuerung und Frischluftbedarf. Warum Preise pro Quadratmeter irreführend sind und welche Angaben für ein genaues Angebot nötig sind.",
    icerikHtml: `
      <h2>Warum gibt es keinen einheitlichen „VRF-Preis“?</h2>
      <p>Eine VRF-Anlage ist kein Fertigprodukt, sondern eine auf das Gebäude zugeschnittene Installation. Die VRF-Kosten zweier gleich großer Büros unterscheiden sich je nach Fassadenausrichtung, Glasanteil, Nutzungsintensität, Innengerätetyp und Aufstellort des Außengeräts erheblich. Ein „VRF-Preis pro Quadratmeter“ liefert daher nur einen groben Anhaltspunkt. Nachfolgend die wichtigsten Kostenfaktoren.</p>

      <h2>1. Gesamtleistung</h2>
      <p>Der größte Kostenblock ist die Außengeräteleistung, die über die Lastberechnung ermittelt wird. Eine ohne Berechnung „sicherheitshalber“ überdimensionierte Anlage erhöht sowohl die Investitions- als auch die Betriebskosten. Eine korrekte Berechnung berücksichtigt Kühl- und Heizlast jedes Raumes, die Gleichzeitigkeit und die Außenauslegungstemperaturen.</p>

      <h2>2. Anzahl und Typ der Innengeräte</h2>
      <p>Wandgeräte sind meist die günstigste Option. Kassettengeräte erfordern eine abgehängte Decke. Kanalgeräte bieten die unauffälligste Lösung, bringen aber Zusatzarbeiten wie Luftkanäle, Gitter und Plenumkästen mit sich. Mit der Zahl der Innengeräte steigen auch Rohrleitungen, Abzweiger und Verkabelung.</p>

      <h2>3. Rohrtrasse und Rohrlänge</h2>
      <p>Kupferrohr, Dämmung, Abzweiger (Refnet) und Befestigungsmaterial steigen mit der Menge. Eine große Entfernung zwischen Außen- und Innengeräten, Geschossdurchbrüche und der Zustand der Schächte beeinflussen den Arbeitsaufwand direkt.</p>

      <h2>4. Aufstellort des Außengeräts</h2>
      <p>Kranarbeiten für die Dachaufstellung, eine Stahlunterkonstruktion, Schwingungsdämpfer oder eine Schallschutzwand erhöhen die Kosten. Wird das Gerät in einem geschlossenen Technikraum aufgestellt, muss die Warmluft über einen Kanal abgeführt werden.</p>

      <h2>5. Steuerungssystem</h2>
      <p>Eine einfache Kabelfernbedienung in jedem Raum kann genügen; in Büros und Hotels werden dagegen zentrale Touch-Steuerung, Zeitprogramme, Fernzugriff oder die Einbindung in die Gebäudeleittechnik (GLT) gewünscht. Diese Optionen erhöhen Komfort und Einsparpotenzial der Anlage und spiegeln sich in den Kosten wider.</p>

      <h2>6. Kondensatableitung und Elektroinstallation</h2>
      <p>Das Kondensat jedes Innengeräts muss über eine Leitung mit Gefälle abgeführt werden; fehlt ein geeigneter Ablauf, wird eine Pumpe oder eine zusätzliche Leitung installiert. Zuleitung und Sicherungsverteiler für die Außengeräte gehören ebenfalls zum Projekt.</p>

      <h2>7. Frischluftbedarf</h2>
      <p>VRF-Innengeräte konditionieren die Raumluft, führen aber keine Frischluft zu. In stark belegten Räumen wie Büros, Besprechungsräumen und Klassenzimmern ist ein Lüftungsgerät mit Wärmerückgewinnung (WRG) oder ein Frischluft-Innengerät erforderlich. Fehlt diese Position von Anfang an im Angebot, entstehen später unerwartete Kosten.</p>

      <h2>Berücksichtigen Sie auch die Betriebskosten</h2>
      <p>Der jährliche Stromverbrauch ist ebenso wichtig wie der Kaufpreis. Achten Sie beim Vergleich von Angeboten auf die saisonalen Effizienzwerte der Geräte (SEER, SCOP); eine hocheffiziente Anlage kann den Mehrpreis der Anfangsinvestition innerhalb weniger Jahre wieder einspielen.</p>

      <h2>Was für ein genaues Angebot nötig ist</h2>
      <ul>
        <li>Architekturpläne oder Grundrisse (falls nicht vorhanden, messen wir vor Ort auf)</li>
        <li>Nutzung der Räume und ungefähre Personenzahl</li>
        <li>Geschosshöhe und Situation der abgehängten Decke</li>
        <li>Vorgesehene Fläche für das Außengerät (Dach, Balkon, Technikraum)</li>
        <li>Ob auch mit dem VRF-System geheizt werden soll</li>
      </ul>
      <p>Mit diesen Angaben berechnen unsere Ingenieure die Leistung und erstellen ein transparentes, positionsweises Angebot. TCL VRF-Modelle finden Sie auf unserer Seite <a href="/tcl-vrf">TCL VRF-Systeme</a>; für eine <a href="/iletisim">kostenlose Besichtigung</a> können Sie uns kontaktieren.</p>
    `,
  },
  "hava-perdesi-nedir-nasil-secilir": {
    baslik: "Was ist ein Torluftschleier, wozu dient er und wie wählt man ihn aus?",
    kategori: "TORLUFTSCHLEIER",
    okumaSuresi: "6 Min. Lesezeit",
    seoBaslik: "Torluftschleier: Funktion und Auswahl – Höhentabelle (2026)",
    seoAciklama: "Ein Torluftschleier hält die Wärme bei offener Tür im Raum. Modelltabelle nach Türbreite und 3–12 m Montagehöhe, mit oder ohne Heizung, Montagetipps.",
    gorselAlt: "Über einer Holzeingangstür montierter Torluftschleier",
    ozet: "Wozu dient ein Torluftschleier, wie funktioniert er und wo wird er eingesetzt? Energieeinsparung, Komfort im Eingang und die Wahl des richtigen Modells: Türbreite, Montagehöhe, mit oder ohne Heizung und was bei der Montage zu beachten ist.",
    icerikHtml: `
      <aside><p><strong>Kurz gesagt:</strong> Ein Torluftschleier ist ein über der Tür montiertes Ventilatorgerät, das bei geöffneter Tür das Entweichen erwärmter oder gekühlter Raumluft verringert. Für das richtige Modell kommt es auf drei Dinge an: <strong>Türbreite</strong> (das Gerät sollte so lang wie die Tür oder etwas länger sein), <strong>Montagehöhe</strong> (bestimmt die Serie) und <strong>ob der Eingang beheizt werden soll</strong> (mit / ohne Heizung).</p></aside>

      <h2>Was ist ein Torluftschleier?</h2>
      <p>Ein Torluftschleier ist ein über der Tür montiertes Gerät, das einen kräftigen, gleichmäßigen Luftstrom nach unten bläst. Bei geöffneter Tür bildet dieser Luftstrom eine unsichtbare Barriere zwischen innen und außen. So bleibt im Winter die erwärmte und im Sommer die gekühlte Luft im Raum.</p>

      <h2>Wozu dient ein Torluftschleier?</h2>
      <p>Kurz: Er verringert bei geöffneter Tür das Entweichen erwärmter oder gekühlter Raumluft und das Eindringen kalter oder warmer Außenluft. Die Vorteile:</p>
      <ul>
        <li><strong>Energieeinsparung:</strong> Weil weniger konditionierte Luft durch die Tür entweicht, laufen Klima- und Heizungsanlage weniger. In Betrieben, deren Tür den ganzen Tag auf- und zugeht, ist der Unterschied deutlich.</li>
        <li><strong>Komfort im Eingang:</strong> Kaltluftströmung und Zugluft an der Tür nehmen ab; Mitarbeiter an Kasse, Information und Empfang arbeiten angenehmer.</li>
        <li><strong>Tür offen halten:</strong> Geschäfte und Restaurants können ihre Tür offen lassen; Kunden treten leichter ein, und das Raumklima bleibt erhalten.</li>
        <li><strong>Eingang im Winter beheizen:</strong> Torluftschleier mit Heizung bilden eine warme Luftbarriere an der Tür; eine separate Heizung für den Eingangsbereich ist unter Umständen nicht nötig.</li>
        <li><strong>Außeneinflüsse verringern:</strong> Der Luftstrom hilft, das Eindringen von Staub, Abgasgeruch und Fluginsekten zu reduzieren.</li>
      </ul>

      <h2>Wo werden sie eingesetzt?</h2>
      <ul>
        <li><strong>Gewerbliche Eingänge:</strong> Geschäfte, Märkte, Apotheken, Banken, Cafés und Restaurants</li>
        <li><strong>Hotel- und Einkaufszentrumseingänge:</strong> Bereiche mit viel Personenverkehr und häufig geöffneten Türen</li>
        <li><strong>Büro- und Wohnhauseingänge:</strong> Gebäudelobbys und Haupteingänge</li>
        <li><strong>Industrietore:</strong> Tore von Lagern, Werkstätten, Fabriken und Hangars; für hohe Tore werden Industrieserien eingesetzt</li>
      </ul>

      <h2>Wie wählt man den richtigen Torluftschleier?</h2>
      <h3>1. Türbreite</h3>
      <p>Die Länge des Torluftschleiers sollte der Türbreite entsprechen oder etwas größer sein. Deckt der Luftstrom nicht die ganze Tür ab, entweicht Luft an den Rändern. Bei breiten Türen werden mehrere Geräte nebeneinander montiert.</p>
      <h3>2. Montagehöhe</h3>
      <p>Die Höhe, in der das Gerät über der Tür montiert wird, ist das wichtigste Kriterium für die Wahl der Serie. Der Luftstrom muss den Boden wirksam erreichen. Bei Niva-Torluftschleiern ohne Heizung eignet sich beispielsweise die Standardserie Linda für Montagehöhen bis 3 m, die Gewerbeserie Life bis 4 m, die Industrieserie Lena bis 6 m und die Turbo-Serie bis 12 m.</p>
      <div class="tablo"><table>
        <thead><tr><th>Serie</th><th>Typ</th><th>Max. Montagehöhe (ohne / mit Heizung)</th><th>Gerätelänge</th><th>Geeignet für</th></tr></thead>
        <tbody>
          <tr><td>Niva Linda</td><td>Standardausführung</td><td>3,0 m / 2,5 m</td><td>85 – 200 cm</td><td>Geschäfts-, Büro-, Wohnungseingänge</td></tr>
          <tr><td>Niva Smart Kaset</td><td>Deckeneinbau</td><td>3,8 m / 3,5 m</td><td>120 – 200 cm</td><td>Eingänge mit abgehängter Decke</td></tr>
          <tr><td>Niva Life</td><td>Gewerbeausführung</td><td>4,0 m / 3,5 m</td><td>100 – 250 cm</td><td>Restaurants, Märkte, gewerbliche Eingänge</td></tr>
          <tr><td>Niva Lena</td><td>Industrieausführung</td><td>6,0 m / 6,0 m</td><td>85 – 120 cm</td><td>Lager, Werkstätten, hohe Tore</td></tr>
          <tr><td>Niva Turbo</td><td>Industrieausführung</td><td>12 m</td><td>100 cm</td><td>Fabriken, Hangars</td></tr>
        </tbody>
      </table></div>
      <p>Ist die Tür breiter als ein einzelnes Gerät, werden zwei oder mehr Geräte nebeneinander montiert, sodass die ganze Tür abgedeckt ist.</p>
      <h3>3. Mit oder ohne Heizung?</h3>
      <p>Wird der Raum bereits durch Klimaanlage oder Zentralheizung gut beheizt, kann ein Modell ohne Heizung genügen. Soll auch der Eingangsbereich im Winter erwärmt werden, wählt man ein Modell mit Heizung. Modelle mit Heizung haben eine höhere elektrische Leistungsaufnahme; Absicherung und Kabelquerschnitt sind entsprechend zu prüfen.</p>
      <h3>4. Montageart</h3>
      <p>Ist über der Tür genügend Platz, werden Wandgeräte eingesetzt. In Geschäften mit abgehängter Decke bieten Deckeneinbau- (Kassetten-) Torluftschleier eine unsichtbare Lösung. Ist über der Tür gar kein Platz, werden vertikale Modelle neben der Tür aufgestellt.</p>

      <h2>Was bei der Montage zu beachten ist</h2>
      <ul>
        <li>Das Gerät sollte möglichst nah an der Tür und direkt über ihr montiert werden.</li>
        <li>Wird der Luftaustritt leicht nach außen geneigt, verstärkt das die Barriere.</li>
        <li>An Fassaden mit ständigem Wind reicht ein Torluftschleier allein unter Umständen nicht aus; er sollte mit einem Windfang oder einer Doppeltür kombiniert werden.</li>
        <li>Je nach Modell kann ein Türkontakt angeschlossen werden, damit sich das Gerät beim Öffnen der Tür automatisch einschaltet; das verhindert unnötigen Betrieb.</li>
      </ul>

      <h2>Niva- und Olefini-Torluftschleier</h2>
      <p>Wir bei İklim Ofisi liefern und montieren Torluftschleier der Marken Niva und Olefini. Niva bietet ein breites Serienprogramm in Standard-, Gewerbe-, Deckeneinbau-, Industrie- und Vertikalausführung. Olefini fügt sich mit elegantem Design und digitalem Bedienfeld harmonisch in die Einrichtung von Geschäfts-, Hotel- und Restauranteingängen ein.</p>
      <p>Serien und Maße finden Sie auf unserer Seite <a href="/hava-perdesi">Torluftschleier</a>. Teilen Sie uns Türbreite, Montagehöhe und Ihren Wunsch mit oder ohne Heizung mit – wir erstellen ein <a href="/iletisim">Angebot</a> mit dem passenden Modell.</p>
    `,
    sss: [
      [
        "Erhöht ein Torluftschleier die Stromrechnung?",
        "Modelle ohne Heizung haben eine geringe Leistungsaufnahme, da sie nur den Ventilatormotor betreiben. Modelle mit Heizung nehmen bei eingeschalteter Heizung mehr Leistung auf. Wird das Gerät über einen Türkontakt nur bei geöffneter Tür betrieben, wird unnötiger Verbrauch vermieden; und weil weniger Wärme durch die Tür entweicht, laufen auch Klimaanlage und Heizung weniger.",
      ],
      [
        "Ersetzt ein Torluftschleier Klimaanlage oder Heizung?",
        "Nein. Ein Torluftschleier heizt oder kühlt den Raum nicht; er verringert den Verlust des vorhandenen Raumklimas durch die Tür. Modelle mit Heizung erwärmen den Türbereich, ersetzen aber nicht die Heizung des Raumes.",
      ],
      [
        "Wird ein Torluftschleier innen oder außen montiert?",
        "In der Regel innen, möglichst nah an der Tür und direkt über ihr. Wird der Luftaustritt leicht nach außen geneigt, verstärkt das die Barriere.",
      ],
      [
        "Kann man einen Torluftschleier auch zu Hause einsetzen?",
        "Ja. Standardmodelle werden auch an Wohnungs- und Gebäudeeingängen eingesetzt; besonders an häufig geöffneten Eingangs-, Garten- oder Terrassentüren verringern sie die Zugluft.",
      ],
      [
        "Hält ein Torluftschleier Fliegen und Staub ab?",
        "Der Luftstrom hilft, das Eindringen von Fluginsekten, Staub und Abgasgeruch zu verringern, hält sie aber nicht vollständig ab. Sein Hauptzweck ist die Verringerung von Wärmeverlust und Zugluft.",
      ],
      [
        "Wovon hängt der Preis eines Torluftschleiers ab?",
        "Die wichtigsten Faktoren sind Gerätelänge, Serie (Montagehöhe), Ausführung mit oder ohne Heizung und die Steuerungsoptionen. Wenn Sie uns Türbreite und Montagehöhe mitteilen, erstellen wir ein verbindliches Preisangebot mit dem passenden Modell.",
      ],
    ],
  },
  "aluminyum-radyator-mu-celik-panel-radyator-mu": {
    baslik: "Aluminium- oder Stahl-Flachheizkörper? Unterschiede und die richtige Wahl",
    kategori: "HEIZUNG",
    okumaSuresi: "6 Min. Lesezeit",
    seoBaslik: "Aluminium- oder Flachheizkörper? Vergleichstabelle",
    seoAciklama: "Aluminium- vs. Stahl-Flachheizkörper: Aufheizzeit, Gewicht, Wasserqualität und Kosten im Vergleich. Wie viele Glieder? Rechenbeispiel und Empfehlung.",
    gorselAlt: "Ayen Aluminiumheizkörper in Holzoptik",
    ozet: "Vergleich von Aluminium- und Stahl-Flachheizkörpern hinsichtlich Aufheizgeschwindigkeit, Gewicht, Optik, Wasserqualität und Kosten; wie die Gliederzahl berechnet wird und welcher Typ wann zu bevorzugen ist.",
    icerikHtml: `
      <aside><p><strong>Kurz gesagt:</strong> Aluminiumheizkörper heizen schneller auf, sind leicht und bieten viele Designoptionen; sie erfordern Aufmerksamkeit beim pH-Wert des Heizungswassers. Stahl-Flachheizkörper sind bei gleicher Wärmeleistung meist günstiger, heizen langsamer auf und halten die Wärme etwas länger. Unabhängig von der Wahl muss die Heizkörperleistung nach der Heizlast des Raumes bestimmt werden.</p></aside>

      <h2>Der grundlegende Unterschied zwischen den beiden Heizkörpertypen</h2>
      <p><strong>Stahl-Flachheizkörper</strong> werden aus gepressten und verschweißten Stahlblechen hergestellt und sind in der Türkei der in Wohnungen am weitesten verbreitete Heizkörpertyp. <strong>Aluminiumheizkörper</strong> entstehen durch das Verbinden von stranggepressten oder gegossenen Gliedern. Material und Herstellung beeinflussen Aufheizgeschwindigkeit, Gewicht, Optik und Einsatzbedingungen direkt.</p>

      <h2>Vergleich</h2>
      <div class="tablo"><table>
        <thead><tr><th>Merkmal</th><th>Aluminiumheizkörper</th><th>Stahl-Flachheizkörper</th></tr></thead>
        <tbody>
          <tr><td>Aufheizgeschwindigkeit</td><td>Schnell (hohe Wärmeleitfähigkeit, geringer Wasserinhalt)</td><td>Langsamer; hält die Wärme nach dem Abschalten etwas länger</td></tr>
          <tr><td>Gewicht</td><td>Leicht, einfache Montage</td><td>Schwerer</td></tr>
          <tr><td>Größe</td><td>Anpassbar durch Hinzufügen oder Entfernen von Gliedern</td><td>Standardlängen und -höhen</td></tr>
          <tr><td>Optik</td><td>Farben, Holz- und Metalldekore</td><td>Schlicht, standardmäßig</td></tr>
          <tr><td>Wasserqualität</td><td>pH-Wert im Herstellerbereich halten, ggf. Inhibitor</td><td>Übliche Pflege des Heizungswassers</td></tr>
          <tr><td>Kosten</td><td>Bei gleicher Leistung meist höher</td><td>Meist günstiger</td></tr>
        </tbody>
      </table></div>
      <h3>Aufheizgeschwindigkeit</h3>
      <p>Aluminium leitet Wärme deutlich besser als Stahl, und Aluminiumheizkörper haben einen geringen Wasserinhalt. Deshalb gibt ein Aluminiumheizkörper kurz nach dem Einschalten Wärme ab und reagiert schnell auf die Einstellung der Thermostatventile. Ein Stahl-Flachheizkörper enthält mehr Wasser, heizt daher langsamer auf und hält die Wärme nach dem Abschalten etwas länger.</p>
      <h3>Gewicht und Montage</h3>
      <p>Aluminiumheizkörper sind leicht; Transport und Montage sind einfach, und die Wand wird weniger belastet.</p>
      <h3>Flexible Abmessungen</h3>
      <p>Die Länge eines Aluminiumheizkörpers ergibt sich aus der Gliederzahl; Glieder können je nach Bedarf hinzugefügt oder entfernt werden. Stahl-Flachheizkörper werden in bestimmten Standardlängen und -höhen gefertigt.</p>
      <h3>Optik</h3>
      <p>Aluminiumheizkörper bieten mit unterschiedlichen Gliederdesigns, Farben sowie Holz- und Metalldekoren viele Gestaltungsmöglichkeiten. Ein Stahl-Flachheizkörper hat eine schlichte, standardmäßige Optik.</p>
      <h3>Wasserqualität</h3>
      <p>In Anlagen mit Aluminiumheizkörpern muss der pH-Wert des Heizungswassers im vom Hersteller angegebenen Bereich gehalten und bei Bedarf ein geeigneter Inhibitor eingesetzt werden. Das ist für die Lebensdauer von Heizkörper und Kessel wichtig. Das ausführende Team muss darauf achten.</p>
      <h3>Kosten</h3>
      <p>Bei gleicher Wärmeleistung ist ein Stahl-Flachheizkörper meist günstiger. Beim Aluminiumheizkörper wird der Mehrpreis durch schnelles Aufheizen, lange Lebensdauer, geringes Gewicht und Designvielfalt aufgewogen.</p>

      <h2>Wie viele Glieder werden benötigt?</h2>
      <p>Die Heizkörperauswahl beginnt immer mit einer raumweisen Heizlastberechnung. Die Gliederzahl ergibt sich aus der berechneten Heizlast geteilt durch die Wärmeleistung pro Glied des gewählten Modells. Ein Raum mit 1.500 W Heizlast benötigt beispielsweise rund 10 Glieder, wenn ein 600 mm hohes Modell mit 151 W pro Glied gewählt wird.</p>
      <p>Die Gliederleistungen in Katalogen gelten für eine bestimmte Temperaturdifferenz (meist Δt 60, also 90/70 °C Wasser und 20 °C Raum). In Anlagen mit niedrigeren Wassertemperaturen, etwa mit Brennwertkessel oder Wärmepumpe, sinkt die Wärmeabgabe des Heizkörpers; die Gliederzahl muss für diese niedrigere Temperatur berechnet werden.</p>

      <h2>Wann welcher Typ?</h2>
      <ul>
        <li><strong>Aluminiumheizkörper:</strong> Wohnungen, Villen, Büros und Hotels, in denen schnelles Aufheizen gewünscht ist, Räume einzeln über Thermostatventile geregelt werden und die Optik wichtig ist.</li>
        <li><strong>Stahl-Flachheizkörper:</strong> Projekte, bei denen das Budget Vorrang hat und eine Standardoptik genügt.</li>
      </ul>

      <h2>Ayen Aluminiumheizkörper</h2>
      <p>Wir bei İklim Ofisi liefern und montieren Ayen Aluminiumheizkörper und Badheizkörper. Ayen-Heizkörper bestehen aus einer Legierung mit 98 % Aluminium und sind nach EN 442 und TSE zertifiziert; jeder Heizkörper wird einer Dichtheitsprüfung mit 15 bar unterzogen. 9 Paneelheizkörper- und 9 Badheizkörper-Serien sind in 30 Farben erhältlich.</p>
      <p>Modelle, Maße und Farben finden Sie auf unserer Seite <a href="/ayen">Ayen Aluminiumheizkörper</a>; den groben Wärmebedarf Ihrer Räume ermitteln Sie mit unserem <a href="/hesaplama">Leistungsrechner</a>. Für die genaue Gliederzahl fordern Sie eine <a href="/iletisim">Besichtigung</a> an.</p>
    `,
    sss: [
      [
        "Heizt ein Aluminium- oder ein Flachheizkörper besser?",
        "Zwei für die Heizlast des Raumes richtig dimensionierte Heizkörper bringen den Raum auf dieselbe Temperatur. Der Unterschied liegt in der Aufheizgeschwindigkeit: Ein Aluminiumheizkörper gibt kurz nach dem Einschalten Wärme ab und reagiert schnell auf das Thermostatventil; ein Stahl-Flachheizkörper heizt langsamer auf.",
      ],
      [
        "Wie viel Watt liefert ein Glied eines Aluminiumheizkörpers?",
        "Das hängt von Modell und Bauhöhe ab. Die 600 mm hohen Ayen-Modelle liefern bei Δt 60 (90/70 °C Wasser, 20 °C Raum) etwa 98 W bis 163 W pro Glied. Bei niedrigeren Wassertemperaturen sinkt dieser Wert.",
      ],
      [
        "Eignen sich Aluminiumheizkörper für Kombithermen?",
        "Ja, sie werden mit Kombithermen und Brennwertkesseln eingesetzt. Der pH-Wert des Heizungswassers muss im vom Hersteller angegebenen Bereich gehalten werden. Soll der Brennwertkessel mit niedriger Wassertemperatur betrieben werden, ist die Gliederzahl für diese Temperatur zu berechnen.",
      ],
      [
        "Kann man Aluminiumheizkörper mit einer Wärmepumpe betreiben?",
        "Ja; da eine Wärmepumpe jedoch mit niedrigerer Wassertemperatur arbeitet, sinkt die Wärmeabgabe des Heizkörpers und für denselben Raum sind mehr Glieder nötig. Die Auswahl muss sich nach der Vorlauftemperatur der Wärmepumpe richten.",
      ],
      [
        "Rosten Aluminiumheizkörper?",
        "Aluminium rostet nicht wie Stahl; in Heizungswasser mit ungeeignetem pH-Wert kann es jedoch korrodieren. Deshalb sollte das Heizungswasser geprüft und bei Bedarf ein geeigneter Inhibitor eingesetzt werden.",
      ],
      [
        "Kann ich vorhandene Flachheizkörper durch Aluminiumheizkörper ersetzen?",
        "Ja. Die Leistung des neuen Heizkörpers wird nach der Heizlast des Raumes gewählt; Anschlussmaße und Ventilpositionen werden bei der Besichtigung geprüft und an die bestehende Installation angepasst.",
      ],
    ],
  },
  "endustriyel-mutfak-havalandirma-elektrostatik-filtre": {
    baslik: "Elektrostatische Filtration in der Gewerbeküchenlüftung: AIRNEX",
    kategori: "KÜCHENLÜFTUNG",
    okumaSuresi: "4 Min. Lesezeit",
    gorselAlt: "AIRNEX Gerät mit Elektrofilter in einer Gewerbeküche",
    ozet: "Wie funktionieren Abluftgeräte mit Elektrofilterzellen zur Kontrolle von Fettaerosolen, Rauch und Feinstaub in der Abluft von Restaurant- und Gewerbeküchen, und welche Angaben braucht man für ein Projekt?",
    icerikHtml: `
      <h2>Das eigentliche Problem der Küchenabluft: Fettaerosole und Rauch</h2>
      <p>Kochgeräte wie Grill, Fritteuse und Herd geben Fetttröpfchen, Rauch und Feinstaub an die Abluft ab. Diese Schadstoffe lagern sich im Kanal ab, belästigen die Umgebung und erhöhen die Wartungskosten.</p>

      <h2>Wie funktioniert das AIRNEX Abluftgerät mit Elektrofilterzelle?</h2>
      <p>Im AIRNEX-System durchläuft die Luft vier Stufen: Der <strong>Vorfilter</strong> hält große Fetttröpfchen und grobe Partikel zurück; im <strong>Ionisierungsteil</strong> werden feine Partikel elektrisch aufgeladen; in der <strong>Abscheidezelle</strong> werden die geladenen Partikel von den Kollektorplatten angezogen und festgehalten; die gefilterte Luft wird über den <strong>Systemventilator</strong> in die Abluft geführt.</p>

      <h2>Zur Geruchskontrolle</h2>
      <p>Die elektrostatische Filtration richtet sich hauptsächlich gegen partikelförmige Schadstoffe. Für gasförmige Geruchsstoffe wird bei Bedarf zusätzlich eine Aktivkohle-, UV- oder andere geeignete Stufe geplant.</p>

      <h2>Welche Angaben braucht man für ein Projekt?</h2>
      <p>Für die richtige Auswahl werden Luftmenge (m³/h), Gesamtdruck (Pa), Kanalmaß, Ablufttemperatur, Koch-/Prozessart und tägliche Betriebszeit benötigt. Mit diesen Daten legen unsere Ingenieure das Gerät aus und planen die gesamte Strecke von der Haube bis zum Ventilator.</p>
    `,
  },
  "vrf-rehberi-mitsubishi-electric-ve-tcl": {
    baslik: "VRF-Klimatisierungsratgeber: TCL- und Mitsubishi-Electric-VRF-Technologien",
    kategori: "VRF-ZENTRALSYSTEME",
    okumaSuresi: "5 Min. Lesezeit",
    gorselAlt: "TCL VRF-Außengerät",
    ozet: "Eine ingenieurtechnische Bewertung der TCL TMV-Serie und der Mitsubishi Electric City Multi VRF-Systeme, die die Klimatisierungskosten in Hotel-, Bürohaus- und Wohnprojekten senken.",
    icerikHtml: `
      <h2>Was ist VRF-/VRV-Klimatisierung?</h2>
      <p>VRF-Systeme (Variable Refrigerant Flow) verbinden mit variablem Kältemittelmassenstrom Dutzende Innengeräte mit einer Außengerätegruppe und ermöglichen so die unabhängige Klimatisierung jedes Raumes.</p>

      <h2>TCL TMV-Serie VRF-Systeme</h2>
      <p>Die VRF-Systeme der neuen TMV-Generation von TCL verbinden mit Inverter-Verdichtern und intelligenter Steuerung hohe Effizienz mit wettbewerbsfähigen Investitionskosten in Büro-, Geschäfts-, Hotel- und Wohnprojekten. Dank eines breiten Innengeräteprogramms bieten sie flexible Lösungen für unterschiedliche Raumtypen. Modelle und technische Daten finden Sie auf unserer Seite <a href="/tcl-vrf">TCL VRF-Systeme</a>.</p>

      <h2>Vorteile von Mitsubishi Electric City Multi VRF</h2>
      <p>Mitsubishi Electric VRF-Systeme zeichnen sich durch ihre Inverter-Verdichter und hohe COP-/EER-Effizienzwerte aus. Die Zubadan-Technologie, die selbst bei niedrigen Außentemperaturen eine hohe Heizleistung bietet, sorgt in Hotel- und Bürohausprojekten für hohen Komfort.</p>

      <h2>Welches System sollten Sie für Ihr Projekt wählen?</h2>
      <p>Unser Ingenieurteam berechnet die Kühl- und Heizlast anhand von Fassadenausrichtung, Glasflächen und Nutzung Ihres Gebäudes und plant das für Ihr Projekt und Budget am besten geeignete VRF-System von TCL oder Mitsubishi Electric.</p>
    `,
  },
  "buderus-ile-merkezi-ve-bireysel-isitma": {
    baslik: "Was ist ein Kaskadenkessel? Ratgeber zur Zentralheizung mit Buderus Brennwertkesseln",
    kategori: "HEIZUNG & KASKADE",
    okumaSuresi: "6 Min. Lesezeit",
    gorselAlt: "Wandhängender Buderus Logamax plus GB272 Brennwertkessel",
    ozet: "Was ist ein Kaskadenkessel und welche Vorteile hat er gegenüber einem großen Einzelkessel? Kaskadenanlagen von 49 kW bis 2.400 kW mit dem Buderus Logamax plus GB272 Brennwertkessel, Leistungsauswahl und was im Heizraum zu beachten ist.",
    icerikHtml: `
      <h2>Was ist ein Kaskadenkessel?</h2>
      <p>Bei einer Kaskadenanlage wird der Wärmebedarf eines Gebäudes nicht von einem großen Kessel, sondern von <strong>mehreren gemeinsam arbeitenden Kesseln</strong> gedeckt. Die Kessel werden über eine gemeinsame Regelung gesteuert; bei geringem Wärmebedarf laufen nur ein oder zwei Kessel, mit sinkender Außentemperatur und steigendem Bedarf schalten nacheinander weitere Kessel zu.</p>
      <p>In zentral beheizten Gebäuden wie Mehrfamilienhäusern, Wohnanlagen, Hotels, Schulen, Krankenhäusern und Bürogebäuden ersetzen Kaskadenanlagen zunehmend den großen Einzelkessel. Der Grund ist einfach: Ein Gebäude benötigt nur in einem sehr kleinen Teil des Jahres die volle Heizleistung und verbringt den Großteil der übrigen Zeit im Teillastbetrieb.</p>

      <h2>Großer Einzelkessel oder Kaskade?</h2>
      <h3>1. Effizienz bei Teillast</h3>
      <p>Ein großer Einzelkessel muss in Zeiten geringen Bedarfs wie Frühjahr und Herbst weit unter seiner Leistung arbeiten. In einer Kaskade laufen nur so viele Kessel, wie gerade nötig sind; jeder Kessel bleibt in seinem effizienten Bereich. Der Modulationsbereich von 1:6 des Buderus Logamax plus GB272 ermöglicht zudem, dass jeder Kessel seine Leistung an den momentanen Bedarf anpasst.</p>
      <h3>2. Redundanz</h3>
      <p>Fällt bei einer Einkesselanlage der Kessel aus, bleibt das Gebäude ohne Heizung. In einer Kaskade können die übrigen Kessel weiterlaufen und die Heizung aufrechterhalten, während ein Kessel wegen einer Störung oder Wartung außer Betrieb ist.</p>
      <h3>3. Platzbedarf und Einbringung</h3>
      <p>Wandkessel sind kompakt und lassen sich problemlos durch enge Treppenhäuser und Türen transportieren. Mit dem GB272 lassen sich selbst in engen oder niedrigen Heizräumen 900 kW installierte Leistung auf weniger als 2 m² realisieren. Die Kessel können an der Wand hängen oder mit einem Bodenmontageset nebeneinander auf dem Boden stehen.</p>
      <h3>4. Schrittweise Investition und Erweiterung</h3>
      <p>Wächst das Gebäude oder kommt ein neuer Block hinzu, können der Anlage weitere Kessel hinzugefügt werden. Auch bei der Sanierung einer alten Zentralheizung ist die Anpassung an den bestehenden Heizraum einfacher.</p>

      <h2>Warum ist ein Brennwertkessel effizienter?</h2>
      <p>Das bei der Verbrennung von Erdgas entstehende Abgas enthält Wasserdampf. Bei herkömmlichen Kesseln entweicht dieser Dampf über den Schornstein, und die darin enthaltene Wärme geht verloren. Ein <strong>Brennwertkessel</strong> kühlt dagegen das Abgas ab, kondensiert den Dampf und führt die frei werdende latente Wärme ebenfalls dem Heizungswasser zu. Deshalb liegt der Wirkungsgrad von Brennwertkesseln bezogen auf den Heizwert über 100 %.</p>
      <p>Damit Kondensation stattfindet, muss das zum Kessel zurückfließende Wasser kühl sein. Je niedriger die Rücklauftemperatur, desto effizienter arbeitet der Kessel. Der Normnutzungsgrad des Buderus GB272 liegt bei 40/30 °C zwischen 109,7 und 110,6 % und bei 75/60 °C zwischen 106 und 107,3 % (bezogen auf den Heizwert). Deshalb steigert die Auslegung von Heizkörpern und Fußbodenheizung auf niedrige Wassertemperaturen in Anlagen mit Brennwertkessel die Effizienz direkt.</p>

      <h2>Kaskade mit dem Buderus Logamax plus GB272</h2>
      <p>Der Buderus Logamax plus GB272 ist ein wandhängender Gas-Brennwertkessel für Wohn-, öffentliche und Gewerbebauten:</p>
      <ul>
        <li><strong>Leistungen:</strong> 49, 69, 100, 125 und 150 kW</li>
        <li><strong>Kaskade:</strong> bis zu 16 Kessel, insgesamt 2.400 kW</li>
        <li><strong>Vorlauftemperatur:</strong> bis 85 °C bei voller Leistung</li>
        <li><strong>Emissionen:</strong> NOx-Klasse 6</li>
        <li><strong>Wärmetauscher:</strong> oberflächenbeschichteter ALU-plus-Aluminiumwärmetauscher</li>
        <li><strong>Brennstoff:</strong> Erdgas und Propan</li>
        <li><strong>Regelung:</strong> Regelgerät Logamatic BC30; mit Logamatic 5000 Modbus TCP/IP, 0–10-V-GLT-Signal und Fernzugriff</li>
      </ul>
      <p>Bei den Modellen mit 125 und 150 kW wird die Kaskaden-Abgasklappe mit dem Kessel geliefert. Da die Kessel direkt nebeneinander stehen können, benötigt die Kaskadengruppe im Heizraum wenig Platz.</p>

      <h2>Wie wird die Leistung bestimmt?</h2>
      <p>Der erste Schritt bei der Kesselauswahl ist die <strong>Heizlastberechnung</strong> des Gebäudes. Sie berücksichtigt die Flächen von Außenwänden, Dach, Boden und Fenstern, den Dämmstandard und die Außenauslegungstemperatur des Standorts. Soll auch das Warmwasser über den Kessel bereitet werden (Speicher), wird dieser Bedarf zusätzlich berücksichtigt.</p>
      <p>Nach Festlegung der Gesamtleistung wird über die Zahl der Kessel entschieden. Ein Gebäude mit 300 kW Bedarf kann beispielsweise mit einer Kaskade aus 2 × 150 kW oder 3 × 100 kW versorgt werden. Mehrere kleinere Kessel ermöglichen einen feineren Betrieb bei geringer Last und eine bessere Redundanz; wenige große Kessel senken Anfangsinvestition und Anschlusszahl. Das richtige Gleichgewicht legen wir anhand des Nutzungsprofils des Gebäudes fest.</p>

      <h2>Was im Heizraum zu beachten ist</h2>
      <ul>
        <li><strong>Hydraulische Trennung:</strong> In Kaskadenanlagen werden Kessel- und Gebäudekreis meist über eine hydraulische Weiche oder einen Plattenwärmetauscher getrennt, damit jeder Kessel mit dem richtigen Volumenstrom arbeitet.</li>
        <li><strong>Abgasanlage:</strong> Die Kaskaden-Abgasanlage muss nach Anzahl und Leistung der Kessel dimensioniert werden.</li>
        <li><strong>Kondensat:</strong> Brennwertkessel erzeugen im Betrieb Kondensat (beim GB272 je nach Modell bis zu 6–16 Liter pro Stunde); es muss an einen geeigneten Ablauf angeschlossen werden.</li>
        <li><strong>Heizungswasser:</strong> In alten Anlagen muss das System gereinigt und die Wasserqualität im vom Hersteller vorgegebenen Bereich gehalten werden.</li>
        <li><strong>Regelung:</strong> Witterungsgeführter Betrieb und die Anbindung an die Gebäudeleittechnik senken die Betriebskosten.</li>
      </ul>

      <h2>Ihr Buderus-Kesselprojekt mit İklim Ofisi</h2>
      <p>Von der Heizlastberechnung über die Kaskadenplanung und die Heizraumplanung bis zu Montage und Inbetriebnahme betreuen wir Buderus-Kesselprojekte aus einer Hand. Modelle, technische Tabellen und den Katalog finden Sie auf unserer Seite <a href="/buderus">Buderus Kessel</a>. Den Einfluss niedriger Wassertemperaturen auf die Heizkörperauswahl erläutern wir in unserem <a href="/blog/aluminyum-radyator-mu-celik-panel-radyator-mu">Vergleich von Aluminium- und Stahl-Flachheizkörpern</a>. Für Ihr Gebäude können Sie eine <a href="/iletisim">Besichtigung und ein Angebot</a> anfordern.</p>
    `,
  },
  "endustriyel-havalandirma-ve-isi-geri-kazanim": {
    baslik: "Lüftung mit Wärmerückgewinnung (WRG) in Industrieanlagen",
    kategori: "LÜFTUNG",
    okumaSuresi: "6 Min. Lesezeit",
    gorselAlt: "Schnittansicht eines Lüftungsgeräts mit Wärmerückgewinnung",
    ozet: "Lüftungszentralen (RLT) mit Wärmerückgewinnung, die in Fabriken, Einkaufszentren und Tiefgaragen Frischluft liefern, ohne die Raumwärme zu verlieren, sowie die Planung von Wickelfalzrohrkanälen.",
    icerikHtml: `
      <h2>Warum ein Gerät mit Wärmerückgewinnung?</h2>
      <p>Geräte, die verbrauchte Luft aus geschlossenen Räumen abführen und dabei die zugeführte Frischluft mit der Wärme der Abluft erwärmen bzw. kühlen, nennt man Lüftungsgeräte mit Wärmerückgewinnung (WRG). Dieses System verringert Ihre Kühl- und Heizlast um bis zu 70 %.</p>

      <h2>Lüftungszentralen (RLT) und Herstellung von Wickelfalzrohren</h2>
      <p>In Industrieanlagen werden Luftmengen (m³/h) und Druckverluste in AutoCAD berechnet, und die Luft wird über dichte runde Wickelfalzrohre verteilt.</p>
    `,
  },
  "klima-kapasite-hesabi-ve-inverter-teknolojisi": {
    baslik: "Die richtige Klimaanlage wählen: Kühllastberechnung und Vorteile von Inverter-Verdichtern",
    kategori: "RATGEBER",
    okumaSuresi: "3 Min. Lesezeit",
    gorselAlt: "Wandklimagerät im Wohnzimmer",
    ozet: "Fehler bei der Auswahl einer Klimaanlage allein nach Quadratmetern, der Einfluss der Glasflächen und die Auswirkung der Inverter-Technik von TCL / Mitsubishi Electric auf die Stromrechnung.",
    icerikHtml: `
      <h2>Warum ist die Auswahl nach Quadratmetern falsch?</h2>
      <p>Zwischen einem Dachgeschossraum und einem Raum im Erdgeschoss mit gleicher Fläche besteht ein Unterschied von 50 % in der Kühllast. Klimaanlagen, die ohne Berücksichtigung von Glasflächen, Dämmung und Fassadenausrichtung gekauft werden, sind entweder zu schwach oder verbrauchen unnötig viel Strom.</p>

      <h2>Wie spart ein Inverter-Verdichter Energie?</h2>
      <p>Ältere Klimageräte schalten ständig ein und aus und ziehen hohe Anlaufströme. Inverter-Klimageräte von TCL und Mitsubishi Electric passen ihre Drehzahl dagegen der Raumtemperatur an und arbeiten kontinuierlich mit A+++-Effizienz.</p>
    `,
  },
};
