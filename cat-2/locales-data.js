/**
 * Cat 2 language hub — locale pack (prototype).
 * Sanity/CMS can replace this structure in production.
 */
(function(){
'use strict';

var DEFAULTS={
  heroEyebrow:'BibleProject',
  heroTitle:'We create resources to help people understand the Bible.',
  sectionLabelPlans:'Reading plans',
  sectionLabelDownloads:'Downloads available',
  plansTitle:'Reading Plans',
  plansIntro:'Reading plans on YouVersion that match your language. Open the Bible App to start.',
  plansOverview:'Our reading plans incorporate animated videos and insightful summaries to inspire people in personal study, small groups, or with family—and help them learn more about the Bible.',
  dlTitle:'Downloads',
  dlIntro:'Video and audio organized by series. Categories with no items in your language are hidden.',
  dlPageTitle:'Download Free BibleProject Resources for Sharing and Teaching',
  dlPageSub:'Access videos, posters, transcripts, and study notes.',
  dlPageNote:'Note: Not all videos have accompanying transcripts, study notes, and posters. We\'re working to add missing transcripts over time. But if study notes or posters are unavailable, it\'s because they were not created for that video.',
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

add('english','en','ltr','English','Downloads','Reading Plans','Language',
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

add('spanish','es','ltr','Spanish','Descargas','Planes de lectura','Idioma',
'Creamos recursos para ayudar a las personas a entender la Biblia.',
'Explora planes de lectura y descargas de video disponibles en tu idioma.',
{sectionLabelPlans:'Planes de lectura',sectionLabelDownloads:'Descargas disponibles',plansTitle:'Planes de lectura',plansIntro:'Planes en YouVersion en tu idioma. Abre la aplicación Biblia para comenzar.',plansOverview:'Nuestros planes de lectura incorporan videos animados y resúmenes útiles para inspirar a las personas en el estudio personal, grupos pequeños o en familia, y ayudarles a aprender más sobre la Biblia.',dlTitle:'Descargas',dlIntro:'Video y audio por serie. Las categorías vacías no se muestran.',dlPageTitle:'Descarga recursos gratuitos de BibleProject para compartir y enseñar',dlPageSub:'Accede a videos, pósters, transcripciones y notas de estudio.',dlPageNote:'Nota: No todos los videos incluyen transcripciones, notas de estudio o pósters. Estamos añadiendo transcripciones faltantes. Si faltan notas o pósters, es porque no se crearon para ese video.',videoSingular:'video',videoPlural:'videos',signupTitle:'Correo de novedades',signupBtn:'Suscribirse',plansEmpty:'Aún no hay planes de lectura para este idioma.',dlEmpty:'Aún no hay categorías de descarga para este idioma.',ctaOpenApp:'Abrir en la app Biblia →',readingPlans:[{title:'Biblia en un año',subtitle:'YouVersion · Español',url:'https://www.bible.com/yv/reading-plans'},{title:'Salmos de consuelo',subtitle:'YouVersion · Español',url:'https://www.bible.com/yv/reading-plans'}],downloads:{'ot-overviews':[{title:'Génesis 1–11',url:'https://bibleproject.com/explore/video/'}],'biblical-themes':[{title:'El Reino de Dios',url:'https://bibleproject.com/explore/video/'}],'advent':[{title:'Adviento',url:'https://bibleproject.com/explore/video/'}]}});

add('french','fr','ltr','French','Téléchargements','Plans de lecture','Langue',
'Nous créons des ressources pour aider chacun à comprendre la Bible.',
'Découvrez des plans de lecture et des téléchargements disponibles dans votre langue.',
{sectionLabelPlans:'Plans de lecture',sectionLabelDownloads:'Téléchargements disponibles',plansTitle:'Plans de lecture',plansIntro:'Plans YouVersion dans votre langue. Ouvrez l’application Bible pour commencer.',plansOverview:'Nos plans de lecture incorporent des vidéos d’animation et des résumés éclairés pour inspirer les personnes lors d’études individuelles, par petits groupes, ou en famille, et leur en apprendre davantage sur la Bible',dlTitle:'Téléchargements',dlIntro:'Vidéos et audio par série. Les catégories vides sont masquées.',dlPageTitle:'Téléchargez gratuitement des ressources BibleProject pour partager et enseigner',dlPageSub:'Accédez aux vidéos, affiches, transcriptions et notes d’étude.',dlPageNote:'Remarque : toutes les vidéos n’ont pas de transcription, notes ou affiches. Nous complétons les transcriptions au fil du temps.',videoSingular:'vidéo',videoPlural:'vidéos',signupTitle:'Newsletter',signupBtn:'S’inscrire',plansEmpty:'Aucun plan de lecture pour cette langue pour le moment.',dlEmpty:'Aucune catégorie de téléchargement pour cette langue.',ctaOpenApp:'Ouvrir dans l’app Bible →',readingPlans:[{title:'La Bible en un an',subtitle:'YouVersion · Français',url:'https://www.bible.com/yv/reading-plans'}],downloads:{'nt-overviews':[{title:'Luc — Aperçu',url:'https://bibleproject.com/explore/video/'}],'biblical-themes':[{title:'Le Royaume de Dieu',url:'https://bibleproject.com/explore/video/'}]}});

add('korean','ko','ltr','Korean','다운로드','읽기 계획','언어',
'성경을 이해하도록 돕는 자료를 만듭니다.',
'해당 언어로 제공되는 읽기 계획과 다운로드를 둘러보세요.',
{sectionLabelPlans:'읽기 계획',sectionLabelDownloads:'이용 가능한 다운로드',plansTitle:'읽기 계획',plansIntro:'YouVersion에서 제공하는 언어별 계획입니다. 바이블 앱에서 시작하세요.',plansOverview:'읽기 계획에는 애니메이션 영상과 통찰 있는 요약이 포함되어 개인·소그룹·가족 공부를 돕고 성경에 대해 더 깊이 배우도록 돕습니다.',dlTitle:'다운로드',dlIntro:'시리즈별로 정리된 영상·오디오입니다. 항목이 없는 카테고리는 숨깁니다.',dlPageTitle:'공유와 가르침을 위한 BibleProject 무료 자료 다운로드',dlPageSub:'영상, 포스터, 대본, 학습 노트를 이용하세요.',dlPageNote:'참고: 모든 영상에 대본·노트·포스터가 있는 것은 아닙니다. 대본은 지속적으로 보완 중입니다.',signupTitle:'이메일 소식',signupBtn:'구독',plansEmpty:'이 언어의 읽기 계획이 아직 없습니다.',dlEmpty:'이 언어의 다운로드 카테고리가 아직 없습니다.',ctaOpenApp:'바이블 앱에서 열기 →',readingPlans:[{title:'1년 성경 읽기',subtitle:'YouVersion · 한국어',url:'https://www.bible.com/yv/reading-plans'}],downloads:{'ot-overviews':[{title:'창세기 1–11',url:'https://bibleproject.com/explore/video/'}],'how-to-read-bible':[{title:'성경 읽는 법',url:'https://bibleproject.com/explore/video/'}]}});

add('polish','pl','ltr','Polish','Pobieranie','Plany czytania','Język',
'Tworzymy zasoby, które pomagają ludziom rozumieć Biblię.',
'Odkrywaj plany czytania i materiały wideo dostępne w Twoim języku.');

add('tagalog','tl','ltr','Tagalog','Mga download','Mga plano sa pagbabasa','Wika',
'Gumagawa kami ng mga mapagkukunan upang matulungan ang mga tao na maunawaan ang Bibliya.',
'Tuklasin ang mga plano sa pagbabasa at download na available sa iyong wika.');

add('czech','cs','ltr','Czech','Stahování','Čtenářské plány','Jazyk',
'Tvoříme zdroje, které lidem pomáhají porozumět Bibli.',
'Prozkoumejte čtecí plán a videa dostupná ve vašem jazyce.');

add('farsi','fa','rtl','Farsi','دانلودها','برنامه‌های مطالعه','زبان',
'ما منابعی می‌سازیم تا به مردم برای فهم کتاب‌مقدس کمک کند.',
'برنامه‌های مطالعه و دانلودهای موجود به زبان خود را مرور کنید.');

add('german','de','ltr','German','Downloads','Lesepläne','Sprache',
'Wir schaffen Ressourcen, die Menschen beim Verstehen der Bibel helfen.',
'Entdecke Lesepläne und Downloads in deiner Sprache.');

add('hindi','hi','ltr','Hindi','डाउनलोड','पढ़ने की योजनाएँ','भाषा',
'हम ऐसे संसाधन बनाते हैं जो लोगों को बाइबिल समझने में मदद करते हैं।',
'अपनी भाषा में उपलब्ध पढ़ने की योजनाओं और डाउनलोड को देखें।');

add('hungarian','hu','ltr','Hungarian','Letöltések','Olvasási tervek','Nyelv',
'Olyan forrásokat készítünk, amelyek segítenek megérteni a Bibliát.',
'Fedezd fel a nyelveden elérhető olvasási terveket és letöltéseket.');

add('japanese','ja','ltr','Japanese','ダウンロード','読書プラン','言語',
'聖書を理解するためのリソースを提供しています。',
'あなたの言語で利用できる読書プランとダウンロードをご覧ください。');

add('kannada','kn','ltr','Kannada','ಡೌನ್‌ಲೋಡ್‌ಗಳು','ಓದುವ ಯೋಜನೆಗಳು','ಭಾಷೆ',
'ಜನರು ಬೈಬಲ್ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯವಾಗುವ ಸಂಪನ್ಮೂಲಗಳನ್ನು ನಾವು ರಚಿಸುತ್ತೇವೆ.',
'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಲಭ್ಯವಿರುವ ಓದುವ ಯೋಜನೆಗಳು ಮತ್ತು ಡೌನ್‌ಲೋಡ್‌ಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.');

add('lithuanian','lt','ltr','Lithuanian','Atsisiuntimai','Skaitymo planai','Kalba',
'Kuriame išteklius, padedančius žmonėms suprasti Bibliją.',
'Peržiūrėkite skaitymo planus ir atsisiuntimus savo kalba.');

add('malayalam','ml','ltr','Malayalam','ഡൗൺലോഡുകൾ','വായനാ പദ്ധതികൾ','ഭാഷ',
'ബൈബിൾ മനസ്സിലാക്കാൻ ആളുകളെ സഹായിക്കുന്ന വിഭവങ്ങൾ ഞങ്ങൾ സൃഷ്ടിക്കുന്നു.',
'നിങ്ങളുടെ ഭാഷയിൽ ലഭ്യമായ വായനാ പദ്ധതികളും ഡൗൺലോഡുകളും കണ്ടെത്തുക.');

add('marathi','mr','ltr','Marathi','डाउनलोड','वाचन योजना','भाषा',
'आम्ही अशा संसाधनांची निर्मिती करतो जी लोकांना बायबल समजून घेण्यात मदत करतात.',
'तुमच्या भाषेत उपलब्ध वाचन योजना आणि डाउनलोड एक्सप्लोर करा.');

add('sinhala','si','ltr','Sinhala','බාගත කිරීම්','කියවීමේ සැලසුම්','භාෂාව',
'අපි මිනිසුන්ට බයිබලය තේරුම් ගැනීමට උපකාරී වන සම්පත් නිර්මාණය කරමු.',
'ඔබේ භාෂාවෙන් ලබා ගත හැකි කියවීමේ සැලසුම් සහ බාගත කිරීම් ගවේෂණය කරන්න.');

add('tamil','ta','ltr','Tamil','பதிவிறக்கங்கள்','படிப்புத் திட்டங்கள்','மொழி',
'மக்கள் வேதாகமத்தைப் புரிந்துகொள்ள உதவும் வளங்களை நாங்கள் உருவாக்குகிறோம்.',
'உங்கள் மொழியில் கிடைக்கும் படிப்புத் திட்டங்கள் மற்றும் பதிவிறக்கங்களைக் கண்டறியவும்.');

add('telugu','te','ltr','Telugu','డౌన్‌లోడ్‌లు','చదవడం ప్రణాళికలు','భాష',
'మేము ప్రజలు బైబిల్‌ను అర్థం చేసుకోవడానికి సహాయపడే వనరులను సృష్టిస్తాము.',
'మీ భాషలో అందుబాటులో ఉన్న చదవడం ప్రణాళికలు మరియు డౌన్‌లోడ్‌లను అన్వేషించండి.');

add('thai','th','ltr','Thai','ดาวน์โหลด','แผนการอ่าน','ภาษา',
'เราสร้างแหล่งเรียนรู้เพื่อช่วยให้ผู้คนเข้าใจพระคัมภีร์',
'สำรวจแผนการอ่านและดาวน์โหลดที่มีในภาษาของคุณ');

add('turkish','tr','ltr','Turkish','İndirmeler','Okuma planları','Dil',
'İnsanların İncil’i anlamasına yardımcı olacak kaynaklar üretiyoruz.',
'Dilinizde mevcut okuma planlarını ve indirmeleri keşfedin.');

add('urdu','ur','rtl','Urdu','ڈاؤن لوڈز','پڑھنے کے منصوبے','زبان',
'ہم ایسے وسائل بناتے ہیں جو لوگوں کو بائبل سمجھنے میں مدد دیتے ہیں۔',
'اپنی زبان میں دستیاب پڑھنے کے منصوبوں اور ڈاؤن لوڈز کو دیکھیں۔');

add('afrikaans','af','ltr','Afrikaans','Aflaaie','Leesplanne','Taal',
'Ons skep hulpbronne om mense te help om die Bybel te verstaan.',
'Verken leesplanne en aflaaie in jou taal beskikbaar.');

add('amharic','am','ltr','Amharic','ውርዶች','የንባብ እቅዶች','ቋንቋ',
'ሰዎች መጽሐፍ ቅዱስን እንዲረዱ የሚረዱ መርጃዎችን እንፈጥራለን።',
'በቋንቋዎ የሚገኙ የንባብ እቅዶችን እና ውርዶችን ያስሱ።');

add('arabic-egyptian','ar-EG','rtl','Arabic (Egyptian)','التنزيلات','خطط القراءة','اللغة',
'نُنشئ موارد تساعد الناس على فهم الكتاب المقدس.',
'استكشف خطط القراءة والتنزيلات المتاحة بلغتك.');

add('arabic-gulf','ar-AE','rtl','Arabic (Gulf)','التنزيلات','خطط القراءة','اللغة',
'نُنشئ موارد تساعد الناس على فهم الكتاب المقدس.',
'استكشف خطط القراءة والتنزيلات المتاحة بلغتك.');

add('arabic-levantine','ar-LB','rtl','Arabic (Levantine)','التنزيلات','خطط القراءة','اللغة',
'نُنشئ موارد تساعد الناس على فهم الكتاب المقدس.',
'استكشف خطط القراءة والتنزيلات المتاحة بلغتك.');

add('arabic-standard','ar','rtl','Arabic (Standard)','التنزيلات','خطط القراءة','اللغة',
'نُنشئ موارد تساعد الناس على فهم الكتاب المقدس.',
'استكشف خطط القراءة والتنزيلات المتاحة بلغتك.');

add('bengali-bangladesh','bn-BD','ltr','Bengali (Bangladesh)','ডাউনলোড','পঠন পরিকল্পনা','ভাষা',
'আমরা এমন সম্পদ তৈরি করি যা মানুষকে বাইবেল বোঝাতে সাহায্য করে।',
'আপনার ভাষায় উপলব্ধ পঠন পরিকল্পনা ও ডাউনলোড দেখুন।');

add('bengali-india','bn-IN','ltr','Bengali (India)','ডাউনলোড','পঠন পরিকল্পনা','ভাষা',
'আমরা এমন সম্পদ তৈরি করি যা মানুষকে বাইবেল বোঝাতে সাহায্য করে।',
'আপনার ভাষায় উপলব্ধ পঠন পরিকল্পনা ও ডাউনলোড দেখুন।');

add('bulgarian','bg','ltr','Bulgarian','Изтегляния','Планове за четене','Език',
'Създаваме ресурси, които помагат на хората да разберат Библията.',
'Разгледайте планове за четене и изтегляния на вашия език.');

add('burmese','my','ltr','Burmese','ဒေါင်းလုဒ်များ','ဖတ်ရှုစီမံကိန်းများ','ဘာသာစကား',
'လူတို့သည် သမ္မာကျမ်းစာကို နားလည်ရန် အကူအညီပေးသော အရင်းအမြစ်များကို ဖန်တီးပါသည်။',
'သင့်ဘာသာစကားဖြင့် ရရှိနိုင်သော ဖတ်ရှုစီမံကန်းများနှင့် ဒေါင်းလုဒ်များကို ရှာဖွေပါ။');

add('cantonese','yue','ltr','Cantonese','下載','閱讀計劃','語言',
'我哋創造資源幫助人明白聖經。',
'探索你語言入面嘅閱讀計劃同下載。');

add('croatian','hr','ltr','Croatian','Preuzimanja','Planovi čitanja','Jezik',
'Stvaramo resurse koji pomažu ljudima razumjeti Bibliju.',
'Istražite planove čitanja i preuzimanja na svom jeziku.');

add('dutch','nl','ltr','Dutch','Downloads','Leesplannen','Taal',
'We maken bronnen om mensen te helpen de Bijbel te begrijpen.',
'Ontdek leesplannen en downloads in jouw taal.');

add('finnish','fi','ltr','Finnish','Lataukset','Lukusuunnitelmat','Kieli',
'Luomme resursseja, jotka auttavat ihmisiä ymmärtämään Raamattua.',
'Tutustu lukusuunnitelmiin ja latauksiin kielelläsi.');

add('greek','el','ltr','Greek','Λήψεις','Προγράμματα ανάγνωσης','Γλώσσα',
'Δημιουργούμε πόρους που βοηθούν τους ανθρώπους να κατανοήσουν την Αγία Γραφή.',
'Εξερευνήστε προγράμματα ανάγνωσης και λήψεις στη γλώσσα σας.');

add('gujarati','gu','ltr','Gujarati','ડાઉનલોડ્સ','વાંચન યોજનાઓ','ભાષા',
'અમે એવા સંસાધનો બનાવીએ છીએ જે લોકોને બાઇબલ સમજવામાં મદદ કરે છે.',
'તમારી ભાષામાં ઉપલબ્ધ વાંચન યોજનાઓ અને ડાઉનલોડ્સ શોધો.');

add('indonesian','id','ltr','Indonesian','Unduhan','Rencana baca','Bahasa',
'Kami membuat sumber daya untuk membantu orang memahami Alkitab.',
'Jelajahi rencana baca dan unduhan dalam bahasa Anda.');

add('italian','it','ltr','Italian','Download','Piani di lettura','Lingua',
'Creiamo risorse per aiutare le persone a capire la Bibbia.',
'Esplora piani di lettura e download nella tua lingua.');

add('khmer','km','ltr','Khmer','ទាញយក','ផែនការអាន','ភាសា',
'យើងបង្កើតធនធានដើម្បីជួយមនុស្សឱ្យយល់ពីព្រះគម្ពីរ។',
'ស្វែងរកផែនការអាននិងទាញយកជាភាសារបស់អ្នក។');

add('kinyarwanda','rw','ltr','Kinyarwanda','Kuramo','Gahunda zo gusoma','Ururimi',
'Dukora ibikoresho bigira abantu gufata Bibiliya neza.',
'Shakisha gahunda zo gusoma na kuramo mu rurimi rwawe.');

add('mandarin-simplified','zh-CN','ltr','Mandarin (Simplified)','下载','阅读计划','语言',
'我们创作资源，帮助人们理解圣经。',
'探索您语言中的阅读计划和下载。');

add('mandarin-traditional','zh-TW','ltr','Mandarin (Traditional)','下載','閱讀計畫','語言',
'我們創作資源，幫助人們理解聖經。',
'探索您語言中的閱讀計畫和下載。');

add('mongolian','mn','ltr','Mongolian','Татах','Унших төлөвлөгөө','Хэл',
'Бид хүмүүст Библийг ойлгоход туслах нөөцүүдийг бүтээдэг.',
'Өөрийн хэл дээрх унших төлөвлөгөө болон татаж авахыг судлаарай.');

add('nepali','ne','ltr','Nepali','डाउनलोडहरू','पढाइ योजनाहरू','भाषा',
'हामी मानिसहरूलाई बाइबल बुझ्न मद्दत गर्न स्रोतहरू सिर्जना गर्छौं।',
'आफ्नो भाषामा उपलब्ध पढाइ योजनाहरू र डाउनलोडहरू अन्वेषण गर्नुहोस्।');

add('norwegian','no','ltr','Norwegian','Nedlastinger','Lesingplaner','Språk',
'Vi lager ressurser som hjelper folk å forstå Bibelen.',
'Utforsk leseplaner og nedlastinger på språket ditt.');

add('punjabi','pa','ltr','Punjabi','ਡਾਊਨਲੋਡ','ਪੜ੍ਹਨ ਦੀਆਂ ਯੋਜਨਾਵਾਂ','ਭਾਸ਼ਾ',
'ਅਸੀਂ ਅਜਿਹੇ ਸਰੋਤ ਬਣਾਉਂਦੇ ਹਾਂ ਜੋ ਲੋਕਾਂ ਨੂੰ ਬਾਈਬਲ ਸਮਝਣ ਵਿੱਚ ਮਦਦ ਕਰਦੇ ਹਨ।',
'ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਉਪਲਬਧ ਪੜ੍ਹਨ ਯੋਜਨਾਵਾਂ ਅਤੇ ਡਾਊਨਲੋਡ ਖੋਜੋ।');

add('romanian','ro','ltr','Romanian','Descărcări','Planuri de lectură','Limbă',
'Creăm resurse care ajută oamenii să înțeleagă Biblia.',
'Explorează planuri de lectură și descărcări în limba ta.');

add('russian','ru','ltr','Russian','Загрузки','Планы чтения','Язык',
'Мы создаём ресурсы, помогающие людям понять Библию.',
'Изучите планы чтения и загрузки на вашем языке.');

add('slovak','sk','ltr','Slovak','Stiahnutia','Čitateľské plány','Jazyk',
'Tvoríme zdroje, ktoré ľuďom pomáhajú porozumieť Biblii.',
'Preskúmajte čitateľské plány a stiahnutia vo vašom jazyku.');

add('swahili','sw','ltr','Swahili','Vipakuliwa','Mipango ya kusoma','Lugha',
'Tunaunda rasilimali zinazosaidia watu kuelewa Biblia.',
'Chunguza mipango ya kusoma na vipakuliwa katika lugha yako.');

add('swedish','sv','ltr','Swedish','Nedladdningar','Läsplaner','Språk',
'Vi skapar resurser som hjälper människor att förstå Bibeln.',
'Utforska läsplaner och nedladdningar på ditt språk.');

add('ukrainian','uk','ltr','Ukrainian','Завантаження','Плани читання','Мова',
'Ми створюємо ресурси, які допомагають людям зрозуміти Біблію.',
'Перегляньте плани читання та завантаження вашою мовою.');

add('vietnamese','vi','ltr','Vietnamese','Tải xuống','Kế hoạch đọc','Ngôn ngữ',
'Chúng tôi tạo tài nguyên giúp mọi người hiểu Kinh Thánh.',
'Khám phá kế hoạch đọc và tải xuống bằng ngôn ngữ của bạn.');

})();
