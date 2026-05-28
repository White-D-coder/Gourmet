# GormetCo — Master Build Prompt

## Structure of the Build Specification

This document is divided into 4 major execution parts:

### Execution Order

The build should be executed in this order:

1. **Part 2 — Backend / Data / Business Logic**
   Covers backend architecture, APIs, pricing engine, customization engine, authentication, order management, inquiry systems, admin operations, and data modeling.

2. **Part 3 — Scalability / Performance / Infrastructure**
   Covers scaling strategy, caching, rendering architecture, database optimization, CDN/media delivery, background jobs, observability, deployment pipelines, reliability, and future extensibility.

3. **Part 4 — Design System / Developer Experience / Operations**
   Covers design tokens, reusable components, CMS structure, testing strategy, security, maintainability, documentation, analytics, developer workflows, and operational tooling.

4. **Part 1 — UI / UX / Brand Experience**
   Covers visual identity, luxury positioning, homepage structure, collections, product pages, customization UX, typography, motion design, trust-building, and conversion-focused interface design.

---

# PART 2 — BACKEND / DATA / BUSINESS LOGIC

## Purpose

This part defines the backend as the control center of GormetCo. It must manage product data, customization rules, pricing, authentication, orders, corporate inquiries, inventory, and admin workflows with precision. The backend must be stable enough to support a premium commerce business and flexible enough to absorb future growth without a rewrite.

The backend is not just an API layer. It is the source of truth for the catalog, the pricing engine, the order lifecycle, the inquiry pipeline, and the operational rules that define how the business behaves.

---

## 1) Backend architecture goals

Build the backend as a modular commerce system with clearly separated domains. Each domain should be independently understandable and testable. Keep business rules in the backend, not scattered through the frontend.

The architecture must support:

* Product discovery and catalog reading
* Customization selection and validation
* Real-time pricing calculation
* Cart persistence
* Checkout and order creation
* Corporate lead capture and workflow management
* Inventory awareness
* Role-based access control
* Admin operations
* Auditability and state tracking

The system should be built for correctness first, then performance, then extension.

---

## 2) Core backend domains

### Authentication and identity

This domain handles user sign-in, sign-up, sessions, role checks, password recovery, and account state.

### Catalog service

This domain manages collections, products, variants, categories, tags, featured content, and editorial metadata.

### Customization service

This domain stores and validates product personalization choices such as names, messages, packaging, add-ons, colors, and bundle configuration.

### Pricing service

This domain calculates final prices using base price, customization price, add-ons, discounts, tax, delivery charges, and corporate tier rules.

### Cart service

This domain stores in-progress product configurations and keeps them consistent across sessions.

### Checkout service

This domain prepares orders, calculates totals, validates delivery data, and interfaces with payment and shipping logic.

### Order service

This domain manages order creation, snapshots, status transitions, fulfillment metadata, and customer communication hooks.

### Inquiry service

This domain captures corporate gifting leads, stores their requirements, and supports follow-up workflows.

### Inventory service

This domain tracks stock levels, reserve logic, depletion status, and business constraints on sellable quantities.

### Notification service

This domain sends order confirmations, inquiry acknowledgments, shipping updates, and admin alerts.

### Admin and content service

This domain powers internal business operations, editorial content, promotions, and operational updates.

---

## 3) Data modeling principles

The database must be structured to preserve business meaning, not just store rows.

Every product should be modeled so it can represent:

* A standalone gift item
* A hamper with nested components
* A configurable bundle
* A seasonal collection item
* A corporate-ready gifting option

Every order must preserve a snapshot of the exact choices made at purchase time. Do not depend only on live product references, because product data may change later.

The data model should support:

* User profiles
* Role assignments
* Product definitions
* Product variants
* Collection membership
* Customization schemas
* Customization selections
* Price breakdowns
* Cart items
* Orders
* Order items
* Inquiries
* Inventory records
* Media assets
* Promotions and coupons
* Shipment details
* Admin notes
* Audit logs

Every core entity should have timestamps, status fields, and reference fields where appropriate.

---

## 4) Product and customization model

GormetCo needs a product model that supports flexible personalization without becoming inconsistent.

A product should include:

* Identity fields
* Display fields
* Commerce fields
* SEO fields
* Media fields
* Availability fields
* Business rule fields

