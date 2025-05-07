```mermaid
sequenceDiagram
    participant browser
    participant server

    Note right of browser: User navigates to /spa

    browser->>server: GET https://studies.cs.helsinki.fi/exampleapp/spa
    activate server
    server-->>browser: HTML document
    deactivate server

    browser->>server: GET /main.css
    activate server
    server-->>browser: CSS file
    deactivate server

    browser->>server: GET /spa.js
    activate server
    server-->>browser: JavaScript file
    deactivate server

    Note right of browser: JavaScript runs and requests note data

    browser->>server: GET /data.json
    activate server
    server-->>browser: JSON notes data
    deactivate server

    Note right of browser: Browser renders notes using DOM manipulation
```