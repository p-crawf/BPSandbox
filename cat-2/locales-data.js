/**
 * Cat 2 language hub — locale pack (prototype).
 * Supported languages: English, Italian, Korean, Arabic Egyptian
 */
(function(){
'use strict';

var DEFAULTS={
  heroEyebrow:'BibleProject',
  heroTitle:'We create resources to help people understand the Bible.',
  sectionLabelPlans:'Reading plans',
  sectionLabelDownloads:'Watch & Download',
  plansTitle:'Reading Plans',
  plansIntro:'Reading plans on YouVersion that match your language. Open the Bible App to start.',
  plansOverview:'Our reading plans incorporate animated videos and insightful summaries to inspire people in personal study, small groups, or with family—and help them learn more about the Bible.',
  dlTitle:'Downloads',
  dlIntro:'Video and audio organized by series. Categories with no items in your language are hidden.',
  dlPageTitle:'Download Free BibleProject Resources for Sharing and Teaching',
  dlPageSub:'Access videos, posters, transcripts, and study notes.',
  dlPageNote:'Note: Not all videos have accompanying transcripts, study notes, and posters. We\'re working to add missing transcripts over time. But if study notes or posters are unavailable, it\'s because they were not created for that video.',
  navAbout:'About',
  videoSingular:'video',
  videoPlural:'videos',
  signupTitle:'Email updates',
  signupBtn:'Subscribe',
  plansEmpty:'No reading plans listed for this language yet.',
  dlEmpty:'No download categories yet for this language.',
  ctaOpenApp:'Open in Bible App →',
  readingPlans:[
    {title:'Bible in one year',subtitle:'',url:'https://www.bible.com/yv/reading-plans'}
  ],
  downloads:{
    'ot-overviews':[{title:'Genesis 1–11 Overview',url:'https://bibleproject.com/explore/video/'}]
  }
};

function rpSubtitle(label){return 'YouVersion · '+label;}

function add(key,htmlLang,dir,label,navD,navP,langL,heroT,heroL,extra){
  var o={
    slug:key,
    htmlLang:htmlLang,
    dir:dir||'ltr',
    label:label,
    navDownloads:navD,
    navPlans:navP,
    langLabel:langL,
    heroTitle:heroT,
    heroLead:heroL
  };
  var merged=Object.assign({},DEFAULTS,o);
  if(extra){
    Object.assign(merged,extra);
  }
  if(!merged.readingPlans||merged.readingPlans.length===0){
    merged.readingPlans=[{title:'Bible in one year',subtitle:rpSubtitle(label),url:'https://www.bible.com/yv/reading-plans'}];
  }else{
    merged.readingPlans=merged.readingPlans.map(function(r){
      return r.subtitle?r:Object.assign({},r,{subtitle:rpSubtitle(label)});
    });
  }
  window.CAT2_LOCALES[key]=merged;
}

window.CAT2_LOCALES={};

/* ── English ─────────────────────────────────────────────────────────── */
add('english','en','ltr','English','Watch & Download','Reading Plans','Language',
'We create resources to help people understand the Bible.',
'Explore reading plans and video downloads available in your language.',
{readingPlans:[
  {title:'BibleProject: The Bible in One Year',subtitle:'YouVersion · English',url:'https://www.bible.com/yv/reading-plans',thumb:'https://d1bsmz3sdihplr.cloudfront.net/media/about/English_Bible_in_One_Year_320.jpg',thumbBg:'#F79968'},
  {title:'Gospels in 40 Days',subtitle:'YouVersion · English',url:'https://www.bible.com/yv/reading-plans',thumb:'https://d1bsmz3sdihplr.cloudfront.net/media/Languages/reading-plan-thumbnails/English_Gospels_320.jpg',thumbBg:'#E8B86D'}
],downloads:{
  'ot-overviews':[{title:'Genesis 1–11 Overview',url:'https://bibleproject.com/explore/video/'}],
  'nt-overviews':[{title:'Luke Overview',url:'https://bibleproject.com/explore/video/'}],
  'biblical-themes':[{title:'The Kingdom of God',url:'https://bibleproject.com/explore/video/'}],
  'how-to-read-bible':[{title:'How to Read the Bible series',url:'https://bibleproject.com/explore/video/'}],
  'word-studies':[{title:'Word Study: Agape',url:'https://bibleproject.com/explore/video/'}]
}});

/* ── Italian ─────────────────────────────────────────────────────────── */
add('italian','it','ltr','Italiano','Download','Piani di lettura','Lingua',
'Creiamo risorse per aiutare le persone a comprendere la Bibbia.',
'Scopri i piani di lettura e i download disponibili nella tua lingua.',
{navAbout:'Chi siamo',
sectionLabelPlans:'Piani di lettura',sectionLabelDownloads:'Download disponibili',
plansTitle:'Piani di lettura',
plansIntro:'Piani di lettura su YouVersion nella tua lingua. Apri l\'app Bibbia per iniziare.',
plansOverview:'I nostri piani di lettura includono video animati e riepilogi stimolanti per ispirare le persone nello studio personale, nei piccoli gruppi o in famiglia, e aiutarle a conoscere meglio la Bibbia.',
dlPageTitle:'Scarica gratuitamente le risorse BibleProject per condivisione e insegnamento',
dlPageSub:'Accedi a video, poster, trascrizioni e note di studio.',
dlPageNote:'Nota: non tutti i video hanno trascrizioni, note di studio o poster. Stiamo aggiungendo le trascrizioni mancanti nel tempo.',
videoSingular:'video',videoPlural:'video',
signupTitle:'Aggiornamenti via email',signupBtn:'Iscriviti',
plansEmpty:'Nessun piano di lettura disponibile per questa lingua.',
dlEmpty:'Nessuna categoria di download disponibile per questa lingua.',
ctaOpenApp:'Apri nell\'app Bibbia →',
readingPlans:[{title:'La Bibbia in un anno',subtitle:'YouVersion · Italiano',url:'https://www.bible.com/yv/reading-plans'}],
downloads:{
  'nt-overviews':[{title:'Luca — Panoramica',url:'https://bibleproject.com/explore/video/'}],
  'biblical-themes':[{title:'Il Regno di Dio',url:'https://bibleproject.com/explore/video/'}]
}});

/* ── Korean ──────────────────────────────────────────────────────────── */
add('korean','ko','ltr','한국어','다운로드','읽기 계획','언어',
'성경을 이해하도록 돕는 자료를 만듭니다.',
'해당 언어로 제공되는 읽기 계획과 다운로드를 둘러보세요.',
{navAbout:'소개',
sectionLabelPlans:'읽기 계획',sectionLabelDownloads:'이용 가능한 다운로드',
plansTitle:'읽기 계획',
plansIntro:'YouVersion에서 제공하는 언어별 계획입니다. 바이블 앱에서 시작하세요.',
plansOverview:'읽기 계획에는 애니메이션 영상과 통찰 있는 요약이 포함되어 개인·소그룹·가족 공부를 돕고 성경에 대해 더 깊이 배우도록 돕습니다.',
dlPageTitle:'공유와 가르침을 위한 BibleProject 무료 자료 다운로드',
dlPageSub:'영상, 포스터, 대본, 학습 노트를 이용하세요.',
dlPageNote:'참고: 모든 영상에 대본·노트·포스터가 있는 것은 아닙니다. 대본은 지속적으로 보완 중입니다.',
videoSingular:'영상',videoPlural:'영상',
signupTitle:'이메일 소식',signupBtn:'구독',
plansEmpty:'이 언어의 읽기 계획이 아직 없습니다.',
dlEmpty:'이 언어의 다운로드 카테고리가 아직 없습니다.',
ctaOpenApp:'바이블 앱에서 열기 →',
readingPlans:[{title:'1년 성경 읽기',subtitle:'YouVersion · 한국어',url:'https://www.bible.com/yv/reading-plans'}],
downloads:{
  'ot-overviews':[{title:'창세기 1–11',url:'https://bibleproject.com/explore/video/'}],
  'how-to-read-bible':[{title:'성경 읽는 법',url:'https://bibleproject.com/explore/video/'}]
}});

/* ── Arabic Egyptian ─────────────────────────────────────────────────── */
add('arabic-egyptian','ar-EG','rtl','العربية المصرية','التنزيلات','خطط القراءة','اللغة',
'نصنع موارد لمساعدة الناس على فهم الكتاب المقدس.',
'استكشف خطط القراءة والتنزيلات المتاحة بلغتك.',
{navAbout:'من نحن',
sectionLabelPlans:'خطط القراءة',sectionLabelDownloads:'التنزيلات المتاحة',
plansTitle:'خطط القراءة',
plansIntro:'خطط القراءة على YouVersion بلغتك. افتح تطبيق الكتاب المقدس للبدء.',
plansOverview:'تتضمن خطط القراءة لدينا مقاطع فيديو متحركة وملخصات ثاقبة لإلهام الأشخاص في الدراسة الشخصية أو في المجموعات الصغيرة أو مع العائلة، ومساعدتهم على التعرف أكثر على الكتاب المقدس.',
dlPageTitle:'تنزيل موارد BibleProject المجانية للمشاركة والتعليم',
dlPageSub:'الوصول إلى مقاطع الفيديو والملصقات والنصوص وملاحظات الدراسة.',
dlPageNote:'ملاحظة: ليس لدى جميع مقاطع الفيديو نصوص أو ملاحظات أو ملصقات. نعمل على إضافة النصوص المفقودة بمرور الوقت.',
videoSingular:'فيديو',videoPlural:'فيديو',
signupTitle:'تحديثات البريد الإلكتروني',signupBtn:'اشترك',
plansEmpty:'لا توجد خطط قراءة لهذه اللغة حتى الآن.',
dlEmpty:'لا توجد فئات تنزيل لهذه اللغة حتى الآن.',
ctaOpenApp:'افتح في تطبيق الكتاب المقدس ←',
readingPlans:[{title:'الكتاب المقدس في عام',subtitle:'YouVersion · العربية',url:'https://www.bible.com/yv/reading-plans'}],
downloads:{
  'ot-overviews':[{title:'تكوين ١–١١',url:'https://bibleproject.com/explore/video/'}],
  'biblical-themes':[{title:'ملكوت الله',url:'https://bibleproject.com/explore/video/'}]
}});

})();
