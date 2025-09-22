# Tasks

## In Progress
- Implement onboarding to journaling transition [September 21, 2025]
  - Fetch journal templates from API after profile creation
  - Group templates by tags/categories
  - Display template selection interface
  - Implement template selection and journal creation flow
  - Add navigation from onboarding completion to journal creation

- Create breathing animation for loading states [September 21, 2025]
  - Design a reusable component with alternating "breathe in"/"breathe out" text
  - Implement bubble animation with zoom in/out effect
  - Add 5-second timing for state transitions
  - Replace standard loading spinners to reduce user irritation during waits
  - Move text outside of bubble while maintaining container dimensions [September 22, 2025]
  - Set initial state to small bubble that grows larger
  - Ensure only the bubble resizes while container remains intact

- Improve dashboard homepage layout [September 22, 2025]
  - Add down arrow at the bottom of the first section (journal + quote)
  - Implement smooth scrolling to second section (roleplay + vocab hub) when arrow is clicked
  - Allow deselection of templates to enable writing with a blank page
  


- Implement text highlighting and processing in feedback [September 21, 2025]
  - Add text highlighting functionality using window.getSelection()
  - Show a floating "Save" button directly above highlighted text
  - Store selected highlights in local state
  - Add a "Process Highlight" button to send highlights to webhook
  - Send saved highlights to the webhook for processing
  - Apply yellow background to saved highlights in the UI
  - Restrict highlighting to only the 'Improved Version' section
  - Ensure error handling keeps users on the feedback page
  - Fix highlight saving functionality to properly add to highlights list
  - Improve DOM manipulation for reliable text highlighting
  - Add debugging to track highlight state changes

- Implement mobile-friendly text highlighting [September 22, 2025]
  - Research best practices for text selection on mobile devices
  - Create touch-friendly highlight selection interface
  - Implement touch event handlers for mobile text selection
  - Design mobile-optimized floating action menu
  - Ensure visual feedback is clear on mobile screens
  - Test across different mobile browsers and devices
  - Optimize performance for mobile devices
  - Add responsive design adjustments for different screen sizes

## Completed
- Implement Flashcard Sets integration in Vocab Hub [September 23, 2025]
  - Created mock data for flashcard sets in mock-flashcard-data.ts
  - Integrated FlashcardSetList component with the Vocab Hub page
  - Added support for displaying loading states, errors, and empty states
  - Modified page layout to display both flashcard sets and vocabulary collections
  - Set up the UI structure for future integration with actual API data

- Update navigation icons with Lucide React components [September 22, 2025]
  - Replaced image-based icons with Lucide React components
  - Updated icons for journal (Book), vocab hub (FlashCard), dashboard (House), roleplay (MessageCircle), and authentication (LogIn/LogOut)
  - Enhanced navigation styling for better visual consistency
  - Improved responsiveness of the navigation component

- Implement comprehensive Journal Page [September 22, 2025]
  - Created Journal List UI component to display entries with timestamps
  - Developed Calendar View component to browse journal entries by date
  - Added Journal Stats section to display total entries and streaks
  - Implemented Wake-up Call section for users who need writing prompts
  - Created Template Selection interface similar to onboarding
  - Integrated components with smooth scrolling and state management
  - Implemented Supabase function calls for journal data and statistics
  - Enhanced date utilities with consistent formatting functions

- Refactor project structure according to global-rules.md [September 21, 2025]
  - Reorganized code by feature and responsibility
  - Fixed redundant file structure
  - Updated import paths
  - Fixed build errors
  