Customization should be modeled separately from the product itself, so one product can have many configurable paths.

Example customization dimensions:

* Personal text
* Card message
* Packaging type
* Ribbon style
* Insert selection
* Add-on selection
* Quantity selection
* Corporate branding
* Date-based delivery constraints

The customization model should support rules such as:

* Required fields
* Optional fields
* Conditional fields
* Character limits
* Price impact
* Compatibility restrictions
* Corporate-only options
* Variant-specific choices

The system should be able to render a dynamic product builder from backend-defined rules instead of hardcoded frontend forms.

---

## 5) Pricing engine

Pricing is a business-critical subsystem. It must be deterministic and transparent.

The pricing engine should calculate the final amount from structured inputs:

* Base product price
* Variant adjustments
* Custom text fees
* Packaging fees
* Add-on fees
* Bundle adjustments
* Quantity multipliers
* Tax
* Delivery fee
* Discount logic
* Corporate discounts
* Coupon logic

The result should be a full breakdown, not just a final total.

The engine must support:

* Reusable pricing rules
* Tiered pricing for bulk orders
* Occasion-based price modifiers
* Time-limited campaigns
* Minimum order thresholds
* Free shipping thresholds
* Product-specific surcharge logic

The pricing logic should be isolated from presentation so it can be tested independently.

---

## 6) Cart and checkout logic

The cart must store the exact selected configuration of a product, not just a product ID.

Cart items should preserve:

* Product reference
* Quantity
* Customization state
* Selected add-ons
* Price snapshot
* Validation status

Checkout should validate:

* Product availability
* Delivery constraints
* Required customization fields
* Address completeness
* Coupon eligibility
* Pricing integrity

If a product becomes unavailable between cart and checkout, the system must fail safely and explain the issue clearly.

The checkout flow should be built for clarity. Do not surprise the user with hidden constraints after they reach payment.

---

## 7) Order lifecycle

Orders must move through a strict but flexible state system.

Typical states:

* Pending
* Paid
* Processing
* Packed
* Shipped
* Delivered
* Cancelled
* Refunded
* Failed

Each transition should be logged.

Orders should store:

* Customer details
* Delivery details
* Item snapshots
* Customization snapshots
* Pricing breakdown
* Payment state
* Fulfillment state
* Tracking data
* Admin notes
* Communication records

The order system must be reliable enough to support customer service, logistics, and financial reconciliation.

---

## 8) Corporate inquiry pipeline

Corporate gifting is not just a contact form. It is a lead pipeline.

The inquiry system should capture:

* Company name
* Contact person
* Email
* Phone
* Budget
* Quantity range
* Occasion
* Delivery destination
* Timeline
* Branding requirements
* Packaging expectations
* Special instructions

Each inquiry should move through statuses such as:

* New
* Reviewing
* Contacted
* Proposal sent
* Negotiation
* Won
* Lost
* Fulfilled

The backend should support internal notes, assignment to team members, follow-up timestamps, and conversion tracking.

This module should be designed so the business can sell large deals without losing track of leads.

---

## 9) Authentication and authorization

The system should support multiple roles with clear permissions.

Possible roles:

* Customer
* Corporate buyer
* Admin
* Super admin

Authorization rules must be enforced on the backend. Do not rely on the frontend to protect sensitive actions.

Examples of protected actions:

* Editing products
* Changing prices
* Managing inventory
* Viewing all orders
* Changing order status
* Reading corporate inquiries
* Accessing analytics

The backend should log administrative actions when sensitive records are modified.

---

## 10) Inventory logic

Inventory should be tracked in a way that reflects reality.

The inventory service should support:

* Stock counts
* Low-stock thresholds
* Reserve logic for carts or checkout windows
* Variant-level inventory
* Component-level inventory for hampers
* Out-of-stock states
* Manual overrides
* Restock visibility

If a hamper is made of several components, stock availability may depend on the weakest component. The system should calculate that correctly.

---

## 11) Notifications and communication hooks

The backend should trigger notifications at important business moments.

Examples:

* Order placed
* Payment confirmed
* Order packed
* Order shipped
* Order delivered
* Inquiry received
* Inquiry updated
* Low stock alert
* Abandoned cart reminder
* Admin follow-up reminder

