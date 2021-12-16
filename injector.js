chrome.storage.sync.get(['outputTitle', 'outputDescription'], ({ outputTitle, outputDescription }) => {
    const titleSelector = 'input[type="text"][name="instance/brief.description"]';
    const descriptionSelector = 'textarea[name="instance/action/action"]';
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
            des.value = "hello";
            des.focus();
        });
    });
});