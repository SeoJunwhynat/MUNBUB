/* Optional user-supplied BGM archives. 18 files in 9 NON-IDENTICAL pairs.
 * Archives are ordinary ZIP_STORED and uploaded at assets/bgm/_incoming/.
 * Override existing matching MP3s at build time after verifying SHA256.
 * Never merge (1) files with their unsuffixed counterparts.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

export const EXPECTED_MUSIC_PACKS={
  "history_music_update_20261110_part1.zip": [
    [
      "late_night_study_1.mp3",
      3195612,
      "abb37e44b47b6004638535c92f7ee0c1f561c9f0336303a0e58061f89b3a637f"
    ],
    [
      "late_night_study_2.mp3",
      2297580,
      "a9f9c66aeddf88dafca4ddc51c63854805c0047bbfce09cbeb504f1f4af8db60"
    ],
    [
      "magical_bookshelf_1.mp3",
      2134757,
      "f339f1c9da5ec1e10e2f17e99622164866ab393b1859070993fb8ad457ed8c86"
    ],
    [
      "magical_bookshelf_2.mp3",
      2125781,
      "8f6ec8782cdecc8ac0f6764c69e3e40a70dfbadc11fdc4bad2acac0c1207e8ce"
    ],
    [
      "neon_loop_1.mp3",
      2170857,
      "c118d8e5066df850043e574c26827b9095dc5dd1bbb22a4f0ae8cfed651c6df8"
    ],
    [
      "neon_loop_2.mp3",
      2101209,
      "257dccb79fae933dac0b5809d83b24b15001057dc5920219c9111ce3980c0bf7"
    ]
  ],
  "history_music_update_20261110_part2.zip": [
    [
      "menu_drift_1.mp3",
      3442462,
      "a5c796896cc15edc70a8e2e0abece272010f618ade6482358095dfb7bb617b40"
    ],
    [
      "menu_drift_2.mp3",
      3385318,
      "11d0c4a04e2dcdca7c7c705282345f6f10a40fa68be1d4d6a68cb16d7709fb23"
    ],
    [
      "nostalgic_tape_1.mp3",
      2834402,
      "11525575e66fdcfd4a3322a59028c574ca60401d81f4fba2c88c3e811cf802da"
    ],
    [
      "nostalgic_tape_2.mp3",
      2780834,
      "2cabbf1c4575d966467c4f2156376cf787627a377d85b8c85c6af0d07f7112c1"
    ],
    [
      "triumphant_fanfare_1.mp3",
      1843686,
      "b9b608217a96ef01f3d8fc78d7f1a222d327e3b8c838c9ff239f5a6be89b7422"
    ],
    [
      "triumphant_fanfare_2.mp3",
      1840134,
      "ec6b5c9512e281b50e179edb69ab697a4303db711fdf8694cae4d6b22b93e830"
    ]
  ],
  "history_music_update_20261110_part3.zip": [
    [
      "mystic_adventure_1.mp3",
      2101927,
      "0bd1826a1e2f4982cbaf2a71fb3fc78e32719f5fcc30b2cf78a53ce8fdf82b2e"
    ],
    [
      "mystic_adventure_2.mp3",
      2134375,
      "ddc284258d189123cf888e04b215d2e47f6de4e284aef1e710d32f247671660e"
    ],
    [
      "history_journey_1.mp3",
      4260292,
      "ef2d9065ffecd1bc4f7dafe3da7694a18e5e76677665bab473805349f23eab97"
    ],
    [
      "history_journey_2.mp3",
      3298660,
      "7728baeec31c0908ae47bb6b449e2fdd803575753bbad60b11794e59063f7947"
    ],
    [
      "quiz_rhythm_1.mp3",
      2231332,
      "2e52d77a4686abe5f35d25928ef65a8cc82bd3e587cbae613687dd6230c30caa"
    ],
    [
      "quiz_rhythm_2.mp3",
      2175556,
      "df50158cb42ffe9d1263aedea33fa26d6cb654164647adb5b3077c9ff9060c4b"
    ]
  ]
};

/* Four previously missing history songs + Flowers Beneath the Wall.
   User-provided '(1)' upload suffixes are identical to earlier sources, so register
   under the original canonical names instead of duplicating the same recordings. */
