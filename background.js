const isFirefox = typeof browser !== 'undefined';
const api = isFirefox ? browser : chrome;

(async () => {
    const status = document.getElementById('status');
    
    try {
        const [tab] = await api.tabs.query({ active: true, currentWindow: true });
        
        if (!tab || !tab.url || !tab.title) {
            status.textContent = 'Error: Cannot access current tab';
            return;
        }
        
        let hostname;
        try {
            hostname = new URL(tab.url).hostname;
        } catch (e) {
            status.textContent = 'Error: Invalid URL';
            return;
        }
        
        const minimalEncodedUrl = tab.url.replace(/%/g, '%25').replace(/&/g, '%26');
        const minimalEncodedTitle = tab.title.replace(/%/g, '%25').replace(/&/g, '%26');
        const rawUrl = `mediaharbor://?url=${minimalEncodedUrl}&title=${minimalEncodedTitle}`;
        
        if (isFirefox) {
            try {
                await api.tabs.create({ url: rawUrl });
                window.close();
            } catch (error) {
                createRedirectPage(rawUrl);
            }
        } else {
            createRedirectPage(rawUrl);
        }
        
    } catch (error) {
        status.textContent = 'Error: ' + error.message;
    }
})();

function createRedirectPage(rawUrl) {
    const redirectPage = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta http-equiv="refresh" content="0; url='${rawUrl.replace(/'/g, "&#39;")}'" />
        <title>MediaHarbor Redirect</title>
      </head>
      <body>
        <p>Redirecting to MediaHarbor...</p>
        <p>If the app doesn't launch automatically, <a href="${rawUrl.replace(/"/g, "&quot;")}">click here</a>.</p>
      </body>
    </html>
  `;
    
    const dataUri = "data:text/html;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(redirectPage)));
    
    api.tabs.create({ url: dataUri });
    window.close();
}