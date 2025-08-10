export const channelCategories = [
  {
    name: 'HQ & Leadership',
    icon: '🏛️',
    channels: [
      { name: 'company-announcements', icon: '📢', isPrivate: false, isLeadershipOnly: true, description: "Big news, launches, policy changes." },
      { name: 'strategy-room', icon: '🏛️', isPrivate: true, isLeadershipOnly: true, description: "Leadership only; long-term planning." },
      { name: 'all-hands', icon: '💬', isPrivate: false, isLeadershipOnly: false, description: "Whole-team discussions, cross-department topics." },
      { name: 'policies', icon: '📜', isPrivate: false, isLeadershipOnly: false, description: "HR rules, leave, expenses, code of conduct." },
      { name: 'industry-news', icon: '📰', isPrivate: false, isLeadershipOnly: false, description: "Share market or optometry AI updates that affect strategy." },
    ],
  },
  {
    name: 'Operations & Projects',
    icon: '📂',
    channels: [
      { name: 'project-roadmap', icon: '🛣️', isPrivate: false, isLeadershipOnly: false, description: "Current & upcoming projects overview." },
      { name: 'daily-updates', icon: '📆', isPrivate: false, isLeadershipOnly: false, description: "Yesterday’s progress, today’s goals, blockers." },
      { name: 'task-board', icon: '✅', isPrivate: false, isLeadershipOnly: false, description: "Synced with Trello/Notion/Asana." },
      { name: 'meeting-notes', icon: '📝', isPrivate: false, isLeadershipOnly: false, description: "Summaries + action points from every meeting." },
      { name: 'milestones', icon: '🎯', isPrivate: false, isLeadershipOnly: false, description: "Major achievements & deadlines." },
    ],
  },
  {
    name: 'Product & Development',
    icon: '💻',
    channels: [
      { name: 'focus-ai-dev', icon: '🤖', isPrivate: false, isLeadershipOnly: false, description: "Development logs for Focus AI (v3.0 and beyond)." },
      { name: 'focus-cast-audio', icon: '🎙️', isPrivate: false, isLeadershipOnly: false, description: "Scripts, edits, and publishing plans for Focus Cast." },
      { name: 'focus-axis-simulator', icon: '🎮', isPrivate: false, isLeadershipOnly: false, description: "Game logic, UI, and simulation tests." },
      { name: 'beta-testing', icon: '🧪', isPrivate: false, isLeadershipOnly: false, description: "For EMR, Notes, Share — dev feedback & testing reports." },
      { name: 'bug-tracking', icon: '🐞', isPrivate: false, isLeadershipOnly: false, description: "Record and resolve software bugs." },
      { name: 'feature-planning', icon: '💡', isPrivate: false, isLeadershipOnly: false, description: "Brainstorm new capabilities." },
      { name: 'integration-requests', icon: '🔌', isPrivate: false, isLeadershipOnly: false, description: "API & automation requests." },
    ],
  },
  {
    name: 'Marketing & Growth',
    icon: '📈',
    channels: [
      { name: 'content-calendar', icon: '📅', isPrivate: false, isLeadershipOnly: false, description: "Plan social posts, ads, and events." },
      { name: 'design-assets', icon: '🎨', isPrivate: false, isLeadershipOnly: false, description: "Logos, graphics, ad creatives." },
      { name: 'campaign-tracking', icon: '📊', isPrivate: false, isLeadershipOnly: false, description: "Monitor ad & social performance." },
      { name: 'prebook-campaign', icon: '📢', isPrivate: false, isLeadershipOnly: false, description: "Manage Focus AI 3.0 pre-book launch." },
      { name: 'partnerships', icon: '🤝', isPrivate: false, isLeadershipOnly: false, description: "Collaborations, influencer outreach." },
      { name: 'social-media-posts', icon: '📷', isPrivate: false, isLeadershipOnly: false, description: "Draft & approve content for Instagram/LinkedIn." },
    ],
  },
  {
    name: 'Client & Support',
    icon: '🤝',
    channels: [
      { name: 'client-onboarding', icon: '📥', isPrivate: false, isLeadershipOnly: false, description: "Docs & steps for new clients." },
      { name: 'active-clients', icon: '📋', isPrivate: false, isLeadershipOnly: false, description: "Track progress of current clients." },
      { name: 'support-tickets', icon: '🎟️', isPrivate: false, isLeadershipOnly: false, description: "Internal follow-up on client issues." },
      { name: 'success-stories', icon: '🌟', isPrivate: false, isLeadershipOnly: false, description: "Record testimonials & wins." },
    ],
  },
  {
    name: 'HR & Team Culture',
    icon: '🧑‍🤝‍🧑',
    channels: [
      { name: 'team-intros', icon: '🙋', isPrivate: false, isLeadershipOnly: false, description: "Welcome new hires." },
      { name: 'wins', icon: '🏆', isPrivate: false, isLeadershipOnly: false, description: "Celebrate big & small achievements." },
      { name: 'casual-chat', icon: '☕', isPrivate: false, isLeadershipOnly: false, description: "Memes, jokes, non-work fun." },
      { name: 'learning-lounge', icon: '📚', isPrivate: false, isLeadershipOnly: false, description: "Optometry research, AI trends, skill development." },
      { name: 'feedback-loop', icon: '🗣️', isPrivate: false, isLeadershipOnly: false, description: "Suggestions for improving workflow." },
    ],
  },
    {
    name: 'Archives & Resources',
    icon: '🗄️',
    channels: [
      { name: 'templates', icon: '📂', isPrivate: false, isLeadershipOnly: false, description: "Contracts, forms, decks." },
      { name: 'product-manuals', icon: '📖', isPrivate: false, isLeadershipOnly: false, description: "Internal guides for each Focus-IN tool." },
      { name: 'meeting-archive', icon: '🗃️', isPrivate: false, isLeadershipOnly: false, description: "Past meeting notes." },
      { name: 'branding-kit', icon: '🎨', isPrivate: false, isLeadershipOnly: false, description: "Colors, fonts, brand guidelines." },
    ],
  },
];

export const allChannels = channelCategories.flatMap(category => category.channels.map(channel => channel.name));
