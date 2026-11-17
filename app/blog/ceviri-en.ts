import type { MakaleCevirisi } from "./data";

// İngilizce makale çevirileri (anahtar: makale slug'ı; slug ve görseller Türkçe ile aynı).
// İçerikteki site içi bağlantılar Türkçe yolla yazılır ("/tcl-vrf"); sayfada otomatik "/en/..." olur.
export const CEVIRI_EN: Record<string, MakaleCevirisi> = {
  "tcl-mini-vrf-nedir-villa-ve-kucuk-ofis": {
    baslik: "What Is TCL Mini VRF? A Guide for Villas, Duplexes and Small Offices",
    kategori: "TCL VRF",
    okumaSuresi: "5 min read",
    gorselAlt: "TCL Mini VRF full DC inverter outdoor unit",
    ozet: "What is TCL Mini VRF and how does it differ from split and multi-split air conditioners? 8–28 kW capacities, single- and three-phase models, SEER/SCOP values, operating temperatures and the right capacity selection for villas, duplexes and small offices.",
    icerikHtml: `
      <h2>What Is Mini VRF?</h2>
      <p>Mini VRF is a version of the VRF technology used in large buildings, designed for smaller projects. Several indoor units are connected to a single outdoor unit; the system sends each room as much refrigerant as it needs, heating and cooling the rooms independently. This way, all the rooms of a villa or a small office are conditioned by a single outdoor unit, without a row of air conditioner outdoor units on the façade.</p>

      <h2>The TCL Mini VRF Series</h2>
      <p>TCL Mini VRF consists of outdoor units with full DC inverter twin rotary compressors and is available in 9 capacities between <strong>8 kW and 28 kW</strong>:</p>
      <ul>
        <li><strong>Single-phase (220–240 V):</strong> models with cooling capacities of 8.0 – 9.0 – 12.1 – 14.0 – 15.5 kW</li>
        <li><strong>Three-phase:</strong> models with cooling capacities of 18.0 – 22.4 – 25.2 – 28.0 kW</li>
      </ul>
      <p>Single-phase models are very convenient for homes without a three-phase electricity connection. According to the catalogue, the seasonal cooling efficiency (SEER) ranges from 5.4 to 7.0 and the seasonal heating efficiency (SCOP) from 3.8 to 4.4, depending on the model.</p>

      <h2>Operating Temperature Range</h2>
      <ul>
        <li><strong>Cooling:</strong> outdoor temperatures from -15 °C to 55 °C</li>
        <li><strong>Heating:</strong> outdoor temperatures from -20 °C to 24 °C</li>
      </ul>
      <p>In Istanbul and similar climates, this range allows Mini VRF to be used not only in summer but also for heating in winter.</p>

      <h2>Split, Multi-Split and Mini VRF Compared</h2>
      <h3>Split air conditioner</h3>
      <p>Each indoor unit has its own outdoor unit. It is the most economical solution for one or two rooms; but as the number of rooms grows, so does the number of outdoor units on the façade.</p>
      <h3>Multi-split</h3>
      <p>Several indoor units are connected to one outdoor unit. The number of connectable indoor units and the piping distances are limited; it suits small apartments.</p>
      <h3>Mini VRF</h3>
      <p>Compared with multi-split, it usually allows more indoor units and longer piping distances, and adjusts capacity more precisely to each room's instantaneous demand. Depending on the project, different indoor unit types such as cassette, ducted (concealed ceiling) and wall-mounted can be combined; we determine the indoor unit options suitable for the outdoor unit model during the site survey. In villas, duplexes and multi-room offices it is a more flexible solution in terms of both appearance and comfort.</p>

      <h2>Which Projects Is It Suitable For?</h2>
      <ul>
        <li><strong>Villas and duplexes:</strong> All rooms on one outdoor unit, a single outdoor unit on the façade</li>
        <li><strong>Small offices and practices:</strong> Independent control of the rooms, regular usage hours</li>
        <li><strong>Shops and cafés:</strong> Invisible installation with cassette or ducted units in the suspended ceiling</li>
        <li><strong>Clinics:</strong> Each room can be kept at a different temperature</li>
      </ul>
      <p>For larger buildings (office towers, hotels, multi-storey offices), the TCL TMV6+ Super Series is used, where 8–32 HP outdoor unit modules are combined up to 128 HP.</p>

      <h2>How Is the Capacity Selected?</h2>
      <p>Mini VRF capacity is determined by the heat gain and heat loss calculated separately for each room. The room capacities are added up, and the outdoor unit is then selected taking into account the proportion of rooms running at the same time (diversity). Façade orientation, glazing ratio, insulation and occupancy directly affect the result, which is why selection "by square metre" is often misleading. For a rough idea, you can use our <a href="/hesaplama">capacity calculator</a>.</p>

      <h2>TCL Mini VRF with İklim Ofisi</h2>
      <p>During the site survey we inspect your rooms one by one and carry out the capacity calculation, determine the outdoor unit location and piping route, and handle supply, installation and commissioning from a single source. For all models and technical tables, see our <a href="/tcl-vrf#mini-vrf">TCL VRF systems</a> page, and read our article <a href="/blog/vrf-mi-split-klima-mi">VRF or split air conditioning?</a> for a comparison of the two systems. Request a <a href="/iletisim">free site survey</a> for your project.</p>
    `,
  },
  "tcl-vrf-nedir-tmv6-super-serisi": {
    baslik: "What Is TCL VRF? What You Need to Know About the TMV6+ Super Series",
    kategori: "TCL VRF",
    okumaSuresi: "6 min read",
    gorselAlt: "TCL TMV6+ Super Series VRF outdoor unit",
    ozet: "The capacity range, efficiency values, operating temperatures, piping lengths and indoor unit options of TCL TMV6+ Super Series VRF systems, and the projects they suit.",
    icerikHtml: `
      <h2>What Is TCL VRF?</h2>
      <p>TCL VRF is a central air conditioning system in which many indoor units are connected to one outdoor unit group. With VRF (Variable Refrigerant Flow) technology, the system sends each room as much refrigerant as it needs at that moment. Each space is heated or cooled independently by its own thermostat, and no energy is wasted on rooms that are rarely used.</p>
      <p>TCL's current VRF series, <strong>TMV6+ Super</strong>, works with full DC inverter compressors and fan motors. The series has been developed for office, hotel, shop, restaurant, office tower and residential projects.</p>

      <h2>Capacity: 32 HP Single Units, 128 HP in Combination</h2>
      <p>The TMV6+ Super Series has 13 different outdoor unit modules from 8 HP to 32 HP. A single outdoor unit is at most 32 HP; in larger projects, modules are combined up to 128 HP. This means the same product family can provide solutions from a small office floor to a large hotel.</p>
      <p>For smaller projects, the <strong>TCL Mini VRF</strong> series is available in a capacity range of 8–28 kW. The 8–16 kW models run on single-phase (220–240 V) and the 18–28 kW models on three-phase power. It is often chosen for projects such as villas, duplexes, small offices and clinics.</p>

      <h2>Efficiency Values</h2>
      <p>According to the catalogue, the seasonal cooling efficiency (SEER) of the TMV6+ Super Series reaches 7.35 and the seasonal heating efficiency (SCOP) 4.50. Because seasonal values reflect the unit's operation at different outdoor temperatures and at part load throughout the year, they are more meaningful for understanding operating costs than a single-point COP/EER value.</p>

      <h2>Operating Temperature Range</h2>
      <ul>
        <li><strong>Cooling:</strong> outdoor temperatures from -15 °C to 56 °C</li>
        <li><strong>Heating:</strong> outdoor temperatures from -30 °C to 28 °C</li>
      </ul>
      <p>Dual-enthalpy (vapour injection) heating technology is used to maintain heating performance at low outdoor temperatures. This is important in projects where heating in winter is also to be provided by the VRF system.</p>

      <h2>Piping Lengths and Installation Flexibility</h2>
      <p>In VRF projects, the piping limits determine where the outdoor unit can be placed. In the TMV6+ Super Series:</p>
      <ul>
        <li>Total piping length up to 1,100 m,</li>
        <li>Actual piping length to the farthest indoor unit 220 m (240 m equivalent),</li>
        <li>Height difference 100 m with the outdoor unit above and 110 m with it below,</li>
        <li>Height difference between indoor units 40 m.</li>
      </ul>
      <p>Because the outdoor unit fan can provide up to 130 Pa of external static pressure, the unit can also be placed in enclosed plant rooms or on intermediate floors; the hot air is ducted outside.</p>

      <h2>Key Technologies</h2>
      <ul>
        <li><strong>DC inverter scroll compressor:</strong> Stepless frequency control adjusts capacity to demand.</li>
        <li><strong>6-stage oil return:</strong> Ensures that compressor oil returns on long piping runs.</li>
        <li><strong>Triple backup:</strong> Thanks to compressor, module and sensor backup operation, a single fault does not stop the whole system.</li>
        <li><strong>Non-polar communication:</strong> There is no polarity in the indoor–outdoor communication cable, reducing the risk of installation errors.</li>
      </ul>

      <h2>Indoor Unit Options</h2>
      <p>More than 100 indoor unit models in 9 categories can be connected to a TCL VRF system. The most commonly used are:</p>
      <ul>
        <li><strong>Cassette type (360°, compact, one-way and two-way):</strong> Offices, shops and restaurants with suspended ceilings</li>
        <li><strong>Ducted type (slim, medium/high and ultra-high static pressure):</strong> Hotel rooms, meeting rooms and spaces requiring concealed installation</li>
        <li><strong>Wall-mounted and floor/ceiling type:</strong> Rooms without a suspended ceiling</li>
        <li><strong>Fresh air type:</strong> Units that condition outdoor air before supplying it indoors</li>
      </ul>

      <h2>Control and Remote Management</h2>
      <p>Each indoor unit can be controlled individually with a wired or wireless controller. With central touch-screen controllers the whole building can be monitored from one point; with the WiFi module and the Tsmart app, the system can also be controlled from a phone.</p>

      <h2>Which Projects Is TCL VRF Suitable For?</h2>
      <p>VRF offers advantages in any building with many rooms used at different times: office floors, office towers, hotels, clinics, schools, shops and villas. In buildings where many split outdoor units on the façade are not wanted, a single outdoor unit group gives a clean appearance.</p>

      <h2>Your TCL VRF Project with İklim Ofisi</h2>
      <p>The right VRF system starts with the right heat load calculation. During the site survey our engineers inspect your building, calculate heat gain and loss space by space, and determine the outdoor unit location and piping route; then they handle supply, installation and commissioning from a single source. For models and technical tables, see our <a href="/tcl-vrf">TCL VRF systems</a> page, and request a <a href="/iletisim">free site survey</a> for your project.</p>
    `,
  },
  "vrf-mi-split-klima-mi": {
    baslik: "VRF or Split Air Conditioning? Choosing the Right System for Your Building",
    kategori: "GUIDE",
    okumaSuresi: "5 min read",
    gorselAlt: "Cassette-type VRF indoor unit mounted in a suspended ceiling",
    ozet: "The differences between split air conditioning and VRF systems: initial investment, operating efficiency, façade appearance, independent control and maintenance. Which system is right for which building.",
    icerikHtml: `
      <h2>How Do the Two Systems Work?</h2>
      <p>In a <strong>split air conditioner</strong>, each indoor unit has its own outdoor unit. Air conditioning five rooms usually requires five outdoor units (in multi-split systems several indoor units can be connected to one outdoor unit, but the number of connectable units is limited).</p>
      <p>In a <strong>VRF system</strong>, one outdoor unit group supplies dozens of indoor units via refrigerant piping. The system sends each room as much refrigerant as it needs, and the rooms are controlled independently.</p>

      <h2>Comparison: 7 Criteria</h2>
      <h3>1. Initial investment</h3>
      <p>For one or a few rooms, split air conditioning is clearly more economical. As the number of rooms increases, the gap narrows; in multi-room buildings, VRF's fewer outdoor units, shorter electrical lines and single control infrastructure balance the total cost.</p>
      <h3>2. Operating efficiency</h3>
      <p>Buildings spend most of the year at part load: some rooms are empty, some get sun, some are in the shade. VRF systems operate highly efficiently under these part-load conditions by adjusting their capacity steplessly. In a multi-room building, annual energy consumption is usually lower than with split systems.</p>
      <h3>3. Façade and roof appearance</h3>
      <p>With split systems, an outdoor unit is hung on the façade for each room. In buildings where the office tower, hotel or residential complex management restricts the façade, this is often not possible. With VRF, the outdoor units are grouped on the roof or in a plant area.</p>
      <h3>4. Piping distance</h3>
      <p>With split air conditioners the piping distance between indoor and outdoor units is short. With VRF systems, piping runs of hundreds of metres allow the outdoor unit to be placed at the most suitable point of the building.</p>
      <h3>5. Control and management</h3>
      <p>With VRF, all indoor units are monitored from a central controller or the building management system; operating hours, temperature limits and fault logs are shown on one screen. In offices and hotels this is an important advantage for energy savings and ease of maintenance.</p>
      <h3>6. Impact of a fault</h3>
      <p>In a split system, a fault in one unit affects only that room. Quality VRF systems can keep running thanks to compressor and module backup; nevertheless, correct design and periodic maintenance become even more important.</p>
      <h3>7. Sharing consumption</h3>
      <p>If a shared VRF system is to be installed in a building consisting of independent apartments, how the consumption of each unit will be allocated must be planned from the start. For small units in separate ownership, a separate system for each unit is often more practical.</p>

      <h2>Which One When?</h2>
      <ul>
        <li><strong>Split air conditioning:</strong> A small number of spaces such as a 1–3 room apartment, a small shop or a single meeting room.</li>
        <li><strong>Mini VRF:</strong> Villas, duplexes, small offices and clinics; mid-sized projects in which one outdoor unit supplies several indoor units.</li>
        <li><strong>VRF:</strong> Office floors, office towers, hotels, schools, shopping centres and any multi-room building with façade restrictions.</li>
      </ul>

      <h2>Before You Decide</h2>
      <p>The right choice is made by looking at the number of spaces, usage hours, the area available for the outdoor unit and the budget together. For indoor units in small rooms, the refrigerant charge must also be checked against the relevant standards. We carry out these checks during the site survey and, if necessary, prepare separate quotes for both systems to make comparison easier.</p>
      <p>For a current VRF example, see our <a href="/tcl-vrf">TCL VRF systems</a> page, and get a rough idea of your rooms' capacity needs with our <a href="/hesaplama">capacity calculator</a>.</p>
    `,
  },
  "vrf-klima-maliyetini-belirleyen-etkenler": {
    baslik: "What Determines the Cost of a VRF System? What to Know Before Requesting a Quote",
    kategori: "VRF CENTRAL SYSTEMS",
    okumaSuresi: "5 min read",
    gorselAlt: "VRF outdoor units installed on a building rooftop",
    ozet: "The price of a VRF system is determined by capacity, indoor unit type, piping route, outdoor unit location, control system and fresh air requirements. Why price per square metre is misleading and what information is needed for an accurate quote.",
    icerikHtml: `
      <h2>Why Is There No Single "VRF Price"?</h2>
      <p>A VRF system is not an off-the-shelf product but an installation designed for the building. The VRF cost of two offices of the same size varies considerably depending on façade orientation, glazing ratio, occupancy, indoor unit type and where the outdoor unit can be placed. That is why a "VRF price per square metre" only gives a rough idea. Below we list the main factors that determine the cost.</p>

      <h2>1. Total Capacity</h2>
      <p>The largest cost item is the outdoor unit capacity, which is determined by the heat load calculation. A system oversized "just to be safe" without calculation increases both the investment and the operating costs. A correct calculation takes into account the heat gain and loss of each space, the proportion of simultaneous operation (diversity) and the outdoor design temperatures.</p>

      <h2>2. Number and Type of Indoor Units</h2>
      <p>Wall-mounted indoor units are usually the most economical option. Cassette types require a suspended ceiling. Ducted types offer the most discreet solution but involve additional work such as ductwork, grilles and plenums. As the number of indoor units increases, so do the piping, branches and cabling.</p>

      <h2>3. Piping Route and Length</h2>
      <p>Copper pipe, insulation, branch (refnet) fittings and supports increase with the quantities. A long distance between the outdoor unit and the indoor units, floor penetrations and the condition of the shafts directly affect labour.</p>

      <h2>4. Outdoor Unit Location</h2>
      <p>Lifting the outdoor unit onto the roof by crane, a steel support structure, anti-vibration mounts or an acoustic screen add to the cost. If it is to be placed in an enclosed plant room, the hot air must be ducted outside.</p>

      <h2>5. Control System</h2>
      <p>A simple wired controller in each room may be sufficient; offices and hotels, however, require a central touch-screen controller, time scheduling, remote access or building management system (BMS) integration. These choices increase the system's comfort and savings potential, and are reflected in the cost.</p>

      <h2>6. Drainage and Electrical Infrastructure</h2>
      <p>The condensate of each indoor unit must be drained through a sloped line; if there is no suitable drain point, a pump or an additional line is installed. The supply line and fuse board for the outdoor units are also part of the project.</p>

      <h2>7. Fresh Air Requirement</h2>
      <p>VRF indoor units condition the room air but do not bring in fresh air. Crowded spaces such as offices, meeting rooms and classrooms require a heat recovery ventilation (HRV) unit or a fresh air indoor unit. If this item is not included in the quote from the start, it later causes unexpected costs.</p>

      <h2>Take Operating Costs into Account Too</h2>
      <p>Annual electricity consumption is as important as the purchase price. When comparing quotes, look at the units' seasonal efficiency values (SEER, SCOP); a highly efficient system can recover the difference in initial investment within a few years.</p>

      <h2>What Is Needed for an Accurate Quote</h2>
      <ul>
        <li>Architectural drawings or floor plans (if not available, we take measurements on site)</li>
        <li>The intended use of the spaces and the approximate number of people</li>
        <li>Floor height and suspended ceiling situation</li>
        <li>The area considered for the outdoor unit (roof, balcony, plant room)</li>
        <li>Whether heating will also be provided by the VRF system</li>
      </ul>
      <p>With this information, our engineers carry out the capacity calculation and prepare a transparent, itemised quote. For TCL VRF models, see our <a href="/tcl-vrf">TCL VRF systems</a> page, or contact us for a <a href="/iletisim">free site survey</a>.</p>
    `,
  },
  "hava-perdesi-nedir-nasil-secilir": {
    baslik: "What Is an Air Curtain, What Does It Do and How to Choose One?",
    kategori: "AIR CURTAINS",
    okumaSuresi: "6 min read",
    seoBaslik: "What Is an Air Curtain and How to Choose One? Height Table (2026)",
    seoAciklama: "An air curtain stops heat escaping while the door is open. Model table by door width and 3–12 m mounting height, heated or unheated, and installation tips.",
    gorselAlt: "Air curtain mounted above a wooden entrance door",
    ozet: "What does an air curtain do, how does it work and where is it used? Energy savings, comfort at the entrance and choosing the right model: door width, mounting height, heated or unheated, and what to consider during installation.",
    icerikHtml: `
      <aside><p><strong>In short:</strong> An air curtain is a fan unit mounted above the door that reduces the escape of heated or cooled indoor air while the door is open. To choose the right model, look at three things: <strong>door width</strong> (the unit should be as long as the door or slightly longer), <strong>mounting height</strong> (determines the series) and <strong>whether the entrance needs heating</strong> (heated / unheated).</p></aside>

      <h2>What Is an Air Curtain?</h2>
      <p>An air curtain is a unit mounted above a door that blows a strong, even stream of air downwards. While the door is open, this air stream creates an invisible barrier between indoors and outdoors. As a result, heated air stays inside in winter and cooled air in summer.</p>

      <h2>What Does an Air Curtain Do?</h2>
      <p>In short: while the door is open, it reduces the escape of heated or cooled indoor air and the influx of cold or hot outdoor air. The benefits are:</p>
      <ul>
        <li><strong>Energy savings:</strong> Because less conditioned air escapes through the door, the air conditioning and heating system runs less. The difference is noticeable in businesses whose doors open and close all day.</li>
        <li><strong>Comfort at the entrance:</strong> Cold air flow and draughts at the door are reduced; staff at checkouts, information desks and reception areas are more comfortable.</li>
        <li><strong>Keeping the door open:</strong> Shops and restaurants can keep their doors open; customers enter more easily and the indoor climate is not disturbed.</li>
        <li><strong>Heating the entrance in winter:</strong> Heated air curtains create a warm air barrier at the door; a separate heater for the entrance area may not be needed.</li>
        <li><strong>Reducing outside influences:</strong> The air stream helps reduce the entry of dust, exhaust odours and flying insects.</li>
      </ul>

      <h2>Where Are They Used?</h2>
      <ul>
        <li><strong>Commercial entrances:</strong> Shops, supermarkets, pharmacies, banks, cafés and restaurants</li>
        <li><strong>Hotel and shopping centre entrances:</strong> Areas with heavy foot traffic and frequently opened doors</li>
        <li><strong>Office and residential entrances:</strong> Building lobbies and main entrances</li>
        <li><strong>Industrial doors:</strong> Warehouse, workshop, factory and hangar doors; industrial series are used for high doors</li>
      </ul>

      <h2>How to Choose the Right Air Curtain</h2>
      <h3>1. Door width</h3>
      <p>The length of the air curtain should be equal to or slightly greater than the door width. If the air stream does not cover the whole door, air escapes at the edges. On wide doors, several units are mounted side by side.</p>
      <h3>2. Mounting height</h3>
      <p>The height at which the unit is installed above the door is the most important factor in choosing the series. The air stream must reach the floor effectively. For example, among Niva air curtains without heaters, the general-purpose Linda series is suitable for mounting heights up to 3 m, the commercial Life series up to 4 m, the industrial Lena series up to 6 m and the Turbo series up to 12 m.</p>
      <div class="tablo"><table>
        <thead><tr><th>Series</th><th>Type</th><th>Max. mounting height (unheated / heated)</th><th>Unit length</th><th>Suitable for</th></tr></thead>
        <tbody>
          <tr><td>Niva Linda</td><td>General type</td><td>3.0 m / 2.5 m</td><td>85 – 200 cm</td><td>Shop, office, residential entrances</td></tr>
          <tr><td>Niva Smart Kaset</td><td>Recessed ceiling</td><td>3.8 m / 3.5 m</td><td>120 – 200 cm</td><td>Entrances with suspended ceilings</td></tr>
          <tr><td>Niva Life</td><td>Commercial type</td><td>4.0 m / 3.5 m</td><td>100 – 250 cm</td><td>Restaurants, supermarkets, commercial entrances</td></tr>
          <tr><td>Niva Lena</td><td>Industrial type</td><td>6.0 m / 6.0 m</td><td>85 – 120 cm</td><td>Warehouses, workshops, high doors</td></tr>
          <tr><td>Niva Turbo</td><td>Industrial type</td><td>12 m</td><td>100 cm</td><td>Factories, hangars</td></tr>
        </tbody>
      </table></div>
      <p>If the door is wider than a single unit, two or more units are mounted side by side so that the whole door is covered.</p>
      <h3>3. Heated or unheated?</h3>
      <p>If the space is already well heated by air conditioning or central heating, an unheated model may be sufficient. If the entrance area should also be heated in winter, a heated model is chosen. Heated models draw more electrical power; the fuse and cable cross-section must be checked accordingly.</p>
      <h3>4. Mounting type</h3>
      <p>If there is enough space above the door, wall-mounted models are used. In shops with suspended ceilings, recessed (cassette) air curtains offer an invisible solution. If there is no space above the door at all, vertical models are placed beside the door.</p>

      <h2>What to Consider During Installation</h2>
      <ul>
        <li>The unit should be mounted as close to the door as possible, directly above it.</li>
        <li>Angling the air outlet slightly outwards strengthens the barrier.</li>
        <li>On façades exposed to constant wind, an air curtain alone may not be enough; it should be combined with a windbreak or a double door.</li>
        <li>Depending on the model, a door switch can be connected so that the unit starts automatically when the door opens; this prevents unnecessary operation.</li>
      </ul>

      <h2>Niva and Olefini Air Curtains</h2>
      <p>At İklim Ofisi we supply and install Niva and Olefini air curtains. Niva offers a wide range of series in general, commercial, recessed ceiling, industrial and vertical types. Olefini, with its stylish design and digital control panel, is an option that blends in with the décor of shop, hotel and restaurant entrances.</p>
      <p>For series and dimensions, see our <a href="/hava-perdesi">air curtains</a> page. Share the door width, mounting height and whether you need a heater, and we will prepare a <a href="/iletisim">quote</a> with the right model.</p>
    `,
    sss: [
      [
        "Does an air curtain increase the electricity bill?",
        "Unheated models draw little power because they only run the fan motor. Heated models draw more power while the heater is on. Running the unit only while the door is open via a door switch prevents unnecessary consumption; and because less heat escapes through the door, the air conditioning and heating also run less.",
      ],
      [
        "Can an air curtain replace air conditioning or central heating?",
        "No. An air curtain does not heat or cool the space; it reduces the loss of the existing climate through the door. Heated models warm the doorway but do not replace the heating system of the space.",
      ],
      [
        "Is an air curtain mounted inside or outside the door?",
        "It is usually mounted on the inside, as close to the door as possible and directly above it. Angling the air outlet slightly outwards strengthens the barrier.",
      ],
      [
        "Can an air curtain be used at home?",
        "Yes. General-type models are also used at residential and building entrances; they reduce draughts at frequently opened entrance, garden or terrace doors in particular.",
      ],
      [
        "Does an air curtain keep out flies and dust?",
        "The air stream helps reduce the entry of flying insects, dust and exhaust odours, but does not block them completely. Its main purpose is to reduce heat loss and draughts.",
      ],
      [
        "What does the price of an air curtain depend on?",
        "The main factors are the unit length, the series (mounting height), whether it is heated or unheated, and the control options. If you tell us the door width and mounting height, we will prepare a firm price quote with the right model.",
      ],
    ],
  },
  "aluminyum-radyator-mu-celik-panel-radyator-mu": {
    baslik: "Aluminium or Steel Panel Radiator? Differences and the Right Choice",
    kategori: "HEATING",
    okumaSuresi: "6 min read",
    seoBaslik: "Aluminium or Steel Panel Radiator? Comparison Table",
    seoAciklama: "Aluminium vs steel panel radiators: heat-up speed, weight, water quality and cost table. How many sections do you need? Worked example and which to choose.",
    gorselAlt: "Wood-pattern Ayen aluminium radiator",
    ozet: "A comparison of aluminium and steel panel radiators in terms of heat-up speed, weight, appearance, water quality and cost; how the number of sections is calculated and which to prefer in which situation.",
    icerikHtml: `
      <aside><p><strong>In short:</strong> Aluminium radiators heat up faster, are lightweight and offer many decorative options; they require attention to the pH value of the system water. Steel panel radiators are usually more economical for the same heat output, heat up more slowly and retain their heat a little longer. Whichever you choose, the radiator output must be determined by the room's heat loss.</p></aside>

      <h2>The Basic Difference Between the Two Radiator Types</h2>
      <p><strong>Steel panel radiators</strong> are made by pressing and welding sheet steel and are the most common radiator type in homes in Türkiye. <strong>Aluminium radiators</strong> are formed by joining sections produced by extrusion or casting. The difference in material and production directly affects heat-up speed, weight, appearance and operating conditions.</p>

      <h2>Comparison</h2>
      <div class="tablo"><table>
        <thead><tr><th>Feature</th><th>Aluminium radiator</th><th>Steel panel radiator</th></tr></thead>
        <tbody>
          <tr><td>Heat-up speed</td><td>Fast (high thermal conductivity, low water content)</td><td>Slower; retains heat a little longer when switched off</td></tr>
          <tr><td>Weight</td><td>Lightweight, easy to install</td><td>Heavier</td></tr>
          <tr><td>Size</td><td>Adjusted by adding or removing sections</td><td>Standard lengths and heights</td></tr>
          <tr><td>Appearance</td><td>Colour, wood and metal finish options</td><td>Plain, standard</td></tr>
          <tr><td>Water quality</td><td>pH must be kept within the manufacturer's range, inhibitor if necessary</td><td>General system water maintenance</td></tr>
          <tr><td>Cost</td><td>Usually higher for the same output</td><td>Usually more economical</td></tr>
        </tbody>
      </table></div>
      <h3>Heat-up speed</h3>
      <p>Aluminium has a much higher thermal conductivity than steel, and aluminium radiators have a low water content. As a result, an aluminium radiator starts giving off heat shortly after it starts operating and responds quickly to thermostatic valve settings. A steel panel radiator holds more water, so it heats up more slowly and also retains its heat a little longer after being switched off.</p>
      <h3>Weight and installation</h3>
      <p>Aluminium radiators are lightweight; they are easy to transport and install and put less load on the wall.</p>
      <h3>Size flexibility</h3>
      <p>The length of an aluminium radiator is determined by the number of sections; sections can be added or removed as required. Steel panel radiators are produced in certain standard lengths and heights.</p>
      <h3>Appearance</h3>
      <p>Aluminium radiators offer decorative options with different section designs, colours, and wood and metal finishes. A steel panel radiator has a plain, standard appearance.</p>
      <h3>Water quality</h3>
      <p>In systems with aluminium radiators, the pH value of the system water must be kept within the range specified by the manufacturer, and a suitable inhibitor used if necessary. This is important for the service life of both the radiator and the boiler. The installation team must pay attention to this.</p>
      <h3>Cost</h3>
      <p>For the same heat output, a steel panel radiator is usually more economical. With aluminium radiators, the difference is offset by fast heat-up, long service life, light weight and design options.</p>

      <h2>How Many Sections Are Needed?</h2>
      <p>Radiator selection always starts with a room-by-room heat loss calculation. The number of sections is found by dividing the calculated heat loss by the heat output per section of the chosen model. For example, a room with a heat loss of 1,500 W needs about 10 sections when a 600 mm high model delivering 151 W per section is selected.</p>
      <p>Section outputs in catalogues are given for a specific water temperature difference (usually Δt 60, i.e. 90/70 °C water and a 20 °C room). In systems operating at lower water temperatures, such as condensing boilers or heat pumps, the radiator's heat output decreases; the number of sections must be calculated for this lower temperature.</p>

      <h2>Which One When?</h2>
      <ul>
        <li><strong>Aluminium radiator:</strong> Homes, villas, offices and hotels where fast heat-up is wanted, rooms are controlled individually with thermostatic valves and a decorative appearance matters.</li>
        <li><strong>Steel panel radiator:</strong> Projects where the budget is the priority and a standard appearance is sufficient.</li>
      </ul>

      <h2>Ayen Aluminium Radiators</h2>
      <p>At İklim Ofisi we supply and install Ayen aluminium radiators and towel radiators. Ayen radiators are made from 98% aluminium alloy and are EN 442 and TSE certified; every radiator undergoes a 15 bar leak test. 9 panel radiator and 9 towel radiator series are available in 30 colours.</p>
      <p>For models, dimensions and colour options, see our <a href="/ayen">Ayen aluminium radiators</a> page, and use our <a href="/hesaplama">capacity calculator</a> to get a rough idea of your rooms' heating needs. For the exact number of sections, request a <a href="/iletisim">site survey</a>.</p>
    `,
    sss: [
      [
        "Which heats better, an aluminium or a panel radiator?",
        "Two radiators sized correctly for the room's heat loss will both bring the room to the same temperature. The difference lies in the heat-up speed: an aluminium radiator gives off heat shortly after it starts and responds quickly to the thermostatic valve; a steel panel radiator heats up more slowly.",
      ],
      [
        "How many watts does one aluminium radiator section deliver?",
        "It depends on the model and height. For example, the 600 mm high Ayen models deliver about 98 W to 163 W per section at Δt 60 (90/70 °C water, 20 °C room). At lower water temperatures this value decreases.",
      ],
      [
        "Are aluminium radiators suitable for combi boilers?",
        "Yes, they are used with combi and condensing boilers. The pH value of the system water must be kept within the range specified by the manufacturer. If the condensing boiler is to run at low water temperatures, the number of sections must be calculated for that temperature.",
      ],
      [
        "Can aluminium radiators be used with a heat pump?",
        "Yes; however, because a heat pump operates at lower water temperatures, the radiator's heat output decreases and more sections are needed for the same room. The selection must be based on the heat pump's operating water temperature.",
      ],
      [
        "Do aluminium radiators rust?",
        "Aluminium does not rust like steel; however, it can corrode in system water with an unsuitable pH value. The system water should therefore be checked and a suitable inhibitor used if necessary.",
      ],
      [
        "Can I replace existing panel radiators with aluminium radiators?",
        "Yes. The output of the new radiator is selected according to the room's heat loss; connection dimensions and valve positions are checked during the site survey and adapted to the existing installation.",
      ],
    ],
  },
  "endustriyel-mutfak-havalandirma-elektrostatik-filtre": {
    baslik: "Electrostatic Filtration in Commercial Kitchen Ventilation: AIRNEX",
    kategori: "KITCHEN VENTILATION",
    okumaSuresi: "4 min read",
    gorselAlt: "AIRNEX unit with electrostatic filter in a commercial kitchen",
    ozet: "How do electrostatic cell exhaust units work to control grease aerosols, smoke and fine particles in restaurant and commercial kitchen exhaust, and what information is needed for a project?",
    icerikHtml: `
      <h2>The Real Problem in Kitchen Exhaust: Grease Aerosols and Smoke</h2>
      <p>Cooking equipment such as grills, fryers and hobs releases grease droplets, smoke and fine particles into the exhaust air. These pollutants build up inside the ductwork, cause nuisance to the surroundings and increase maintenance costs.</p>

      <h2>How Does the AIRNEX Electrostatic Cell Exhaust Unit Work?</h2>
      <p>In the AIRNEX system, the air passes through four stages: the <strong>pre-filter</strong> captures large grease droplets and coarse particles; in the <strong>ionisation</strong> section, fine particles are electrically charged; in the <strong>collector cell</strong>, the charged particles are attracted to and held on the collector plates; and the filtered air is discharged to the exhaust via the <strong>system fan</strong>.</p>

      <h2>About Odour Control</h2>
      <p>Electrostatic filtration is mainly aimed at particulate-phase pollutants. For gas-phase odour compounds, activated carbon, UV or another suitable stage is designed separately where necessary.</p>

      <h2>What Information Is Needed for a Project?</h2>
      <p>For the right selection, information on airflow (m³/h), total pressure (Pa), duct size, exhaust temperature, cooking/process type and daily operating time is required. With this data our engineers size the unit and design the entire line from the hood to the fan.</p>
    `,
  },
  "vrf-rehberi-mitsubishi-electric-ve-tcl": {
    baslik: "VRF Air Conditioning Guide: TCL and Mitsubishi Electric VRF Technologies",
    kategori: "VRF CENTRAL SYSTEMS",
    okumaSuresi: "5 min read",
    gorselAlt: "TCL VRF outdoor unit",
    ozet: "An engineering assessment of TCL TMV series and Mitsubishi Electric City Multi VRF systems, which reduce air conditioning costs in hotel, office tower and residential projects.",
    icerikHtml: `
      <h2>What Is VRF / VRV Air Conditioning?</h2>
      <p>VRF (Variable Refrigerant Flow) systems use variable refrigerant flow technology to connect dozens of indoor units to a single outdoor unit group, allowing every room to be conditioned independently.</p>

      <h2>TCL TMV Series VRF Systems</h2>
      <p>With inverter compressors and a smart control infrastructure, TCL's new-generation TMV series VRF systems combine high efficiency with a competitive investment cost in office, shop, hotel and residential projects. Thanks to a wide range of indoor units, they offer flexible solutions for different types of spaces. For models and technical data, see our <a href="/tcl-vrf">TCL VRF systems</a> page.</p>

      <h2>Advantages of Mitsubishi Electric City Multi VRF</h2>
      <p>Mitsubishi Electric VRF systems stand out for their inverter compressor design and high COP/EER efficiency values. Zubadan technology, which delivers high heating performance even at low outdoor temperatures, provides strong comfort in hotel and office tower projects.</p>

      <h2>Which System Should You Choose for Your Project?</h2>
      <p>Our engineering team carries out a heat gain/loss calculation based on your building's façade orientation, glazed areas and intended use, and designs the TCL or Mitsubishi Electric VRF system best suited to your project and budget.</p>
    `,
  },
  "buderus-ile-merkezi-ve-bireysel-isitma": {
    baslik: "What Is a Cascade Boiler? A Guide to Central Heating with Buderus Condensing Boilers",
    kategori: "HEATING & CASCADE",
    okumaSuresi: "6 min read",
    gorselAlt: "Wall-mounted Buderus Logamax plus GB272 condensing boiler",
    ozet: "What is a cascade boiler and what are its advantages over a single large boiler? Cascade systems from 49 kW to 2,400 kW with the Buderus Logamax plus GB272 condensing boiler, capacity selection and what to consider in the boiler room.",
    icerikHtml: `
      <h2>What Is a Cascade Boiler?</h2>
      <p>A cascade boiler system meets a building's heating demand not with one large boiler but with <strong>several boilers working together</strong>. The boilers are grouped under a common controller; when the heat demand is low, only one or two boilers run, and as the weather gets colder and demand increases, the other boilers switch on in turn.</p>
      <p>In centrally heated buildings such as apartment blocks, residential complexes, hotels, schools, hospitals and office buildings, cascade systems are increasingly replacing single large boilers. The reason is simple: a building needs full heating capacity for only a very small part of the year and spends most of the rest of the time at part load.</p>

      <h2>A Single Large Boiler or a Cascade?</h2>
      <h3>1. Part-load efficiency</h3>
      <p>A single large boiler has to operate far below its capacity during periods of low demand such as spring and autumn. In a cascade system, only as many boilers as are needed at that moment run, and each boiler stays within its efficient range. The 1:6 modulation ratio of the Buderus Logamax plus GB272 also allows each boiler to adjust its output to instantaneous demand.</p>
      <h3>2. Redundancy</h3>
      <p>In a single-boiler system, the building is left without heating if the boiler fails. In a cascade system, while one boiler is out of service due to a fault or maintenance, the other boilers can keep running and maintain the heating.</p>
      <h3>3. Space and ease of transport</h3>
      <p>Wall-mounted boilers are compact and can easily be carried through narrow stairways and doors. With the GB272, 900 kW of installed output can be achieved in less than 2 m², even in narrow or low-ceilinged boiler rooms. The boilers can be wall-mounted or placed side by side on the floor with a floor mounting kit.</p>
      <h3>4. Phased investment and expansion</h3>
      <p>When the building grows or a new block is added, boilers can be added to the system. When renovating an old central system, it is also easier to adapt to the existing boiler room.</p>

      <h2>Why Is a Condensing Boiler More Efficient?</h2>
      <p>The flue gas produced when natural gas burns contains water vapour. In conventional boilers this vapour is discharged through the flue and the heat it contains is lost. A <strong>condensing boiler</strong>, however, cools the flue gas to condense this vapour and transfers the released latent heat to the system water as well. This is why the efficiency of condensing boilers exceeds 100% based on the net calorific value.</p>
      <p>For condensation to take place, the water returning to the boiler must be cool. The lower the return temperature, the more efficiently the boiler operates. The standard seasonal efficiency of the Buderus GB272 is 109.7–110.6% at 40/30 °C and 106–107.3% at 75/60 °C (based on the net calorific value). For this reason, sizing radiators and underfloor heating for low water temperatures in installations with condensing boilers directly increases efficiency.</p>

      <h2>Cascades with the Buderus Logamax plus GB272</h2>
      <p>The Buderus Logamax plus GB272 is a wall-mounted gas condensing boiler developed for residential, public and commercial buildings:</p>
      <ul>
        <li><strong>Outputs:</strong> 49, 69, 100, 125 and 150 kW</li>
        <li><strong>Cascade:</strong> up to 16 boilers, 2,400 kW in total</li>
        <li><strong>Flow temperature:</strong> up to 85 °C at full output</li>
        <li><strong>Emissions:</strong> NOx class 6</li>
        <li><strong>Heat exchanger:</strong> surface-coated ALU plus aluminium heat exchanger</li>
        <li><strong>Fuel:</strong> natural gas and propane</li>
        <li><strong>Control:</strong> Logamatic BC30 controller; Modbus TCP/IP, 0–10 V BMS signal and remote access with Logamatic 5000</li>
      </ul>
      <p>On the 125 and 150 kW models, the cascade flue gas damper is supplied with the boiler. Because the boilers can be placed directly side by side, the cascade group takes up little space in the boiler room.</p>

      <h2>How Is the Capacity Determined?</h2>
      <p>The first step in selecting a boiler is the building's <strong>heat loss calculation</strong>. The calculation takes into account the areas of external walls, roof, floor and windows, the insulation and the outdoor design temperature of the city where the building is located. If domestic hot water is also to be produced by the boiler (cylinder), this demand is added separately.</p>
      <p>Once the total capacity is determined, the number of boilers is decided. For example, a building with a demand of 300 kW can be served by a cascade of 2 × 150 kW or 3 × 100 kW. More, smaller boilers provide more precise operation at low load and better redundancy; fewer, larger boilers reduce the initial investment and the number of connections. We strike the right balance based on the building's usage profile.</p>

      <h2>What to Consider in the Boiler Room</h2>
      <ul>
        <li><strong>Hydraulic separation:</strong> In cascade systems, the boiler circuit and the building circuit are usually separated by a low-loss header (hydraulic separator) or a plate heat exchanger, so that each boiler operates at the correct flow rate.</li>
        <li><strong>Flue:</strong> The cascade flue system must be sized according to the number and output of the boilers.</li>
        <li><strong>Condensate:</strong> Condensing boilers produce condensate while operating (up to 6–16 litres per hour on the GB272, depending on the model); it must be connected to a suitable drain.</li>
        <li><strong>System water:</strong> In old installations the system must be cleaned and the water quality kept within the values specified by the manufacturer.</li>
        <li><strong>Controls:</strong> Weather-compensated operation and connection to the building management system reduce operating costs.</li>
      </ul>

      <h2>Your Buderus Boiler Project with İklim Ofisi</h2>
      <p>From heat loss calculation to cascade design, and from boiler room design to installation and commissioning, we handle Buderus boiler projects from a single source. For models, technical tables and the catalogue, see our <a href="/buderus">Buderus boilers</a> page. We explain the effect of low water temperature on radiator selection in our <a href="/blog/aluminyum-radyator-mu-celik-panel-radyator-mu">comparison of aluminium and steel panel radiators</a>. You can request a <a href="/iletisim">site survey and quote</a> for your building.</p>
    `,
  },
  "endustriyel-havalandirma-ve-isi-geri-kazanim": {
    baslik: "Heat Recovery Ventilation (HRV) Installations in Industrial Facilities",
    kategori: "VENTILATION",
    okumaSuresi: "6 min read",
    gorselAlt: "Cross-section of a heat recovery ventilation unit",
    ozet: "Heat recovery air handling units (AHU) that supply fresh air in factories, shopping centres and enclosed car parks without losing indoor heat, and spiral duct design.",
    icerikHtml: `
      <h2>Why Use a Heat Recovery Unit?</h2>
      <p>Units that extract stale air from enclosed spaces while heating or cooling the incoming fresh air with the heat of the extracted air are called heat recovery (HRV) units. This system reduces your air conditioning and heating load by up to 70%.</p>

      <h2>Air Handling Units (AHU) and Spiral Duct Fabrication</h2>
      <p>In industrial facilities, airflow (m³/h) and pressure losses are calculated in AutoCAD, and the air is distributed through leak-tight spiral round ducts.</p>
    `,
  },
  "klima-kapasite-hesabi-ve-inverter-teknolojisi": {
    baslik: "Choosing the Right Air Conditioner: Heat Gain Calculation and the Advantages of Inverter Compressors",
    kategori: "GUIDE",
    okumaSuresi: "3 min read",
    gorselAlt: "Wall-mounted air conditioner in a living room",
    ozet: "Mistakes made when choosing an air conditioner by floor area alone, the glazing factor and the effect of TCL / Mitsubishi Electric inverter technology on the electricity bill.",
    icerikHtml: `
      <h2>Why Is Choosing an Air Conditioner by Floor Area Wrong?</h2>
      <p>There is a 50% difference in heat load between a top-floor room and an intermediate ground-floor room of the same floor area. Air conditioners bought without calculating the glazed area, the building's insulation and the façade orientation are either insufficient or consume unnecessarily high amounts of electricity.</p>

      <h2>How Does an Inverter Compressor Save Energy?</h2>
      <p>Old-type air conditioners constantly start and stop, drawing high starting currents. TCL and Mitsubishi Electric inverter air conditioners, on the other hand, adjust their speed to the room temperature and operate continuously with A+++ efficiency.</p>
    `,
  },
};
