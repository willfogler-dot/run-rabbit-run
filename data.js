/* RRR100 2026 — race data
   Times are minutes elapsed from the Tortoise start: Fri 18 Sep 2026, 09:00 MDT.
   Sources: 2026 Runner's Manual v1.1 (29 Jul 2026); published finisher race reports.
   Interpolated (non-official) pace estimates are flagged est:true. */

const RACE = {
  startISO: '2026-09-18T09:00:00-06:00',
  tz: 'America/Denver',
  // darkness windows, minutes from start (civil twilight)
  dark: [[640, 1285], [2078, 2400]],   // 19:40 Fri → 06:25 Sat ; 19:38 Sat →
  limit: 2160
};

/* mile, name, elev(ft), bag, crew, pacer, plan times (min), cutoff (min|null) */
const STATIONS = [
  { mi:0,     name:'Start — Ski Basin',      elev:6886,  bag:1,crew:1,pacer:0, p30:0,    p36:0,    tgt:0,    cut:null, major:1 },
  { mi:5.4,   name:'Mount Werner',           elev:10372, bag:0,crew:0,pacer:0, p30:90,   p36:105,  tgt:105,  cut:390 },
  { mi:17.7,  name:'Fish Creek Falls TH',    elev:6952,  bag:0,crew:2,pacer:0, p30:255,  p36:285,  tgt:285,  cut:540, note:'Crew on foot or bike only — 4 mi from Olympian. Driving here risks DQ.' },
  { mi:24.3,  name:'Long Lake',              elev:9850,  bag:0,crew:0,pacer:0, p30:405,  p36:525,  tgt:465,  cut:null },
  { mi:30.1,  name:'Summit Lake',            elev:10316, bag:1,crew:1,pacer:0, p30:540,  p36:690,  tgt:615,  cut:null, major:1, note:'Highest aid station. Drop bag. Crew possible but a 2-hour drive each way.' },
  { mi:34.3,  name:"Billy's Rabbit Hole",    elev:10040, bag:0,crew:0,pacer:0, p30:620,  p36:780,  tgt:705,  cut:null, est:1, note:'Minimal aid.' },
  { mi:44.5,  name:'Dry Lake',               elev:8272,  bag:0,crew:3,pacer:1, p30:735,  p36:930,  tgt:855,  cut:null, note:'No parking — drop off, turn around, leave. First pacer pickup.' },
  { mi:51.2,  name:'Olympian Hall',          elev:6669,  bag:1,crew:1,pacer:1, p30:825,  p36:1050, tgt:960,  cut:1050, major:1, note:'Halfway. Only indoor aid station. Mandatory gear check on exit.' },
  { mi:54.4,  name:'Lane of Pain',           elev:8180,  bag:0,crew:0,pacer:0, p30:890,  p36:1140, tgt:1030, cut:null, est:1, note:'Minimal aid. Check in — you pass twice.' },
  { mi:58.1,  name:'Lane of Pain',           elev:8180,  bag:0,crew:0,pacer:0, p30:950,  p36:1210, tgt:1105, cut:null, est:1, note:'Second pass. Check in again.' },
  { mi:63.9,  name:'Olympian Hall',          elev:6669,  bag:1,crew:1,pacer:1, p30:1065, p36:1275, tgt:1185, cut:1365, major:1, note:'Mandatory gear check on exit. Do not sit down.' },
  { mi:70.8,  name:'Dry Lake',               elev:8272,  bag:0,crew:3,pacer:1, p30:1200, p36:1455, tgt:1350, cut:1500, note:'No parking. Pacer swap before the crux climb.' },
  { mi:76.6,  name:"Billy's Rabbit Hole",    elev:10040, bag:0,crew:0,pacer:0, p30:1330, p36:1635, tgt:1500, cut:null, est:1, note:'Minimal aid. Check in.' },
  { mi:80.8,  name:'Summit Lake',            elev:10316, bag:1,crew:1,pacer:1, p30:1425, p36:1725, tgt:1590, cut:1800, major:1, note:'Last drop bag. Last crew. Last pacer swap. 21 miles to go.' },
  { mi:89.0,  name:'Long Lake',              elev:9850,  bag:0,crew:0,pacer:0, p30:1575, p36:1905, tgt:1770, cut:2010, note:'The real finish gate. Be here by 5:00 PM, not 6:30.' },
  { mi:95.8,  name:'Mount Werner',           elev:10372, bag:0,crew:0,pacer:0, p30:1725, p36:2070, tgt:1920, cut:2100, note:'All downhill from here. Target 6:30–7:00 PM.' },
  { mi:101.8, name:'FINISH',                 elev:6886,  bag:1,crew:1,pacer:1, p30:1800, p36:2160, tgt:2010, cut:2160, major:1, note:'The clock stops when you hug the Designated Hugger.' }
];