- Implement journal feedback feature [September 21, 2025]
  - Added "Get Feedback" button to journal entry creation page
  - Created feedback page to display response (title, summary, improved version)
  - Implemented webhook call to external API for journal feedback
  - Added vocabulary suggestions with checkboxes for selection
  - Added navigation between journal creation and feedback pages
  - Fixed API response handling with robust error recovery
  - Added server-side proxy with timeout and data validation
  - Implemented user-friendly error messages and fallback content
  - Updated code to handle nested webhook response structure [array[0].output]
  - Added comprehensive validation and graceful fallback for malformed responses
  - Created unit tests to verify webhook response parsing logic
  - Improved timeout handling with increased duration (60s) and retry logic
  - Enhanced user experience with progressive loading indicators
  - Implemented exponential backoff retry mechanism for resilience
  - Added original version field to display the unmodified journal content [September 21, 2025]
  - Added "Get Feedback" button to journal entry creation page
  - Created feedback page to display response (title, summary, improved version)
  - Implemented webhook call to external API for journal feedback
  - Added vocabulary suggestions with checkboxes for selection
  - Added navigation between journal creation and feedback pages
  - Fixed API response handling with robust error recovery
  - Added server-side proxy with timeout and data validation
  - Implemented user-friendly error messages and fallback content
  - Updated code to handle nested webhook response structure [array[0].output]
  - Added comprehensive validation and graceful fallback for malformed responses
  - Created unit tests to verify webhook response parsing logic
  - Improved timeout handling with increased duration (60s) and retry logic
  - Enhanced user experience with progressive loading indicators
  - Implemented exponential backoff retry mechanism for resilience

## Discovered During Work

- Implement flashcard saving with webhook integration [September 22, 2025]
  - Update flashcard creation page to send data to webhook at https://auto.zephyrastyle.com/webhook/save-flashcards
  - Send profileId and flashcards data (front, back with definition and example)
  - Show breathing animation loader during the API call
  - Display success message upon successful save
  - Implement error handling with user-friendly error messages
  - Add unit tests to validate webhook integration
  - Update API response handling for robust error recovery
  - Add validation for required flashcard fields before submission

- Rename and update "Flashcards" to "Vocab Hub" throughout the application [September 22, 2025]
  - Updated navigation component to use "Vocab Hub" instead of "Flashcards"
  - Added "Home" link to navigation
  - Updated references in dashboard page to point to /vocab instead of /flashcards
  - Updated vocabulary review button text and links
  - Ensured consistent terminology throughout the application
  - Fixed journal feedback redirects to maintain flashcard creation flow
  - Added layout to vocab page to ensure navigation appears






<!-- Once profile createed -> create a jouranl_set in supavase for that user, name: Journal Voca. in table: flashcard_set"  -->
<!-- UI
make the set has image of multiple cards, like a stack of cards -->






<!-- once sign in, should store profiles info (name, userid) so that other
eleent in app can use it (for exapmle to show user name in header...) 
->

start writing -> sign up
remove the guide: "clear selection, click to select,..)
The wrting screen should be clean. the content section now is too small ( should be in same size as the page "creat falshcard"
)


return to journal -> return to feedback page 









------------------------------UI------------------------
Navigation side bar: if user close, keep it close even user choose another page. show big only when user click the hamburger icon.

side bar: always in collapsed,if user click hamburger icon, show full side bar. sidebar over screen,dark background, click outside to close. dont affect the page width.






Choose template of iccons, global theme
save all the endponts, webhook, supabase funtion in a place -->

































## Completed

- Create dedicated landing page for the application [September 22, 2025]
  - Reviewed project architecture to align with existing patterns
  - Developed responsive landing page component following the design in the provided image
  - Configured Next.js app router to make landing page the entry point to the application
  - Implemented mobile-first responsive design using Tailwind and shared hooks
  - Extracted reusable UI components for page sections (Header, Hero, Section, Footer, etc.)
  - Added appropriate content, copy, and call-to-action elements
  - Connected landing page to authentication flow for proper user journey
  - Wrote comprehensive unit tests (expected use, edge cases, failure cases)
  - Ensured consistent styling with the rest of the application

- Implement mobile-first layout approach across the application [September 22, 2025]
  - Created shared useResponsive hook for consistent breakpoint detection
  - Implemented z-index management system for proper UI layering
  - Refactored Navigation component for mobile-first styling
  - Updated AppLayout component to eliminate duplicate navigation rendering
  - Improved highlight selector component with mobile touch handling
  - Enhanced VocabPage with mobile-optimized buttons and layouts
  - Added mobile-friendly utility classes in global CSS
  - Created comprehensive mobile-first development guide
  - Added tests for responsive components
  - Optimized touch targets for mobile interaction (minimum 44×44px)
  - Implemented responsive transitions between mobile and desktop views
  - Created useTransitionStyles hook for smooth layout transitions
  - Updated auth pages with mobile-friendly layouts
  - Documented mobile-first implementation patterns for future development

