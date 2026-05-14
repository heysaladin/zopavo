import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed templates
  const templates = [
    {
      name: "Carousel Launch",
      category: "Product Launch",
      captionTemplate:
        "Introducing [PRODUCT NAME] 🚀\n\nSwipe to see everything it can do →\n\n[KEY BENEFIT 1]\n[KEY BENEFIT 2]\n[KEY BENEFIT 3]\n\nWhat do you think? Drop a comment below 👇",
      hashtagsTemplate:
        "#productlaunch #design #ui #ux #buildinpublic #indiemaker #creator",
    },
    {
      name: "Case Study",
      category: "Portfolio",
      captionTemplate:
        "Case Study: [PROJECT NAME]\n\nThe challenge:\n[DESCRIBE THE PROBLEM]\n\nThe solution:\n[DESCRIBE YOUR APPROACH]\n\nThe result:\n[DESCRIBE THE OUTCOME]\n\nFull case study in my portfolio — link in bio.",
      hashtagsTemplate:
        "#casestudy #design #portfolio #ux #productdesign #designprocess",
    },
    {
      name: "UI Showcase",
      category: "Portfolio",
      captionTemplate:
        "New UI design drop 🎨\n\n[DESCRIBE WHAT YOU'RE SHOWING]\n\nDesigned in [TOOL]. Focused on [KEY DESIGN PRINCIPLE].\n\nThoughts? ✨",
      hashtagsTemplate:
        "#uidesign #uiux #designinspiration #interface #figma #webdesign",
    },
    {
      name: "Build in Public",
      category: "Creator",
      captionTemplate:
        "Building in public — Week [NUMBER]\n\nWhat I shipped:\n✅ [ITEM 1]\n✅ [ITEM 2]\n✅ [ITEM 3]\n\nWhat's next:\n→ [NEXT STEP]\n\nProgress feels slow, but it's real. 🔨",
      hashtagsTemplate:
        "#buildinpublic #indiehacker #maker #solofounder #startup #sideproject",
    },
    {
      name: "Motion Showcase",
      category: "Motion Design",
      captionTemplate:
        "Motion study: [NAME] ✨\n\nExploring [CONCEPT/TECHNIQUE] through animation.\n\nTools: [LIST TOOLS]\nTime: [APPROX TIME]\n\nSave this for inspiration 🔖",
      hashtagsTemplate:
        "#motiondesign #animation #aftereffects #motion #designinspiration #mograph",
    },
  ];

  for (const template of templates) {
    await prisma.template.upsert({
      where: { id: template.name },
      update: template,
      create: template,
    });
  }

  // Seed sample posts
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await prisma.post.createMany({
    data: [
      {
        title: "HyperFlow Product Launch",
        platform: "BOTH",
        caption:
          "Introducing HyperFlow — the creator's posting assistant.\n\nNo more copy-pasting. No more tab switching. No more forgetting to post.\n\nJust a clean, fast workflow for getting your content out there. 🚀",
        hashtags:
          "#productlaunch #creator #design #buildinpublic #indiehacker #workflow",
        scheduledAt: tomorrow,
        status: "READY",
        notes: "Use the hero screenshot for media",
      },
      {
        title: "UI Design Process Carousel",
        platform: "INSTAGRAM",
        caption:
          "My design process in 5 slides 🎨\n\nSwipe to see how I go from blank canvas to final product.\n\n1/ Research & Discovery\n2/ Wireframing\n3/ Visual Design\n4/ Prototyping\n5/ Handoff",
        hashtags:
          "#uidesign #designprocess #figma #ux #productdesign #designtips",
        scheduledAt: nextWeek,
        status: "SCHEDULED",
        notes: "Make sure all 5 slides are exported at 2x",
      },
      {
        title: "Build in Public Week 12",
        platform: "LINKEDIN",
        caption:
          "Week 12 of building in public.\n\nShipped: HyperFlow beta, 3 new features, zero bugs (probably)\n\nLearned: Consistency beats perfection every time.\n\nThe most important thing I do every week isn't writing code — it's shipping something visible.",
        hashtags: "#buildinpublic #indiehacker #saas #maker #startup",
        scheduledAt: null,
        status: "DRAFT",
        notes: "Add some stats if possible",
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