/* Schematic elevation profile: [mile, ft]. Aid station elevations are official;
   intermediate points are interpolated from the course description. */
const PROFILE = [
  [0,6886],[0.4,7000],[1.2,7700],[2.4,9080],[3.2,9450],[4.2,9850],[5.4,10372],
  [6.2,10150],[7.0,10280],[7.8,9980],[8.6,10180],[9.4,9880],[10.2,10050],[11.0,9800],[11.7,9600],
  [12.4,9200],[13.2,8700],[14.0,8200],[15.0,7750],[16.0,7400],[17.0,7080],[17.7,6952],
  [18.4,7150],[19.4,7550],[20.4,8000],[21.4,8500],[22.4,9050],[23.0,9600],[23.6,9800],[24.3,9850],
  [25.3,9950],[26.3,9900],[27.3,10050],[28.3,10120],[29.2,10250],[30.1,10316],
  [31.0,10380],[32.0,10300],[33.0,10200],[34.3,10040],
  [35.5,9900],[36.5,9700],[37.5,9500],[38.5,9350],[39.5,9150],[40.5,8950],[41.5,8750],[42.5,8550],[43.5,8200],[44.0,8150],[44.5,8272],
  [45.5,8050],[46.5,7800],[47.5,7500],[48.5,7200],[49.5,6950],[50.0,6800],[51.2,6669],
  [52.0,6900],[53.0,7500],[54.4,8180],[55.2,8050],[56.0,7800],[56.8,7650],[57.4,7900],[58.1,8180],
  [59.2,7850],[60.4,7500],[61.6,7150],[62.8,6850],[63.9,6669],
  [64.6,6750],[65.3,6800],[66.3,7050],[67.3,7350],[68.3,7650],[69.3,7950],[70.8,8272],
  [71.5,8350],[72.1,8420],[73.0,8900],[74.0,9400],[75.0,9800],[75.3,9945],[75.5,9900],[76.6,10040],
  [77.6,10120],[78.6,10200],[79.7,10260],[80.8,10316],
  [81.6,10250],[82.6,10350],[83.6,10280],[84.6,10420],[85.9,10557],[86.9,10300],[87.3,10150],[88.2,9950],[89.0,9850],
  [89.7,9800],[90.6,10050],[91.4,9880],[92.3,10150],[93.1,9950],[94.0,10180],[94.8,10000],[95.8,10372],
  [96.6,9950],[97.4,9450],[98.4,8800],[99.4,8100],[100.4,7400],[101.2,7000],[101.8,6886]
];