Notification templates should be centrally managed and consistent in tone.

---

## 12) API design

The API should be clean, predictable, and versionable.

APIs should cover:

* Public catalog data
* Product details
* Collection details
* Customization metadata
* Pricing preview
* Cart updates
* Checkout submission
* Order retrieval
* Inquiry submission
* User account actions
* Admin operations

Use consistent request and response shapes. Validate inputs at the boundary. Return meaningful errors. Avoid ambiguous responses that force the frontend to guess.

The API should be designed so the frontend can render most commerce flows without duplicating business logic.

---

## 13) Content and CMS support

The backend should support editable content for brand and campaign management.

Content-managed areas include:

* Homepage sections
* Campaign banners
* Collection descriptions
* FAQ content
* Policy pages
* Editorial copy
* Seasonal announcements
* Corporate landing text

Content should be structured so non-developers can update it safely without breaking layout or data integrity.

---

## 14) Validation and safety

All important business inputs must be validated on the backend.

Validate:

* Form fields
* Text lengths
* Email formats
* Phone formats
* Dates
* Address completeness
* Customization compatibility
* Pricing rule inputs
* File uploads
* Role-based actions

The backend should fail gracefully and explain what needs correction.

---

## 15) Testing strategy for backend logic

Backend tests should focus on correctness of business rules.

Must-test areas:

* Pricing calculations
* Customization validation
* Coupon application
* Order creation
* Inventory deduction
* Inquiry workflow updates
* Permission checks
* Status transitions
* Snapshot integrity
* Notification triggers

If the backend logic is wrong, the business will leak money or create customer friction. Test those paths first.

---

## 16) Operational standards

The backend should be observable and easy to operate.

Include:

* Logs for major actions
* Error reporting
* Audit trails
* Status monitoring
* Retry mechanisms for failed asynchronous jobs
* Idempotency for sensitive operations like checkout and payment handling

Business operations depend on the backend being explainable after something breaks.

---

## 17) Exit criteria for Part 2

Part 2 is complete only when the backend can reliably support:

* Product and collection management
* Dynamic customization
* Transparent pricing
* Cart and checkout flow
* Order lifecycle tracking
* Corporate inquiry intake
* Admin operations
* Inventory awareness
* Secure access control
* Durable order snapshots

When this part is done, the platform has a real commercial core.

# PART 1 — UI / UX / BRAND EXPERIENCE

Use this prompt to guide the design, engineering, and product execution of **GormetCo**, a premium customizable gifting platform. Treat this as the operating spec for the entire system. Build for elegance, trust, scalability, and long-term maintainability. Every decision should support a luxury-first brand, a strong personalization engine, and a business model that can expand from D2C gifting into corporate gifting, concierge orders, seasonal campaigns, and future marketplace extensions.

---

## 1) Core mission

Build GormetCo as a premium gifting platform where customers can browse elegant gift collections, customize products with personal details, select packaging and add-ons, understand pricing instantly, and place orders with confidence. The experience must feel polished, expensive, calm, and trustworthy. The system must support both individual buyers and corporate clients. It must be easy for the business team to manage products, pricing, inventory, and lead inquiries without developer intervention for routine updates.

The platform should not feel like a generic e-commerce template. It should feel like a curated luxury brand with strong editorial presentation, intentional pacing, and high confidence in every interaction. The architecture should remain durable as SKUs, custom options, traffic, and business complexity grow.

---

## 2) Product definition

GormetCo sells customizable gifting products. A gift may be a single item, a hamper, a themed bundle, a seasonal collection, or a corporate gifting package. Each product can have optional personalization layers such as:

* Name engraving or printed text
* Message cards
* Brand logos for corporate orders
* Color or material selection
* Item combinations inside a hamper
* Optional add-ons such as ribbons, premium wrapping, inserts, or gift notes
* Occasion-based packaging
* Delivery scheduling
* Bulk quantities

The platform must support dynamic pricing based on selected customizations. Every customization should clearly show the customer how the price changes, what is included, and what constraints apply.

The system should support the following business modes:

* D2C gifting for individual buyers
* Corporate gifting for bulk requests
* Seasonal and event-based collections
* Limited edition drops
* Concierge-style special orders
* Future expansion into referral, subscription, and loyalty programs

