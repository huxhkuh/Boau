// Add a project to this list with its title, URL, GIF path and description paragraphs.
const portfolioProjects = [
  {
    "title": "פוינט",
    "url": "https://mediumseagreen-goose-906772.hostingersite.com/",
    "image": "assets/images/projects/point.gif",
    "description": [
      "ספריית פונטים אישית.",
      "כשהתחלתי ליצור אתרים גיליתי שהרבה פונטים מקצועיים עולים לא מעט.",
      "אז יצרתי לעצמי כמה, אתם מוזמנים להשתמש בהם גם."
    ]
  },
  {
    "title": "אחוזת רכסים",
    "url": "https://gardar.co.il/",
    "image": "assets/images/projects/rechasim.gif",
    "description": [
      "דף נחיתה עבור יזם פרטי שמתעסק בתחום יזמות הבוטיק.",
      "אתר שמעביר היטב את התחושה, את  היוקרה, הפשטות והצניעות של היזם.",
      "דף נחיתה מקצועי אבל מרענן."
    ]
  },
  {
    "title": "בואו חשבון",
    "url": "https://xn--4dbbbobbm0ete.com/",
    "image": "assets/images/projects/boau-account-new.gif",
    "description": [
      "אתר המנגיש ידע פיננסי, עיצוב מכובד ורציני. שנותן לכל אחד שנכנס לאתר את התחושה שהוא הגיע למקום הנכון."
    ]
  },
  {
    "title": "שותפים לתהילים",
    "url": "https://tahilim.netlify.app/",
    "image": "assets/images/projects/tehilim.gif",
    "description": [
      "שותפים לתהילים: אתר שבו תוכלו לקבל קישור לאמירת תהילים לרפואה או להדפיס חוברת לבית הקברות.",
      "עיצוב תואם לאווירה ולחשיבות."
    ]
  },
  {
    "title": "נדלניסט צפון",
    "url": "https://nadlanistzafon.co.il/",
    "image": "assets/images/projects/nadlanist-north.gif",
    "description": [
      "אתר תיווך דירות באזור צפון הארץ.",
      "מותאם במיוחד לציבור החרדי.",
      "נבנה עם פיצ'רים כמו בוט AI ואפשרויות תשלום מאובטחות."
    ]
  },
  {
    "title": "אתגר הכסף הגדול",
    "url": "https://tipim-economic-game.huxh.chatgpt.site/",
    "image": "assets/images/projects/money-challenge.gif",
    "description": [
      "אתגר הכסף הגדול מבית טיפים לכלכה נבונה.",
      "האמת היה ממש כיף לעבוד על הפרויקט הזה, משחק אינטראקטיבי מושך ומעניין עם פרסים בסופו.",
      "עיצוב משחקי, אבל עדיין בוגר.",
      "אתר שיכול לעבוד עם עומס משתמשים גבוה בו-זמנית. הוא נבנה הרי בדיוק בשביל זה."
    ]
  }
];

(() => {
  const grid = document.getElementById("portfolio-grid");
  if (!grid) return;
  portfolioProjects.forEach((project, index) => {
    const article = document.createElement("article");
    article.className = "portfolio-item";
    const media = document.createElement("a");
    media.className = "portfolio-media";
    media.href = project.url;
    media.target = "_blank";
    media.rel = "noopener";
    media.setAttribute("aria-label", project.title);
    const image = document.createElement("img");
    image.src = project.image;
    image.alt = project.title;
    image.loading = index < 2 ? "eager" : "lazy";
    image.decoding = "async";
    media.append(image);
    const copy = document.createElement("div");
    copy.className = "portfolio-copy";
    const heading = document.createElement("h2");
    heading.textContent = project.title;
    copy.append(heading);
    project.description.forEach(text => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      copy.append(paragraph);
    });
    const link = document.createElement("a");
    link.className = "portfolio-visit";
    link.href = project.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "לצפייה באתר";
    link.setAttribute("aria-label", "לצפייה באתר " + project.title);
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "←";
    link.append(arrow);
    copy.append(link);
    article.append(media, copy);
    grid.append(article);
  });
})();