const SECTIONS = [
  { n:1, from:0, to:5.4, title:'Start → Mount Werner', sub:'5.4 mi · +3,486 ft · ski slope and two-track',
    body:`<p>Straight up the ski mountain. Thunderhead Hiking Trail to Heavenly Daze — a black-diamond run the manual calls "very, very steep" — then Why Not Road, Chisholm Trail to Four Points Lodge, and the Storm Peak Challenge two-track to the aid station. Roughly 650 ft/mi average, but Heavenly Daze is far steeper than the average.</p>
    <p class="quote">The grade goes "from tough to steep to brutal," and the hardest part is getting up to the gondola.</p>
    <p>Grass and dirt ski slope with zero shade, then rough two-track. The Forest Service asks runners to spread out rather than form a single-file rut, so expect a wide conga line. This is <b>not</b> the 50-mile route — the 100 takes the steeper line.</p>
    <h4>Watch for</h4><ul>
    <li><b>Going out hard.</b> You cannot bank time on a 650 ft/mi climb, only spend it. Expect 1:30–1:45 and be at peace with it.</li>
    <li><b>Water.</b> Fill everything. Next aid is 12.3 miles away.</li>
    <li>Crew can only reach the top of the gondola, and only if it's running.</li></ul>` },

  { n:2, from:5.4, to:17.7, title:'Mount Werner → Fish Creek Falls TH', sub:'12.3 mi · −3,420 ft · longest unsupported stretch',
    body:`<p><b>First 6.3 mi:</b> Mountain View Trail (FS 1032) along the ridge off Mt. Werner — Hogan Park meadows south, Zirkel Wilderness peaks north. The manual calls it "some of the prettiest in Colorado" and it's the best running you'll do all race, but it honestly has "lots of challenging steep ups and downs." Rolling, not free.</p>
    <p><b>Then the turn:</b> at the junction, <b>turn down Fish Creek Falls Trail (FS 1102)</b>. This is the most-repeated instruction in the entire manual.</p>
    <p><b>Last ~6 mi:</b> into the canyon. Rough, rocky, steep — over 25% gradient in places — dropping roughly 3,000 ft. A first-timer's description: "6 miles of rocky, technical, steep, and beautiful trail." The creek parallels the last few miles, so it's filterable. You'll be passing runners coming the other way on narrow tread.</p>
    <div class="warn"><b>There is a rocky section where the tread goes indistinct. Do not go left toward the falls. Go down.</b> The trail reappears.</div>
    <h4>This is where the race is decided</h4>
    <p>You'll be 3–4 hours in, fresh, on a screaming descent, in the best scenery of the day, with Hares starting to come through. Every bit of quad you spend here you do not get back — and you have to climb straight back up it, and then descend 3,500 ft to the finish 84 miles later.</p>
    <p><b>6:00 PM cutoff.</b> Crew on foot or bike only.</p>` },

  { n:3, from:17.7, to:24.3, title:'Fish Creek Falls → Long Lake', sub:'6.6 mi · +2,898 ft · steep technical climb',
    body:`<p>Straight back up what you just descended, at about 440 ft/mi. Big steps, steep narrow tread, creek crossings, two waterfalls worth a five-second look. It tops out and mellows into a flat traverse around the north shore of Long Lake into the aid station, captained by Karl Meltzer.</p>
    <p>In 2018 the mid-pack hit this in 90°F+ heat; Jeff Browning, who finished third, called it the most difficult part of the course.</p>
    <h4>Watch for</h4><ul>
    <li><b>This is a power-hike section, full stop.</b> Nobody sane runs it. Budget 2:00–2:30.</li>
    <li><b>Eat here.</b> The descent will have killed your appetite and you're about to go a long way.</li>
    <li>No crew, no drop bag. Arriving roughly 4:00–5:45 PM.</li></ul>` },

  { n:4, from:24.3, to:30.1, title:'Long Lake → Summit Lake', sub:'5.8 mi · +466 ft · rolling dirt road',
    body:`<p>The easiest section of the race. East on Fish Creek Falls Trail, then signs and flagging put you on the Continental Divide Road — rolling dirt road at a gentle grade, past Fish Creek Reservoir, more up than down as it climbs gradually to Summit Lake.</p>
    <div class="note"><b>One junction:</b> veer right shortly after leaving Long Lake.</div>
    <p class="quote">Probably the easiest section of the race. A good spot to make sure you get your time where it needs to be heading into the hardest parts.</p>
    <h4>Watch for</h4><ul>
    <li>This is where you earn back schedule if you got the Fish Creek descent wrong.</li>
    <li>Fully exposed high-altitude road. Weather arrives here with no warning.</li>
    <li><b>Take your full night kit at Summit</b> whether or not it's dark yet.</li></ul>` },

  { n:5, from:30.1, to:44.5, title:'Summit Lake → Billy\'s → Dry Lake', sub:'14.4 mi · −2,044 ft · longest segment on the course',
    body:`<p><b>First 4.2 mi:</b> continue on FR310 straight past the first intersection to where the road T's after a parking lot on the left. <b>LEFT onto Buff Pass Road (CR 60)</b>, just over a mile, then <b>LEFT onto FR306</b> — the top of Flash of Gold. Past a couple of well-marked forks, onto singletrack with views into the North Fork of Fish Creek, to Billy's Rabbit Hole (minimal aid — stock up).</p>
    <p><b>Then 10.2 mi of Flash of Gold.</b> Purpose-built flowing singletrack through dense aspen groves, dropping ~1,800 ft on endless mellow switchbacks. Every race recap names this as the highlight of the course — most runners hit it as the sun drops and the aspens light up.</p>
    <div class="note"><b>Two spots where it merges onto ~0.5 mi of powerline two-track.</b> Be ready for the turn back onto singletrack. Cross the upper Spring Creek bridge, veer left past the BTR connector. Bottom out at a creek crossing, take the short bushwhack-cutoff on your right after the small bridge up to Buff Pass Road, turn left, short way to Dry Lake.</div>
    <h4>Watch for</h4><ul>
    <li><b>You will hit darkness in here.</b> Get your light out at Summit or Billy's, not on the trail.</li>
    <li>This is the section that produced most of the 2022 drops when a monsoon hit runners leaving Summit.</li>
    <li>If your legs are good, this is where you make real time. If your quads are gone, this is ten miles of finding that out.</li></ul>` },

  { n:6, from:44.5, to:51.2, title:'Dry Lake → Olympian Hall', sub:'6.7 mi · −1,603 ft · smooth singletrack, then town',
    body:`<p>Spring Creek Trail: ~5.5 mi of nice singletrack at mild-to-moderate downhill grade with a few steeper pitches, through ferns and big-leafed jungle-ish flora. Fifteen numbered bridges across Spring Creek — they count down. You may get a little wet near the bottom.</p>
    <p>You emerge at Spring Creek Trailhead and Amethyst Road — <b>the point where pacer rules loosen for every runner in the race</b>. Cross the road, take the trail to your left through town, out at Fish Creek Falls Road and 3rd Street, then <b>across Lincoln</b>. Volunteers hit the crosswalk button but cannot stop traffic. Short paved stretch to Olympian Hall.</p>
    <div class="warn"><b>Olympian is a Venus fly trap.</b> The only indoor aid station: heated, real bathrooms, a hundred people milling around, and races quietly ending in chairs. Get in, get your gear check, get out.</div>
    <p><b>2:30 AM cutoff. Mandatory gear check on exit.</b> Mile 51.2 — about halfway, and you will not feel halfway.</p>` },

  { n:7, from:51.2, to:63.9, title:'Olympian → Emerald Mountain → Olympian', sub:'12.7 mi · +1,511 / −1,511 ft · entirely in the dark',
    body:`<p>Blackmer Drive up, up, up — a fire road that climbs relentlessly and gets steeper as it goes.</p>
    <p class="quote">It just never feels like it flattens. It breaks the entire time.</p>
    <p>Left uphill on Little Moab to the <b>Lane of Pain</b> — roughly 3 miles and 1,500 ft with pitches near 20% — to the steeply rolling Ridge Road minimal aid station. Then right on Stairway to Heaven, descend, right on Blair Witch, right on Quarry Mountain Trail back to Lane of Pain. From there Morning Gloria down to Lupine, left on Emerald Meadows to the Stables, left past the Yurt, back to Olympian. The final descent is long machine-built mountain-bike switchbacks with steep berms that throw you off-camber — not technically hard, but it goes on.</p>
    <div class="warn"><b>You pass the Lane of Pain aid station twice. Check in both times.</b></div>
    <h4>The mental crux</h4>
    <p>Almost every race report names this as the hardest section — not physically, mentally. You're doing a 12.7-mile loop between 1 and 5 AM that ends exactly where it started.</p>
    <p class="quote">A long half-marathon. Nothing too bad, nothing too special; just a slog through the night.</p>
    <p class="quote">It was the hardest part of the race for me. Somehow I was just really tired, really creaky, really cranky.</p>
    <div class="warn"><b>Bears — particularly mothers with cubs — and mountain lions are explicitly flagged.</b> Emerald teems with game.</div>
    <p><b>7:45 AM cutoff on return.</b></p>` },

  { n:8, from:63.9, to:70.8, title:'Olympian → Dry Lake', sub:'6.9 mi · +1,603 ft · reverse of Section 6, at dawn',
    body:`<p>Back through town in the dark, across Lincoln at the light — your pacer guides you — then 5.5 miles grinding back up Spring Creek. One veteran's entire note on this segment:</p>
    <p class="quote">Time to dig down and grind back up the hill to Dry Lake. Grind it.</p>
    <p>Walking out of a lit town into the mountains at night for a final 35+ mile push is genuinely intimidating. Sunrise is 6:51 AM — on schedule you'll get light partway up.</p>
    <div class="warn"><b>This is where the posted cutoffs turn hostile.</b> Olympian 7:45 AM → Dry Lake 10:00 AM is 2h15 for 6.9 miles of climbing. If you're anywhere near the Olympian cutoff, the race is functionally over.</div>` },

  { n:9, from:70.8, to:80.8, title:"Dry Lake → Billy's → Summit Lake", sub:'10.0 mi · +2,044 ft · THE CRUX',
    body:`<p>Ditch Trail contouring above the Soda Creek drainage, then <b>right at the Grouse Trail junction at about 1.3 mi</b>, and up. Grouse is a black-diamond, expert-only <i>downhill</i> mountain bike trail — roughly 1,700 ft of gain in 3.2 miles, with rock gardens, drops, steep narrow passages and cliffside exposure. Sections cross bare granite marked only with <b>white painted dashes and cairns</b>. Blind corners for descending bikers, and you'll be on it Saturday morning when bike traffic is live.</p>
    <p>At ~4.5 mi you hit Buff Pass Road: <b>LEFT for under 0.2 mi</b>, then <b>LEFT onto Flash of Gold</b>. Billy's is 5.8 mi from Dry Lake. Then 4.2 rolling, gradual miles up to Summit Lake.</p>
    <h4>The manual is wrong about this</h4>
    <p>The manual says Fish Creek is the hardest section. Finishers flatly disagree.</p>
    <p class="quote">I'm going to assert that this is by far the hardest, most technical section of the race. This section will either make or break your race.</p>
    <p class="quote">Most technical and hardest climb of the course. Nothing to do but march up it.</p>
    <p>Mile 70–81, second day, no sleep. <b>Budget 3.5–5 hours.</b> This is where a strong pacer earns their keep.</p>
    <p>Summit at 80.8: drop bag, crew, pacer swap, <b>3:00 PM cutoff</b>. A veteran on arriving here: <i>"You are up. The race is not over, but it's done."</i></p>` },

  { n:10, from:80.8, to:89.0, title:'Summit Lake → Long Lake', sub:'8.2 mi · course high point 10,557 ft',
    body:`<p>A different route than your outbound. Head east to the junction with the <b>Wyoming Trail (FS 1101)</b>, also the Continental Divide National Scenic Trail.</p>
    <div class="warn"><b>The access onto the Wyoming Trail is small and vague. Do not miss it.</b></div>
    <p>Then south on rolling singletrack through high forest and meadow, most of it near 10,000 ft, cresting the course high point around mile 86. Gone are the smooth road grades — this is a series of rolling passes.</p>
    <p class="quote">This section will take you 8 miles, and it will feel every inch of it. At this point I found myself wondering if they would ever take us downhill.</p>
    <h4>Highest and most exposed part of the course</h4>
    <p>No aid, no crew, no bailout. In 2022 a pair left their rain gear in the Summit drop bag to save weight and got caught in a hailstorm at 10,500 ft with no shell. This is exactly why the 2026 mandatory gear rule exists. <b>Carry it.</b></p>
    <div class="warn"><b>At the 4-way junction with Percy Trail (~mile 86–87), take the RIGHT-hand trail.</b> Left is the 50-mile course, and Saturday-afternoon 50-milers will be moving through. Then right (west) on Fish Creek Falls Trail 1.7 mi to Long Lake.</div>
    <p><b>6:30 PM cutoff — treat 5:00 PM as the real one.</b></p>` },

  { n:11, from:89.0, to:95.8, title:'Long Lake → Mount Werner', sub:'6.8 mi · +522 ft · rolling, one last climb',
    body:`<p>Back onto Mountain View Trail — veer left at the junction. Three or four rolling passes up and over, then the final climb to Mt. Werner. You'll likely see 50-milers, who will cheer for you.</p>
    <p class="quote">I would call this the longest 6 miles of my life. Not the hardest. Not the most technical. The miles just seem to go forever, and you will roll up and down three or four passes before you see the final climb.</p>
    <p><b>8:00 PM cutoff, but you cannot make the finish from here on the cutoff line. Target 6:30–7:00 PM.</b></p>` },

  { n:12, from:95.8, to:101.8, title:'Mount Werner → Finish', sub:'6.0 mi · −3,486 ft · all downhill',
    body:`<p>Storm Peak Challenge two-track down past Four Points Lodge and Rainbow Saddle, onto the Why Not access road, some singletrack, one small stream crossing, then pavement into the base area. Same as the 50-mile finish. No navigation required.</p>
    <p>It is 3,500 ft of descent in 6 miles on 100-mile legs.</p>
    <p class="quote">Six miles of steep downhill will be the final bout of torture that the course will be throwing at you.</p>
    <div class="note"><b>Poles.</b> One 2022 finisher's single stated regret was not stashing poles in his Summit Lake drop bag specifically for this descent. Poles are legal for all runners in 2026 — "a change from the past."</div>
    <p>Likely in the dark if you're anywhere near 34–36 hours. <b>The clock does not stop until you hug the Designated Hugger.</b></p>` }
];

