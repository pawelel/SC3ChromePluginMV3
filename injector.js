chrome.storage.sync.get(['outputTitle', 'outputDescription', 'outputLocation'], ({ outputTitle, outputDescription, outputLocation }) => {
    const titleSelector = 'input[type="text"][name="instance/brief.description"]';
    const descriptionSelector = 'textarea[name="instance/action/action"]';
    const locationSelector = 'input[type="text"][name="instance/location"]';
    document.querySelectorAll('iframe').forEach((iframe) => {
        function trySearch(selector, callback) {
            const element = (iframe.contentWindow || iframe.contentDocument)?.document?.querySelector(selector);
            if (element) {
                callback(element);
            }
        }

        trySearch(titleSelector, (ele) => {
            ele.value = outputTitle;
            ele.focus();
        });
        trySearch(descriptionSelector, (des) => {
            des.value = outputDescription;
            des.focus();

        });
        trySearch(locationSelector, (loc) => {
            loc.value = outputLocation;
            loc.focus();
        });
    });
});
