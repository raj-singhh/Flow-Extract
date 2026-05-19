# **App Name**: FlowExtract

## Core Features:

- Dynamic Extraction Configurator: A top-bar interface with checkboxes allowing users to specify exactly which fields (Email, Phone, Skills, Experience, Companies) the AI should target.
- Dual Aggregator Columns: Side-by-side display columns that automatically compile all extracted emails and phone numbers into clean, comma-separated blocks for quick copying.
- AI Multi-Data Extraction Tool: An intelligent parsing tool that reasons over resume text to extract only the user-selected attributes, ensuring context-aware identification of contact info and career history.
- Centralized Batch Drop Zone: A dedicated interactive section for dragging and dropping multiple resume files simultaneously for immediate background processing.
- Structured Candidate Table: A dynamic list at the bottom of the page that populates detailed rows for each candidate, showing only the fields toggled in the configuration bar.
- One-Click Clipboard Utility: Copy buttons for the aggregated contact columns that format data with comma separators for direct use in email BCC fields.

## Style Guidelines:

- A vertical stack layout: configuration bar at the top, a split two-column summary section, a centered drop zone, and a full-width data table at the bottom.
- Primary color: Electric Cobalt (#5C5CF0) for actionable items; Background: Deep Navy Slate (#0D0D12) for a professional dark mode aesthetic.
- Uses 'Space Grotesk' for labels and headers to maintain a technical feel, with 'Inter' for high-readability in the data table and extraction lists.
- Minimalist glyphs for checkboxes and file types, with a distinct 'copy' icon for the contact aggregator boxes.
- Smooth row insertion animations in the candidate list and a pulsing border effect on the drop zone when files are hovered over it.