const CREW = [
  { n:1, where:'Start — ski basin', win:'8:00–9:00 AM Fri', mi:0, drive:0, note:'Photos, then you are done for hours.' },
  { n:2, where:'Fish Creek Falls TH', win:'1:00–2:30 PM Fri', mi:17.7, drive:null, opt:1, note:'Optional. Park at Olympian Hall and bike or run 4 miles. No vehicles, no shuttle — driving here risks Will\'s DQ.' },
  { n:3, where:'SLEEP AND EAT', win:'3:00–9:00 PM Fri', mi:null, drive:null, rest:1, note:'Do not skip this. The next 20 hours are the job.' },
  { n:4, where:'Dry Lake (44.5)', win:'10:30 PM–12:30 AM', mi:44.5, drive:45, note:'Drop Pacer 1. Drop and go — no parking, sheriff tickets and tows.' },
  { n:5, where:'Olympian Hall (51.2)', win:'12:00–2:30 AM', mi:51.2, drive:15, key:1, note:'The biggest stop. Mandatory gear check on exit. Have all five items spare. Do not let him settle into a chair.' },
  { n:6, where:'Olympian Hall (63.9)', win:'4:00–7:00 AM', mi:63.9, drive:15, note:'Second gear check. Sunrise 6:51 AM. Caffeine, dry socks.' },
  { n:7, where:'Dry Lake (70.8)', win:'6:30–9:30 AM', mi:70.8, drive:45, note:'Drop and go. Pacer swap before the crux climb.' },
  { n:8, where:'Summit Lake (80.8)', win:'10:30 AM–1:30 PM', mi:80.8, drive:120, key:1, note:'Two-hour drive the long way around — you may not use Buffalo Pass Road above Dry Lake. Leave two and a half hours early. No cell service.' },
  { n:9, where:'Finish', win:'from 3:00 PM Sat', mi:101.8, drive:120, note:'Allow two hours to get back from Summit.' }
];

