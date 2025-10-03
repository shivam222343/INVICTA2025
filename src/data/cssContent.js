// Additional CSS sections to be added to moduleData.js

const additionalCSSSections = [
  {
    title: 'Styling With CSS',
    introduction: 'Learn how to apply colors, work with units, borders, box model properties, and backgrounds in CSS.',
    subsections: [
      {
        title: 'Working with colors in CSS - name, rgb, etc.',
        content: 'CSS supports multiple color formats for flexible styling options.',
        points: [
          'Named colors: red, blue, green, etc.',
          'RGB: rgb(255, 0, 0) for red',
          'Hexadecimal: #FF0000 for red',
          'HSL: hsl(0, 100%, 50%) for red',
          'RGBA and HSLA for transparency'
        ],
        codeExample: {
          title: 'CSS Color Examples',
          language: 'css',
          explanation: 'Different ways to define colors in CSS',
          code: `.named-color { color: red; }
.hex-color { color: #3498db; }
.rgb-color { color: rgb(52, 152, 219); }
.rgba-color { color: rgba(52, 152, 219, 0.8); }
.hsl-color { color: hsl(204, 70%, 53%); }`
        }
      },
      {
        title: 'Working with css units - %, px, rem, em, vw, vh, min, max',
        content: 'Understanding different CSS units for responsive and flexible layouts.',
        points: [
          'px: Fixed pixel units',
          '%: Relative to parent element',
          'em: Relative to font-size of element',
          'rem: Relative to root font-size',
          'vw/vh: Viewport width/height',
          'min/max functions for responsive values'
        ]
      }
    ]
  },
  {
    title: 'More about CSS',
    introduction: 'Advanced CSS concepts including display properties, flexbox, grid, positioning, and selectors.',
    subsections: [
      {
        title: 'Applying display properties - inline, grid, flex, none, inline-block, etc.',
        content: 'Display property controls how elements are rendered and positioned.',
        codeExample: {
          title: 'Display Properties',
          language: 'css',
          explanation: 'Different display values change element behavior',
          code: `.block { display: block; }
.inline { display: inline; }
.inline-block { display: inline-block; }
.flex { display: flex; }
.grid { display: grid; }
.none { display: none; }`
        }
      },
      {
        title: 'Introduction to FlexBox for aligning and structure',
        content: 'Flexbox provides powerful alignment and distribution capabilities.',
        codeExample: {
          title: 'Flexbox Layout',
          language: 'css',
          explanation: 'Flexbox properties for flexible layouts',
          code: `.flex-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.flex-item {
  flex: 1;
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: auto;
}`
        }
      }
    ]
  },
  {
    title: 'Interesting things about CSS ✌️',
    introduction: 'Explore pseudo-classes, transitions, transforms, and animations to create engaging user experiences.',
    subsections: [
      {
        title: 'Applying pseudo classes and Pseudo Elements',
        content: 'Pseudo-classes and pseudo-elements add interactivity and styling without extra HTML.',
        codeExample: {
          title: 'Pseudo Classes and Elements',
          language: 'css',
          explanation: 'Interactive states and generated content',
          code: `/* Pseudo-classes */
a:hover { color: red; }
input:focus { border-color: blue; }
button:active { transform: scale(0.95); }

/* Pseudo-elements */
p::before { content: "→ "; }
p::after { content: " ←"; }
.tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
}`
        }
      },
      {
        title: 'Learning CSS Transitions',
        content: 'Smooth animations between property changes.',
        codeExample: {
          title: 'CSS Transitions',
          language: 'css',
          explanation: 'Animate property changes smoothly',
          code: `.button {
  background-color: blue;
  transition: all 0.3s ease-in-out;
}

.button:hover {
  background-color: red;
  transform: scale(1.1);
}`
        }
      }
    ]
  },
  {
    title: 'Responsive with CSS 🖥️',
    introduction: 'Create responsive designs that work across all devices using modern CSS techniques.',
    subsections: [
      {
        title: 'Mobile-first vs Desktop-first approach',
        content: 'Understanding different responsive design strategies.',
        points: [
          'Mobile-first: Start with mobile styles, add desktop features',
          'Desktop-first: Start with desktop, adapt for mobile',
          'Mobile-first is generally preferred for performance',
          'Use min-width media queries for mobile-first'
        ]
      },
      {
        title: 'Media queries and responsive units',
        content: 'Use media queries and responsive units for adaptive layouts.',
        codeExample: {
          title: 'Responsive Design',
          language: 'css',
          explanation: 'Media queries and responsive techniques',
          code: `/* Mobile-first approach */
.container {
  width: 100%;
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    max-width: 750px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    padding: 2rem;
  }
}

/* Responsive functions */
.responsive-text {
  font-size: clamp(1rem, 2.5vw, 2rem);
}`
        }
      }
    ]
  }
];

export default additionalCSSSections;
