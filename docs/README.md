# Certus Operations Dashboard Documentation

Welcome to the Certus Operations Dashboard documentation! This directory contains all product, technical, and design documentation for the project.

---

## 📚 Start Here

**New to the project?** Read these in order:

1. **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** — Complete index of all documentation
2. **[prd.md](prd.md)** — Product requirements and features
3. **[architecture.md](architecture.md)** — System architecture and technical design
4. **[database_schema.md](database_schema.md)** — Complete database reference

---

## 🎯 Quick Links by Role

### Restaurant Owner / Operator
- [User Data Flow](user_data_flow.md) — How to access and view your data
- [User Creation Guide](user_creation_guide.md) — How new users are added
- Page specifications in [ux/page_map.md](ux/page_map.md)

### Developer
- [Architecture](architecture.md) — System design and component structure
- [Database Schema](database_schema.md) — All tables, fields, and relationships
- [Analytics Implementation](analytics_implementation.md) — Complete analytics technical docs
- [Authentication](auth/authentication.md) — Auth flow and session management

### Product Manager
- [PRD](prd.md) — Complete product specification
- [Timeline](timeline.md) — Project timeline and task tracking
- [UX Page Map](ux/page_map.md) — All pages and user flows

### Designer
- [UI Tokens](ui/tokens.json) — Design system tokens
- [Component Patterns](ui/component_patterns.md) — UI component library
- [Interaction Specs](ui/interaction_specs.md) — Micro-interactions and animations
- [Components Map](ui/components_map.md) — Figma to code mapping

---

## 📁 Directory Structure

```
docs/
├── README.md                         ← You are here
├── DOCUMENTATION_INDEX.md            ← Complete documentation index
├── prd.md                            ← Product requirements
├── architecture.md                   ← System architecture
├── database_schema.md                ← Database reference
├── user_data_flow.md                 ← How data flows through the system
├── timeline.md                       ← Project timeline
├── user_creation_guide.md            ← User management guide
├── user_management_access_control.md ← Access control guide
├── roles_and_permissions.md          ← RBAC documentation
│
├── analytics_implementation.md       ← Analytics technical docs
├── analytics_complete_summary.md     ← Analytics executive summary
│
├── auth/
│   └── authentication.md             ← Authentication flow
│
├── ui/
│   ├── tokens.json                   ← Design tokens
│   ├── components_map.md             ← Component specifications
│   ├── component_patterns.md         ← UI patterns
│   ├── interaction_specs.md          ← Micro-interactions
│   └── loading_states.md             ← Loading patterns
│
└── ux/
    └── page_map.md                   ← Page inventory and user flows
```

---

## 🚀 Recently Completed

### Analytics Page (November 2025)
**Status:** ✅ Complete and documented

**Features:**
- Time range filtering (Today, Yesterday, Last 7 Days, Last Month, All Time)
- Call type filtering (Orders, Reservations, etc.)
- Single-day hourly views with timezone conversion
- Multi-day daily aggregates
- Operating hours overlay on charts
- Revenue chart with trends
- CSV export

**Documentation:**
- [analytics_implementation.md](analytics_implementation.md) — Technical details
- [analytics_complete_summary.md](analytics_complete_summary.md) — Executive summary

**Bug Fixes:**
- ✅ Revenue calculation (was showing 1000x too high)
- ✅ Timezone conversion (using proper `Intl.DateTimeFormat`)
- ✅ Operating hours display (requires complete database data)

---

## 🔍 Finding Information

### "How do I...?"
| Task | Documentation |
|------|---------------|
| Understand the product | [prd.md](prd.md) |
| Set up authentication | [auth/authentication.md](auth/authentication.md) |
| Query analytics data | [analytics_implementation.md](analytics_implementation.md) |
| Find database tables | [database_schema.md](database_schema.md) |
| Create a new user | [user_creation_guide.md](user_creation_guide.md) |
| Understand page structure | [ux/page_map.md](ux/page_map.md) |

### "What is...?"
| Question | Documentation |
|----------|---------------|
| The system architecture? | [architecture.md](architecture.md) |
| How data flows through the app? | [user_data_flow.md](user_data_flow.md) |
| The design system? | [ui/tokens.json](ui/tokens.json) & [ui/component_patterns.md](ui/component_patterns.md) |
| The RBAC system? | [roles_and_permissions.md](roles_and_permissions.md) |

### "Why does...?"
| Question | Documentation |
|----------|---------------|
| Analytics show certain hours? | [analytics_implementation.md](analytics_implementation.md) (Timezone Conversion section) |
| Revenue display in cents? | [database_schema.md](database_schema.md) |
| Call type filtering work this way? | [analytics_complete_summary.md](analytics_complete_summary.md) (Never Use Boolean Flags section) |

---

## 📝 Documentation Standards

When updating documentation:

1. **Use markdown format** for all documentation files
2. **Include file references** with line numbers (e.g., `file.ts:42-51`)
3. **Add checkmarks** (✅) for completed features
4. **Link to related docs** for easy navigation
5. **Include code examples** for complex logic
6. **Maintain version history** in document headers
7. **Update DOCUMENTATION_INDEX.md** when adding new docs

---

## ✅ Documentation Health

### Up to Date ✅
- PRD (analytics marked as implemented)
- Architecture (analytics section updated)
- User Data Flow (analytics patterns added)
- Analytics Implementation (complete and current)
- Analytics Complete Summary (comprehensive overview)
- Database Schema (fully documented)
- Authentication (complete)

### Needs Review ⚠️
- UX Page Map — Analytics section should reflect actual implementation (not original spec)

---

## 🤝 Contributing

### When to Update Documentation
- **After implementing a feature** → Update PRD, architecture, and page_map
- **After fixing a bug** → Document in implementation file
- **After major refactor** → Update architecture and affected docs
- **After user research** → Update UX documentation

### Document Owners
- **PRD:** Product Owner Agent
- **Architecture:** Backend Architect Agent
- **Analytics:** Frontend Developer + Backend Architect
- **UX:** UX Researcher Agent
- **UI:** UI Designer Agent
- **Auth:** Backend Architect Agent

---

## 📞 Need Help?

1. **Check [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** for complete documentation map
2. **Search docs** for keywords related to your question
3. **Review related documents** listed at the bottom of each doc
4. **Ask the team** if you can't find what you need

---

## 🔗 External Resources

### Tech Stack
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Recharts Documentation](https://recharts.org/en-US/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### Tools
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

---

**Last Updated:** 2025-11-24
**Maintained By:** Product Owner + Documentation Team