const DRIVES = [
  { to:'Olympian Hall', t:'15 min', dir:'Mount Werner Rd → right on Hwy 40 (Lincoln) into town → left on 5th St → cross the railroad tracks → right. Ample parking out front plus the ball fields and rodeo grounds within 100 yards.', tag:'Race HQ: check-in, briefings, drop bag drop-off, awards.' },
  { to:'Dry Lake', t:'45 min', dir:'Mount Werner Rd → right on Hwy 40 toward town → right on 3rd St toward Steamboat High → Amethyst Dr → Buffalo Pass Rd → about 3 mi. Parking lot on the right, just above Spring Creek Trailhead.', tag:'NO PARKING. DROP AND GO. DO NOT DRIVE HIGHER.', warn:1 },
  { to:'Summit Lake', t:'~2 hours, ~70 mi', dir:'Mount Werner Rd → Hwy 40 → LEFT toward Rabbit Ears Pass, away from town → ~22 mi to the Hwy 14 junction → left on Hwy 14 toward Walden → ~18.5 mi → sign on the left for Buffalo Pass (CO 24) → ~11 mi → onto CO 24-FR 60 → ~18.2 mi to the aid station.', tag:'Leave 2.5 hours before you need to be there. No cell service. Ample parking.', warn:1 },
  { to:'Fish Creek Falls TH', t:'bike or run 4 mi', dir:'Park at Olympian Hall and travel on foot or by bicycle. There is no shuttle and no vehicle access.', tag:'Driving here risks disqualification.', warn:1 },
  { to:'Downtown (spectator)', t:'—', dir:'Runners cross Lincoln between Spring Creek Trailhead and Olympian Hall in both directions, about 1.5 miles of town running. Park downtown or at Olympian.', tag:'Everyone may have a pacer through this stretch, Hares included.' }
];

