import { Building, Megaphone, Users, ScrollText, Newspaper, Waypoints, CalendarDays, CheckSquare, FileText as FileTextIcon, Milestone, Bot, Mic, Gamepad, TestTube, Bug, Lightbulb, Plug, Calendar, Palette, LineChart, Handshake, Camera, UserPlus, Trophy, Coffee, BookOpen, MessageCircle, FolderKanban, Ticket, Star, DownloadCloud, ClipboardList, BookUser, AreaChart, MessageSquare, Award, ClipboardCheck } from 'lucide-react';

export const channelCategories = [
  {
    name: 'HQ & Leadership',
    icon: Building,
    channels: [
      { name: 'company-announcements', isPrivate: false, isLeadershipOnly: true },
      { name: 'strategy-room', isPrivate: true, isLeadershipOnly: true },
      { name: 'all-hands', isPrivate: false, isLeadershipOnly: false },
      { name: 'policies', isPrivate: false, isLeadershipOnly: false },
      { name: 'industry-news', isPrivate: false, isLeadershipOnly: false },
    ],
  },
  {
    name: 'Operations & Projects',
    icon: FolderKanban,
    channels: [
      { name: 'project-roadmap', isPrivate: false, isLeadershipOnly: false },
      { name: 'daily-updates', isPrivate: false, isLeadershipOnly: false },
      { name: 'task-board', isPrivate: false, isLeadershipOnly: false },
      { name: 'meeting-notes', isPrivate: false, isLeadershipOnly: false },
      { name: 'milestones', isPrivate: false, isLeadershipOnly: false },
    ],
  },
  {
    name: 'Product & Development',
    icon: Bot,
    channels: [
      { name: 'focus-ai-dev', isPrivate: false, isLeadershipOnly: false },
      { name: 'focus-cast-audio', isPrivate: false, isLeadershipOnly: false },
      { name: 'focus-axis-simulator', isPrivate: false, isLeadershipOnly: false },
      { name: 'beta-testing', isPrivate: false, isLeadershipOnly: false },
      { name: 'bug-tracking', isPrivate: false, isLeadershipOnly: false },
      { name: 'feature-planning', isPrivate: false, isLeadershipOnly: false },
      { name: 'integration-requests', isPrivate: false, isLeadershipOnly: false },
    ],
  },
  {
    name: 'Marketing & Growth',
    icon: LineChart,
    channels: [
      { name: 'content-calendar', isPrivate: false, isLeadershipOnly: false },
      { name: 'design-assets', isPrivate: false, isLeadershipOnly: false },
      { name: 'campaign-tracking', isPrivate: false, isLeadershipOnly: false },
      { name: 'prebook-campaign', isPrivate: false, isLeadershipOnly: false },
      { name: 'partnerships', isPrivate: false, isLeadershipOnly: false },
      { name: 'social-media-posts', isPrivate: false, isLeadershipOnly: false },
    ],
  },
  {
    name: 'Client & Support',
    icon: Handshake,
    channels: [
      { name: 'client-onboarding', isPrivate: false, isLeadershipOnly: false },
      { name:- 'active-clients', isPrivate: false, isLeadershipOnly: false },
      { name: 'support-tickets', isPrivate: false, isLeadershipOnly: false },
      { name: 'success-stories', isPrivate: false, isLeadershipOnly: false },
    ],
  },
  {
    name: 'HR & Team Culture',
    icon: Users,
    channels: [
      { name: 'team-intros', isPrivate: false, isLeadershipOnly: false },
      { name: 'wins', isPrivate: false, isLeadershipOnly: false },
      { name: 'casual-chat', isPrivate: false, isLeadershipOnly: false },
      { name: 'learning-lounge', isPrivate: false, isLeadershipOnly: false },
      { name: 'feedback-loop', isPrivate: false, isLeadershipOnly: false },
    ],
  },
  {
    name: 'Internship Management',
    icon: BookUser,
    channels: [
      { name: 'internship-planning', isPrivate: true, isLeadershipOnly: false },
      { name: 'applications-review', isPrivate: true, isLeadershipOnly: false },
      { name: 'training-plans', isPrivate: true, isLeadershipOnly: false },
      { name: 'intern-progress', isPrivate: true, isLeadershipOnly: false },
      { name: 'mentor-discussions', isPrivate: true, isLeadershipOnly: false },
      { name: 'final-reports', isPrivate: true, isLeadershipOnly: false },
    ],
  },
];

export const allChannels = channelCategories.flatMap(category => category.channels.map(channel => channel.name));