---

## 3) Experience principles

Design every screen around these principles:

* Luxury over clutter
* Clarity over cleverness
* Confidence over noise
* Trust over gimmicks
* Fast comprehension over dense UI
* Premium pacing over rushed interaction

The interface should use generous whitespace, refined typography, restrained motion, and a strong visual hierarchy. The customer must immediately understand what the product is, what can be customized, how much it costs, and how to move forward.

The brand tone should feel sophisticated, warm, and assured. Avoid playful visuals that reduce trust. Avoid cheap gradients, loud badges, or overwhelming animations. Motion should support the experience, not dominate it.

---

## 4) Information architecture

The site should be structured around a clear commerce journey.

Primary public surfaces:

* Home
* Collections
* Collection detail
* Product detail
* Customization flow
* Cart
* Checkout
* Order confirmation
* Corporate gifting inquiry
* About / sourcing ethos
* Contact
* FAQ
* Delivery and return policy
* Track order

Administrative surfaces:

* Admin dashboard
* Product management
* Collection management
* Order management
* Inquiry management
* Inventory management
* Content management
* Promotional campaign management
* Customer support view
* Analytics dashboard

Future-ready surfaces:

* Account dashboard
* Saved gift lists
* Wishlist or shortlisted gifts
* Loyalty and repeat-order area
* Corporate account portal
* Event planning or concierge module

---

## 5) Visual design direction

GormetCo should visually communicate premium craftsmanship.

Use a refined palette with a dominant neutral base and selective luxury accents. Prefer deep black, ivory, warm stone, muted gold, charcoal, and an elegant accent color reserved for actions or highlights. The palette should feel expensive, not flashy.

Typography should combine an editorial serif for headlines and a clean sans-serif for body copy and interface labels. The type system should create contrast between emotion and function. Headlines can be dramatic and elegant. Supporting text should remain highly legible.

Use large images, thoughtful cropping, and full-bleed sections. Let the product photography carry the emotional weight. Avoid overcrowding cards with too much copy. Let the products breathe.

Visual rhythm should alternate between:

* Hero storytelling
* Category discovery
* Product detail focus
* Trust sections
* Social proof
* Conversion prompts

Motion should be subtle and high-end:

* Smooth fades
* Gentle slide-ins
* Controlled parallax
* Soft hover elevation
* Elegant image scaling
* Minimal but deliberate page transitions

Avoid excessive bounce, gimmicky microinteractions, or visual effects that feel game-like.

---

## 6) Homepage requirements

The homepage must communicate the value proposition in under five seconds.

The hero section should include:

* Brand name
* Premium one-line positioning statement
* Primary CTA to shop collections
* Secondary CTA to explore corporate gifting or bespoke orders
* Strong visual imagery

The hero should not overload the visitor with multiple competing messages. It should anchor the brand.

Below the hero, include these sections:

* Featured collections
* Customization capabilities
* Signature craftsmanship or sourcing ethos
* Occasion-based gifting categories
* Corporate gifting section
* Social proof or customer trust indicators
* How it works
* Editorial storytelling block
* Final conversion banner

The homepage should behave like a luxury editorial landing page plus a commerce gateway.

---

## 7) Collection architecture

Collections are the primary discovery layer. Every collection should have:

* Title
* Description
* Occasion tags
* Visual theme
* Price range
* Product count
* Featured products
* Seasonal availability
* Customization availability

Collections can be organized by:

* Occasion
* Recipient
* Budget
* Product type
* Seasonal campaign
* Corporate use case
* Premium tier

Examples of collection categories:

* Wedding gifting
* Birthday gifting
* Festive gifting
* Corporate welcome hampers
* Client appreciation gifts
* Luxury desk gifts
* Wellness gifts
* Celebration hampers
* Personalized gift boxes

Collection pages must be conversion-oriented but editorial in tone. Include filters, preview cards, and concise storytelling.

---

## 8) Product model

Each product must have a structured model that supports both display and business logic.

Required product fields:

* Name
* Slug
* SKU or internal code
* Category
* Collection membership
* Base price
* Discount price, if any
* Images and media
* Short description
* Long description
* Materials or contents
* Dimensions
* Weight
* Availability status
* Lead time
* Inventory status
* Customization options
* Add-ons
* Tagline
* Occasion tags
* Recipient tags
* Featured flag
* SEO metadata
* Corporate eligible flag