const PACERS = [
  { n:1, from:44.5, to:63.9, dist:'19.4 mi', title:'Dry Lake → Olympian (second pass)',
    body:`Spring Creek descent, town crossing, then the full Emerald Mountain loop in the dark. Low elevation (6,600–8,200 ft) but the mentally hardest stretch of the race — a 12.7-mile loop at 1–5 AM ending where it started. Check in at the Lane of Pain aid station both times. Bears and mountain lions are explicitly flagged for Emerald.`,
    need:'Steady runner comfortable at night. Bring conversation.' },
  { n:2, from:63.9, to:80.8, dist:'16.9 mi', title:'Olympian → Summit Lake',
    body:`Town crossing, 5.5 miles climbing Spring Creek, then the Ditch and Grouse trails to 10,316 ft. Dawn, biggest sustained climb, most remote, most technical — Grouse is expert-grade mountain bike terrain with granite slabs marked by white dashes and cairns.`,
    need:'Your strongest pacer. Note: whoever finishes at Summit is stranded at 10,316 ft, two hours from town, until crew extracts them.', key:1 },
  { n:3, from:80.8, to:101.8, dist:'21.0 mi', title:'Summit Lake → Finish',
    body:`Wyoming Trail rollers above 10,000 ft over the course high point, the Percy Trail junction (<b>go right</b> — left is the 50-mile course), Long Lake, the last climb to Mt Werner, then 3,500 ft of descent in six miles.`,
    need:'Someone who can still move at 20+ min/mi and make decisions for a person who no longer can. Bring your own light — you will finish in the dark.' }
];

