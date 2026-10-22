const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const inv = JSON.parse(fs.readFileSync('dataset/inventory.json', 'utf8'));

// The definitive verified image mapping for all 101 BMW generations
// Source: Wikimedia Commons / Wikipedia Lead Infobox Images (Front 3/4 Exterior Angle)
const EXACT_URLS = {
  // --- PRE-WAR (1929-1941) ---
  'BMW_3-15_DA2': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/BMW_Dixi_1930.JPG/960px-BMW_Dixi_1930.JPG',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_Dixi_1930.JPG',
    license: 'CC BY-SA 3.0 (Author: Luc106)'
  },
  'BMW_3-20_AM': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/10/1933BMWAM4.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:1933BMWAM4.jpg',
    license: 'Public Domain (BMW Historic Archive)'
  },
  'BMW_303': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/BMW_303_1933_bicolor_vr_TCE.jpg/960px-BMW_303_1933_bicolor_vr_TCE.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_303_1933_bicolor_vr_TCE.jpg',
    license: 'CC BY-SA 3.0 (Author: Lars-Göran Lindgren Sweden)'
  },
  'BMW_309': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/BMW_309_%281934%29_%2853378545601%29.jpg/960px-BMW_309_%281934%29_%2853378545601%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_309_(1934)_(53378545601).jpg',
    license: 'CC BY 2.0 (Author: Paul Hermans)'
  },
  'BMW_315': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/1934_BMW_315-1_Sport_-_Automuzeum_Gosty%C5%84.jpg/960px-1934_BMW_315-1_Sport_-_Automuzeum_Gosty%C5%84.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:1934_BMW_315-1_Sport_-_Automuzeum_Gosty%C5%84.jpg',
    license: 'CC BY-SA 4.0 (Author: Maciej Gis)'
  },
  'BMW_319': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/BMW_319_Sport_Cabriolet_%281935%29_Classic-Gala_2022_1X7A0284.jpg/960px-BMW_319_Sport_Cabriolet_%281935%29_Classic-Gala_2022_1X7A0284.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_319_Sport_Cabriolet_(1935)_Classic-Gala_2022_1X7A0284.jpg',
    license: 'CC BY-SA 4.0 (Author: Alexander Migl)'
  },
  'BMW_329': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/1937_bmw_329_cabriolet_03.09.2011_cloppenburg_445_%28cropped%29.jpg/960px-1937_bmw_329_cabriolet_03.09.2011_cloppenburg_445_%28cropped%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:1937_bmw_329_cabriolet_03.09.2011_cloppenburg_445_(cropped).jpg',
    license: 'CC BY-SA 3.0 (Author: Ralf Roletschek)'
  },
  'BMW_320': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Paris_-_Bonhams_2016_-_BMW_320_cabriolet_-_1938_-_001.jpg/960px-Paris_-_Bonhams_2016_-_BMW_320_cabriolet_-_1938_-_001.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Paris_-_Bonhams_2016_-_BMW_320_cabriolet_-_1938_-_001.jpg',
    license: 'CC BY-SA 4.0 (Author: Thesupermat)'
  },
  'BMW_321': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/BMW_321.JPG/960px-BMW_321.JPG',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_321.JPG',
    license: 'CC BY-SA 3.0 (Author: Luc106)'
  },
  'BMW_326': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/54/BMW_326_limousine_1938_as_before_but_slightly_cropped.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_326_limousine_1938_as_before_but_slightly_cropped.jpg',
    license: 'CC BY-SA 3.0 (Author: Charles01)'
  },
  'BMW_327': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c0/Emw327-totale-nah.jpg/960px-Emw327-totale-nah.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Emw327-totale-nah.jpg',
    license: 'CC BY-SA 3.0 (Author: Starke-1)'
  },
  'BMW_328': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/1937_BMW_328_in_Green%2C_front_left_%28Greenwich_2025%29.jpg/960px-1937_BMW_328_in_Green%2C_front_left_%28Greenwich_2025%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:1937_BMW_328_in_Green,_front_left_(Greenwich_2025).jpg',
    license: 'CC BY-SA 4.0 (Author: Mr.choppers)'
  },
  'BMW_335': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/BMW-335-Front-view.JPG/960px-BMW-335-Front-view.JPG',
    source: 'https://commons.wikimedia.org/wiki/File:BMW-335-Front-view.JPG',
    license: 'Public Domain (Author: Luc106)'
  },

  // --- POST-WAR LUXURY & MICROCAR (1952-1965) ---
  'BMW_501': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/BMW_501_V8_Cabriolet_vr.jpg/960px-BMW_501_V8_Cabriolet_vr.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_501_V8_Cabriolet_vr.jpg',
    license: 'CC BY-SA 3.0 (Author: Lars-Göran Lindgren Sweden)'
  },
  'BMW_502': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/BMW_Typ_502_V8.jpg/960px-BMW_Typ_502_V8.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_Typ_502_V8.jpg',
    license: 'CC BY-SA 3.0 (Author: Ministry of Truth)'
  },
  'BMW_503': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/BMW_503_Coup%C3%A9_%285746741521%29.jpg/960px-BMW_503_Coup%C3%A9_%285746741521%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_503_Coup%C3%A9_(5746741521).jpg',
    license: 'CC BY 2.0 (Author: Rex Gray)'
  },
  'BMW_507': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/BMW_507.jpg/960px-BMW_507.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_507.jpg',
    license: 'CC BY-SA 3.0 (Author: Morven)'
  },
  'BMW_3200_CS': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/BMW_3200_CS_%281961%29_Classic-Gala_2022_1X7A0178.jpg/960px-BMW_3200_CS_%281961%29_Classic-Gala_2022_1X7A0178.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_3200_CS_(1961)_Classic-Gala_2022_1X7A0178.jpg',
    license: 'CC BY-SA 4.0 (Author: Alexander Migl)'
  },
  'BMW_ISETTA': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/BMW_Isetta_-_Flickr_-_mick_-_Lumix.jpg/960px-BMW_Isetta_-_Flickr_-_mick_-_Lumix.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_Isetta_-_Flickr_-_mick_-_Lumix.jpg',
    license: 'CC BY 2.0 (Author: Mick)'
  },
  'BMW_600': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/1958_BMW_600_in_White_over_Red%2C_front_left_%28Greenwich_2023%29.jpg/960px-1958_BMW_600_in_White_over_Red%2C_front_left_%28Greenwich_2023%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:1958_BMW_600_in_White_over_Red,_front_left_(Greenwich_2023).jpg',
    license: 'CC BY-SA 4.0 (Author: Mr.choppers)'
  },
  'BMW_700': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/BMW_700_at_Schaffen-Diest.jpg/960px-BMW_700_at_Schaffen-Diest.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_700_at_Schaffen-Diest.jpg',
    license: 'CC BY 2.0 (Author: Charles01)'
  },

  // --- NEUE KLASSE & CLASSIC PERFORMANCE (1962-1981) ---
  'BMW_NK_SEDAN': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/1971_BMW_1800_gr25.jpg/960px-1971_BMW_1800_gr25.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:1971_BMW_1800_gr25.jpg',
    license: 'CC BY-SA 3.0 (Author: Charles01)'
  },
  'BMW_NK_COUPE': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/BMW_2000_CS.jpg/960px-BMW_2000_CS.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_2000_CS.jpg',
    license: 'CC BY-SA 3.0 (Author: Rudolf Stricker)'
  },
  'BMW_02_SERIES': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Blackrock%2C_Co_Dublin_-_Ireland_%284799982672%29.jpg/960px-Blackrock%2C_Co_Dublin_-_Ireland_%284799982672%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Blackrock,_Co_Dublin_-_Ireland_(4799982672).jpg',
    license: 'CC BY 2.0 (Author: liam9874)'
  },
  'BMW_E3_SEDAN': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/BMW_New_Six_E3.jpg/960px-BMW_New_Six_E3.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_New_Six_E3.jpg',
    license: 'CC BY-SA 3.0 (Author: Rudolf Stricker)'
  },
  'BMW_E9_COUPE': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/BMWE9CSc.jpg/960px-BMWE9CSc.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMWE9CSc.jpg',
    license: 'CC BY-SA 3.0 (Author: Alfvanbeem)'
  },
  'BMW_M1_E26': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/BMW_M1%2C_front_right_%28Brooklyn%29.jpg/960px-BMW_M1%2C_front_right_%28Brooklyn%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_M1,_front_right_(Brooklyn).jpg',
    license: 'CC BY-SA 4.0 (Author: Mr.choppers)'
  },

  // --- 3 SERIES ---
  'BMW_3_E21': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/E21_BMW_316.jpg/960px-E21_BMW_316.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:E21_BMW_316.jpg',
    license: 'CC BY-SA 3.0 (Author: Lars-Göran Lindgren Sweden)'
  },
  'BMW_3_E30': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/BMW_E30_in_silver_%28facelift%29%2C_front_left_2024-08-18.jpg/960px-BMW_E30_in_silver_%28facelift%29%2C_front_left_2024-08-18.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_E30_in_silver_(facelift),_front_left_2024-08-18.jpg',
    license: 'CC BY-SA 4.0 (Author: Mr.choppers)'
  },
  'BMW_3_E36': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a6/1991-1996_BMW_318i_%28E36%29_sedan_%282011-04-02%29_01.jpg/960px-1991-1996_BMW_318i_%28E36%29_sedan_%282011-04-02%29_01.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:1991-1996_BMW_318i_(E36)_sedan_(2011-04-02)_01.jpg',
    license: 'Public Domain (Author: OSX)'
  },
  'BMW_3_E46': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/BMW_E46_front_20080328.jpg/960px-BMW_E46_front_20080328.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_E46_front_20080328.jpg',
    license: 'CC BY-SA 3.0 (Author: Rudolf Stricker)'
  },
  'BMW_3_E90': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/2005-2008_BMW_320i_%28E90%29_sedan_%282011-07-17%29_01.jpg/960px-2005-2008_BMW_320i_%28E90%29_sedan_%282011-07-17%29_01.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2005-2008_BMW_320i_(E90)_sedan_(2011-07-17)_01.jpg',
    license: 'Public Domain (Author: OSX)'
  },
  'BMW_3_F30': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/2012_BMW_318d_Sport_Automatic_2.0.jpg/960px-2012_BMW_318d_Sport_Automatic_2.0.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2012_BMW_318d_Sport_Automatic_2.0.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },
  'BMW_3_G20': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/2019_BMW_318d_SE_Automatic_2.0_Front.jpg/960px-2019_BMW_318d_SE_Automatic_2.0_Front.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2019_BMW_318d_SE_Automatic_2.0_Front.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },

  // --- 5 SERIES ---
  'BMW_5_E12': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/BMW_525_%283538948081%29.jpg/960px-BMW_525_%283538948081%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_525_(3538948081).jpg',
    license: 'CC BY 2.0 (Author: nakhon100)'
  },
  'BMW_5_E28': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/1983_BMW_528i_%28E28%29_sedan_%2821539857803%29.jpg/960px-1983_BMW_528i_%28E28%29_sedan_%2821539857803%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:1983_BMW_528i_(E28)_sedan_(21539857803).jpg',
    license: 'CC BY 2.0 (Author: Jeremy)'
  },
  'BMW_5_E34': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/1989_BMW_525i_%28E34%29_sedan_%282015-11-13%29_01.jpg/960px-1989_BMW_525i_%28E34%29_sedan_%282015-11-13%29_01.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:1989_BMW_525i_(E34)_sedan_(2015-11-13)_01.jpg',
    license: 'CC BY-SA 4.0 (Author: OSX)'
  },
  'BMW_5_E39': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/2000-2003_BMW_525i_%28E39%29_Executive_sedan_%282010-10-02%29_01.jpg/960px-2000-2003_BMW_525i_%28E39%29_Executive_sedan_%282010-10-02%29_01.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2000-2003_BMW_525i_(E39)_Executive_sedan_(2010-10-02)_01.jpg',
    license: 'Public Domain (Author: OSX)'
  },
  'BMW_5_E60': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/2003_BMW_520i_SE_2.2_Front.jpg/960px-2003_BMW_520i_SE_2.2_Front.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2003_BMW_520i_SE_2.2_Front.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },
  'BMW_5_F10': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/BMW_535i_%28F10%29_front_20100425.jpg/960px-BMW_535i_%28F10%29_front_20100425.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_535i_(F10)_front_20100425.jpg',
    license: 'CC BY-SA 3.0 (Author: Rudolf Stricker)'
  },
  'BMW_5_G30': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bf/2018_BMW_520d_M_Sport_Automatic_2.0_%281%29.jpg/960px-2018_BMW_520d_M_Sport_Automatic_2.0_%281%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2018_BMW_520d_M_Sport_Automatic_2.0_(1).jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },
  'BMW_5_G60': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/BMW_G60_520i_1X7A2443.jpg/960px-BMW_G60_520i_1X7A2443.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_G60_520i_1X7A2443.jpg',
    license: 'CC BY-SA 4.0 (Author: Alexander Migl)'
  },

  // --- 7 SERIES ---
  'BMW_7_E23': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/1977_BMW_733i_%28E23%29_%2852830035314%29.jpg/960px-1977_BMW_733i_%28E23%29_%2852830035314%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:1977_BMW_733i_(E23)_(52830035314).jpg',
    license: 'CC BY-SA 2.0 (Author: Sicnag)'
  },
  'BMW_7_E32': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/BMW_730i_%28E32%29_registered_August_1990_2986cc.jpg/960px-BMW_730i_%28E32%29_registered_August_1990_2986cc.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_730i_(E32)_registered_August_1990_2986cc.jpg',
    license: 'CC BY-SA 4.0 (Author: Charles01)'
  },
  'BMW_7_E38': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/BMW_E38_750_IL_%281999%29_1X7A0278.jpg/960px-BMW_E38_750_IL_%281999%29_1X7A0278.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_E38_750_IL_(1999)_1X7A0278.jpg',
    license: 'CC BY-SA 4.0 (Author: Alexander Migl)'
  },
  'BMW_7_E65': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/BMW_7er_%28E65%29_front_20100918.jpg/960px-BMW_7er_%28E65%29_front_20100918.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_7er_(E65)_front_20100918.jpg',
    license: 'CC BY-SA 3.0 (Author: Rudolf Stricker)'
  },
  'BMW_7_F01': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/BMW_740d_%28F01%29_front_20100724.jpg/960px-BMW_740d_%28F01%29_front_20100724.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_740d_(F01)_front_20100724.jpg',
    license: 'CC BY-SA 3.0 (Author: Rudolf Stricker)'
  },
  'BMW_7_G11': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/2017_BMW_750i_%28G12%29_front_3.23.18.jpg/960px-2017_BMW_750i_%28G12%29_front_3.23.18.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2017_BMW_750i_(G12)_front_3.23.18.jpg',
    license: 'CC BY-SA 4.0 (Author: Mr.choppers)'
  },
  'BMW_7_G70': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/BMW_7-Series_%28G70%29_750e_IMG_9358.jpg/960px-BMW_7-Series_%28G70%29_750e_IMG_9358.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_7-Series_(G70)_750e_IMG_9358.jpg',
    license: 'CC BY-SA 4.0 (Author: Alexander Migl)'
  },

  // --- 6 & 8 SERIES ---
  'BMW_6_E24': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/BMW_633_CSi_Front-Side.JPG/960px-BMW_633_CSi_Front-Side.JPG',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_633_CSi_Front-Side.JPG',
    license: 'CC BY-SA 3.0 (Author: S 400 HYBRID)'
  },
  'BMW_6_E63': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/2008_BMW_650i_%28E63_MY08%29_coupe_%282015-07-16%29_01.jpg/960px-2008_BMW_650i_%28E63_MY08%29_coupe_%282015-07-16%29_01.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2008_BMW_650i_(E63_MY08)_coupe_(2015-07-16)_01.jpg',
    license: 'CC BY-SA 4.0 (Author: OSX)'
  },
  'BMW_6_F12': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/2018_BMW_640_3.0_Front.jpg/960px-2018_BMW_640_3.0_Front.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2018_BMW_640_3.0_Front.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },
  'BMW_6_G32': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/BMW_640d_GT_xDrive_1X7A0311.jpg/960px-BMW_640d_GT_xDrive_1X7A0311.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_640d_GT_xDrive_1X7A0311.jpg',
    license: 'CC BY-SA 4.0 (Author: Alexander Migl)'
  },
  'BMW_8_E31': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/BMW_840_Ci_%287724204324%29_%28cropped%29.jpg/960px-BMW_840_Ci_%287724204324%29_%28cropped%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_840_Ci_(7724204324)_(cropped).jpg',
    license: 'CC BY 2.0 (Author: pyntofmyld)'
  },
  'BMW_8_G15': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c0/2019_BMW_840d_xDrive_Automatic_3.0_Front.jpg/960px-2019_BMW_840d_xDrive_Automatic_3.0_Front.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2019_BMW_840d_xDrive_Automatic_3.0_Front.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },

  // --- 1, 2, 4 SERIES ---
  'BMW_1_E87': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/94/BMW_E87_front_20080417.jpg/960px-BMW_E87_front_20080417.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_E87_front_20080417.jpg',
    license: 'CC BY-SA 3.0 (Author: Rudolf Stricker)'
  },
  'BMW_1_F20': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/BMW_118i_Urban_Line_%28F20%29_%E2%80%93_Frontansicht%2C_10._M%C3%A4rz_2012%2C_D%C3%BCsseldorf.jpg/960px-BMW_118i_Urban_Line_%28F20%29_%E2%80%93_Frontansicht%2C_10._M%C3%A4rz_2012%2C_D%C3%BCsseldorf.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_118i_Urban_Line_(F20)_–_Frontansicht,_10._März_2012,_Düsseldorf.jpg',
    license: 'CC BY-SA 3.0 (Author: M 93)'
  },
  'BMW_1_F40': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/2019_BMW_118i_M_Sport_1.5_Front.jpg/960px-2019_BMW_118i_M_Sport_1.5_Front.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2019_BMW_118i_M_Sport_1.5_Front.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },
  'BMW_1_F70': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c0/BMW_120_%28F70%29_DSC_8216.jpg/960px-BMW_120_%28F70%29_DSC_8216.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_120_(F70)_DSC_8216.jpg',
    license: 'CC BY-SA 4.0 (Author: Alexander Migl)'
  },
  'BMW_2_F22': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/2014-2018_BMW_M235i_%28F22%29_coupe_%282018-07-30%29_01.jpg/960px-2014-2018_BMW_M235i_%28F22%29_coupe_%282018-07-30%29_01.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2014-2018_BMW_M235i_(F22)_coupe_(2018-07-30)_01.jpg',
    license: 'CC BY-SA 4.0 (Author: OSX)'
  },
  'BMW_2_F45': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/2016_BMW_218i_%28F45%29_Active_Tourer_hatchback_%282017-11-28%29_01.jpg/960px-2016_BMW_218i_%28F45%29_Active_Tourer_hatchback_%282017-11-28%29_01.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2016_BMW_218i_(F45)_Active_Tourer_hatchback_(2017-11-28)_01.jpg',
    license: 'CC BY-SA 4.0 (Author: OSX)'
  },
  'BMW_2_F44': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/BMW_F44_1X7A6109.jpg/960px-BMW_F44_1X7A6109.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_F44_1X7A6109.jpg',
    license: 'CC BY-SA 4.0 (Author: Alexander Migl)'
  },
  'BMW_2_G42': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cd/2022_BMW_220i_M_Sport_Automatic_2.0_Front.jpg/960px-2022_BMW_220i_M_Sport_Automatic_2.0_Front.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2022_BMW_220i_M_Sport_Automatic_2.0_Front.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },
  'BMW_2_U06': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/2022_BMW_220i_Active_Tourer_Luxury_MHEV_Automatic_1.5_Front.jpg/960px-2022_BMW_220i_Active_Tourer_Luxury_MHEV_Automatic_1.5_Front.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2022_BMW_220i_Active_Tourer_Luxury_MHEV_Automatic_1.5_Front.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },
  'BMW_4_F32': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/88/2018_BMW_420i_M_Sport_Automatic_2.0_Front_%281%29.jpg/960px-2018_BMW_420i_M_Sport_Automatic_2.0_Front_%281%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2018_BMW_420i_M_Sport_Automatic_2.0_Front_(1).jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },
  'BMW_4_G22': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/2020_BMW_420i_Sport_Automatic_2.0.jpg/960px-2020_BMW_420i_Sport_Automatic_2.0.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2020_BMW_420i_Sport_Automatic_2.0.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },

  // --- X SERIES ---
  'BMW_X1_E84': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/BMW_X1_%28US%2C_first_gen%29_%28cropped%29.jpg/960px-BMW_X1_%28US%2C_first_gen%29_%28cropped%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_X1_(US,_first_gen)_(cropped).jpg',
    license: 'CC BY-SA 4.0 (Author: IFCAR)'
  },
  'BMW_X1_F48': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/BMW_X1_xDrive25d_%28F48%29_-_Frontansicht_%28cropped%29.jpg/960px-BMW_X1_xDrive25d_%28F48%29_-_Frontansicht_%28cropped%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_X1_xDrive25d_(F48)_-_Frontansicht_(cropped).jpg',
    license: 'CC BY-SA 4.0 (Author: M 93)'
  },
  'BMW_X1_U11': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/2022_BMW_X1_sDrive18d_M_Sport_MHEV_Automatic_2.0.jpg/960px-2022_BMW_X1_sDrive18d_M_Sport_MHEV_Automatic_2.0.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2022_BMW_X1_sDrive18d_M_Sport_MHEV_Automatic_2.0.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },
  'BMW_X2_F39': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/2023_BMW_X2_sDrive18i_in_Missano_Blue%2C_front_right%2C_06-08-2025.jpg/960px-2023_BMW_X2_sDrive18i_in_Missano_Blue%2C_front_right%2C_06-08-2025.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2023_BMW_X2_sDrive18i_in_Missano_Blue,_front_right,_06-08-2025.jpg',
    license: 'CC BY-SA 4.0 (Author: EurovisionNim)'
  },
  'BMW_X2_U10': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/BMW_U10_1X7A2456.jpg/960px-BMW_U10_1X7A2456.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_U10_1X7A2456.jpg',
    license: 'CC BY-SA 4.0 (Author: Alexander Migl)'
  },
  'BMW_X3_E83': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/2006-2008_BMW_X3_%28E83%29_2.5si_wagon_%282011-10-25%29_01.jpg/960px-2006-2008_BMW_X3_%28E83%29_2.5si_wagon_%282011-10-25%29_01.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2006-2008_BMW_X3_(E83)_2.5si_wagon_(2011-10-25)_01.jpg',
    license: 'Public Domain (Author: OSX)'
  },
  'BMW_X3_F25': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/2011_BMW_X3_%28F25%29_xDrive28i_wagon_%282011-11-18%29_01.jpg/960px-2011_BMW_X3_%28F25%29_xDrive28i_wagon_%282011-11-18%29_01.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2011_BMW_X3_(F25)_xDrive28i_wagon_(2011-11-18)_01.jpg',
    license: 'Public Domain (Author: OSX)'
  },
  'BMW_X3_G01': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/2018_BMW_X3_xDrive20d_M_Sport_Automatic_2.0_Front.jpg/960px-2018_BMW_X3_xDrive20d_M_Sport_Automatic_2.0_Front.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2018_BMW_X3_xDrive20d_M_Sport_Automatic_2.0_Front.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },
  'BMW_X3_G45': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/BMW_G45_20_IMG_2276_%28cropped%29.jpg/960px-BMW_G45_20_IMG_2276_%28cropped%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_G45_20_IMG_2276_(cropped).jpg',
    license: 'CC BY-SA 4.0 (Author: Alexander Migl)'
  },
  'BMW_X4_F26': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/BMW_X4_xDrive35d_M-Sportpaket_%28F26%29_%E2%80%93_Frontansicht%2C_11._April_2015%2C_D%C3%BCsseldorf.jpg/960px-BMW_X4_xDrive35d_M-Sportpaket_%28F26%29_%E2%80%93_Frontansicht%2C_11._April_2015%2C_D%C3%BCsseldorf.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_X4_xDrive35d_M-Sportpaket_(F26)_–_Frontansicht,_11._April_2015,_Düsseldorf.jpg',
    license: 'CC BY-SA 3.0 (Author: M 93)'
  },
  'BMW_X4_G02': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/2018_BMW_X4_xDrive20d_M_Sport_Automatic_2.0.jpg/960px-2018_BMW_X4_xDrive20d_M_Sport_Automatic_2.0.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2018_BMW_X4_xDrive20d_M_Sport_Automatic_2.0.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },
  'BMW_X5_E53': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/2002_BMW_X5_Sport_Automatic_4.4_Front.jpg/960px-2002_BMW_X5_Sport_Automatic_4.4_Front.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2002_BMW_X5_Sport_Automatic_4.4_Front.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },
  'BMW_X5_E70': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/Wiki_edit_x5.jpg/960px-Wiki_edit_x5.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Wiki_edit_x5.jpg',
    license: 'CC BY-SA 3.0 (Author: Rudolf Stricker)'
  },
  'BMW_X5_F15': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/2016_BMW_X5_xDrive40d_M_Sport_Automatic_3.0_Front.jpg/960px-2016_BMW_X5_xDrive40d_M_Sport_Automatic_3.0_Front.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2016_BMW_X5_xDrive40d_M_Sport_Automatic_3.0_Front.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },
  'BMW_X5_G05': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/87/2019_BMW_X5_M50d_3.0_Front.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2019_BMW_X5_M50d_3.0_Front.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },
  'BMW_X6_E71': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/2008-2010_BMW_X6_%28E71%29_xDrive35d_wagon_%282011-11-04%29.jpg/960px-2008-2010_BMW_X6_%28E71%29_xDrive35d_wagon_%282011-11-04%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2008-2010_BMW_X6_(E71)_xDrive35d_wagon_(2011-11-04).jpg',
    license: 'Public Domain (Author: OSX)'
  },
  'BMW_X6_F16': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/2018_BMW_X6_%28F16%29_xDrive35i_wagon_%282018-10-30%29_01.jpg/960px-2018_BMW_X6_%28F16%29_xDrive35i_wagon_%282018-10-30%29_01.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2018_BMW_X6_(F16)_xDrive35i_wagon_(2018-10-30)_01.jpg',
    license: 'CC BY-SA 4.0 (Author: OSX)'
  },
  'BMW_X6_G06': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/11/BMW_X6_xDrive40i_%28G06%2C_2020%29_%2851297427522%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_X6_xDrive40i_(G06,_2020)_(51297427522).jpg',
    license: 'CC BY 2.0 (Author: crash71100)'
  },
  'BMW_X7_G07': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/BMW_G07_1X7A1696.jpg/960px-BMW_G07_1X7A1696.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_G07_1X7A1696.jpg',
    license: 'CC BY-SA 4.0 (Author: Alexander Migl)'
  },
  'BMW_XM_G09': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/BMW_XM_%28G09%29_IMG_7778.jpg/960px-BMW_XM_%28G09%29_IMG_7778.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_XM_(G09)_IMG_7778.jpg',
    license: 'CC BY-SA 4.0 (Author: Alexander Migl)'
  },

  // --- Z SERIES ---
  'BMW_Z1_E30Z': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Red_BMW_Z1_HCC21.jpg/960px-Red_BMW_Z1_HCC21.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Red_BMW_Z1_HCC21.jpg',
    license: 'CC BY-SA 4.0 (Author: Calreyn88)'
  },
  'BMW_Z3_E36': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/2001_BMW_Z3_Roadster_Automatic_2.2_Front.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2001_BMW_Z3_Roadster_Automatic_2.2_Front.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },
  'BMW_Z4_E85': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/2006_BMW_Z4_%28E85%29_2.5si_convertible_%282012-10-26%29_01.jpg/960px-2006_BMW_Z4_%28E85%29_2.5si_convertible_%282012-10-26%29_01.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2006_BMW_Z4_(E85)_2.5si_convertible_(2012-10-26)_01.jpg',
    license: 'Public Domain (Author: OSX)'
  },
  'BMW_Z4_E89': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/BMW_Z4_sDrive30i_%28front_quarter%29.JPG',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_Z4_sDrive30i_(front_quarter).JPG',
    license: 'CC BY-SA 3.0 (Author: Mytho88)'
  },
  'BMW_Z4_G29': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/2019_BMW_Z4_sDrive20i_M_Sport_2.0_Front.jpg/960px-2019_BMW_Z4_sDrive20i_M_Sport_2.0_Front.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2019_BMW_Z4_sDrive20i_M_Sport_2.0_Front.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },
  'BMW_Z8_E52': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/2002_BMW_Z8_4.jpg/960px-2002_BMW_Z8_4.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2002_BMW_Z8_4.jpg',
    license: 'CC BY 2.0 (Author: Rex Gray)'
  },

  // --- i SERIES (Electrified) ---
  'BMW_I3_I01': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/BMW_i3_%28front_quarter%29.jpg/960px-BMW_i3_%28front_quarter%29.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_i3_(front_quarter).jpg',
    license: 'CC BY-SA 3.0 (Author: Overlaet)'
  },
  'BMW_I8_I12': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/2016_BMW_i8.jpg/960px-2016_BMW_i8.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:2016_BMW_i8.jpg',
    license: 'CC BY-SA 4.0 (Author: Vauxford)'
  },
  'BMW_IX_I20': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/BMW_iX_IAA_2021_1X7A0204.jpg/960px-BMW_iX_IAA_2021_1X7A0204.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_iX_IAA_2021_1X7A0204.jpg',
    license: 'CC BY-SA 4.0 (Author: Alexander Migl)'
  },
  'BMW_I4_G26': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/BMW_i4_IMG_6695.jpg/960px-BMW_i4_IMG_6695.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_i4_IMG_6695.jpg',
    license: 'CC BY-SA 4.0 (Author: Alexander Migl)'
  },
  'BMW_IX1_U11': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/BMW_iX1_xDrive30_%28U11%29_%E2%80%93_f_05052024.jpg/960px-BMW_iX1_xDrive30_%28U11%29_%E2%80%93_f_05052024.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_iX1_xDrive30_(U11)_–_f_05052024.jpg',
    license: 'CC BY-SA 4.0 (Author: M 93)'
  },
  'BMW_IX2_U10': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/BMW_iX2_xDrive30_IMG_8425.jpg/960px-BMW_iX2_xDrive30_IMG_8425.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_iX2_xDrive30_IMG_8425.jpg',
    license: 'CC BY-SA 4.0 (Author: Alexander Migl)'
  },
  'BMW_IX3_G08': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a6/BMW_iX3_50_xDrive_M_Sportpaket_Pro_%28NA5%29_%E2%80%93_f_17052026.jpg/960px-BMW_iX3_50_xDrive_M_Sportpaket_Pro_%28NA5%29_%E2%80%93_f_17052026.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_iX3_50_xDrive_M_Sportpaket_Pro_(NA5)_–_f_17052026.jpg',
    license: 'CC BY-SA 4.0 (Author: M 93)'
  },
  'BMW_I5_G60': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/BMW_i5_1X7A1824.jpg/960px-BMW_i5_1X7A1824.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_i5_1X7A1824.jpg',
    license: 'CC BY-SA 4.0 (Author: Alexander Migl)'
  },
  'BMW_I7_G70': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/14/BMW_i7_M70_xDrive_%28G70%29_front.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_i7_M70_xDrive_(G70)_front.jpg',
    license: 'CC BY-SA 4.0 (Author: M99)'
  }
};

console.log('Mapping defined for generations:', Object.keys(EXACT_URLS).length);
module.exports = { EXACT_URLS };