For hampers or bundles, the product model must also support nested items. Each hamper can contain multiple components, each with quantity, variant, supplier link, and substitution rules.

---

## 9) Customization engine

This is the heart of GormetCo.

The customization engine must allow customers to modify products in a guided, step-by-step interface. It should support a clear sequence such as:

1. Choose base product
2. Select packaging or theme
3. Add personalization text
4. Add card message
5. Select add-ons
6. Choose quantity or set size
7. Review updated price
8. Confirm and add to cart

The engine must support conditional logic. Some customization options should only appear if another choice is selected. Examples:

* Premium packaging unlocks premium ribbon choices
* Corporate orders unlock logo insertion
* Larger hampers unlock extra add-on slots
* Certain items may restrict engraving options

The UI must show pricing changes instantly and transparently. No hidden charges. If an option adds cost, the increment should be visible immediately.

The engine should support validation rules such as:

* Maximum text length
* Character restrictions
* Image size and format limits
* Unsupported combinations
* Inventory constraints
* Delivery date cutoffs

The system should save customization states in the cart and order record so the exact configuration can be reproduced later.

---

## 10) Pricing logic

The pricing system must be modular and extensible.

Pricing should support:

* Base product price
* Variant price adjustment
* Add-on price adjustment
* Packaging tier price
* Personalization price
* Bulk pricing discounts
* Corporate tier pricing
* Seasonal promotions
* Coupon codes
* Minimum order quantities for some products

Pricing rules must be deterministic and auditable. The system should calculate the final price from clear components. The customer should be able to see a breakdown such as:

* Base product
* Customization fee
* Packaging fee
* Add-ons
* Tax
* Delivery fee
* Discounts
* Final total

Do not hide complexity. Present it cleanly.

---

## 11) Trust design

The platform must build trust at every stage.

Trust signals should include:

* Secure checkout indicators
* Clear policy pages
* Visible contact options
* Transparent pricing
* Accurate delivery expectations
* Product quality assurances
* Corporate credibility indicators
* Realistic previews of personalization
* Order confirmation and tracking
* Refund and replacement logic where applicable

Corporate buyers must see that the platform is professional enough for business use. Individual buyers must feel safe spending money and sharing personal message details.

Trust should also come from consistency. Spacing, copy, motion, and imagery must all feel aligned.

---

## 12) Content strategy

The brand voice should be premium, calm, and precise.

Copy should be:

* Clear
* Elegant
* Minimal but meaningful
* Specific about quality
* Reassuring without overexplaining

Avoid cheap sales language. Avoid hype that sounds fake. Avoid generic marketing fluff.

Good content categories include:

* Sourcing ethos
* Craftsmanship notes
* Occasion guides
* Personalization explanations
* Corporate gifting benefits
* Delivery reliability
* Gift etiquette and recommendations
* Product care and storage notes

The content strategy should help users choose quickly while reinforcing perceived value.

---

## 13) Corporate gifting pipeline

The platform must support a dedicated corporate gifting flow.

Corporate inquiry form should capture:

* Company name
* Contact person
* Email and phone
* Quantity range
* Budget range
* Occasion
* Delivery city or cities
* Timeline
* Custom branding needs
* Packaging preferences
* Notes and special requirements

After submission, the inquiry should be stored in the database and surfaced in the admin dashboard. The admin should be able to update status stages such as:

* New
* Contacted
* Proposal sent
* Negotiation
* Won
* Lost
* Fulfilled

The pipeline should support follow-ups, notes, assignments, and reminders. It should be easy to convert inquiries into quotations or custom orders.

---

## 14) Order management flow

Orders must support a full lifecycle.

Stages can include:

* Cart
* Checkout initiated
* Payment pending
* Payment confirmed
* Processing
* Packed
* Shipped
* Out for delivery
* Delivered
* Cancelled
* Returned
* Refunded

Each order should store all relevant data:

* Customer identity
* Delivery address
* Customization payload
* Payment status
* Tracking references
* Tax details
* Invoice data
* Communication logs

The admin should be able to update fulfillment status and view all customization details without checking external systems.