const MANDATORY = [
  'Headlamp, waist lamp or flashlight — plus a backup in case one fails',
  'Warm jacket',
  'Space blanket or equivalent',
  'Raincoat or equivalent',
  'Gloves'
];

const DROPBAGS = [
  { name:'Summit Lake bag', tag:'Mile 30.1 and 80.8 — sixteen hours apart',
    warn:'Pack as two clearly labelled ziplocs inside one bag.',
    lists:[
      { h:'Pass 1 — mile 30.1, about 7:15 PM Friday', items:['Headlamp and backup light','Spare batteries','Warm jacket','Gloves, hat, buff','Long-sleeve layer','Calories for 14.4 mi to Dry Lake'] },
      { h:'Pass 2 — mile 80.8, about 11:30 AM Saturday', items:['Dry socks','Fresh light and batteries for the second night','Sunscreen','Blister kit','Calories for the final 21 mi','Poles for the finish descent'] }
    ] },
  { name:'Olympian Hall bag', tag:'Mile 51.2 and 63.9 — only 12.7 mi and ~4 hours apart',
    lists:[
      { h:'Pass 1 — mile 51.2, about 1:00 AM', items:['Mandatory gear staging — all five items','Shoe and sock change if doing one','Real food','Emerald Mountain loop kit'] },
      { h:'Pass 2 — mile 63.9, about 4:45 AM', items:['Dry socks','Caffeine','Restock for the Spring Creek climb','Sunrise layer — sunrise is 6:51 AM'] }
    ] },
  { name:'Dry Lake — no drop bag', tag:'Mile 44.5 and 70.8', crewOnly:1,
    warn:'Dry Lake has crew access but no drop bag. Whatever you want at those two stops, the crew carries.' }
];

