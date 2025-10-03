export const moduleData = {
  'internet-basics': {
    id: 'internet-basics',
    title: 'Internet Basics',
    sections: [
      {
        title: 'How the Internet Works',
        introduction: 'Understanding the fundamental concepts of how the internet operates, from its history to modern-day communication protocols.',
        subsections: [
          {
            title: 'History of Web (Web 1.0 to Web 3.0)',
            content: 'The evolution of the web from static pages to interactive applications and decentralized systems.',
            points: [
              'Web 1.0 (1990s): Static websites with read-only content',
              'Web 2.0 (2000s): Interactive web with user-generated content, social media',
              'Web 3.0 (2010s+): Semantic web, AI integration, decentralized applications'
            ]
          },
          {
            title: 'How Computers Communicate',
            content: 'Computers communicate through standardized protocols and network infrastructure.',
            points: [
              'Data is broken into packets for transmission',
              'Each packet contains source and destination information',
              'Routers direct packets through the most efficient path',
              'Packets are reassembled at the destination'
            ]
          },
          {
            title: 'Global Data Transmission',
            content: 'Data travels across the world through a complex network of cables, satellites, and wireless connections.',
            points: [
              'Undersea cables carry 99% of international internet traffic',
              'Fiber optic cables use light pulses to transmit data',
              'Satellite connections provide coverage to remote areas',
              'Data centers act as major hubs for internet traffic'
            ]
          }
        ],
        practiceTasks: [
          {
            title: 'Trace a Website Request',
            description: 'Use command line tools to trace the path of a web request.',
            steps: [
              'Open command prompt or terminal',
              'Type "tracert google.com" (Windows) or "traceroute google.com" (Mac/Linux)',
              'Observe the different hops your request takes',
              'Note the IP addresses and response times'
            ],
            hint: 'Each line represents a router or server your request passes through.'
          }
        ]
      },
      {
        title: 'Domain Names, IP & MAC Addresses',
        introduction: 'Learn about the addressing systems that make internet communication possible.',
        subsections: [
          {
            title: 'Domain Names',
            content: 'Human-readable addresses that map to IP addresses.',
            points: [
              'Domain names like google.com are easier to remember than IP addresses',
              'Top-level domains (TLD): .com, .org, .net, .edu',
              'Subdomains: www.google.com, mail.google.com',
              'Domain registration is managed by registrars'
            ]
          },
          {
            title: 'IP Addresses',
            content: 'Unique numerical identifiers for devices on a network.',
            points: [
              'IPv4: 32-bit addresses (e.g., 192.168.1.1)',
              'IPv6: 128-bit addresses for more devices',
              'Public vs Private IP addresses',
              'Static vs Dynamic IP assignment'
            ]
          },
          {
            title: 'MAC Addresses',
            content: 'Hardware-level identifiers for network interfaces.',
            points: [
              'Media Access Control addresses are unique to each network card',
              '48-bit identifier (e.g., 00:1B:44:11:3A:B7)',
              'Used for local network communication',
              'Cannot be changed (burned into hardware)'
            ]
          }
        ],
        practiceTasks: [
          {
            title: 'Find Your Network Information',
            description: 'Discover your device\'s network identifiers.',
            steps: [
              'Open command prompt',
              'Type "ipconfig /all" (Windows) or "ifconfig" (Mac/Linux)',
              'Find your IP address, subnet mask, and MAC address',
              'Use "nslookup google.com" to see IP resolution'
            ]
          }
        ]
      },
      {
        title: 'Client-Server Architecture',
        introduction: 'Understanding the fundamental model of web communication between clients and servers.',
        subsections: [
          {
            title: 'Client-Server Model',
            content: 'A distributed computing architecture where clients request services from servers.',
            points: [
              'Client: Device that requests services (browser, mobile app)',
              'Server: Computer that provides services and resources',
              'Request-Response cycle forms the basis of web communication',
              'Servers can serve multiple clients simultaneously'
            ]
          },
          {
            title: 'Front-end vs Back-end',
            content: 'The division of responsibilities in web applications.',
            points: [
              'Front-end: User interface, runs in the browser (HTML, CSS, JavaScript)',
              'Back-end: Server logic, database operations, APIs',
              'Front-end handles user interactions and display',
              'Back-end processes data and business logic'
            ]
          },
          {
            title: 'Static vs Dynamic Websites',
            content: 'Different approaches to serving web content.',
            points: [
              'Static: Pre-built HTML files served as-is',
              'Dynamic: Content generated on-the-fly based on user requests',
              'Static sites are faster but less interactive',
              'Dynamic sites can personalize content and handle user data'
            ]
          }
        ]
      },
      {
        title: 'Internet Protocols',
        introduction: 'The communication protocols that enable reliable data transmission across networks.',
        subsections: [
          {
            title: 'TCP Protocol',
            content: 'Transmission Control Protocol ensures reliable, ordered data delivery.',
            points: [
              'Connection-oriented protocol',
              'Guarantees data delivery and order',
              'Error checking and correction',
              'Used for web browsing, email, file transfer'
            ]
          },
          {
            title: 'TCP Three-Way Handshake',
            content: 'The process of establishing a TCP connection.',
            points: [
              'SYN: Client requests connection',
              'SYN-ACK: Server acknowledges and responds',
              'ACK: Client confirms connection established',
              'Connection is now ready for data transfer'
            ]
          },
          {
            title: 'UDP Protocol',
            content: 'User Datagram Protocol for fast, connectionless communication.',
            points: [
              'Connectionless protocol',
              'No guarantee of delivery or order',
              'Lower overhead, faster transmission',
              'Used for streaming, gaming, DNS queries'
            ]
          }
        ]
      },
      {
        title: 'HTTP & HTTPS',
        introduction: 'The protocols that power web communication and security.',
        subsections: [
          {
            title: 'HTTP Protocol',
            content: 'HyperText Transfer Protocol for web communication.',
            points: [
              'Application layer protocol built on TCP',
              'Stateless: each request is independent',
              'HTTP/1.1, HTTP/2, HTTP/3 versions',
              'Uses methods: GET, POST, PUT, DELETE'
            ]
          },
          {
            title: 'HTTP Status Codes',
            content: 'Standardized response codes indicating request results.',
            points: [
              '200 OK: Successful request',
              '404 Not Found: Resource not available',
              '500 Internal Server Error: Server problem',
              '301 Moved Permanently: Resource relocated'
            ]
          },
          {
            title: 'HTTPS Security',
            content: 'HTTP Secure adds encryption for safe communication.',
            points: [
              'SSL/TLS encryption protects data in transit',
              'Prevents eavesdropping and tampering',
              'Certificate authorities verify server identity',
              'Required for sensitive data transmission'
            ]
          }
        ]
      }
    ]
  },

  'html': {
    id: 'html',
    title: 'HTML',
    sections: [
      {
        title: 'Starting with HTML',
        introduction: 'HTML (HyperText Markup Language) is the foundation of web pages, providing structure and content through elements and tags.',
        subsections: [
          {
            title: 'Understanding HTML',
            content: 'HTML is a markup language that uses tags to structure content on web pages.',
            points: [
              'HTML stands for HyperText Markup Language',
              'It provides structure and meaning to web content',
              'Uses tags to define different types of content',
              'Forms the skeleton of every web page'
            ]
          },
          {
            title: 'HTML Structure',
            content: 'Every HTML document follows a standard structure with essential elements.',
            codeExample: {
              title: 'Basic HTML Structure',
              language: 'html',
              explanation: 'This is the basic structure every HTML page should have. The DOCTYPE declares the HTML version, html is the root element, head contains metadata, and body contains visible content.',
              code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Page</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>Welcome to my first HTML page!</p>
</body>
</html>`
            }
          },
          {
            title: 'Essential HTML Tags',
            content: 'Core HTML tags that form the foundation of web pages.',
            points: [
              '<!DOCTYPE html>: Declares HTML5 document type',
              '<html>: Root element of the page',
              '<head>: Contains metadata and page information',
              '<title>: Sets the page title shown in browser tab',
              '<body>: Contains all visible page content'
            ]
          }
        ],
        codeExamples: [
          {
            title: 'Simple HTML Page',
            language: 'html',
            explanation: 'A complete HTML page with proper structure and basic content elements.',
            code: `<!DOCTYPE html>
<html>
<head>
    <title>Welcome Page</title>
</head>
<body>
    <h1>Welcome to Web Development</h1>
    <p>This is your first step into creating websites!</p>
</body>
</html>`
          }
        ],
        practiceTasks: [
          {
            title: 'Create Your First HTML Page',
            description: 'Build a simple HTML page about yourself.',
            steps: [
              'Create a new file called "index.html"',
              'Add the basic HTML structure',
              'Include a title with your name',
              'Add a heading and paragraph about yourself',
              'Open the file in your browser'
            ],
            hint: 'Remember to save the file with .html extension and use proper indentation.',
            solution: `<!DOCTYPE html>
<html>
<head>
    <title>About Me</title>
</head>
<body>
    <h1>John Doe</h1>
    <p>I am learning web development and this is my first HTML page!</p>
</body>
</html>`
          }
        ]
      },
      {
        title: 'Text Elements & Lists',
        introduction: 'Learn how to structure and format text content using HTML elements for headings, paragraphs, and lists.',
        subsections: [
          {
            title: 'Heading Tags (h1-h6)',
            content: 'HTML provides six levels of headings for organizing content hierarchy.',
            codeExample: {
              title: 'HTML Headings',
              language: 'html',
              explanation: 'Headings create a hierarchy of content. h1 is the most important, h6 is the least. Use them to structure your content logically.',
              code: `<h1>Main Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>
<h4>Sub-subsection</h4>
<h5>Minor Heading</h5>
<h6>Smallest Heading</h6>`
            }
          },
          {
            title: 'Paragraph and Text Elements',
            content: 'Various HTML elements for different types of text content.',
            codeExample: {
              title: 'Text Elements',
              language: 'html',
              explanation: 'Different HTML elements serve different purposes for text content. Each has semantic meaning.',
              code: `<p>This is a paragraph of text.</p>
<br><!-- Line break -->
<span>Inline text element</span>
<code>console.log("Hello World");</code>
<pre>
    Preformatted text
    preserves    spaces
    and line breaks
</pre>`
            }
          },
          {
            title: 'HTML Lists',
            content: 'Organize information using ordered and unordered lists.',
            codeExample: {
              title: 'HTML Lists',
              language: 'html',
              explanation: 'Lists help organize related items. Use ul for bullet points, ol for numbered lists.',
              code: `<!-- Unordered List -->
<ul>
    <li>HTML</li>
    <li>CSS</li>
    <li>JavaScript</li>
</ul>

<!-- Ordered List -->
<ol>
    <li>Learn HTML</li>
    <li>Learn CSS</li>
    <li>Learn JavaScript</li>
</ol>

<!-- Nested Lists -->
<ul>
    <li>Frontend
        <ul>
            <li>HTML</li>
            <li>CSS</li>
        </ul>
    </li>
    <li>Backend</li>
</ul>`
            }
          },
          {
            title: 'Links and Navigation',
            content: 'Create hyperlinks to connect pages and external resources.',
            codeExample: {
              title: 'HTML Links',
              language: 'html',
              explanation: 'Links are created with the anchor tag. The href attribute specifies the destination.',
              code: `<!-- External link -->
<a href="https://google.com">Visit Google</a>

<!-- Link to another page -->
<a href="about.html">About Us</a>

<!-- Link with target attribute -->
<a href="https://github.com" target="_blank">GitHub (New Tab)</a>

<!-- Email link -->
<a href="mailto:contact@example.com">Send Email</a>`
            }
          }
        ],
        practiceTasks: [
          {
            title: 'Create a Recipe Page',
            description: 'Build an HTML page for your favorite recipe using headings, paragraphs, and lists.',
            steps: [
              'Create a new HTML file called "recipe.html"',
              'Add a main heading with the recipe name',
              'Create an ingredients section with an unordered list',
              'Add an instructions section with an ordered list',
              'Include a paragraph describing the dish'
            ],
            hint: 'Use h1 for the recipe name, h2 for sections, and appropriate list types for ingredients and steps.'
          }
        ]
      },
      {
        title: 'Media Tags & Attributes',
        introduction: 'Learn how to embed images, videos, and audio content in your web pages using HTML media elements.',
        subsections: [
          {
            title: 'Images',
            content: 'Display images on your web page with proper attributes.',
            codeExample: {
              title: 'HTML Images',
              language: 'html',
              explanation: 'The img tag embeds images. Always include alt text for accessibility and SEO.',
              code: `<!-- Basic image -->
<img src="photo.jpg" alt="A beautiful sunset">

<!-- Image with dimensions -->
<img src="logo.png" alt="Company Logo" width="200" height="100">

<!-- Responsive image -->
<img src="banner.jpg" alt="Website Banner" style="max-width: 100%; height: auto;">

<!-- Image with link -->
<a href="gallery.html">
    <img src="thumbnail.jpg" alt="Photo Gallery">
</a>`
            }
          },
          {
            title: 'Audio Elements',
            content: 'Embed audio content with HTML5 audio elements.',
            codeExample: {
              title: 'HTML Audio',
              language: 'html',
              explanation: 'The audio element provides native audio playback with various control options.',
              code: `<!-- Basic audio with controls -->
<audio controls>
    <source src="music.mp3" type="audio/mpeg">
    <source src="music.ogg" type="audio/ogg">
    Your browser does not support audio.
</audio>

<!-- Audio with additional attributes -->
<audio controls autoplay muted loop>
    <source src="background.mp3" type="audio/mpeg">
</audio>`
            }
          },
          {
            title: 'Video Elements',
            content: 'Embed video content with HTML5 video elements.',
            codeExample: {
              title: 'HTML Video',
              language: 'html',
              explanation: 'The video element provides native video playback with comprehensive control options.',
              code: `<!-- Basic video with controls -->
<video controls width="640" height="360">
    <source src="movie.mp4" type="video/mp4">
    <source src="movie.webm" type="video/webm">
    Your browser does not support video.
</video>

<!-- Video with poster and attributes -->
<video controls poster="thumbnail.jpg" width="100%">
    <source src="demo.mp4" type="video/mp4">
</video>`
            }
          },
          {
            title: 'Media Attributes',
            content: 'Important attributes for controlling media behavior.',
            points: [
              'src: Source file path or URL',
              'alt: Alternative text for images (accessibility)',
              'width/height: Dimensions in pixels',
              'controls: Show playback controls for audio/video',
              'autoplay: Start playing automatically (use carefully)',
              'loop: Repeat playback continuously',
              'muted: Start with audio muted',
              'poster: Thumbnail image for videos'
            ]
          }
        ],
        practiceTasks: [
          {
            title: 'Create a Media Gallery',
            description: 'Build a page showcasing different types of media content.',
            steps: [
              'Create an HTML page with a gallery layout',
              'Add at least 3 images with proper alt text',
              'Include an audio element with controls',
              'Add a video element with a poster image',
              'Use appropriate dimensions for all media'
            ],
            hint: 'You can use placeholder services like https://via.placeholder.com/300x200 for images.'
          }
        ]
      },
      {
        title: 'Forms and Semantic HTML',
        introduction: 'Master HTML forms for user input and learn semantic HTML elements for better structure and accessibility.',
        subsections: [
          {
            title: 'HTML Forms Basics',
            content: 'Forms allow users to input and submit data to web servers.',
            codeExample: {
              title: 'Basic HTML Form',
              language: 'html',
              explanation: 'Forms collect user input through various input elements. The form tag wraps all form elements.',
              code: `<form action="/submit" method="POST">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>
    
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
    
    <label for="message">Message:</label>
    <textarea id="message" name="message" rows="4"></textarea>
    
    <button type="submit">Send Message</button>
</form>`
            }
          },
          {
            title: 'Input Types',
            content: 'HTML5 provides various input types for different data formats.',
            codeExample: {
              title: 'HTML Input Types',
              language: 'html',
              explanation: 'Different input types provide appropriate keyboards and validation on mobile devices.',
              code: `<!-- Text inputs -->
<input type="text" placeholder="Your name">
<input type="email" placeholder="email@example.com">
<input type="password" placeholder="Password">
<input type="tel" placeholder="Phone number">

<!-- Number and date inputs -->
<input type="number" min="1" max="100">
<input type="date">
<input type="time">
<input type="range" min="0" max="100" value="50">

<!-- Selection inputs -->
<input type="checkbox" id="agree">
<input type="radio" name="size" value="small">
<input type="file" accept="image/*">

<!-- Color picker -->
<input type="color" value="#ff0000">`
            }
          },
          {
            title: 'Form Elements',
            content: 'Additional form elements for complex user interfaces.',
            codeExample: {
              title: 'Advanced Form Elements',
              language: 'html',
              explanation: 'Select dropdowns and textareas provide more input options for users.',
              code: `<!-- Dropdown select -->
<select name="country">
    <option value="">Choose a country</option>
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="ca">Canada</option>
</select>

<!-- Multi-select -->
<select name="skills" multiple>
    <option value="html">HTML</option>
    <option value="css">CSS</option>
    <option value="js">JavaScript</option>
</select>

<!-- Textarea for long text -->
<textarea name="bio" rows="5" cols="40" placeholder="Tell us about yourself..."></textarea>

<!-- Fieldset for grouping -->
<fieldset>
    <legend>Personal Information</legend>
    <input type="text" name="firstName" placeholder="First Name">
    <input type="text" name="lastName" placeholder="Last Name">
</fieldset>`
            }
          },
          {
            title: 'Semantic HTML Elements',
            content: 'HTML5 semantic elements provide meaning and structure to web content.',
            codeExample: {
              title: 'Semantic HTML Structure',
              language: 'html',
              explanation: 'Semantic elements clearly describe their meaning to both browsers and developers.',
              code: `<header>
    <nav>
        <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </nav>
</header>

<main>
    <article>
        <header>
            <h1>Article Title</h1>
            <time datetime="2024-01-01">January 1, 2024</time>
        </header>
        <section>
            <h2>Introduction</h2>
            <p>Article content goes here...</p>
        </section>
    </article>
    
    <aside>
        <h3>Related Links</h3>
        <ul>
            <li><a href="#">Link 1</a></li>
            <li><a href="#">Link 2</a></li>
        </ul>
    </aside>
</main>

<footer>
    <p>&copy; 2024 My Website. All rights reserved.</p>
</footer>`
            }
          }
        ],
        practiceTasks: [
          {
            title: 'Build a Contact Form',
            description: 'Create a comprehensive contact form with validation and semantic structure.',
            steps: [
              'Create a contact page with semantic HTML structure',
              'Build a form with name, email, subject, and message fields',
              'Add appropriate input types and validation attributes',
              'Include a submit button and reset button',
              'Use proper labels and accessibility features'
            ],
            hint: 'Use the "required" attribute for validation and "for" attribute on labels to connect them to inputs.'
          }
        ]
      }
    ]
  },

  'css': {
    id: 'css',
    title: 'CSS',
    sections: [
      {
        title: 'Basics of CSS (Cascading Style Sheet)',
        introduction: 'CSS is used to style and layout web pages. Learn the fundamentals of CSS syntax, selectors, and how to add styling to HTML.',
        subsections: [
          {
            title: 'Introduction to CSS and Why it is important',
            content: 'CSS separates presentation from content, making websites more maintainable and visually appealing.',
            points: [
              'CSS controls the visual appearance of web pages',
              'Separates content (HTML) from presentation (CSS)',
              'Enables responsive design and consistent styling',
              'Reduces code duplication and improves maintainability'
            ]
          },
          {
            title: 'Understanding Syntax, Selectors and comments in CSS',
            content: 'CSS uses selectors to target HTML elements and apply styles using property-value pairs.',
            codeExample: {
              title: 'CSS Syntax and Selectors',
              language: 'css',
              explanation: 'CSS rules consist of selectors and declaration blocks. Different selectors target different elements.',
              code: `/* CSS Comment */
/* Element selector */
h1 { color: blue; font-size: 24px; }

/* Class selector */
.highlight { background-color: yellow; }

/* ID selector */
#header { margin-top: 20px; }

/* Understanding precedence: ID > Class > Element */
#main-title { color: red; }     /* Highest priority */
.title { color: green; }        /* Medium priority */
h1 { color: blue; }            /* Lowest priority */`
            }
          },
          {
            title: 'Adding CSS to HTML Page - Inline, Internal, External',
            content: 'Three methods to add CSS: inline (highest priority), internal (page-specific), external (best practice).',
            codeExample: {
              title: 'CSS Integration Methods',
              language: 'html',
              explanation: 'External CSS is preferred for maintainability and performance.',
              code: `<!-- Inline CSS (Highest Priority) -->
<p style="color: red; font-size: 16px;">Inline styled text</p>

<!-- Internal CSS -->
<head>
    <style>
        .blue-text { color: blue; font-weight: bold; }
    </style>
</head>

<!-- External CSS (Best Practice) -->
<head>
    <link rel="stylesheet" href="styles.css">
</head>`
            }
          },
          {
            title: 'How to style text using CSS',
            content: 'CSS provides comprehensive text styling properties for typography control.',
            codeExample: {
              title: 'Text Styling Properties',
              language: 'css',
              explanation: 'Complete text styling options for beautiful typography.',
              code: `.styled-text {
    font-family: 'Arial', sans-serif;
    font-size: 18px;
    font-weight: bold;
    font-style: italic;
    line-height: 1.5;
    text-decoration: underline;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
    word-spacing: 4px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}`
            }
          }
        ]
      },
      {
        title: 'Styling With CSS',
        introduction: 'Learn advanced styling techniques including colors, units, borders, box model, and backgrounds.',
        subsections: [
          {
            title: 'Working with colors in CSS',
            content: 'CSS supports multiple color formats for flexible styling options.',
            codeExample: {
              title: 'CSS Color Formats',
              language: 'css',
              explanation: 'Different ways to define colors in CSS with examples.',
              code: `.color-examples {
    /* Named colors */
    color: red;
    
    /* Hexadecimal */
    background-color: #3498db;
    
    /* RGB */
    border-color: rgb(52, 152, 219);
    
    /* RGBA (with transparency) */
    box-shadow: 0 0 10px rgba(52, 152, 219, 0.8);
    
    /* HSL */
    outline-color: hsl(204, 70%, 53%);
}`
            }
          },
          {
            title: 'Working with CSS units and Box Model',
            content: 'Understanding different CSS units and the box model properties.',
            codeExample: {
              title: 'CSS Units and Box Model',
              language: 'css',
              explanation: 'Different units and box model properties for responsive design.',
              code: `.box-model-example {
    /* CSS Units */
    width: 300px;           /* Fixed pixels */
    height: 50%;           /* Relative to parent */
    font-size: 1.2rem;     /* Relative to root font-size */
    margin: 2em;           /* Relative to element font-size */
    
    /* Viewport units */
    min-height: 100vh;     /* Full viewport height */
    max-width: 90vw;       /* 90% of viewport width */
    
    /* Box Model Properties */
    margin: 20px 15px 10px 5px;    /* top right bottom left */
    padding: 15px;                  /* All sides */
    border: 2px solid #333;
    box-sizing: border-box;         /* Include padding/border in width */
}`
            }
          },
          {
            title: 'Background properties and borders',
            content: 'Advanced background styling and border techniques.',
            codeExample: {
              title: 'Backgrounds and Borders',
              language: 'css',
              explanation: 'Comprehensive background and border styling options.',
              code: `.advanced-styling {
    /* Border styling */
    border: 3px solid #333;
    border-radius: 10px;
    border-style: dashed dotted solid double;
    
    /* Background properties */
    background-image: url('image.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    
    /* Gradient backgrounds */
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    
    /* Box shadow */
    box-shadow: 0 4px 8px rgba(0,0,0,0.1), 0 6px 20px rgba(0,0,0,0.15);
}`
            }
          }
        ]
      },
      {
        title: 'More about CSS',
        introduction: 'Advanced CSS concepts including display properties, flexbox, grid, positioning, and advanced selectors.',
        subsections: [
          {
            title: 'Applying display properties - inline, grid, flex, none, inline-block, etc.',
            content: 'Display property controls how elements are rendered and positioned in the document flow.',
            codeExample: {
              title: 'Display Properties',
              language: 'css',
              explanation: 'Different display values change how elements behave and interact with other elements.',
              code: `.display-examples {
    /* Block elements take full width */
    display: block;
    
    /* Inline elements flow with text */
    display: inline;
    
    /* Inline-block combines both behaviors */
    display: inline-block;
    
    /* Flexbox for flexible layouts */
    display: flex;
    
    /* Grid for 2D layouts */
    display: grid;
    
    /* Hide element completely */
    display: none;
}`
            }
          },
          {
            title: 'Introduction to FlexBox for aligning and structure',
            content: 'Flexbox provides powerful one-dimensional layout capabilities with flexible alignment options.',
            codeExample: {
              title: 'Complete Flexbox Guide',
              language: 'css',
              explanation: 'Flexbox properties for creating flexible and responsive layouts.',
              code: `.flex-container {
    display: flex;
    flex-direction: row;        /* row, column, row-reverse, column-reverse */
    flex-wrap: wrap;           /* nowrap, wrap, wrap-reverse */
    justify-content: space-between; /* flex-start, center, space-around, space-evenly */
    align-items: center;       /* flex-start, flex-end, center, stretch, baseline */
    align-content: space-around; /* For wrapped items */
}

.flex-item {
    flex: 1;                   /* Shorthand for flex-grow, flex-shrink, flex-basis */
    flex-grow: 1;             /* How much item should grow */
    flex-shrink: 0;           /* How much item should shrink */
    flex-basis: auto;         /* Initial size before free space distribution */
    align-self: flex-end;     /* Override align-items for individual item */
    order: 2;                 /* Change visual order */
}`
            }
          },
          {
            title: 'Understanding CSS Grid for making grids',
            content: 'CSS Grid provides two-dimensional layout system for complex grid-based designs.',
            codeExample: {
              title: 'CSS Grid Layout',
              language: 'css',
              explanation: 'Grid properties for creating sophisticated 2D layouts.',
              code: `.grid-container {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;    /* Fractional units */
    grid-template-rows: auto 1fr auto;
    grid-gap: 20px;                        /* Gap between items */
    grid-template-areas: 
        "header header header"
        "sidebar main aside"
        "footer footer footer";
}

.grid-item {
    grid-column: 1 / 3;                    /* Span from column 1 to 3 */
    grid-row: 2 / 4;                       /* Span from row 2 to 4 */
    grid-area: header;                     /* Use named area */
}`
            }
          },
          {
            title: 'Working with positional properties and overflow',
            content: 'CSS positioning and overflow properties for precise element placement and content management.',
            codeExample: {
              title: 'Positioning and Overflow',
              language: 'css',
              explanation: 'Different positioning schemes and overflow handling techniques.',
              code: `.positioning-examples {
    /* Static: Default positioning */
    position: static;
    
    /* Relative: Positioned relative to normal position */
    position: relative;
    top: 10px;
    left: 20px;
    
    /* Absolute: Positioned relative to nearest positioned ancestor */
    position: absolute;
    top: 0;
    right: 0;
    
    /* Fixed: Positioned relative to viewport */
    position: fixed;
    bottom: 20px;
    right: 20px;
    
    /* Sticky: Toggles between relative and fixed */
    position: sticky;
    top: 0;
}

.overflow-examples {
    overflow: visible;    /* Default - content not clipped */
    overflow: hidden;     /* Content clipped, no scrollbars */
    overflow: scroll;     /* Always show scrollbars */
    overflow: auto;       /* Scrollbars only when needed */
}`
            }
          },
          {
            title: 'Working with Grouping and Nested Selectors',
            content: 'Advanced selector techniques for efficient and maintainable CSS.',
            codeExample: {
              title: 'Advanced Selectors',
              language: 'css',
              explanation: 'Grouping selectors and nesting for better organization and specificity.',
              code: `/* Grouping Selectors */
h1, h2, h3, h4, h5, h6 {
    font-family: 'Arial', sans-serif;
    margin-bottom: 1rem;
}

/* Descendant Selectors (Nested) */
.navbar ul {
    list-style: none;
}

.navbar ul li {
    display: inline-block;
}

.navbar ul li a {
    text-decoration: none;
    padding: 10px 15px;
}

/* Child Selector (Direct children only) */
.menu > li {
    border-bottom: 1px solid #ccc;
}

/* Adjacent Sibling Selector */
h2 + p {
    margin-top: 0;
}

/* Attribute Selectors */
input[type="email"] {
    border: 2px solid blue;
}

a[href^="https"] {
    color: green;
}`
            }
          }
        ]
      },
      {
        title: 'Interesting things about CSS ✌️',
        introduction: 'Explore pseudo-classes, transitions, transforms, and animations to create engaging and interactive user experiences.',
        subsections: [
          {
            title: 'Applying pseudo classes and Pseudo Elements',
            content: 'Pseudo-classes and pseudo-elements add interactivity and styling without extra HTML elements.',
            codeExample: {
              title: 'Pseudo Classes and Elements',
              language: 'css',
              explanation: 'Interactive states and generated content for enhanced user experience.',
              code: `/* Pseudo-classes for interactive states */
a:hover {
    color: red;
    text-decoration: underline;
}

input:focus {
    border-color: blue;
    outline: 2px solid lightblue;
}

button:active {
    transform: scale(0.95);
}

li:nth-child(odd) {
    background-color: #f0f0f0;
}

li:first-child {
    font-weight: bold;
}

li:last-child {
    border-bottom: none;
}

/* Pseudo-elements for generated content */
.quote::before {
    content: """;
    font-size: 2em;
    color: #666;
}

.quote::after {
    content: """;
    font-size: 2em;
    color: #666;
}

.tooltip::after {
    content: attr(data-tooltip);
    position: absolute;
    background: black;
    color: white;
    padding: 5px;
    border-radius: 3px;
}`
            }
          },
          {
            title: 'Learning CSS Transitions',
            content: 'CSS transitions provide smooth animations between property changes for better user experience.',
            codeExample: {
              title: 'CSS Transitions',
              language: 'css',
              explanation: 'Smooth property changes with timing functions and delays.',
              code: `.transition-examples {
    /* Basic transition */
    transition: all 0.3s ease;
    
    /* Specific property transitions */
    transition: color 0.2s ease-in-out,
                background-color 0.3s ease,
                transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    /* Transition with delay */
    transition: opacity 0.5s ease 0.2s;
}

.button {
    background-color: blue;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    transition: all 0.3s ease;
}

.button:hover {
    background-color: darkblue;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* Timing functions */
.ease-in { transition-timing-function: ease-in; }
.ease-out { transition-timing-function: ease-out; }
.ease-in-out { transition-timing-function: ease-in-out; }
.linear { transition-timing-function: linear; }`
            }
          },
          {
            title: 'Creating with Transform (2D and 3D)',
            content: 'CSS transforms allow you to rotate, scale, move, and skew elements in 2D and 3D space.',
            codeExample: {
              title: '2D and 3D Transforms',
              language: 'css',
              explanation: 'Transform functions for moving and manipulating elements in space.',
              code: `/* 2D Transforms */
.transform-2d {
    /* Translate (move) */
    transform: translate(50px, 100px);
    transform: translateX(50px);
    transform: translateY(100px);
    
    /* Rotate */
    transform: rotate(45deg);
    
    /* Scale */
    transform: scale(1.5);
    transform: scaleX(2);
    transform: scaleY(0.5);
    
    /* Skew */
    transform: skew(30deg, 20deg);
    transform: skewX(30deg);
    
    /* Combine multiple transforms */
    transform: translate(50px, 50px) rotate(45deg) scale(1.2);
}

/* 3D Transforms */
.transform-3d {
    /* Enable 3D space */
    transform-style: preserve-3d;
    perspective: 1000px;
    
    /* 3D Translate */
    transform: translate3d(50px, 100px, 200px);
    transform: translateZ(100px);
    
    /* 3D Rotate */
    transform: rotate3d(1, 1, 0, 45deg);
    transform: rotateX(45deg);
    transform: rotateY(45deg);
    transform: rotateZ(45deg);
    
    /* 3D Scale */
    transform: scale3d(1.5, 1.5, 2);
    transform: scaleZ(2);
}`
            }
          },
          {
            title: 'Understanding CSS Animation (@keyframes)',
            content: 'CSS animations using @keyframes provide complex, multi-step animations without JavaScript.',
            codeExample: {
              title: 'CSS Animations with @keyframes',
              language: 'css',
              explanation: 'Create complex animations with keyframes and animation properties.',
              code: `/* Define keyframes */
@keyframes slideIn {
    0% {
        transform: translateX(-100%);
        opacity: 0;
    }
    50% {
        opacity: 0.5;
    }
    100% {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-30px);
    }
    60% {
        transform: translateY(-15px);
    }
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

/* Apply animations */
.animated-element {
    animation: slideIn 1s ease-out;
    animation-delay: 0.5s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-fill-mode: forwards;
    
    /* Shorthand */
    animation: bounce 2s ease-in-out infinite alternate;
}

.loading-spinner {
    animation: pulse 1.5s ease-in-out infinite;
}`
            }
          }
        ]
      },
      {
        title: 'Responsive with CSS 🖥️',
        introduction: 'Create responsive designs that work seamlessly across all devices using modern CSS techniques and best practices.',
        subsections: [
          {
            title: 'Mobile-first vs Desktop-first Website',
            content: 'Understanding different responsive design strategies and their implications for development and performance.',
            points: [
              'Mobile-first: Start with mobile styles, progressively enhance for larger screens',
              'Desktop-first: Start with desktop styles, adapt down for smaller screens',
              'Mobile-first is preferred for performance and user experience',
              'Use min-width media queries for mobile-first approach',
              'Use max-width media queries for desktop-first approach',
              'Mobile-first reduces CSS overrides and improves load times'
            ]
          },
          {
            title: 'Measurement units for Responsive Design',
            content: 'Choose the right units for responsive layouts that adapt to different screen sizes and user preferences.',
            codeExample: {
              title: 'Responsive Units Comparison',
              language: 'css',
              explanation: 'Different units serve different purposes in responsive design.',
              code: `.responsive-units {
    /* Fixed units (avoid for responsive design) */
    width: 300px;        /* Pixels - fixed size */
    margin: 1in;         /* Inches - print media */
    padding: 10mm;       /* Millimeters - print media */
    
    /* Relative units (preferred for responsive) */
    font-size: 1.2rem;   /* Relative to root font-size */
    margin: 2em;         /* Relative to element's font-size */
    width: 80%;          /* Relative to parent width */
    
    /* Viewport units (great for full-screen elements) */
    height: 100vh;       /* 100% of viewport height */
    width: 100vw;        /* 100% of viewport width */
    font-size: 4vw;      /* 4% of viewport width */
    
    /* Modern responsive units */
    font-size: clamp(1rem, 2.5vw, 2rem);  /* Fluid typography */
    width: min(90%, 1200px);               /* Responsive with max limit */
    height: max(300px, 50vh);              /* Minimum height with flexibility */
}`
            }
          },
          {
            title: 'Using Viewport meta element and Media queries',
            content: 'Essential setup for responsive design using viewport meta tag and CSS media queries.',
            codeExample: {
              title: 'Responsive Setup and Media Queries',
              language: 'html',
              explanation: 'Viewport meta tag is crucial for mobile responsiveness.',
              code: `<!-- Essential viewport meta tag -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
/* Mobile-first CSS approach */
.container {
    width: 100%;
    padding: 1rem;
    margin: 0 auto;
}

.grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

/* Tablet styles (min-width: 768px) */
@media (min-width: 768px) {
    .container {
        max-width: 750px;
        padding: 2rem;
    }
    
    .grid {
        grid-template-columns: 1fr 1fr;
    }
}

/* Desktop styles (min-width: 1024px) */
@media (min-width: 1024px) {
    .container {
        max-width: 1200px;
    }
    
    .grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* Large desktop (min-width: 1440px) */
@media (min-width: 1440px) {
    .container {
        max-width: 1400px;
        padding: 3rem;
    }
}
</style>`
            }
          },
          {
            title: 'Setting up Images and Typography for Responsiveness',
            content: 'Make images and text adapt beautifully to different screen sizes and resolutions.',
            codeExample: {
              title: 'Responsive Images and Typography',
              language: 'css',
              explanation: 'Techniques for flexible images and scalable typography.',
              code: `/* Responsive Images */
.responsive-image {
    max-width: 100%;
    height: auto;
    display: block;
}

.hero-image {
    width: 100%;
    height: 50vh;
    object-fit: cover;
    object-position: center;
}

/* Responsive Typography */
.fluid-typography {
    /* Fluid font sizes using clamp() */
    font-size: clamp(1rem, 2.5vw, 2.5rem);
    line-height: clamp(1.2, 1.5vw, 1.6);
}

.responsive-headings {
    /* Base mobile size */
    font-size: 1.5rem;
    line-height: 1.3;
}

@media (min-width: 768px) {
    .responsive-headings {
        font-size: 2rem;
    }
}

@media (min-width: 1024px) {
    .responsive-headings {
        font-size: 2.5rem;
        line-height: 1.2;
    }
}

/* Modern CSS functions for responsiveness */
.modern-responsive {
    /* Clamp for fluid sizing */
    width: clamp(300px, 50vw, 800px);
    padding: clamp(1rem, 3vw, 3rem);
    
    /* Min/Max for constraints */
    font-size: max(1rem, 2vw);
    margin: min(2rem, 5vw);
}`
            }
          },
          {
            title: 'Understanding HTML structure for Responsive Design',
            content: 'Proper HTML structure is foundation for effective responsive design implementation.',
            codeExample: {
              title: 'Responsive HTML Structure',
              language: 'html',
              explanation: 'Semantic HTML structure that supports responsive CSS effectively.',
              code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Page</title>
</head>
<body>
    <!-- Flexible container structure -->
    <div class="container">
        <header class="header">
            <nav class="navigation">
                <ul class="nav-list">
                    <li><a href="#home">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>
        </header>
        
        <main class="main-content">
            <section class="hero">
                <h1 class="hero-title">Responsive Design</h1>
                <p class="hero-subtitle">Works on all devices</p>
            </section>
            
            <section class="content-grid">
                <article class="card">
                    <img src="image.jpg" alt="Description" class="card-image">
                    <div class="card-content">
                        <h2 class="card-title">Card Title</h2>
                        <p class="card-text">Card description text.</p>
                    </div>
                </article>
                <!-- More cards... -->
            </section>
        </main>
        
        <footer class="footer">
            <p>&copy; 2024 Responsive Website</p>
        </footer>
    </div>
</body>
</html>`
            }
          }
        ],
        practiceTasks: [
          {
            title: 'Build a Responsive Card Layout',
            description: 'Create a responsive card grid that adapts from 1 column on mobile to 3 columns on desktop.',
            steps: [
              'Create HTML structure with container and card elements',
              'Apply mobile-first CSS with single column layout',
              'Add media queries for tablet (2 columns) and desktop (3 columns)',
              'Make images responsive and add hover effects',
              'Test on different screen sizes and devices'
            ],
            hint: 'Use CSS Grid with grid-template-columns and media queries. Don\'t forget the viewport meta tag!',
            solution: `/* Mobile-first responsive cards */
.card-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
}

.card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
}

@media (min-width: 768px) {
    .card-container {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024px) {
    .card-container {
        grid-template-columns: repeat(3, 1fr);
        max-width: 1200px;
        margin: 0 auto;
    }
}`
          }
        ]
      }
    ]
  },

  'javascript': {
    id: 'javascript',
    title: 'JavaScript',
    sections: [
      {
        title: 'Basics of Javascript with ES6+ Features 🚀',
        introduction: 'JavaScript is the programming language of the web. Learn modern ES6+ features and fundamental concepts.',
        subsections: [
          {
            title: 'Introduction to JavaScript and Why it is Important',
            content: 'JavaScript makes websites interactive and dynamic, running in browsers and servers.',
            points: [
              'JavaScript adds interactivity to web pages',
              'Runs in browsers (client-side) and servers (Node.js)',
              'Essential for modern web development',
              'Used for web apps, mobile apps, and desktop applications',
              'Large ecosystem with frameworks like React, Vue, Angular'
            ]
          },
          {
            title: 'Variables and Data Types in JavaScript',
            content: 'Understanding how to store and work with different types of data in JavaScript.',
            codeExample: {
              title: 'Variables and Data Types',
              language: 'javascript',
              explanation: 'Modern JavaScript variable declarations and data types.',
              code: `// Variable declarations (ES6+)
let name = "John";           // Block-scoped, can be reassigned
const age = 25;              // Block-scoped, cannot be reassigned
var city = "New York";       // Function-scoped (avoid in modern JS)

// Data Types
// Primitive types
let number = 42;             // Number
let text = "Hello World";    // String
let isActive = true;         // Boolean
let nothing = null;          // Null
let notDefined;              // Undefined
let symbol = Symbol('id');   // Symbol (ES6)
let bigNum = 123n;          // BigInt (ES2020)

// Non-primitive types
let array = [1, 2, 3, 4];           // Array
let object = {                      // Object
  name: "John",
  age: 25,
  hobbies: ["reading", "coding"]
};

// Template strings (ES6)
let greeting = \`Hello, my name is \${name} and I'm \${age} years old.\`;

// Logging and debugging
console.log("Basic log");
console.info("Information");
console.warn("Warning message");
console.error("Error message");

// User interaction
alert("Hello User!");
let userInput = prompt("Enter your name:");
let confirmed = confirm("Are you sure?");`
            }
          },
          {
            title: 'Working with Strings and Basic Operations',
            content: 'String methods and operations for text manipulation in JavaScript.',
            codeExample: {
              title: 'String Methods and Operations',
              language: 'javascript',
              explanation: 'Essential string methods for text processing.',
              code: `let text = "JavaScript is Amazing";

// String methods
console.log(text.length);              // 20
console.log(text.toLowerCase());       // "javascript is amazing"
console.log(text.toUpperCase());       // "JAVASCRIPT IS AMAZING"

// Searching in strings
console.log(text.includes("Script"));  // true
console.log(text.indexOf("Script"));   // 4
console.log(text.startsWith("Java"));  // true
console.log(text.endsWith("ing"));     // true

// Extracting parts
console.log(text.slice(0, 10));       // "JavaScript"
console.log(text.substring(4, 10));   // "Script"
console.log(text.substr(4, 6));       // "Script" (deprecated)

// Splitting and joining
let words = text.split(" ");           // ["JavaScript", "is", "Amazing"]
console.log(words.join("-"));          // "JavaScript-is-Amazing"

// Replacing text
console.log(text.replace("Amazing", "Awesome")); // "JavaScript is Awesome"
console.log(text.replaceAll("a", "@"));          // "J@v@Script is @m@zing"

// Template literals (ES6)
let name = "Developer";
let message = \`Welcome \${name}!
This is a multi-line
template string.\`;

// String padding (ES2017)
let num = "5";
console.log(num.padStart(3, "0"));     // "005"
console.log(num.padEnd(3, "0"));       // "500"`
            }
          },
          {
            title: 'Operators and Expressions in JavaScript',
            content: 'Understanding different types of operators and how to use them effectively.',
            codeExample: {
              title: 'JavaScript Operators',
              language: 'javascript',
              explanation: 'Complete guide to JavaScript operators and their usage.',
              code: `// Arithmetic Operators
let a = 10, b = 3;
console.log(a + b);    // 13 (Addition)
console.log(a - b);    // 7  (Subtraction)
console.log(a * b);    // 30 (Multiplication)
console.log(a / b);    // 3.333... (Division)
console.log(a % b);    // 1  (Modulus/Remainder)
console.log(a ** b);   // 1000 (Exponentiation ES2016)

// Assignment Operators
let x = 5;
x += 3;    // x = x + 3 → 8
x -= 2;    // x = x - 2 → 6
x *= 2;    // x = x * 2 → 12
x /= 3;    // x = x / 3 → 4
x %= 3;    // x = x % 3 → 1

// Increment/Decrement
let count = 5;
console.log(++count);  // 6 (Pre-increment)
console.log(count++);  // 6 (Post-increment, then count becomes 7)
console.log(--count);  // 6 (Pre-decrement)
console.log(count--);  // 6 (Post-decrement, then count becomes 5)

// Comparison Operators
console.log(5 == "5");   // true  (Loose equality)
console.log(5 === "5");  // false (Strict equality)
console.log(5 != "6");   // true  (Not equal)
console.log(5 !== "5");  // true  (Strict not equal)
console.log(5 > 3);      // true
console.log(5 >= 5);     // true

// Logical Operators
let isLoggedIn = true;
let isAdmin = false;

console.log(isLoggedIn && isAdmin);  // false (AND)
console.log(isLoggedIn || isAdmin);  // true  (OR)
console.log(!isLoggedIn);            // false (NOT)

// Ternary Operator
let age = 18;
let status = age >= 18 ? "Adult" : "Minor";
console.log(status); // "Adult"`
            }
          }
        ]
      },
      {
        title: 'Loops & Conditionals in Javascript',
        introduction: 'Control flow in JavaScript using conditional statements and loops for decision making and repetitive tasks.',
        subsections: [
          {
            title: 'Conditional Statements in JavaScript',
            content: 'Make decisions in your code using if-else statements, switch cases, and ternary operators.',
            codeExample: {
              title: 'Conditional Statements',
              language: 'javascript',
              explanation: 'Different ways to implement conditional logic in JavaScript.',
              code: `// If-else statements
let score = 85;

if (score >= 90) {
    console.log("Grade: A");
} else if (score >= 80) {
    console.log("Grade: B");
} else if (score >= 70) {
    console.log("Grade: C");
} else {
    console.log("Grade: F");
}

// Ternary operator
let status = score >= 60 ? "Pass" : "Fail";
console.log(status);

// Switch statement
let day = "Monday";
switch (day) {
    case "Monday":
        console.log("Start of work week");
        break;
    case "Friday":
        console.log("TGIF!");
        break;
    case "Saturday":
    case "Sunday":
        console.log("Weekend!");
        break;
    default:
        console.log("Regular day");
}

// Logical operators in conditions
let age = 25;
let hasLicense = true;

if (age >= 18 && hasLicense) {
    console.log("Can drive");
}

// Nullish coalescing (ES2020)
let username = null;
let displayName = username ?? "Guest";
console.log(displayName); // "Guest"`
            }
          },
          {
            title: 'Loops in JavaScript',
            content: 'Repeat code execution using different types of loops: for, while, do-while, forEach, for-in, and for-of.',
            codeExample: {
              title: 'JavaScript Loops',
              language: 'javascript',
              explanation: 'Complete guide to all loop types in JavaScript.',
              code: `// For loop
for (let i = 0; i < 5; i++) {
    console.log("Count:", i);
}

// While loop
let count = 0;
while (count < 3) {
    console.log("While count:", count);
    count++;
}

// Do-while loop (executes at least once)
let num = 0;
do {
    console.log("Do-while:", num);
    num++;
} while (num < 2);

// Arrays and loops
let fruits = ["apple", "banana", "orange"];

// forEach loop
fruits.forEach((fruit, index) => {
    console.log(\`\${index}: \${fruit}\`);
});

// For-of loop (values)
for (let fruit of fruits) {
    console.log("Fruit:", fruit);
}

// For-in loop (indices/keys)
for (let index in fruits) {
    console.log(\`Index \${index}: \${fruits[index]}\`);
}

// Object iteration
let person = { name: "John", age: 30, city: "NYC" };

for (let key in person) {
    console.log(\`\${key}: \${person[key]}\`);
}

// Loop control statements
for (let i = 0; i < 10; i++) {
    if (i === 3) continue;  // Skip iteration
    if (i === 7) break;     // Exit loop
    console.log(i);
}

// Nested loops
for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= 2; j++) {
        console.log(\`i: \${i}, j: \${j}\`);
    }
}`
            }
          }
        ]
      },
      {
        title: 'Functions in JavaScript',
        introduction: 'Functions are reusable blocks of code. Learn different types of functions, parameters, scope, and closures.',
        subsections: [
          {
            title: 'Function Types and Declarations',
            content: 'Understanding different ways to create and use functions in JavaScript.',
            codeExample: {
              title: 'Function Types',
              language: 'javascript',
              explanation: 'Various function declaration and expression syntaxes.',
              code: `// Function Declaration (Hoisted)
function greet(name) {
    return \`Hello, \${name}!\`;
}

// Function Expression
const add = function(a, b) {
    return a + b;
};

// Arrow Functions (ES6)
const multiply = (a, b) => a * b;
const square = x => x * x;
const sayHello = () => console.log("Hello!");

// Parameters and Arguments
function introduce(name, age = 18, ...hobbies) {
    console.log(\`Name: \${name}, Age: \${age}\`);
    console.log("Hobbies:", hobbies);
}

introduce("John", 25, "reading", "coding", "gaming");

// Destructuring parameters
function createUser({name, email, age = 18}) {
    return {name, email, age, id: Date.now()};
}

let user = createUser({name: "Alice", email: "alice@email.com"});

// Higher-order functions
function processArray(arr, callback) {
    return arr.map(callback);
}

let numbers = [1, 2, 3, 4];
let doubled = processArray(numbers, x => x * 2);
console.log(doubled); // [2, 4, 6, 8]

// IIFE (Immediately Invoked Function Expression)
(function() {
    console.log("This runs immediately!");
})();

// Function as first-class citizens
const operations = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b
};

console.log(operations.add(5, 3)); // 8`
            }
          },
          {
            title: 'Scope and Closures',
            content: 'Understanding variable scope, closure concepts, and how functions access variables.',
            codeExample: {
              title: 'Scope and Closures',
              language: 'javascript',
              explanation: 'Variable scope rules and closure behavior in JavaScript.',
              code: `// Global scope
let globalVar = "I'm global";

function outerFunction(x) {
    // Function scope
    let outerVar = "I'm in outer function";
    
    function innerFunction(y) {
        // Inner function has access to outer variables (Closure)
        let innerVar = "I'm in inner function";
        console.log(globalVar);  // Accessible
        console.log(outerVar);   // Accessible
        console.log(innerVar);   // Accessible
        return x + y;
    }
    
    return innerFunction;
}

// Closure example
function createCounter() {
    let count = 0;
    
    return function() {
        count++;
        return count;
    };
}

const counter1 = createCounter();
const counter2 = createCounter();

console.log(counter1()); // 1
console.log(counter1()); // 2
console.log(counter2()); // 1 (separate closure)

// Block scope with let/const
if (true) {
    let blockScoped = "Only accessible in this block";
    const alsoBlockScoped = "Me too!";
    var functionScoped = "I'm function scoped";
}

// console.log(blockScoped); // Error!
console.log(functionScoped); // Works

// Practical closure example - Module pattern
function createBankAccount(initialBalance) {
    let balance = initialBalance;
    
    return {
        deposit: function(amount) {
            balance += amount;
            return balance;
        },
        withdraw: function(amount) {
            if (amount <= balance) {
                balance -= amount;
                return balance;
            }
            return "Insufficient funds";
        },
        getBalance: function() {
            return balance;
        }
    };
}

const account = createBankAccount(100);
console.log(account.deposit(50));  // 150
console.log(account.withdraw(30)); // 120
console.log(account.getBalance()); // 120`
            }
          }
        ]
      },
      {
        title: 'Arrays and Objects in JavaScript',
        introduction: 'Master arrays and objects - the fundamental data structures for storing and manipulating collections of data.',
        subsections: [
          {
            title: 'Working with Arrays',
            content: 'Arrays store multiple values in a single variable. Learn array methods and manipulation techniques.',
            codeExample: {
              title: 'Array Methods and Operations',
              language: 'javascript',
              explanation: 'Essential array methods for data manipulation and processing.',
              code: `// Creating arrays
let fruits = ["apple", "banana", "orange"];
let numbers = [1, 2, 3, 4, 5];
let mixed = [1, "hello", true, {name: "John"}];

// Adding/removing elements
fruits.push("grape");           // Add to end
fruits.unshift("mango");        // Add to beginning
let lastFruit = fruits.pop();   // Remove from end
let firstFruit = fruits.shift(); // Remove from beginning

console.log(fruits); // ["apple", "banana", "orange"]

// Array methods
let nums = [1, 2, 3, 4, 5];

// Map - transform each element
let doubled = nums.map(x => x * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// Filter - select elements that meet condition
let evens = nums.filter(x => x % 2 === 0);
console.log(evens); // [2, 4]

// Reduce - combine all elements into single value
let sum = nums.reduce((acc, curr) => acc + curr, 0);
console.log(sum); // 15

// Find - get first element that matches
let found = nums.find(x => x > 3);
console.log(found); // 4

// Some/Every - test conditions
let hasEven = nums.some(x => x % 2 === 0);  // true
let allPositive = nums.every(x => x > 0);   // true

// Array destructuring (ES6)
let [first, second, ...rest] = nums;
console.log(first, second, rest); // 1 2 [3, 4, 5]

// Spread operator
let moreFruits = ["kiwi", "pear"];
let allFruits = [...fruits, ...moreFruits];
console.log(allFruits);

// Array methods chaining
let result = nums
    .filter(x => x > 2)
    .map(x => x * x)
    .reduce((acc, curr) => acc + curr);
console.log(result); // 50 (3² + 4² + 5²)`
            }
          },
          {
            title: 'Working with Objects',
            content: 'Objects store key-value pairs and are fundamental to JavaScript. Learn object manipulation and methods.',
            codeExample: {
              title: 'Object Operations and Methods',
              language: 'javascript',
              explanation: 'Complete guide to working with JavaScript objects.',
              code: `// Creating objects
let person = {
    name: "John",
    age: 30,
    city: "New York",
    hobbies: ["reading", "coding"],
    greet: function() {
        return \`Hello, I'm \${this.name}\`;
    }
};

// Accessing properties
console.log(person.name);        // Dot notation
console.log(person["age"]);      // Bracket notation
console.log(person.greet());     // Method call

// Adding/modifying properties
person.email = "john@email.com"; // Add new property
person.age = 31;                 // Modify existing
person["country"] = "USA";       // Bracket notation

// Deleting properties
delete person.city;

// Object methods
let keys = Object.keys(person);           // Get all keys
let values = Object.values(person);       // Get all values
let entries = Object.entries(person);     // Get key-value pairs

console.log(keys);    // ["name", "age", "hobbies", "greet", "email", "country"]
console.log(values);  // ["John", 31, Array(2), function, "john@email.com", "USA"]

// Object destructuring
let {name, age, email} = person;
console.log(name, age, email); // John 31 john@email.com

// Nested objects
let user = {
    profile: {
        personal: {
            firstName: "Jane",
            lastName: "Doe"
        },
        contact: {
            email: "jane@email.com",
            phone: "123-456-7890"
        }
    }
};

// Accessing nested properties
console.log(user.profile.personal.firstName); // Jane

// Object methods and this keyword
let calculator = {
    value: 0,
    add: function(num) {
        this.value += num;
        return this;
    },
    multiply: function(num) {
        this.value *= num;
        return this;
    },
    getValue: function() {
        return this.value;
    }
};

// Method chaining
let result = calculator.add(5).multiply(3).getValue();
console.log(result); // 15

// Object.freeze, Object.seal
let config = {debug: true, version: "1.0"};
Object.freeze(config);  // Cannot modify
// config.debug = false; // This won't work

// Timing functions
setTimeout(() => {
    console.log("This runs after 2 seconds");
}, 2000);

let intervalId = setInterval(() => {
    console.log("This runs every second");
}, 1000);

// Clear interval after 5 seconds
setTimeout(() => {
    clearInterval(intervalId);
}, 5000);`
            }
          }
        ]
      },
      {
        title: 'Document Object Model Manipulation',
        introduction: 'Learn to interact with HTML elements using JavaScript DOM methods for dynamic web pages.',
        subsections: [
          {
            title: 'Introduction to DOM and DOM Structure',
            content: 'The DOM represents HTML as a tree structure that JavaScript can manipulate.',
            points: [
              'DOM stands for Document Object Model',
              'Represents HTML documents as a tree of nodes',
              'Each HTML element is a node in the tree',
              'JavaScript can access and modify DOM elements',
              'Three main types: document, element, and text nodes'
            ],
            codeExample: {
              title: 'DOM Selection Methods',
              language: 'javascript',
              explanation: 'Different ways to select and access DOM elements.',
              code: `// Selecting elements by ID
const header = document.getElementById('main-header');

// Selecting by class name (returns HTMLCollection)
const buttons = document.getElementsByClassName('btn');

// Selecting by tag name
const paragraphs = document.getElementsByTagName('p');

// Modern selectors (recommended)
const firstButton = document.querySelector('.btn');
const allButtons = document.querySelectorAll('.btn');

// DOM tree traversal
const parent = header.parentNode;
const children = header.childNodes;
const firstChild = header.firstChild;
const nextSibling = header.nextSibling;

console.log('Header element:', header);
console.log('All buttons:', allButtons);`
            }
          },
          {
            title: 'Manipulating DOM Elements',
            content: 'Change content, attributes, and styles of HTML elements dynamically.',
            codeExample: {
              title: 'DOM Manipulation Methods',
              language: 'javascript',
              explanation: 'Methods to modify element content, attributes, and styles.',
              code: `const element = document.querySelector('#myElement');

// Changing content
element.innerHTML = '<strong>New HTML content</strong>';
element.textContent = 'New text content';

// Working with attributes
element.setAttribute('data-id', '123');
const dataId = element.getAttribute('data-id');
element.removeAttribute('class');

// Styling elements
element.style.color = 'blue';
element.style.backgroundColor = 'yellow';
element.style.fontSize = '20px';

// Working with classes
element.classList.add('active');
element.classList.remove('hidden');
element.classList.toggle('highlight');
element.classList.contains('active'); // returns boolean

// Creating and removing elements
const newDiv = document.createElement('div');
newDiv.textContent = 'New element';
document.body.appendChild(newDiv);

// Remove element
element.removeChild(newDiv);`
            }
          }
        ]
      },
      {
        title: 'Event Handling in JavaScript',
        introduction: 'Handle user interactions and browser events to create interactive web applications.',
        subsections: [
          {
            title: 'Event Listeners and Event Types',
            content: 'Respond to user actions like clicks, keyboard input, and mouse movements.',
            codeExample: {
              title: 'Event Handling Examples',
              language: 'javascript',
              explanation: 'Different types of events and how to handle them.',
              code: `// Adding event listeners
const button = document.querySelector('#myButton');

button.addEventListener('click', function(event) {
    console.log('Button clicked!');
    console.log('Event target:', event.target);
});

// Mouse events
button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = 'lightblue';
});

button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = '';
});

// Keyboard events
document.addEventListener('keydown', (event) => {
    console.log('Key pressed:', event.key);
    if (event.key === 'Enter') {
        console.log('Enter key pressed!');
    }
});

// Form events
const form = document.querySelector('#myForm');
form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent form submission
    const formData = new FormData(form);
    console.log('Form data:', Object.fromEntries(formData));
});

// Browser events
window.addEventListener('load', () => {
    console.log('Page fully loaded');
});

window.addEventListener('resize', () => {
    console.log('Window resized');
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready');
});`
            }
          }
        ]
      },
      {
        title: 'Asynchronous Programming JavaScript',
        introduction: 'Handle asynchronous operations using callbacks, promises, and async/await for better user experience.',
        subsections: [
          {
            title: 'Callbacks, Promises, and Async/Await',
            content: 'Manage asynchronous code execution and avoid callback hell.',
            codeExample: {
              title: 'Asynchronous Programming',
              language: 'javascript',
              explanation: 'Evolution from callbacks to modern async/await syntax.',
              code: `// Callbacks (older approach)
function fetchData(callback) {
    setTimeout(() => {
        callback('Data received');
    }, 1000);
}

fetchData((data) => {
    console.log(data);
});

// Promises (ES6)
function fetchDataPromise() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('Promise data received');
        }, 1000);
    });
}

fetchDataPromise()
    .then(data => console.log(data))
    .catch(error => console.error(error));

// Async/Await (ES2017) - Modern approach
async function getData() {
    try {
        const data = await fetchDataPromise();
        console.log(data);
    } catch (error) {
        console.error('Error:', error);
    }
}

getData();

// Timing functions
setTimeout(() => {
    console.log('Runs after 2 seconds');
}, 2000);

const intervalId = setInterval(() => {
    console.log('Runs every second');
}, 1000);

// Clear interval after 5 seconds
setTimeout(() => {
    clearInterval(intervalId);
}, 5000);

// Fetch API example
async function fetchUserData() {
    try {
        const response = await fetch('https://api.example.com/users');
        const users = await response.json();
        console.log(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
    }
}`
            }
          }
        ]
      }
    ]
  },

  'react': {
    id: 'react',
    title: 'React.js',
    sections: [
      {
        title: 'Introduction of React 🪫',
        introduction: 'React is a powerful JavaScript library for building user interfaces. Learn the fundamentals and set up your development environment.',
        subsections: [
          {
            title: 'What is React and Why Use It?',
            content: 'React is a JavaScript library for building user interfaces, especially single-page applications.',
            points: [
              'Created by Facebook for building interactive UIs',
              'Component-based architecture for reusable code',
              'Virtual DOM for better performance',
              'Large ecosystem and community support',
              'Used by major companies like Netflix, Airbnb, Instagram'
            ]
          },
          {
            title: 'Components and Single Page Applications',
            content: 'Understanding React components and how SPAs work differently from traditional websites.',
            codeExample: {
              title: 'React Components Basics',
              language: 'jsx',
              explanation: 'Function components are the modern way to create React components.',
              code: `// Function Component (Modern approach)
function Welcome(props) {
    return <h1>Hello, {props.name}!</h1>;
}

// Arrow Function Component
const Greeting = ({ name, age }) => {
    return (
        <div>
            <h2>Welcome {name}</h2>
            <p>You are {age} years old</p>
        </div>
    );
};

// Class Component (Legacy approach)
class WelcomeClass extends React.Component {
    render() {
        return <h1>Hello, {this.props.name}!</h1>;
    }
}

// Using components
function App() {
    return (
        <div>
            <Welcome name="John" />
            <Greeting name="Alice" age={25} />
        </div>
    );
}`
            }
          },
          {
            title: 'Setting Up React Environment and JSX',
            content: 'Learn to set up React with Vite and understand JSX syntax.',
            commandExample: {
              title: 'React Project Setup',
              explanation: 'Commands to create and run a React project with Vite.',
              commands: [
                'npm create vite@latest my-react-app -- --template react',
                'cd my-react-app',
                'npm install',
                'npm run dev'
              ]
            },
            codeExample: {
              title: 'JSX Example',
              language: 'jsx',
              explanation: 'Understanding JSX syntax and React components.',
              code: `function MyComponent() {
    const name = "React Developer";
    const isLoggedIn = true;
    
    return (
        <div className="container">
            <h1>Hello {name}!</h1>
            {isLoggedIn ? (
                <p>Welcome back!</p>
            ) : (
                <p>Please log in</p>
            )}
            <ul>
                {['Apple', 'Banana', 'Orange'].map((fruit, index) => (
                    <li key={index}>{fruit}</li>
                ))}
            </ul>
        </div>
    );
}`
            }
          }
        ]
      },
      {
        title: 'React Basics 🔦',
        introduction: 'Master the fundamentals of React including state, props, and component interaction.',
        subsections: [
          {
            title: 'State Management with useState',
            content: 'Learn to manage component state using the useState hook.',
            codeExample: {
              title: 'useState Hook Examples',
              language: 'jsx',
              explanation: 'useState allows functional components to have state.',
              code: `import { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);
    const [name, setName] = useState('');
    const [todos, setTodos] = useState([]);
    
    const increment = () => setCount(count + 1);
    const decrement = () => setCount(count - 1);
    
    const addTodo = () => {
        if (name.trim()) {
            setTodos([...todos, { id: Date.now(), text: name }]);
            setName('');
        }
    };
    
    return (
        <div>
            <h2>Count: {count}</h2>
            <button onClick={increment}>+</button>
            <button onClick={decrement}>-</button>
            
            <div>
                <input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Add todo"
                />
                <button onClick={addTodo}>Add</button>
                
                <ul>
                    {todos.map(todo => (
                        <li key={todo.id}>{todo.text}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}`
            }
          },
          {
            title: 'Props and Component Communication',
            content: 'Pass data between components using props and handle events.',
            codeExample: {
              title: 'Props and Event Handling',
              language: 'jsx',
              explanation: 'Props allow parent components to pass data to child components.',
              code: `// Child Component
function TodoItem({ todo, onDelete, onToggle }) {
    return (
        <li className={todo.completed ? 'completed' : ''}>
            <span onClick={() => onToggle(todo.id)}>
                {todo.text}
            </span>
            <button onClick={() => onDelete(todo.id)}>Delete</button>
        </li>
    );
}

// Parent Component
function TodoApp() {
    const [todos, setTodos] = useState([
        { id: 1, text: 'Learn React', completed: false },
        { id: 2, text: 'Build a project', completed: false }
    ]);
    
    const deleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };
    
    const toggleTodo = (id) => {
        setTodos(todos.map(todo => 
            todo.id === id 
                ? { ...todo, completed: !todo.completed }
                : todo
        ));
    };
    
    return (
        <div>
            <h1>Todo List</h1>
            <ul>
                {todos.map(todo => (
                    <TodoItem 
                        key={todo.id}
                        todo={todo}
                        onDelete={deleteTodo}
                        onToggle={toggleTodo}
                    />
                ))}
            </ul>
        </div>
    );
}`
            }
          }
        ]
      },
      {
        title: 'Useful Hooks in React 🪝',
        introduction: 'Master essential React hooks for state management, side effects, and performance optimization.',
        subsections: [
          {
            title: 'useEffect and Component Lifecycle',
            content: 'Handle side effects and component lifecycle with useEffect hook.',
            codeExample: {
              title: 'useEffect Hook Examples',
              language: 'jsx',
              explanation: 'useEffect handles side effects like API calls, subscriptions, and cleanup.',
              code: `import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Effect runs after component mounts and when userId changes
    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const response = await fetch(\`/api/users/\${userId}\`);
                const userData = await response.json();
                setUser(userData);
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUser();
    }, [userId]); // Dependency array
    
    // Cleanup effect
    useEffect(() => {
        const timer = setInterval(() => {
            console.log('Timer tick');
        }, 1000);
        
        // Cleanup function
        return () => {
            clearInterval(timer);
        };
    }, []);
    
    if (loading) return <div>Loading...</div>;
    if (!user) return <div>User not found</div>;
    
    return (
        <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
        </div>
    );
}`
            }
          },
          {
            title: 'useContext and Other Essential Hooks',
            content: 'Learn useContext, useRef, useMemo, and useCallback for advanced React patterns.',
            codeExample: {
              title: 'Advanced React Hooks',
              language: 'jsx',
              explanation: 'Essential hooks for context, refs, and performance optimization.',
              code: `import { useState, createContext, useContext, useRef, useMemo, useCallback } from 'react';

// Context for theme
const ThemeContext = createContext();

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');
    
    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }, []);
    
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

function ExpensiveComponent({ items }) {
    const { theme } = useContext(ThemeContext);
    const inputRef = useRef(null);
    
    // Memoize expensive calculation
    const expensiveValue = useMemo(() => {
        return items.reduce((sum, item) => sum + item.price, 0);
    }, [items]);
    
    // Memoize callback to prevent unnecessary re-renders
    const handleClick = useCallback(() => {
        inputRef.current?.focus();
    }, []);
    
    return (
        <div className={theme}>
            <p>Total: \${expensiveValue}</p>
            <input ref={inputRef} />
            <button onClick={handleClick}>Focus Input</button>
        </div>
    );
}`
            }
          }
        ]
      },
      {
        title: 'Styling in React 🐼',
        introduction: 'Learn different approaches to styling React components including CSS modules, styled-components, and responsive design.',
        subsections: [
          {
            title: 'Styling Approaches in React',
            content: 'Explore various methods to style React components effectively.',
            codeExample: {
              title: 'React Styling Methods',
              language: 'jsx',
              explanation: 'Different ways to style React components with their pros and cons.',
              code: `// 1. Inline Styles
function InlineStyled({ isActive }) {
    const buttonStyle = {
        backgroundColor: isActive ? '#007bff' : '#6c757d',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    };
    
    return <button style={buttonStyle}>Click me</button>;
}

// 2. CSS Classes
import './Button.css';

function CSSStyled({ variant, children }) {
    return (
        <button className={\`btn btn-\${variant}\`}>
            {children}
        </button>
    );
}

// 3. CSS Modules
import styles from './Button.module.css';

function ModuleStyled({ children }) {
    return (
        <button className={styles.primaryButton}>
            {children}
        </button>
    );
}

// 4. Styled Components (requires styled-components library)
import styled from 'styled-components';

const StyledButton = styled.button\`
    background-color: \${props => props.primary ? '#007bff' : '#6c757d'};
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
        opacity: 0.8;
    }
    
    @media (max-width: 768px) {
        padding: 8px 16px;
        font-size: 14px;
    }
\`;

function App() {
    return <StyledButton primary>Styled Button</StyledButton>;
}`
            }
          }
        ]
      },
      {
        title: 'Navigation with React Router 🚧',
        introduction: 'Implement client-side routing in React applications using React Router for seamless navigation.',
        subsections: [
          {
            title: 'React Router Setup and Basic Navigation',
            content: 'Set up React Router and create navigable routes in your application.',
            commandExample: {
              title: 'Install React Router',
              explanation: 'Install React Router DOM for client-side routing.',
              commands: ['npm install react-router-dom']
            },
            codeExample: {
              title: 'React Router Implementation',
              language: 'jsx',
              explanation: 'Complete setup for routing in React applications.',
              code: `import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';

// Components
function Home() {
    return <h1>Home Page</h1>;
}

function About() {
    return <h1>About Page</h1>;
}

function UserProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    return (
        <div>
            <h1>User Profile: {userId}</h1>
            <button onClick={() => navigate('/')}>Go Home</button>
        </div>
    );
}

function NotFound() {
    return (
        <div>
            <h1>404 - Page Not Found</h1>
            <Link to="/">Go back to Home</Link>
        </div>
    );
}

// Navigation Component
function Navigation() {
    return (
        <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/user/123">User Profile</Link>
        </nav>
    );
}

// Main App with Router
function App() {
    return (
        <BrowserRouter>
            <Navigation />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/user/:userId" element={<UserProfile />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}`
            }
          }
        ]
      },
      {
        title: 'Form Controls in React 📋',
        introduction: 'Build dynamic forms with validation, handle user input, and integrate with APIs.',
        subsections: [
          {
            title: 'Building Forms with Validation',
            content: 'Create controlled forms with validation and API integration.',
            codeExample: {
              title: 'React Form with Validation',
              language: 'jsx',
              explanation: 'Complete form handling with validation and API submission.',
              code: `import { useState } from 'react';

function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
        category: 'general'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };
    
    // Validation function
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        }
        
        return newErrors;
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            if (response.ok) {
                setSubmitted(true);
                setFormData({ name: '', email: '', message: '', category: 'general' });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };
    
    if (submitted) {
        return <div className="success">Thank you! Your message has been sent.</div>;
    }
    
    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                />
                {errors.name && <span className="error">{errors.name}</span>}
            </div>
            
            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                {errors.email && <span className="error">{errors.email}</span>}
            </div>
            
            <div>
                <label htmlFor="category">Category:</label>
                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                >
                    <option value="general">General</option>
                    <option value="support">Support</option>
                    <option value="feedback">Feedback</option>
                </select>
            </div>
            
            <div>
                <label htmlFor="message">Message:</label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                />
                {errors.message && <span className="error">{errors.message}</span>}
            </div>
            
            <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
            </button>
        </form>
    );
}`
            }
          }
        ]
      },
      {
        title: 'Performance Optimization 🏎️',
        introduction: 'Optimize React applications for better performance using memoization, code splitting, and best practices.',
        subsections: [
          {
            title: 'Memoization and Performance Techniques',
            content: 'Use React.memo, useMemo, and useCallback to optimize component performance.',
            codeExample: {
              title: 'React Performance Optimization',
              language: 'jsx',
              explanation: 'Techniques to prevent unnecessary re-renders and optimize performance.',
              code: `import { useState, useMemo, useCallback, memo, lazy, Suspense } from 'react';

// Memoized component - only re-renders when props change
const ExpensiveChild = memo(({ data, onItemClick }) => {
    console.log('ExpensiveChild rendered');
    
    return (
        <div>
            {data.map(item => (
                <div key={item.id} onClick={() => onItemClick(item.id)}>
                    {item.name} - {item.price}
                </div>
            ))}
        </div>
    );
});

// Lazy loaded component
const LazyComponent = lazy(() => import('./LazyComponent'));

function OptimizedApp() {
    const [count, setCount] = useState(0);
    const [items, setItems] = useState([
        { id: 1, name: 'Item 1', price: 100 },
        { id: 2, name: 'Item 2', price: 200 }
    ]);
    const [filter, setFilter] = useState('');
    
    // Memoize expensive calculation
    const expensiveTotal = useMemo(() => {
        console.log('Calculating total...');
        return items.reduce((sum, item) => sum + item.price, 0);
    }, [items]);
    
    // Memoize filtered items
    const filteredItems = useMemo(() => {
        return items.filter(item => 
            item.name.toLowerCase().includes(filter.toLowerCase())
        );
    }, [items, filter]);
    
    // Memoize callback to prevent child re-renders
    const handleItemClick = useCallback((itemId) => {
        console.log('Item clicked:', itemId);
        // Handle item click logic
    }, []);
    
    // Memoize another callback
    const handleAddItem = useCallback(() => {
        const newItem = {
            id: Date.now(),
            name: \`Item \${items.length + 1}\`,
            price: Math.floor(Math.random() * 1000)
        };
        setItems(prev => [...prev, newItem]);
    }, [items.length]);
    
    return (
        <div>
            <h1>Performance Optimized App</h1>
            
            <div>
                <button onClick={() => setCount(count + 1)}>
                    Count: {count}
                </button>
                <p>Total: \${expensiveTotal}</p>
            </div>
            
            <div>
                <input
                    type="text"
                    placeholder="Filter items..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <button onClick={handleAddItem}>Add Item</button>
            </div>
            
            <ExpensiveChild 
                data={filteredItems}
                onItemClick={handleItemClick}
            />
            
            {/* Code splitting with Suspense */}
            <Suspense fallback={<div>Loading...</div>}>
                <LazyComponent />
            </Suspense>
        </div>
    );
}

export default OptimizedApp;`
            }
          }
        ]
      }
    ]
  },

  'nodejs-express': {
    id: 'nodejs-express',
    title: 'Node & Express',
    sections: [
      {
        title: 'Starting with Node.js - The Beginning 🏁',
        introduction: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine. Learn to set up your development environment and create your first Node.js application.',
        subsections: [
          {
            title: 'Introduction to Node.js and Setup',
            content: 'Node.js allows you to run JavaScript on the server side. Set up your development environment with essential tools.',
            points: [
              'Node.js is a JavaScript runtime environment',
              'Built on Chrome\'s V8 JavaScript engine',
              'Allows server-side JavaScript development',
              'Non-blocking, event-driven architecture',
              'Large ecosystem with NPM packages'
            ],
            codeExample: {
              title: 'First Node.js Script',
              language: 'javascript',
              explanation: 'Create your first Node.js application and understand NPM basics.',
              code: `// app.js - Your first Node.js script
console.log("Namaste Duniya! 🌍");

// Working with modules
const fs = require('fs');
const path = require('path');

// Read a file
fs.readFile('package.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    console.log('Package.json content:', data);
});

// Working with built-in modules
const os = require('os');
console.log('Platform:', os.platform());
console.log('CPU Architecture:', os.arch());
console.log('Free Memory:', os.freemem());

// Export and import (CommonJS)
// math.js
function add(a, b) {
    return a + b;
}

function multiply(a, b) {
    return a * b;
}

module.exports = { add, multiply };

// main.js
const { add, multiply } = require('./math');
console.log('5 + 3 =', add(5, 3));
console.log('5 * 3 =', multiply(5, 3));`
            }
          },
          {
            title: 'NPM and Package Management',
            content: 'Learn to manage dependencies and create package.json for your Node.js projects.',
            commandExample: {
              title: 'NPM Commands',
              explanation: 'Essential NPM commands for package management.',
              commands: [
                'npm init',
                'npm init -y',
                'npm install express',
                'npm install nodemon --save-dev',
                'npm install lodash mongoose',
                'npm install -g nodemon'
              ]
            },
            codeExample: {
              title: 'Package.json Configuration',
              language: 'json',
              explanation: 'Complete package.json structure for Node.js projects.',
              code: `{
  "name": "my-node-app",
  "version": "1.0.0",
  "description": "My first Node.js application",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0",
    "jest": "^29.0.0"
  },
  "keywords": ["nodejs", "express", "api"],
  "author": "Your Name",
  "license": "MIT"
}`
            }
          }
        ]
      },
      {
        title: 'Creating Server - Writing Our First Server 📱',
        introduction: 'Learn to create HTTP servers using Node.js built-in modules and understand how servers work.',
        subsections: [
          {
            title: 'HTTP Server Basics',
            content: 'Create your first HTTP server and understand request-response cycle.',
            codeExample: {
              title: 'Basic HTTP Server',
              language: 'javascript',
              explanation: 'Create a simple HTTP server with routing and status codes.',
              code: `const http = require('http');
const url = require('url');

// Create HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    // Basic routing
    if (path === '/' && method === 'GET') {
        res.statusCode = 200; // Success
        res.end(JSON.stringify({
            message: 'Welcome to Node.js Server!',
            timestamp: new Date().toISOString()
        }));
    } else if (path === '/users' && method === 'GET') {
        res.statusCode = 200;
        res.end(JSON.stringify({
            users: [
                { id: 1, name: 'John Doe' },
                { id: 2, name: 'Jane Smith' }
            ]
        }));
    } else if (path === '/about' && method === 'GET') {
        res.statusCode = 200;
        res.end(JSON.stringify({
            message: 'About our Node.js application'
        }));
    } else {
        // 404 Not Found
        res.statusCode = 404;
        res.end(JSON.stringify({
            error: 'Page not found',
            statusCode: 404
        }));
    }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
});

// Handle server errors
server.on('error', (err) => {
    console.error('Server error:', err);
});`
            }
          },
          {
            title: 'HTTP Status Codes and Responses',
            content: 'Understand different HTTP status codes and how to use them properly.',
            points: [
              '1xx: Informational responses',
              '2xx: Success (200 OK, 201 Created, 204 No Content)',
              '3xx: Redirection (301 Moved Permanently, 302 Found)',
              '4xx: Client errors (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity)',
              '5xx: Server errors (500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable)'
            ]
          }
        ]
      },
      {
        title: 'Web Framework - Express.js 🚀',
        introduction: 'Express.js is a fast, unopinionated web framework for Node.js. Learn to build robust web applications and APIs.',
        subsections: [
          {
            title: 'Express.js Basics and Setup',
            content: 'Set up Express.js server and understand its core concepts.',
            codeExample: {
              title: 'Express Server Setup',
              language: 'javascript',
              explanation: 'Create an Express server with routing and middleware.',
              code: `const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Built-in middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static('public')); // Serve static files

// Basic routes
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Express.js!',
        timestamp: new Date().toISOString()
    });
});

// Route with URL parameters
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.json({
        message: \`User ID: \${userId}\`,
        params: req.params
    });
});

// Route with query parameters
app.get('/search', (req, res) => {
    const { q, limit = 10, page = 1 } = req.query;
    res.json({
        query: q,
        limit: parseInt(limit),
        page: parseInt(page),
        results: []
    });
});

// POST route
app.post('/users', (req, res) => {
    const { name, email } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({
            error: 'Name and email are required'
        });
    }
    
    res.status(201).json({
        message: 'User created successfully',
        user: { id: Date.now(), name, email }
    });
});

// PUT route
app.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const updates = req.body;
    
    if (!updates.name || !updates.email) {
        return res.status(400).json({
            error: 'Name and email are required'
        });
    }
    
    res.json({
        message: \`User \${userId} updated\`,
        updates
    });
});

// DELETE route
app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.json({
        message: \`User \${userId} deleted\`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(\`Express server running on http://localhost:\${PORT}\`);
});`
            }
          }
        ]
      },
      {
        title: 'Template Engine - EJS 🚜',
        introduction: 'EJS (Embedded JavaScript) is a simple templating language that lets you generate HTML markup with plain JavaScript.',
        subsections: [
          {
            title: 'EJS Setup and Syntax',
            content: 'Learn to set up EJS and use its templating features for dynamic HTML generation.',
            codeExample: {
              title: 'EJS Template Engine',
              language: 'javascript',
              explanation: 'Set up EJS and create dynamic HTML templates.',
              code: `// app.js - Express with EJS
const express = require('express');
const path = require('path');

const app = express();

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static('public'));

// Sample data
const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
];

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Home Page',
        message: 'Welcome to EJS!',
        currentYear: new Date().getFullYear()
    });
});

app.get('/users', (req, res) => {
    res.render('users', {
        title: 'Users List',
        users: users,
        totalUsers: users.length
    });
});

app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    
    if (!user) {
        return res.status(404).render('404', {
            title: 'User Not Found'
        });
    }
    
    res.render('user-detail', {
        title: \`User: \${user.name}\`,
        user: user
    });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

/* views/index.ejs */
/*
<!DOCTYPE html>
<html>
<head>
    <title><%= title %></title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <h1><%= message %></h1>
    <p>Current year: <%= currentYear %></p>
    
    <% if (message.includes('Welcome')) { %>
        <p>Thank you for visiting!</p>
    <% } %>
    
    <a href="/users">View Users</a>
</body>
</html>
*/

/* views/users.ejs */
/*
<!DOCTYPE html>
<html>
<head>
    <title><%= title %></title>
</head>
<body>
    <h1>Users (<%= totalUsers %>)</h1>
    
    <% if (users.length > 0) { %>
        <ul>
            <% users.forEach(user => { %>
                <li>
                    <a href="/users/<%= user.id %>">
                        <%= user.name %> - <%= user.email %>
                        <% if (user.role === 'admin') { %>
                            <span class="admin-badge">Admin</span>
                        <% } %>
                    </a>
                </li>
            <% }); %>
        </ul>
    <% } else { %>
        <p>No users found.</p>
    <% } %>
    
    <a href="/">Back to Home</a>
</body>
</html>
*/`
            }
          }
        ]
      },
      {
        title: 'Middleware in Express.js 🐵',
        introduction: 'Middleware functions are functions that have access to the request and response objects. Learn to create and use middleware effectively.',
        subsections: [
          {
            title: 'Understanding and Creating Middleware',
            content: 'Learn different types of middleware and how to implement them in Express.js.',
            codeExample: {
              title: 'Express Middleware',
              language: 'javascript',
              explanation: 'Different types of middleware and their implementation.',
              code: `const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Built-in middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Third-party middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: ['http://localhost:3000', 'https://myapp.com'],
    credentials: true
}));

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Custom logging middleware
const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(\`[\${timestamp}] \${req.method} \${req.url}\`);
    next(); // Call next middleware
};
app.use(logger);

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    // Verify token (simplified)
    if (token === 'valid-token') {
        req.user = { id: 1, name: 'John Doe' };
        next();
    } else {
        res.status(403).json({ error: 'Invalid token' });
    }
};

// Route-level middleware
app.get('/protected', authenticateToken, (req, res) => {
    res.json({
        message: 'This is a protected route',
        user: req.user
    });
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    
    if (err.type === 'validation') {
        return res.status(400).json({
            error: 'Validation Error',
            details: err.details
        });
    }
    
    if (err.type === 'database') {
        return res.status(500).json({
            error: 'Database Error'
        });
    }
    
    res.status(500).json({
        error: 'Internal Server Error'
    });
};

// Routes
app.get('/api/users', (req, res) => {
    res.json({ users: [] });
});

app.post('/api/users', (req, res, next) => {
    try {
        const { name, email } = req.body;
        
        if (!name || !email) {
            const error = new Error('Name and email are required');
            error.type = 'validation';
            error.details = { name: !name, email: !email };
            throw error;
        }
        
        res.status(201).json({
            message: 'User created',
            user: { id: Date.now(), name, email }
        });
    } catch (error) {
        next(error); // Pass error to error handler
    }
});

// Use error handling middleware (must be last)
app.use(errorHandler);

app.listen(3000, () => {
    console.log('Server with middleware running on port 3000');
});`
            }
          }
        ]
      }
    ]
  },

  'project': {
    id: 'project',
    title: 'Project (Chatbot)',
    sections: [
      {
        title: 'Frontend Part 1: React Setup & State Management 🚀',
        introduction: 'Create a file named App.js and paste the following blocks in order.',
        subsections: [
          {
            title: 'Step 1: Imports and Main Component Definition',
            content: 'Create a file named App.js and paste the following blocks in order.',
            codeExample: {
              title: 'Step 1: Imports and Main Component Definition',
              language: 'jsx',
              explanation: 'Import React hooks and axios, then define the main App component.',
              code: `import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {`
            }
          },
          {
            title: 'Step 2: State and Ref Initialization',
            content: 'Set up all the state variables needed for the chatbot functionality.',
            codeExample: {
              title: 'Step 2: State and Ref Initialization',
              language: 'jsx',
              explanation: 'Initialize all state variables and refs for managing chat functionality.',
              code: `  // State variables
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);`
            }
          },
          {
            title: 'Step 3: Auto-Scroll Logic',
            content: 'Implement automatic scrolling to keep the latest messages visible.',
            codeExample: {
              title: 'Step 3: Auto-Scroll Logic',
              language: 'jsx',
              explanation: 'Create smooth scrolling behavior for new messages.',
              code: `  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);`
            }
          }
        ]
      },
      {
        title: 'Frontend Part 2: Data Loading & Message Handling 💬',
        introduction: 'Continue building the chatbot functionality with data loading and message handling.',
        subsections: [
          {
            title: 'Step 4: Load Chat History and Save Username',
            content: 'Load previous chat messages from the backend when the component mounts.',
            codeExample: {
              title: 'Step 4: Load Chat History and Save Username',
              language: 'jsx',
              explanation: 'Fetch existing chat history and save username to localStorage.',
              code: `  // Load previous chats from backend on start
  useEffect(() => {
    if (username) localStorage.setItem('username', username);

    axios.get('http://localhost:5000/api/chat')
      .then(res => setMessages(res.data))
      .catch(err => {
        console.error(err);
        setError('Failed to load chat history');
      });
  }, [username]);`
            }
          },
          {
            title: 'Step 5: Send Message Function',
            content: 'Create the core function to send messages to the AI backend and handle responses.',
            codeExample: {
              title: 'Step 5: Send Message Function',
              language: 'jsx',
              explanation: 'Handle message sending with loading states and error handling.',
              code: `  // Send message to backend
  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setError('');
    setIsLoading(true);

    // Add user message immediately to UI
    const tempMessage = { username, message: userMessage, botReply: '', isLoading: true };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const res = await axios.post('http://localhost:5000/api/chat', { 
        username, 
        message: userMessage 
      });
      
      // Update the message with bot reply
      setMessages(prev => 
        prev.map((msg, idx) => 
          idx === prev.length - 1 
            ? { ...msg, botReply: res.data.reply, isLoading: false }
            : msg
        )
      );
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || 'Failed to send message. Please try again.';
      setError(errorMessage);
      
      // Remove the temporary message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };`
            }
          },
          {
            title: 'Step 6: Handle Enter Key Press',
            content: 'Add keyboard shortcuts for better user experience.',
            codeExample: {
              title: 'Step 6: Handle Enter Key Press',
              language: 'jsx',
              explanation: 'Allow users to send messages by pressing Enter.',
              code: `  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };`
            }
          }
        ]
      },
      {
        title: 'Frontend Part 3: UI Components & Styling 🎨',
        introduction: 'Create the complete user interface with modern styling, animations, and responsive design.',
        subsections: [
          {
            title: 'Step 7: JSX Return and Custom Scrollbar Styles',
            content: 'This is the start of the render function, including the global container and custom styles.',
            codeExample: {
              title: 'Step 7: JSX Return and Custom Scrollbar Styles',
              language: 'jsx',
              explanation: 'Create the main layout with gradient background and custom CSS animations.',
              code: `  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Custom Scrollbar Styles */}
      <style jsx>{\`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 transparent;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      \`}</style>`
            }
          },
          {
            title: 'Step 8: Header Component',
            content: 'Create a professional header with branding and navigation elements.',
            codeExample: {
              title: 'Step 8: Header Component',
              language: 'jsx',
              explanation: 'Build the header with INVICTA branding and chat bot title.',
              code: `      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">INVICTA AI Assistant</h1>
              <p className="text-sm text-gray-500">Build It Better - AI Chatbot</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">`
            }
          }
        ]
      },
      {
        title: 'Backend Part 1: Server Setup & Database 🔧',
        introduction: 'Create a file named server.js (or index.js) and paste the following blocks in order.',
        subsections: [
          {
            title: 'Step 1: Imports and Express Setup',
            content: 'Import required modules and initialize Express server.',
            codeExample: {
              title: 'Step 1: Imports and Express Setup',
              language: 'javascript',
              explanation: 'Import modules and configure Express with CORS and JSON parsing.',
              code: `// 1. Import required modules
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

// 2. Initialize Express
const app = express();
app.use(cors());
app.use(express.json());`
            }
          },
          {
            title: 'Step 2: MongoDB Connection',
            content: 'Make sure you have a .env file with MONGO_URI and GEMINI_API_KEY.',
            codeExample: {
              title: 'Step 2: MongoDB Connection',
              language: 'javascript',
              explanation: 'Connect to MongoDB with proper error handling.',
              code: `// 3. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://dombeshivam80_db_user:AyurSetu@cluster0.5a6ny7q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.log('MongoDB connection error:', err.message);
  // Continue running server even if MongoDB fails
});`
            }
          },
          {
            title: 'Step 3: Define Chat Schema and Model',
            content: 'Define the MongoDB schema for storing chat messages.',
            codeExample: {
              title: 'Step 3: Define Chat Schema and Model',
              language: 'javascript',
              explanation: 'Create schema for chat messages with timestamps.',
              code: `// 4. Define chat schema
const chatSchema = new mongoose.Schema({
  username: String,
  message: String,
  botReply: String,
  createdAt: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);`
            }
          }
        ]
      },
      {
        title: 'Backend Part 2: API Routes & Gemini Integration 🤖',
        introduction: 'Create API endpoints for chat functionality and integrate with Google Gemini AI.',
        subsections: [
          {
            title: 'Step 4: GET Endpoint to Load History',
            content: 'Create endpoint to retrieve previous chat messages from the database.',
            codeExample: {
              title: 'Step 4: GET Endpoint to Load History',
              language: 'javascript',
              explanation: 'GET endpoint to fetch all previous chat messages.',
              code: `// 5. Get all previous chats
app.get('/api/chat', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.json([]); // Return empty array if DB not connected
    }
    const chats = await Chat.find().sort({ createdAt: 1 });
    res.json(chats);
  } catch (err) {
    console.log('Error fetching chats:', err.message);
    res.json([]); // Return empty array on error
  }
});`
            }
          },
          {
            title: 'Step 5: Helper Function for Model Discovery',
            content: 'Create helper functions to discover available Gemini AI models.',
            codeExample: {
              title: 'Step 5: Helper Function for Model Discovery',
              language: 'javascript',
              explanation: 'Helper functions to get available Gemini models with caching.',
              code: `// Debug endpoint to check available models
app.get('/api/models', async (req, res) => {
  try {
    const models = await getAvailableModels();
    res.json({ models, cached: !!cachedModels });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch models', details: err.message });
  }
});

// Helper function to get available models
const getAvailableModels = async () => {
  try {
    const response = await axios.get(
      \`https://generativelanguage.googleapis.com/v1beta/models?key=\${process.env.GEMINI_API_KEY}\` 
    );
    
    // Filter models that support generateContent
    const availableModels = response.data.models
      .filter(model => model.supportedGenerationMethods?.includes('generateContent'))
      .map(model => model.name.replace('models/', ''));
    
    console.log('Available models:', availableModels);
    return availableModels;
  } catch (err) {
    console.error('Error fetching models:', err.response?.data || err.message);
    // Fallback to commonly working models
    return ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'];
  }
};

// Cache for available models (refresh every hour)
let cachedModels = null;
let lastModelFetch = 0;`
            }
          }
        ]
      },
      {
        title: 'Backend Part 3: Message Processing & Server Launch 🚀',
        introduction: 'Complete the chatbot backend with message processing and AI integration.',
        subsections: [
          {
            title: 'Step 6: POST Endpoint to Send Message and Get Reply',
            content: 'Create the main endpoint to process user messages and get AI responses.',
            codeExample: {
              title: 'Step 6: POST Endpoint to Send Message and Get Reply',
              language: 'javascript',
              explanation: 'POST endpoint to send messages to Gemini AI and save responses.',
              code: `// 6. Send message to Gemini API and save to DB
app.post('/api/chat', async (req, res) => {
  const { username, message } = req.body;

  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({ 
        error: 'Gemini API key not configured. Please add your API key to the .env file.' 
      });
    }

    // Get available models (cache for 1 hour)
    const now = Date.now();
    if (!cachedModels || (now - lastModelFetch) > 3600000) {
      cachedModels = await getAvailableModels();
      lastModelFetch = now;
    }

    // 6a. Call Google Gemini API with first available model
    let geminiResponse;
    let usedModel = null;

    for (const model of cachedModels) {
      try {
        geminiResponse = await axios.post(
          \`https://generativelanguage.googleapis.com/v1beta/models/\${model}:generateContent?key=\${process.env.GEMINI_API_KEY}\` ,
          {
            contents: [{
              parts: [{
                text: message
              }]
            }]
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        usedModel = model;
        console.log(\`Successfully used model: \${model}\` );
        break; // Success, exit the loop
      } catch (modelErr) {
        console.log(\`Model \${model} failed:\` , modelErr.response?.data?.error?.message || modelErr.message);
        continue; // Try next model
      }
    }

    // If all models failed, throw error
    if (!geminiResponse) {
      throw new Error('All available models failed to respond');
    }

    // 6b. Get bot reply from response
    const botReply = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || 
                      'Sorry, I could not generate a response.';

    // 6c. Save chat to MongoDB (only if connected)
    if (mongoose.connection.readyState === 1) {
      try {
        const chat = new Chat({ username, message, botReply });
        await chat.save();
      } catch (dbErr) {
        console.log('Error saving to database:', dbErr.message);
        // Continue without saving to DB
      }
    }

    res.json({ reply: botReply });
  } catch (err) {
    console.error('Gemini API Error:', err.response?.data || err.message);
    
    // Provide more specific error messages
    if (err.response?.status === 400) {
      res.status(500).json({ error: 'Invalid API request. Please check your message.' });
    } else if (err.response?.status === 403) {
      res.status(500).json({ error: 'API key is invalid or has insufficient permissions.' });
    } else if (err.response?.status === 429) {
      res.status(500).json({ error: 'API rate limit exceeded. Please try again later.' });
    } else {
      res.status(500).json({ error: 'Failed to get response from AI. Please try again.' });
    }
  }
});`
            }
          },
          {
            title: 'Step 7: Start the Server',
            content: 'Launch the Express server and make it ready to handle requests.',
            codeExample: {
              title: 'Step 7: Start the Server',
              language: 'javascript',
              explanation: 'Start the server on specified port with console logging.',
              code: `// 7. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\` ));`
            }
          }
        ]
      },
      {
        title: 'Frontend Part 4: Username Modal & Chat Interface 🎭',
        introduction: 'Build the username input modal and chat container interface.',
        subsections: [
          {
            title: 'Step 9: Username Input Modal (Conditional Rendering)',
            content: 'Create a welcome modal for users to enter their name before chatting.',
            codeExample: {
              title: 'Step 9: Username Input Modal (Conditional Rendering)',
              language: 'jsx',
              explanation: 'Modal dialog for username input with modern design.',
              code: `        {/* Username Input Modal */}
        {!username && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
                <p className="text-gray-600">Please enter your name to start chatting</p>
              </div>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && username.trim()) {
                    // Username is already set, modal will close automatically
                  }
                }}
                autoFocus
              />
              <button
                onClick={() => {
                  if (username.trim()) {
                    // Username is already set, modal will close automatically
                  }
                }}
                disabled={!username.trim()}
                className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Start Chatting
              </button>
            </div>
          </div>
        )}`
            }
          }
        ]
      }
    ]
  }
};

// Additional modules will be added here (CSS, JavaScript, etc.)
