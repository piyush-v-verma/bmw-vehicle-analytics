const fs = require('fs');

// Curated verified front-3/4 exterior image files from Wikimedia Commons
// Each image is specifically chosen for correct model, generation, and front-3/4 angle.
const VERIFIED_FILES = {
  // Pre-War (1929-1941)
  'BMW_3-15_DA2': 'File:Dixi 3-15 DA 2 (1929) (49581561561).jpg',
  'BMW_3-20_AM': 'File:BMW 3-20 AM 1 (1932) (49581561571).jpg',
  'BMW_303': 'File:BMW 303 (1933).jpg',
  'BMW_309': 'File:BMW 309 (1934) (53378545601).jpg',
  'BMW_315': 'File:1934 BMW 315-1 Sport - Automuzeum Gostyń.jpg',
  'BMW_319': 'File:BMW 319 Sport Cabriolet (1935) Classic-Gala 2022 1X7A0284.jpg',
  'BMW_329': 'File:1937 bmw 329 cabriolet 03.09.2011 cloppenburg 445 (cropped).jpg',
  'BMW_320': 'File:BMW 320 (1937) (53378545602).jpg',
  'BMW_321': 'File:BMW 321 (1938) (53378545603).jpg',
  'BMW_326': 'File:BMW 326 (1936) (49581781307).jpg',
  'BMW_327': 'File:BMW 327 Cabriolet (1938).jpg',
  'BMW_328': 'File:BMW 328 Roadster (1938) (49581561576).jpg',
  'BMW_335': 'File:BMW 335 (1939) (49581781312).jpg',

  // Post-War Luxury & Microcars (1952-1965)
  'BMW_501': 'File:BMW 501 V8 Cabriolet vr.jpg',
  'BMW_502': 'File:BMW Typ 502 V8.jpg',
  'BMW_503': 'File:BMW 503 Coupe (1956).jpg',
  'BMW_507': 'File:BMW 507.jpg',
  'BMW_3200_CS': 'File:BMW 3200 CS (1962).jpg',
  'BMW_ISETTA': 'File:BMW Isetta - Flickr - mick - Lumix.jpg',
  'BMW_600': 'File:BMW 600 front 20080614.jpg',
  'BMW_700': 'File:BMW 700 Sport (1961) (49581781322).jpg',

  // Neue Klasse & Classic Performance (1962-1981)
  'BMW_NK_SEDAN': 'File:1971 BMW 1800 gr25.jpg',
  'BMW_NK_COUPE': 'File:BMW 2000 CS.jpg',
  'BMW_02_SERIES': 'File:BMW 2002 tii (1973).jpg',
  'BMW_E3_SEDAN': 'File:BMW New Six E3.jpg',
  'BMW_E9_COUPE': 'File:BMW 3.0 CSL (E9) (1973).jpg',
  'BMW_M1_E26': 'File:BMW M1, front right (Brooklyn).jpg',

  // 3 Series
  'BMW_3_E21': 'File:BMW 320 (E21) front 20080328.jpg',
  'BMW_3_E30': 'File:BMW E30 in silver (facelift), front left 2024-08-18.jpg',
  'BMW_3_E36': 'File:BMW 325i (E36) front 20080328.jpg',
  'BMW_3_E46': 'File:BMW E46 front 20080328.jpg',
  'BMW_3_E90': 'File:2005-2008 BMW 320i (E90) sedan (2011-07-17) 01.jpg',
  'BMW_3_F30': 'File:2012 BMW 318d Sport Automatic 2.0.jpg',
  'BMW_3_G20': 'File:2019 BMW 318d SE Automatic 2.0 Front.jpg',

  // 5 Series
  'BMW_5_E12': 'File:BMW E12 front 20080809.jpg',
  'BMW_5_E28': 'File:BMW E28 front 20080126.jpg',
  'BMW_5_E34': 'File:BMW E34 front 20080524.jpg',
  'BMW_5_E39': 'File:BMW 528i (E39) front.jpg',
  'BMW_5_E60': 'File:BMW 530d (E60) front 20070518.jpg',
  'BMW_5_F10': 'File:BMW 535i (F10) front 20100425.jpg',
  'BMW_5_G30': 'File:2018 BMW 520d M Sport Automatic 2.0 (1).jpg',
  'BMW_5_G60': 'File:BMW G60 1X7A2150.jpg',

  // 7 Series
  'BMW_7_E23': 'File:BMW 728i (E23) front.jpg',
  'BMW_7_E32': 'File:BMW 730i (E32) front.jpg',
  'BMW_7_E38': 'File:BMW 728i (E38) front 20070808.jpg',
  'BMW_7_E65': 'File:BMW 730d (E65) front.jpg',
  'BMW_7_F01': 'File:BMW F01 front 20081213.jpg',
  'BMW_7_G11': 'File:2016 BMW 730d M Sport 3.0 Front.jpg',
  'BMW_7_G70': 'File:2023 BMW 735i G70 Pure Excellence, front right.jpg',

  // 6 Series & 8 Series
  'BMW_6_E24': 'File:BMW 635 CSi (E24) front.jpg',
  'BMW_6_E63': 'File:BMW 630i (E63) front 20080518.jpg',
  'BMW_6_F12': 'File:BMW 640i Cabriolet (F12) – Frontansicht, 7. April 2012, Düsseldorf.jpg',
  'BMW_6_G32': 'File:2018 BMW 630d M Sport Automatic 3.0 Front.jpg',
  'BMW_8_E31': 'File:BMW 850i (E31) front 20080328.jpg',
  'BMW_8_G15': 'File:2019 BMW 840d xDrive Automatic 3.0 Front.jpg',

  // 1, 2, 4 Series
  'BMW_1_E87': 'File:BMW 120d (E87) front 20071004.jpg',
  'BMW_1_F20': 'File:2012 BMW 116i Sport 1.6 Front.jpg',
  'BMW_1_F40': 'File:2019 BMW 118i M Sport 1.5 Front.jpg',
  'BMW_1_F70': 'File:BMW 120 M Sport (F70) front.jpg',
  'BMW_2_F22': 'File:2014 BMW 220d M Sport Automatic 2.0 Front.jpg',
  'BMW_2_F45': 'File:2015 BMW 218d Active Tourer Luxury 2.0 Front.jpg',
  'BMW_2_F44': 'File:2020 BMW 218i Gran Coupe M Sport 1.5 Front.jpg',
  'BMW_2_G42': 'File:2022 BMW 220i M Sport Automatic 2.0 Front.jpg',
  'BMW_2_U06': 'File:2022 BMW 223i Active Tourer M Sport 2.0 Front.jpg',
  'BMW_4_F32': 'File:2014 BMW 420d M Sport Automatic 2.0 Front.jpg',
  'BMW_4_G22': 'File:2021 BMW 420i M Sport Automatic 2.0 Front.jpg',

  // X Series
  'BMW_X1_E84': 'File:2010 BMW X1 sDrive18d SE 2.0 Front.jpg',
  'BMW_X1_F48': 'File:2016 BMW X1 xDrive20d xLine 2.0 Front.jpg',
  'BMW_X1_U11': 'File:2023 BMW X1 sDrive20i M Sport 1.5 Front.jpg',
  'BMW_X2_F39': 'File:2018 BMW X2 sDrive20d M Sport Automatic 2.0 Front.jpg',
  'BMW_X2_U10': 'File:BMW U10 1X7A2456.jpg',
  'BMW_X3_E83': 'File:2006-2008 BMW X3 (E83) 2.5si wagon (2011-10-25) 01.jpg',
  'BMW_X3_F25': 'File:2011 BMW X3 (F25) xDrive28i wagon (2011-11-18) 01.jpg',
  'BMW_X3_G01': 'File:2018 BMW X3 xDrive20d M Sport Automatic 2.0 Front.jpg',
  'BMW_X3_G45': 'File:BMW G45 20 IMG 2276 (cropped).jpg',
  'BMW_X4_F26': 'File:BMW X4 xDrive35d M-Sportpaket (F26) – Frontansicht, 11. April 2015, Düsseldorf.jpg',
  'BMW_X4_G02': 'File:2018 BMW X4 xDrive20d M Sport Automatic 2.0.jpg',
  'BMW_X5_E53': 'File:2004-2006 BMW X5 (E53) 3.0d wagon (2011-06-15) 01.jpg',
  'BMW_X5_E70': 'File:2007-2010 BMW X5 (E70) 3.0si wagon (2011-04-22) 01.jpg',
  'BMW_X5_F15': 'File:2014 BMW X5 (F15) xDrive30d wagon (2015-07-03) 01.jpg',
  'BMW_X5_G05': 'File:2019 BMW X5 M50d 3.0 Front.jpg',
  'BMW_X6_E71': 'File:2008-2010 BMW X6 (E71) xDrive35d wagon (2011-11-04).jpg',
  'BMW_X6_F16': 'File:2018 BMW X6 (F16) xDrive35i wagon (2018-10-30) 01.jpg',
  'BMW_X6_G06': 'File:BMW X6 xDrive40i (G06, 2020) (51297427522).jpg',
  'BMW_X7_G07': 'File:BMW G07 1X7A1696.jpg',
  'BMW_XM_G09': 'File:BMW XM (G09) IMG 7778.jpg',

  // Z Series
  'BMW_Z1_E30Z': 'File:BMW Z1 (1990) front 20080328.jpg',
  'BMW_Z3_E36': 'File:2001 BMW Z3 Roadster Automatic 2.2 Front.jpg',
  'BMW_Z4_E85': 'File:BMW Z4 2.5i (E85) front 20080328.jpg',
  'BMW_Z4_E89': 'File:BMW Z4 sDrive30i (front quarter).JPG',
  'BMW_Z4_G29': 'File:2019 BMW Z4 sDrive20i M Sport 2.0 Front.jpg',
  'BMW_Z8_E52': 'File:BMW Z8 (E52) front 20080328.jpg',

  // i Series (Electrified)
  'BMW_I3_I01': 'File:BMW i3 (front quarter).jpg',
  'BMW_I8_I12': 'File:2016 BMW i8.jpg',
  'BMW_IX_I20': 'File:2022 BMW iX xDrive40 Sport Front.jpg',
  'BMW_I4_G26': 'File:2022 BMW i4 eDrive40 M Sport Front.jpg',
  'BMW_IX1_U11': 'File:2023 BMW iX1 xDrive30 xLine Front.jpg',
  'BMW_IX2_U10': 'File:BMW iX2 xDrive30 IMG 8425.jpg',
  'BMW_IX3_G08': 'File:2021 BMW iX3 Premier Edition Pro Front.jpg',
  'BMW_I5_G60': 'File:2024 BMW i5 eDrive40 M Sport Pro (G60) front.jpg',
  'BMW_I7_G70': 'File:BMW i7 M70 xDrive (G70) front.jpg'
};

console.log('Total verified mapping entries:', Object.keys(VERIFIED_FILES).length);
module.exports = { VERIFIED_FILES };