const CARRIES = [
  { seg:'Mount Werner (5.4) → Fish Creek (17.7)', d:'12.3 mi, no aid', note:'Longest dry stretch of the race. Filterable water in the last few miles of the canyon.', hi:1 },
  { seg:'Summit (30.1) → Dry Lake (44.5)', d:'14.4 mi', note:'Only minimal aid at Billy\'s (34.3). Longest segment on the course.', hi:1 },
  { seg:'Dry Lake (70.8) → Summit (80.8)', d:'10.0 mi', note:'Only minimal aid at Billy\'s (76.6). Biggest climb of the back half.', hi:1 },
  { seg:'Summit (80.8) → Long Lake (89.0)', d:'8.2 mi', note:'Above 10,000 ft the whole way. No bailout.' }
];

const SCHEDULE = [
  ['Thu 17 Sep','3:00–6:00 PM check-in and drop bag drop-off, Olympian Hall · 6:00–7:00 PM briefing, held outside — bring chairs · <b>Check-in closes 7:00 PM. No race-day check-in.</b>'],
  ['Fri 18 Sep','<b>9:00 AM Tortoise start</b> · 1:00 PM Hare start'],
  ['Sat 19 Sep','10:00 AM finish-line party (free to runners, $20 others; beer at noon) · <b>9:00 PM Tortoise cutoff, race ends</b>'],
  ['Sun 20 Sep','7:00 AM–noon drop bag pickup — contents donated or binned after noon · 10:30 AM awards, Olympian Hall'],
  ['Admin','Entries and Tortoise/Hare changes close <b>Monday 7 September</b>. Tortoises get 3-digit bibs, 400–800. Merch and discounted gondola tickets are cheaper at check-in than race morning.']
];

const RULES = [
  { r:'No driving to Fish Creek Falls Trailhead.', d:'Foot or bike only, four miles from Olympian Hall. "If your crew attempts to drive to this aid station you risk disqualification."' },
  { r:'No crewing or driving above Dry Lake on Buffalo Pass Road.', d:'Automatic DQ for the runner. Summit Lake requires the two-hour route around, every single time.' },
  { r:'No parking at Dry Lake.', d:'Drop off, turn around, leave. The sheriff will ticket and tow.' },
  { r:'Aid only at designated points.', d:'Crew aid stations, spectator access through town, and the top of the gondola. Nowhere else.' },
  { r:'No headphones between Spring Creek Trailhead and Olympian Hall.', d:'Either direction. Remove them approaching any aid station.' },
  { r:'An IV or oxygen ends your race.', d:'No exceptions.' },
  { r:'Rudeness is grounds for disqualification.', d:'To volunteers, staff, other runners, bikers, hunters or hikers. This is a volunteer-only organisation.' },
  { r:'No littering. No stashing supplies on course.', d:'Drop bags at designated aid stations only.' },
  { r:'You must leave the aid station before the cutoff time.', d:'Checking out and coming back after the cutoff counts as abandoning. Do not argue with the aid station captain.' }
];

const QUESTIONS = [
  '<b>Pacer pickup — Dry Lake 44.5, or Spring Creek Trailhead?</b> The manual contradicts itself: §5 and the aid station table say Dry Lake; §14 prose says Spring Creek Trailhead.',
  'Are Long Lake 24.3, Summit 30.1 and Dry Lake 44.5 actually uncutoff? The absolute-cutoff column is blank for all three.',
  'Mandatory gear — enforced at both Olympian passes? Is "warm jacket" specified, insulated versus any long-sleeve? Spot-checked anywhere else on course?',
  'Will the gondola run Friday morning for crew, and Saturday evening for family to reach the last four miles?',
  'Will Summit Lake drop bags be on site by 6:00 PM Friday?',
  'Buckle thresholds by finish time? Reported practice is gold under 30 hours, silver 30–36, but the manual does not say.'
];