---

## 15) Admin dashboard requirements

The admin system must be secure, efficient, and useful.

Core dashboard widgets:

* Total revenue
* Total orders
* Pending inquiries
* Low stock alerts
* Customization-heavy products
* Top performing collections
* Recent orders
* Recent inquiries
* Fulfillment bottlenecks
* Conversion metrics

Admin features:

* Create, edit, archive products
* Create, edit, archive collections
* Upload media
* Manage inventory
* Update pricing rules
* Review corporate inquiries
* Update order statuses
* Manage promotions and banners
* Review user accounts
* Export data

The admin interface should be functional, not decorative. It should still feel polished, but the priority is operational efficiency.

---

## 16) Backend architecture

The backend should be designed as a modular commerce engine.

Required domains:

* Authentication
* Catalog service
* Customization service
* Pricing service
* Cart service
* Checkout service
* Order service
* Inquiry service
* Inventory service
* Notification service
* CMS/content service
* Analytics service

Each domain should have clear responsibilities and minimal coupling.

The backend should expose well-defined APIs for the frontend and admin. API contracts should be stable, typed, and versioned where needed. Validation must occur at the boundary. Business rules should not be scattered across the UI.

The system should support future splitting into separate services if needed, but it should begin as a well-structured modular monolith unless traffic or team size clearly justify distributed services.

---

## 17) Data modeling requirements

The data model must preserve product structure and order history precisely.

Core entities may include:

* User
* Role
* CustomerProfile
* Product
* ProductVariant
* Collection
* CustomizationOption
* CustomizationChoice
* Cart
* CartItem
* Order
* OrderItem
* Inquiry
* InventoryRecord
* Shipment
* PaymentTransaction
* Coupon
* Review
* MediaAsset
* Notification
* AdminNote

Every order must retain a snapshot of product and customization data at purchase time. Do not depend only on live product records, because those may change later.

Model relationships carefully so that the system can support:

* One-to-many product variants
* Nested hamper components
* Reusable customization schemas
* Role-based access
* Historical order integrity
* Corporate inquiry workflows

---

## 18) Authentication and roles

The platform must support multiple user roles.

Roles may include:

* Guest
* Customer
* Corporate buyer
* Admin
* Super admin

Authentication should support secure sessions, protected routes, and role-based permissions. Corporate users may have different dashboard needs from retail customers. Admin access should be tightly protected and auditable.

User account features may include:

* Order history
* Saved addresses
* Saved customization templates
* Wishlist or saved gifts
* Corporate profile details
* Notification preferences

---

## 19) Scalability strategy

Build the system so it can scale without architectural collapse.

Scalability must be considered across:

* Product catalog growth
* Traffic spikes during festivals and campaigns
* Bulk corporate requests
* Image and media volume
* Checkout and payment load
* Search and filtering load
* Admin operations

Use caching where appropriate, especially for static or semi-static catalog pages, collection pages, and popular product data. Offload heavy media handling to object storage or a CDN. Separate read-heavy and write-heavy paths where useful.

The frontend should use server rendering or hybrid rendering for discoverability and performance. The backend should keep expensive operations isolated. Database indexes should support lookup patterns used by the app. Background jobs should handle email, order updates, media processing, and reporting tasks.

The architecture should allow future expansion into:

* Dedicated admin app
* Mobile app
* API for partners
* Vendor or artisan portal
* Separate reporting dashboard

---

## 20) Performance requirements

The platform must load quickly and feel responsive.

Performance goals:

* Fast first render
* Minimal layout shift
* Efficient image delivery
* Smooth page transitions
* Low interaction latency
* Fast admin filtering and search

Optimize large assets and avoid unnecessary client-side rendering for static content. Use appropriate loading states, skeletons, and lazy loading. Make sure the site remains smooth even on mid-range mobile devices.

---

## 21) SEO and discoverability

The site must be discoverable.

SEO needs include:

* Structured metadata
* Clean URLs
* Semantic page hierarchy
* Indexable collection pages
* Rich product pages
* Open Graph data
* Social sharing previews
* Internal linking between related products and collections
* Occasion-based landing pages

Build pages that rank for high-intent searches around gifting, corporate gifting, luxury hampers, personalized gifts, and premium occasion-based products. Avoid thin pages. Give search engines and users genuinely useful context.