export const HISTORY_NEW_5_PACKS={
  "history_music_register_5_20261110.zip": [
    [
      "Afternoon_in_a_Seoul_Teahouse.mp3",
      4269310,
      "c399d7bfad7c7496ad478b4a4a8f499e251e83105f47e544fcc4aa13ed0d2cbd"
    ],
    [
      "Questions_in_the_Gallery.mp3",
      2932050,
      "cc213fd8600d597743ce3a13e8cb73dcb7f8bfda673d7c661c7a50cfed94cab8"
    ],
    [
      "The_Clockmaker_s_Ledger.mp3",
      2413572,
      "fe3e5202dd9a3f9f8fee54a5211fe66cf18bdae9ec944156740d01eb3f390bc8"
    ],
    [
      "Last_Page_Turned.mp3",
      4292507,
      "d7cb14bcd04c99ce7943a1e5f4061d6398ce03bacdc930140ba061a5a01d1ab2"
    ],
    [
      "Flowers_Beneath_the_Wall.mp3",
      3730143,
      "e6ea6694f86c7654df633aaa78c4f901097be80d7c671713fd1e644d8db0c1f2"
    ]
  ]
};

export function parseStoredZip(bytes){
 const entries=new Map();
 let at=0;
 while(at+4<=bytes.length){
  const sig=bytes.readUInt32LE(at);
  if(sig===0x02014b50||sig===0x06054b50)break;
  if(sig!==0x04034b50)throw Error('Unexpected ZIP entry header at '+at);
  if(at+30>bytes.length)throw Error('Truncated ZIP entry');
  const flags=bytes.readUInt16LE(at+6),method=bytes.readUInt16LE(at+8);
  if(flags&8||method!==0)throw Error('History BGM pack must use ZIP_STORED without data descriptors');
  const size=bytes.readUInt32LE(at+18),uncompressed=bytes.readUInt32LE(at+22);
  const nlen=bytes.readUInt16LE(at+26),extra=bytes.readUInt16LE(at+28);
  const start=at+30+nlen+extra,end=start+size;
  if(size!==uncompressed||start>bytes.length||end>bytes.length)throw Error('Corrupt ZIP data size');
  const name=bytes.subarray(at+30,at+30+nlen).toString('utf8');
  if(!/^[A-Za-z0-9_-]+\.mp3$/.test(name)||entries.has(name))throw Error('Unexpected or duplicate MP3 in ZIP: '+name);
  entries.set(name,bytes.subarray(start,end));
  at=end;
 }
 return entries;
}

export async function installHistoryPacks(root,logger=console,packs=EXPECTED_MUSIC_PACKS){
 let installed=0,awaiting=0;
 const dest=join(root,'assets','bgm');
 for(const [archive,files] of Object.entries(packs)){
  let packed;
  try{packed=await readFile(join(dest,'_incoming',archive));}
  catch(e){
   if(e?.code==='ENOENT'){
    logger.log('BGM awaiting '+archive+' ('+files.length+' unique tracks)');
    awaiting+=files.length;continue;
   }
   throw e;
  }
  const entries=parseStoredZip(packed);
  if(entries.size!==files.length)throw Error('Unexpected BGM pack entry count: '+archive);
  // Validate ALL files before overwriting any file in the same archive.
  for(const [name,length,sha] of files){
   const content=entries.get(name);
   if(!content||content.length!==length)throw Error('BGM pack missing/wrong size '+name);
   if(createHash('sha256').update(content).digest('hex')!==sha)throw Error('BGM pack SHA256 mismatch '+name);
  }
  await mkdir(dest,{recursive:true});
  for(const [name] of files){
   // Overwrite old audio bytes deliberately, keeping (1) as separate canonical MP3.
   await writeFile(join(dest,name),entries.get(name));
   installed++;
  }
  logger.log('BGM updated '+archive+': '+files.length+' MP3 files SHA256 verified, existing tracks overwritten');
 }
 logger.log('BGM history update: '+installed+' installed, '+awaiting+' awaiting archive upload');
 return {installed,awaiting};
}