---

## 22) Media and asset system

Images matter more than words for this business.

The media system must support:

* Product hero images
* Gallery images
* Lifestyle images
* Customization previews
* Corporate mockups
* Seasonal banners
* Editorial storytelling visuals
* Logo assets
* Packaging mockups

Media delivery must be optimized for speed and quality. The system should generate responsive variants, thumbnails, and possibly preview images for custom configurations.

For customization previews, the frontend should show a faithful visual approximation of the selected configuration where feasible. If full visual rendering is not possible for every combination, the system should still present a clean summary of choices.

---

## 23) Notification system

The platform should communicate with users reliably.

Notifications can include:

* Order confirmation
* Payment confirmation
* Shipping updates
* Delivery updates
* Corporate inquiry acknowledgment
* Admin follow-up reminders
* Abandoned cart reminders
* Promotional announcements
* Back-in-stock alerts

Support email and, if needed later, SMS or WhatsApp integrations. Notifications should be templated, trackable, and consistent in tone.

---

## 24) Analytics and reporting

The business needs data.

Track at minimum:

* Traffic sources
* Product views
* Add-to-cart rates
* Checkout conversion rates
* Abandonment points
* Best-selling collections
* Corporate inquiry conversion
* AOV
* Repeat customers
* Low-stock trends
* Seasonal demand patterns

Admin reporting should help the business understand what to improve, what to restock, and what to promote.

---

## 25) Content management

The team must be able to update content without code changes.

Content management should cover:

* Homepage banners
* Collection copy
* Product descriptions
* FAQs
* Policy pages
* Campaign banners
* Announcement bars
* Corporate landing copy
* Editorial articles

The CMS should be simple enough for non-technical operators but structured enough to prevent broken layouts or inconsistent branding.

---

## 26) Security requirements

Security must be built in, not added later.

Protect against:

* Unauthorized admin access
* Injection attacks
* Broken authorization
* File upload abuse
* Data leakage
* Weak session handling
* Payment abuse
* Form spam

Ensure role-based permissions, server-side validation, secure secrets handling, and proper audit logging for sensitive actions. Personalization and order data can include private customer messages, so treat it carefully.

---

## 27) Maintainability standards

The codebase must remain easy to extend.

Use:

* Clear folder boundaries
* Reusable UI components
* Typed contracts
* Shared design tokens
* Named business rules
* Validation schemas
* Stable data access patterns

Avoid duplicating logic across frontend and backend. Avoid overengineering with unnecessary abstraction. Build for the real business size first, but keep extension points clear.

---

## 28) Developer experience

The system should be pleasant for developers to work on.

That means:

* Fast local setup
* Predictable environment configuration
* Good linting and formatting
* Strong type safety
* Testable services
* Easy debugging
* Reusable component library
* Shared utilities for product and pricing logic

The repo should be organized so future developers can understand the business quickly. Documentation should explain customization rules, pricing rules, order states, and content structure.

---

## 29) Testing strategy

Test the business-critical parts first.

Priority test areas:

* Pricing calculations
* Customization validation
* Checkout flow
* Role-based access
* Order state transitions
* Inquiry submission
* Inventory adjustments
* Admin permissions
* Media upload handling
* Payment success and failure paths

Use unit tests for pure logic, integration tests for data and API flows, and end-to-end tests for the critical user journey.

---

## 30) Acceptance criteria

The build is successful only if the following are true:

* The site feels premium and trustworthy
* Customers can customize products clearly
* Pricing updates correctly and transparently
* Corporate inquiry flow works end to end
* Admin can manage products and orders efficiently
* The architecture is modular and maintainable
* The system performs well under load
* The brand feels elegant, not generic
* The platform is ready for future expansion

---

## 31) Final execution instruction

Build GormetCo as a premium gifting platform with luxury presentation, precise customization, reliable commerce logic, and strong operational tooling. Treat every feature as part of a larger ecosystem. The customer-facing side must feel calm, elegant, and confidence-building. The backend must feel durable, typed, auditable, and scalable. The admin tools must make the business easy to run. The entire product must be designed so it can grow into a serious commerce brand without needing a rewrite.

Do not build a flashy demo. Build a real platform.
